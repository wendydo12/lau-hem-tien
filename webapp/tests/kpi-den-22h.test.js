/* tests/kpi-den-22h.test.js — LUẬT CHỈ TIÊU MỀM TỚI 22:00 (chủ dự án chốt 08/10 đêm):
 *   "ta muốn là target 1 ngày set là như thế ví dụ 10 ng là đủ kpi nhưng serve chưa hết giờ thì
 *    vẫn có khách vào và serve tiếp cho đến khi quán đóng theo 10h chứ ko phải là ok đủ 10 ng
 *    rồi thì end ngày"
 *
 * Bốn luật phải đúng đồng thời:
 *   L1. LỊCH KHÁCH VÃNG LAI = chỉ tiêu × khachVuotKpi (≥ 2) — không ai dựng lịch đúng bằng chỉ tiêu.
 *   L2. Lịch phủ KÍN ca: mốc khách cuối sát 22:00 (≥ 90% ca), khách vào liên tục không khe > 18s
 *       ở phần chính ca — "9h mấy đã hết khách" là lỗi cấm.
 *   L3. autoCloseCheck KHÔNG có đường nào đóng ngày vì ĐỦ CHỈ TIÊU; đóng sớm chỉ khi hết lịch
 *       vãng lai hoặc hết nguyên liệu.
 *   L4. 22:00 (el >= shiftMs) là nơi duy nhất kết thúc ca theo giờ.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArrivals, shiftMs, KHE_LIEN_TUC_MS } from '../js/engine/shift.js';
import { makeCFG } from '../js/engine/config.js';

const GAME = new URL('..', import.meta.url).pathname;
const main = fs.readFileSync(path.join(GAME, 'js', 'main.js'), 'utf8');
const rng = (seed = 7) => { let x = seed; return { next: () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648 }; };

test('L1 · lịch vãng lai = chỉ tiêu × khachVuotKpi, KHÔNG dựng lịch đúng bằng chỉ tiêu', () => {
  const cfg = makeCFG();
  const heSo = cfg.balance?.khachVuotKpi;
  assert.ok(typeof heSo === 'number' && heSo >= 2,
    'balance.khachVuotKpi phải ≥ 2 — khách vãng lai phải nhiều hơn chỉ tiêu thì mới phủ kín ca');
  assert.ok(/R\.today\.walkin = Math\.max\(\s*Math\.round\(R\.today\.cap \* \(cfg\.balance\?\.khachVuotKpi/.test(main),
    'startSell phải dựng lịch từ walkin = cap × khachVuotKpi (có sàn phủ kín ca)');
  assert.ok(/Math\.ceil\(R\.shiftMs \/ KHE_LIEN_TUC_MS\)/.test(main),
    'walkin phải có SÀN = shiftMs / KHE_LIEN_TUC_MS để ngày KPI thấp vẫn phủ kín ca tới 22:00');
  assert.ok(/buildArrivals\(R\.today\.walkin/.test(main),
    'buildArrivals phải nhận walkin — dựng lịch bằng R.today.cap là vi phạm luật KPI mềm');
  assert.ok(!/buildArrivals\(R\.today\.cap,/.test(main),
    'còn chỗ nào dựng lịch đúng bằng chỉ tiêu — đủ KPI sẽ hết khách giữa ca');
  /* savepoint giữa ngày cũng phải nối tiếp theo walkin, không theo cap */
  assert.ok(/walkin - R\.today\.arrived/.test(main),
    'resumeSell phải tính khách còn lại theo walkin');
});

test('L2 · lịch vãng lai phủ kín ca tới sát 22:00, không khe bất thường ở phần chính ca', () => {
  const cfg = makeCFG();
  const heSo = cfg.balance.khachVuotKpi;
  const total = shiftMs();
  for (const cap of [6, 10, 12, 20]) {
    const walkin = Math.round(cap * heSo);
    const a = buildArrivals(walkin, total, rng(cap));
    assert.equal(a.length, walkin, `cap ${cap}: lịch phải đúng ${walkin} mốc vãng lai`);
    /* mốc cuối sát giờ đóng (main.js kẹp về shiftMs - 3000) */
    const cuoi = Math.min(a[a.length - 1], total - 3000);
    assert.ok(cuoi >= total * 0.9,
      `cap ${cap}: khách cuối ${Math.round(cuoi)}ms < 90% ca (${Math.round(total * 0.9)}ms) — ca bị hụt đuôi`);
    /* phần chính ca (0-90%) không khe nào quá 18 giây nền */
    for (let i = 1; i < a.length; i++) {
      if (a[i] < total * 0.9) {
        assert.ok(a[i] - a[i - 1] <= 18000 + 1200,
          `cap ${cap}: khe ${Math.round(a[i] - a[i - 1])}ms tại mốc ${i} — khách thưa bất thường`);
      }
    }
  }
});

test('L2b · mô phỏng mời khách như main.js: đủ KPI rồi khách VẪN vào tới cuối ca', () => {
  const cfg = makeCFG();
  const nhanh = cfg.balance.moiNhanhNhat;
  const total = shiftMs();
  const cap = 10;
  /* đúng công thức main.js: walkin = max(cap × hệ số, sàn phủ ca) */
  const walkin = Math.max(Math.round(cap * cfg.balance.khachVuotKpi), Math.ceil(total / KHE_LIEN_TUC_MS));
  const lich = buildArrivals(walkin, total, rng(10));
  /* chủ quán phục vụ siêu nhanh: luôn còn chỗ, mời ngay khi được phép (đúng công thức main.js) */
  let truoc = -1e9, idx = 0, datKpiAt = null;
  while (idx < lich.length) {
    const somNhat = Math.max(lich[idx] / nhanh, truoc + KHE_LIEN_TUC_MS);
    const tai = Math.min(somNhat, total - 3000);
    if (idx + 1 === cap) datKpiAt = tai;    /* mốc đạt đủ chỉ tiêu (khách thứ 10) */
    truoc = tai; idx++;
  }
  assert.ok(datKpiAt !== null && datKpiAt < total * 0.6,
    'giả định của test: với chủ quán nhanh, đủ KPI phải xảy ra TRƯỚC 60% ca');
  assert.ok(truoc >= total * 0.9,
    `khách cuối vào lúc ${Math.round(truoc)}ms — phải sát 22:00 (${Math.round(total)}ms), không được dừng ở mốc đạt KPI`);
});

test('L3 · autoCloseCheck không có đường nào đóng ngày vì đủ chỉ tiêu', () => {
  const i = main.indexOf('function autoCloseCheck');
  const than = main.slice(i, i + 1800);
  assert.ok(than.length > 100, 'không tìm thấy autoCloseCheck');
  assert.ok(!/arrived >= R\.today\.cap/.test(than) && !/arrived\s*>=\s*cap/.test(than),
    'autoCloseCheck còn so arrived với chỉ tiêu — đủ KPI là đóng, sai luật');
  assert.ok(/hetHang = !canCook\(\)/.test(than),
    'đóng sớm phải do HẾT NGUYÊN LIỆU chứ không phải hết chỉ tiêu');
  assert.ok(/hetLich/.test(than) && /R\.spawnIdx >= R\.arrivals\.length/.test(than),
    'đóng sớm do hết lịch phải so spawnIdx với cuối lịch vãng lai');
});

test('L4 · 22:00 là nơi duy nhất kết thúc ca theo giờ (el >= shiftMs → endDay)', () => {
  const dem = (main.match(/el >= R\.shiftMs\) endDay\(\)|el >= dayMs\) endDay\(\)/g) || []).length;
  assert.ok(dem >= 2, 'cả startSell và resumeSell đều phải đóng ca khi hết giờ — thấy ' + dem + ' chỗ');
});

test('HUD hiện ĐẠT/VƯỢT chỉ tiêu (mốc mềm, không phải trần cứng)', () => {
  assert.ok(/VƯỢT CHỈ TIÊU/.test(main) && /ĐẠT CHỈ TIÊU/.test(main),
    'màn tổng kết phải phân biệt ĐẠT và VƯỢT chỉ tiêu');
});

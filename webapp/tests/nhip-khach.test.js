/* tests/nhip-khach.test.js — HÀNG RÀO NHỊP KHÁCH (yêu cầu "khách vào liên tục", 08/10/2026)
 *
 * Chủ dự án yêu cầu khách vào liên tục thay vì thưa 15-20 giây. Hai thứ phải cùng đúng:
 *   1. LỊCH khách (engine/shift.js) — không khe nào thưa quá KHE_LIEN_TUC_MS ở phần đầu ca,
 *      vẫn đúng tổng số khách của trần hôm nay, vẫn cách nhau tối thiểu MIN_GAP_MS;
 *   2. CÁCH MỜI khách (main.js) — chỉ mời khi CÒN CHỖ NGỒI TRỐNG và được phép đẩy nhanh tối đa
 *      `moiNhanhNhat` lần so với nhịp nền. Thiếu một trong hai là quán lại thưa.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArrivals, shiftMs, MIN_GAP_MS, KHE_LIEN_TUC_MS, KHE_NEN_MS } from '../js/engine/shift.js';
import { makeCFG } from '../js/engine/config.js';

const rng = (seed = 7) => { let x = seed; return { next: () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648 }; };
const GAME = new URL('..', import.meta.url).pathname;

test('lịch khách: đúng tổng số của trần, nằm trong ca, không ai cách nhau dưới MIN_GAP', () => {
  for (const cap of [3, 10, 12, 26, 40]) {
    const a = buildArrivals(cap, shiftMs(), rng(cap));
    assert.equal(a.length, cap, `cap ${cap}: phải đúng ${cap} mốc khách`);
    assert.ok(a.every(t => t >= 0 && t <= shiftMs()), `cap ${cap}: mọi mốc phải nằm trong ca`);
    for (let i = 1; i < a.length; i++) {
      assert.ok(a[i] - a[i - 1] >= MIN_GAP_MS, `cap ${cap}: hai khách cách nhau ${a[i] - a[i - 1]}ms < ${MIN_GAP_MS}ms`);
    }
  }
});

test('lịch nền: phần đầu ca không khe nào thưa quá KHE_NEN_MS (18 giây)', () => {
  const total = shiftMs();
  for (const cap of [10, 12, 20, 26]) {
    const a = buildArrivals(cap, total, rng(cap + 1));
    const khe = a.slice(1).map((t, i) => t - a[i]);
    const xau = khe.filter((g, i) => a[i] < total * 0.75 && g > KHE_NEN_MS + 600);
    assert.equal(xau.length, 0, `cap ${cap}: còn ${xau.length} khe nền thưa quá ${KHE_NEN_MS}ms (${xau.join(', ')})`);
  }
});

test('khi chủ quán phục vụ kịp: khách vào đều mỗi KHE_LIEN_TUC_MS suốt ca (luật 08/10 đêm)', () => {
  const cfg = makeCFG();
  const nhanh = cfg.balance?.moiNhanhNhat ?? 3;
  const total = shiftMs();
  /* số mốc vãng lai theo ĐÚNG công thức main.js: cap × khachVuotKpi, có SÀN phủ kín ca */
  const san = Math.ceil(total / KHE_LIEN_TUC_MS);
  for (const cap of [10, 20, 26]) {
    const walkin = Math.max(Math.round(cap * (cfg.balance.khachVuotKpi ?? 2)), san);
    const a = buildArrivals(walkin, total, rng(cap + 5));
    /* mô phỏng đúng công thức mời khách mới của main.js (chủ quán nhanh, luôn còn chỗ):
     * mốc mời = max(mốc nền ÷ moiNhanhNhat, lượt trước + KHE_LIEN_TUC_MS).
     * Luật CŨ (mốc nền ÷ nhanh, KHÔNG sàn 6s) hút cả ca vào 1/3 đầu — luật MỚI phải rải đều. */
    let truoc = -1e9;
    const khe = [];
    for (const moc of a) {
      const somNhat = Math.max(moc / nhanh, truoc + KHE_LIEN_TUC_MS);
      if (truoc > 0) khe.push(somNhat - truoc);
      truoc = somNhat;
    }
    const lonNhat = Math.max(...khe);
    assert.ok(lonNhat <= KHE_LIEN_TUC_MS + 2500,
      `cap ${cap}: phục vụ kịp mà vẫn có khe ${Math.round(lonNhat)}ms — khách lại dồn/thưa bất thường`);
    /* và mốc mời cuối phải phủ gần hết ca — không được "hết khách" từ giữa ca */
    assert.ok(truoc >= total * 0.9,
      `cap ${cap}: khách cuối vào lúc ${Math.round(truoc)}ms < 90% ca — ca bị hút cạn sớm`);
  }
});

test('cfg có tay vặn "mời nhanh nhất" và nó nằm trong khoảng hợp lý', () => {
  const cfg = makeCFG();
  const n = cfg.balance?.moiNhanhNhat;
  assert.ok(typeof n === 'number' && n >= 1 && n <= 5, 'moiNhanhNhat phải là số 1..5, đang là ' + n);
});

test('main.js: chỉ mời khách khi còn chỗ ngồi + có khe tối thiểu + đẩy nhanh theo tay vặn', () => {
  const src = fs.readFileSync(path.join(GAME, 'js', 'main.js'), 'utf8');
  assert.ok(/conCho\s*=\s*R\.slots\.some/.test(src), 'thiếu điều kiện "còn chỗ ngồi" khi mời khách');
  assert.ok(/duGian\s*=\s*el - \(R\.lastArrivalAt/.test(src), 'thiếu khe tối thiểu giữa hai khách');
  assert.ok(/moiNhanhNhat/.test(src), 'thiếu tay vặn moiNhanhNhat trong nhịp mời khách');
  assert.ok(/R\.lastArrivalAt = el/.test(src), 'thiếu việc ghi mốc khách vừa ghé');
});

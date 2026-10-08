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

test('khi chủ quán phục vụ kịp: khách vào sớm nhất mỗi KHE_LIEN_TUC_MS (6 giây)', () => {
  const cfg = makeCFG();
  const nhanh = cfg.balance?.moiNhanhNhat ?? 3;
  const total = shiftMs();
  for (const cap of [10, 12, 20]) {
    const a = buildArrivals(cap, total, rng(cap + 5));
    /* mốc sớm nhất có thể = mốc nền ÷ hệ số đẩy nhanh */
    const som = a.map(t => t / nhanh);
    for (let i = 1; i < som.length; i++) {
      if (a[i] < total * 0.75) {
        assert.ok(som[i] - som[i - 1] <= KHE_LIEN_TUC_MS + 1200,
          `cap ${cap}: khi phục vụ kịp vẫn còn khe ${Math.round(som[i] - som[i - 1])}ms > ${KHE_LIEN_TUC_MS}ms`);
      }
    }
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

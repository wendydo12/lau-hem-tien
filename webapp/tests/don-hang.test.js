/* tests/don-hang.test.js — HÀNG RÀO "PHÂN BỐ ĐƠN HÀNG CÂN" (yêu cầu chủ dự án 08/10/2026:
 * "sao ta ko thấy khách order nồi lớn ... nhớ random cho nó balance các chi tiết")
 *
 * Lỗi gốc: bản 07/10 để cỡ nồi Lớn ăn 0% trong 3 ngày đầu → người chơi mới không bao giờ gặp,
 * tưởng game thiếu tính năng. Nay mọi ngày đều CÓ thể gặp nồi lớn, nhưng tần suất leo thang đều
 * và vẫn tôn trọng luật giá (đắt quá thì gần như không ai gọi).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCFG } from '../js/engine/config.js';
import { fresh } from '../js/engine/state.js';
import { genOrder, potCount, dipChance } from '../js/engine/orders.js';
import { makeRNG } from '../js/engine/rng.js';
import { lChance } from '../js/engine/economy.js';

const cfg = makeCFG();
const S = fresh(cfg);
const napKho = d => { for (const k of Object.keys(S.stock)) S.stock[k] = [{ q: 999, exp: d + 99 }]; };

/* đo tần suất cỡ nồi Lớn và số ly có nước chấm ở một ngày */
function doNgay(d, N = 4000) {
  S.day = d; napKho(d);
  const rng = makeRNG(9000 + d);
  let L = 0, cham = 0, ly = 0, noi = 0;
  for (let i = 0; i < N; i++) {
    const soNoi = potCount(d, rng); noi += soNoi;
    for (let c = 0; c < soNoi; c++) { const o = genOrder(S, cfg, rng); if (o.size === 'L') L++; if (o.dip) cham++; ly++; }
  }
  return { L: L / ly, cham: cham / ly, noiTb: noi / N };
}

test('nồi Lớn phải xuất hiện NGAY TỪ NGÀY 1 (hiếm nhưng có)', () => {
  for (const d of [1, 2, 3]) {
    S.day = d; napKho(d);
    const c = lChance(S, cfg);
    assert.ok(c >= .03, `ngày ${d}: cơ hội nồi lớn ${c} — quá thấp, người chơi sẽ tưởng không có`);
    const do_ = doNgay(d, 3000);
    assert.ok(do_.L > 0, `ngày ${d}: đo thật không ra ly nồi lớn nào`);
  }
});

test('cỡ nồi Lớn leo thang đều, không nhảy bậc', () => {
  const moc = [1, 5, 10, 20, 40].map(d => { S.day = d; napKho(d); return lChance(S, cfg); });
  for (let i = 1; i < moc.length; i++) {
    assert.ok(moc[i] >= moc[i - 1], `cơ hội nồi lớn giảm ở mốc ${i}: ${moc.join(' → ')}`);
    assert.ok(moc[i] - moc[i - 1] <= .12, `cơ hội nồi lớn nhảy bậc quá nhanh: ${moc.join(' → ')}`);
  }
  assert.ok(moc[moc.length - 1] <= .40, 'nồi lớn không được vượt 40% ly');
});

test('luật giá vẫn giữ: đắt quá thì gần như không ai gọi, chạm trần thì không ai gọi', () => {
  const S2 = fresh(cfg);
  S2.day = 20;
  S2.sell.L = cfg.sizeWarn + 1000;                 /* đắt hơn mức "nhắc" */
  assert.ok(lChance(S2, cfg) <= .05, 'bán nồi lớn quá đắt mà vẫn nhiều khách gọi');
  S2.sell.L = cfg.sizeCap;                         /* chạm trần phụ thu */
  assert.equal(lChance(S2, cfg), 0, 'chạm trần phụ thu thì phải KHÔNG ai gọi nồi lớn');
});

test('các chi tiết khác cũng có bậc thang: số nồi và nước chấm tăng dần theo ngày', () => {
  const d1 = doNgay(1, 2000), d8 = doNgay(8, 2000), d30 = doNgay(30, 2000);
  assert.ok(d1.noiTb === 1, 'ngày 1 phải đúng 1 nồi mỗi khách (học việc)');
  assert.ok(d8.noiTb > d1.noiTb && d30.noiTb > d8.noiTb, `số nồi không leo đều: ${d1.noiTb} → ${d8.noiTb} → ${d30.noiTb}`);
  assert.equal(dipChance(1, cfg), 0, 'ngày 1 chưa có nước chấm');
  assert.ok(d8.cham > 0, 'ngày 8 phải bắt đầu có khách gọi nước chấm');
  assert.ok(d8.cham < d30.cham, 'nước chấm phải leo thang theo ngày');
});

test('không bao giờ gọi món hết hàng (kể cả nồi lớn) — kho trống thì đơn trơn', () => {
  const S3 = fresh(cfg);
  S3.day = 12;                                     /* kho TRỐNG hoàn toàn */
  const rng = makeRNG(11);
  for (let i = 0; i < 400; i++) {
    const o = genOrder(S3, cfg, rng);
    assert.equal(o.tops.length, 0, 'kho trống mà vẫn gọi món nhúng');
    assert.equal(o.dip, null, 'kho trống mà vẫn gọi nước chấm');
  }
});

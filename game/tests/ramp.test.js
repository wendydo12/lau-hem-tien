/* tests/ramp.test.js — LEO THANG ĐƠN HÀNG THEO NGÀY (yêu cầu thiết kế 07/10/2026)
 * "yêu cầu add-ons của khách tăng từ từ" — đo bằng số: mỗi ngày một nhích, không nhảy bậc,
 * và ngày đầu phải thật dễ để người chơi vào guồng. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCFG } from '../js/engine/config.js';
import { fresh } from '../js/engine/state.js';
import { ITEMS } from '../js/engine/data.js';
import { addStock } from '../js/engine/stock.js';
import { genOrder, levelOf, maxTops, potCount, dipChance, spicyChance } from '../js/engine/orders.js';
import { lChance } from '../js/engine/economy.js';
import { makeRNG } from '../js/engine/rng.js';

const cfg = makeCFG();

/* trạng thái "mở hết món + đầy kho" để đo đúng phần LEO THANG, không bị chặn vì thiếu hàng */
function S(day) {
  const s = fresh(cfg);
  s.day = day; s.seed = 20261007;
  Object.keys(s.unlocked).forEach(k => { s.unlocked[k] = true; });
  Object.keys(ITEMS).forEach(k => addStock(s, k, 99, cfg));
  s.money = 99999999;
  return s;
}
const doDai = o => (o.dip ? 1 : 0) + o.tops.length + (o.spicy != null ? 1 : 0) + (o.size === 'L' ? 1 : 0);

/* trung bình "số thứ khách đòi thêm" mỗi đơn ở một ngày */
function tbDoDai(day, n = 300) {
  const s = S(day), r = makeRNG(1000 + day);
  let tong = 0, soLan = 0, dip = 0, spicy = 0, toplon = 0;
  for (let i = 0; i < n; i++) {
    const o = genOrder(s, cfg, r, levelOf(day, cfg));
    if (o.so) continue;
    soLan++;
    tong += doDai(o);
    if (o.dip) dip++;
    if (o.spicy != null) spicy++;
    if (o.size === 'L') toplon++;
  }
  return { tb: tong / Math.max(1, soLan), dip: dip / soLan, spicy: spicy / soLan, toplon: toplon / soLan };
}

test('ngày đầu phải thật DỄ: ngày 1-2 đơn trơn (1 món nhúng, không chấm, không cay, cỡ nhỏ)', () => {
  for (const day of [1, 2]) {
    const s = S(day), r = makeRNG(77);
    for (let i = 0; i < 200; i++) {
      const o = genOrder(s, cfg, r, levelOf(day, cfg));
      assert.equal(o.dip, null, 'ngày ' + day + ' chưa có nước chấm');
      assert.equal(o.spicy, null, 'ngày ' + day + ' chưa có cay');
      assert.equal(o.size, 'N', 'ngày ' + day + ' chỉ nồi nhỏ');
      assert.ok(o.tops.length <= 1, 'ngày ' + day + ' tối đa 1 món nhúng');
    }
    assert.equal(potCount(day, makeRNG(9)), 1, 'ngày ' + day + ' mỗi khách 1 nồi');
  }
});

test('leo thang KHÔNG nhảy bậc: độ dài đơn trung bình mỗi ngày một nhích', () => {
  const ngay = [1, 2, 3, 5, 6, 7, 9, 10, 12, 15, 16, 20, 25, 29, 30, 35, 45, 50, 60];
  const tb = ngay.map(d => tbDoDai(d).tb);
  /* tăng dần theo xu hướng chung */
  assert.ok(tb[tb.length - 1] > tb[0] + 1.0, 'ngày 60 phải đòi nhiều hơn ngày 1 rõ rệt');
  /* mỗi bước không được nhảy quá 1,1 "món đòi thêm" (bản cũ nhảy ~2,5 ở ngày 30) */
  for (let i = 1; i < tb.length; i++) {
    assert.ok(tb[i] - tb[i - 1] <= 1.1, 'ngày ' + ngay[i] + ' nhảy quá nhanh: ' + tb[i - 1].toFixed(2) + ' → ' + tb[i].toFixed(2));
  }
  /* và không được tụt sâu (trừ nhiễu) */
  for (let i = 1; i < tb.length; i++) {
    assert.ok(tb[i] - tb[i - 1] >= -0.45, 'ngày ' + ngay[i] + ' tụt bất thường');
  }
});

test('từng thứ đòi thêm đều leo thang riêng: chấm · cay · cỡ lớn · số nồi', () => {
  /* nước chấm: ngày 1-5 chưa có, từ ngày 6 mới xuất hiện và tăng dần */
  for (const d of [1, 3, 5]) assert.equal(dipChance(d, cfg), 0, 'ngày ' + d + ' chưa có chấm');
  assert.ok(dipChance(6, cfg) > 0 && dipChance(6, cfg) < dipChance(30, cfg) && dipChance(30, cfg) < dipChance(60, cfg));
  /* cay: y như chấm, và ngày 6 chỉ một phần khách đòi (bản cũ: 100%) */
  for (const d of [1, 3, 5]) assert.equal(spicyChance(d, cfg), 0);
  assert.ok(spicyChance(6, cfg) <= .3, 'ngày 6 chỉ ~25% khách đòi cay');
  assert.ok(spicyChance(60, cfg) > spicyChance(30, cfg));
  /* cỡ nồi L: ngày 1-3 chưa có (bản cũ 35% ngay ngày 1) */
  const s3 = S(3), s4 = S(4), s30 = S(30);
  assert.equal(lChance(s3, cfg), 0);
  assert.ok(lChance(s4, cfg) > 0 && lChance(s4, cfg) < lChance(s30, cfg));
  /* số nồi: chỉ 1 cho tới ngày 5, sau đó mới dần có 2+ nồi */
  const trung = {};
  for (const d of [1, 5, 9, 15, 29, 40, 60]) {
    const r = makeRNG(555 + d);
    let t = 0; const N = 400;
    for (let i = 0; i < N; i++) t += potCount(d, r);
    trung[d] = t / N;
    assert.ok(trung[d] >= 1 && trung[d] <= 5, 'số nồi luôn 1..5');
  }
  assert.equal(trung[1], 1);
  assert.equal(trung[5], 1);
  for (const d of [9, 15, 29, 40, 60]) assert.ok(trung[d] >= trung[1], 'ngày ' + d + ' ≥ ngày 1');
  assert.ok(trung[60] > trung[9], 'về sau khách gọi nhiều nồi hơn hẳn');
  assert.ok(trung[9] < 1.3, 'ngày 9 vẫn nhẹ (≤ ~1,2 nồi/khách)');
});

test('trần món nhúng: bậc thang mượt 1→2→3→4→5, không bao giờ tụt', () => {
  let truoc = 0;
  for (let d = 1; d <= 90; d++) {
    const t = maxTops(d, cfg);
    assert.ok(t >= truoc, 'ngày ' + d + ' không được tụt');
    assert.ok(t - truoc <= 1, 'ngày ' + d + ' nhảy quá 1 bậc');
    truoc = t;
  }
  assert.equal(maxTops(1, cfg), 1);
  assert.equal(maxTops(90, cfg), 5);
});

test('đo thật: ngày 6 khách KHÔNG đòi cay 100% nữa, ngày 30 không còn sốc 2-5 nồi', () => {
  const d6 = tbDoDai(6), d30 = tbDoDai(30);
  assert.ok(d6.spicy < .45, 'ngày 6 tỉ lệ đòi cay phải dưới 45% (bản cũ 100%), thực tế ' + Math.round(d6.spicy * 100) + '%');
  assert.ok(d6.dip < .45, 'ngày 6 tỉ lệ đòi chấm phải dưới 45%, thực tế ' + Math.round(d6.dip * 100) + '%');
  let nhieuNoi = 0; const r = makeRNG(4242);
  for (let i = 0; i < 500; i++) if (potCount(30, r) >= 3) nhieuNoi++;
  assert.ok(nhieuNoi / 500 < .35, 'ngày 30 đơn 3+ nồi phải dưới 35%, thực tế ' + Math.round(nhieuNoi / 5) + '%');
});

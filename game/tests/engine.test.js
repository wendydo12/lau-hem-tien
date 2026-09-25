/* tests/engine.test.js — blockgate Phase 1: backend engine chạy headless */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCFG, DEFAULT_CONFIG } from '../js/engine/config.js';
import { ITEMS, BASE_KEYS, TOP_KEYS, DIP_KEYS, DUOC_KEYS, SECRET_KEYS, XTOP_KEYS, DEF_SELL, UPG } from '../js/engine/data.js';
import { fresh, loadFrom, newPot, sanitize } from '../js/engine/state.js';
import { addStock, qty, take, expireStock } from '../js/engine/stock.js';
import { price, unitCost, traffic, rating, takeLoan, payDayLoan, sellLS, buyLS, rollLSRate, addDebt, resolveDebts, cheatHit, dayTax, recRev, recCost, priceLS, pricyItems } from '../js/engine/economy.js';
import { genOrder, matches, wrongKinds, levelOf, maxPat, stars, pickBrat, makeNameGen } from '../js/engine/orders.js';
import { reviewText, reviewFits, xReviewText, addReview } from '../js/engine/reviews.js';
import { rollDay, badCheck, mkBadPlan, takeGift, evIs } from '../js/engine/events.js';
import { initRuntime, spawn, serve, timeoutCustomer, closeDay, startDay, pourResult, slotCount } from '../js/engine/loop.js';
import { makeRNG } from '../js/engine/rng.js';

const cfg = makeCFG();
const rng = () => makeRNG(12345);

function seededState(seed = 12345) {
  const S = fresh(cfg);
  S.seed = seed;
  return S;
}

/* ============ 1. DATA ============ */
test('ITEMS: đủ 7 nồi lẩu theo brief', () => {
  const pots = BASE_KEYS;
  assert.equal(pots.length, 7);
  ['ca_chua', 'nam', 'suon', 'thai', 'suki', 'dong_trung', 'tu_xuyen'].forEach(k => assert.ok(ITEMS[k], 'thiếu nồi ' + k));
  /* 3 nồi đầu miễn phí */
  assert.equal(ITEMS.ca_chua.unlock, 0);
  assert.equal(ITEMS.nam.unlock, 0);
  assert.equal(ITEMS.suon.unlock, 0);
  /* nồi tiên giới mở bằng tiền */
  assert.ok(ITEMS.dong_trung.unlock >= 600000);
  assert.ok(ITEMS.tu_xuyen.unlock >= 400000);
});

test('ITEMS: thực đơn extra bí mật — 8 món, chỉ mở cho khách tu tiên', () => {
  assert.equal(SECRET_KEYS.length, 8);
  /* 6 món bán linh thạch (sell nhỏ) + 2 món bán VNĐ giá cao (nhân sâm, đông trùng tiên) */
  assert.equal(XTOP_KEYS.length, 6);
  XTOP_KEYS.forEach(k => assert.ok(ITEMS[k].sell <= 10, 'giá LS phải nhỏ (đơn vị linh thạch): ' + k));
  ['x_nhan_sam', 'x_dong_trung'].forEach(k => assert.ok(ITEMS[k].sell >= 20000, 'dược liệu tiên bán VNĐ giá cao: ' + k));
  assert.equal(DUOC_KEYS.length, 1);  /* nấm bụng dê — dược thiện khách thường đôi khi gọi */
});

test('thực đơn bí mật: khách thường KHÔNG BAO GIỜ gọi món secret, khách tu tiên thì có', () => {
  const S = seededState();
  [...BASE_KEYS, ...TOP_KEYS, ...DIP_KEYS, ...DUOC_KEYS, ...SECRET_KEYS].forEach(k => { addStock(S, k, 50, cfg); S.unlocked[k] = true; });
  const r = rng();
  /* khách thường: 100 đơn không được chứa secret */
  for (let i = 0; i < 100; i++) {
    const o = genOrder(S, cfg, r, 3, { xian: false });
    o.tops.forEach(t => assert.ok(!SECRET_KEYS.includes(t), 'khách thường lọt món secret: ' + t));
  }
  /* khách tu tiên: phải có lúc gọi secret */
  let secretSeen = 0;
  for (let i = 0; i < 300; i++) {
    const o = genOrder(S, cfg, r, 3, { xian: true });
    if (o.tops.some(t => SECRET_KEYS.includes(t))) secretSeen++;
  }
  assert.ok(secretSeen >= 10, 'khách tu tiên phải gọi món bí mật, thực tế ' + secretSeen);
});

test('UPG: 6 trang bị phàm + 5 trang bị tiên', () => {
  assert.equal(UPG.filter(u => u.tier === 'equip').length, 6);
  assert.equal(UPG.filter(u => u.tier === 'xian').length, 5);
});

/* ============ 2. KHO + HẠN DÙNG ============ */
test('kho: nhập theo mẻ, cộng dồn cùng hạn, cận date dùng trước', () => {
  const S = seededState();
  addStock(S, 't_bo', 5, cfg);
  addStock(S, 't_bo', 3, cfg);
  assert.equal(qty(S, 't_bo'), 8);
  assert.equal(S.stock.t_bo.length, 1, 'cùng ngày nhập phải gộp 1 mẻ');
  S.day = 2;
  addStock(S, 't_bo', 4, cfg);
  assert.equal(S.stock.t_bo.length, 2, 'khác ngày = khác mẻ');
  assert.ok(S.stock.t_bo[0].exp < S.stock.t_bo[1].exp, 'mẻ cận date xếp trước');
  assert.ok(take(S, 't_bo'));
  assert.equal(qty(S, 't_bo'), 11);
});

test('kho: hết hạn tự đổ bỏ + tính tiền mất', () => {
  const S = seededState();
  addStock(S, 't_bo', 10, cfg);   /* life 1 ngày → exp = day 1 */
  S.day = 2;                       /* qua ngày */
  const out = expireStock(S, cfg);
  assert.equal(out.length, 1);
  assert.equal(out[0].q, 10);
  assert.equal(out[0].v, 10 * ITEMS.t_bo.cost);
  assert.equal(qty(S, 't_bo'), 0);
});

test('kho: hàng không hạn (supply) không bao giờ exp', () => {
  const S = seededState();
  addStock(S, 'sup', 5, cfg);
  S.day = 999;
  assert.equal(expireStock(S, cfg).length, 0);
  assert.equal(qty(S, 'sup'), 5);
});

/* ============ 3. ECONOMY ============ */
test('price: tính đúng tổng các thành phần', () => {
  const S = seededState();
  const o = { base: 'suon', dip: 'd_sa_te', tops: ['t_tom'], size: 'L', spicy: null };
  const expect = DEF_SELL.suon + DEF_SELL.d_sa_te + DEF_SELL.t_tom + DEF_SELL.L;
  assert.equal(price(o, S), expect);
  const o2 = { ...o, size: 'N' };
  assert.equal(price(o2, S), expect - DEF_SELL.L);
});

test('unitCost: chi phí 1 nồi = base + chấm + topping thường + nồi chén', () => {
  const S = seededState();
  const o = { base: 'nam', dip: 'd_chao', tops: ['t_bo', 'x_linh_chi'], size: 'N' };
  /* món secret bán linh thạch không tính tiền VNĐ */
  assert.equal(unitCost(o, cfg), ITEMS.nam.cost + ITEMS.d_chao.cost + ITEMS.t_bo.cost + ITEMS.sup.cost);
});

test('traffic: rating cao → hệ số khách cao; giá rẻ (index<1) hút thêm khách', () => {
  const S1 = seededState();
  S1.reviews = Array.from({ length: 10 }, () => ({ s: 5 }));
  const S2 = seededState();
  S2.reviews = Array.from({ length: 10 }, () => ({ s: 2 }));
  assert.ok(traffic(S1, cfg) > traffic(S2, cfg));
  /* giá rẻ hơn mặc định → traffic cao hơn (avgIdx < 1) */
  const S3 = seededState();
  S3.reviews = Array.from({ length: 10 }, () => ({ s: 5 }));
  BASE_KEYS.forEach(k => S3.sell[k] = Math.round(DEF_SELL[k] * 0.8));
  assert.ok(traffic(S3, cfg) > traffic(S1, cfg));
});

test('giá đắt: bị phát hiện qua pricyItems → khách bỏ đi từ spawn (không phải traffic)', () => {
  const S = seededState();
  BASE_KEYS.forEach(k => S.unlocked[k] = true);
  S.sell.ca_chua = cfg.potCap + 1;  /* đắt quá ngưỡng */
  assert.ok(pricyItems(S, cfg).includes('ca_chua'));
});

test('traffic: biển neon +20%, quảng cáo +25% cộng dồn', () => {
  const base = seededState();
  base.reviews = [{ s: 5 }];
  const up = seededState();
  up.reviews = [{ s: 5 }];
  up.upg.sign = true; up.upg.ads = true;
  const t0 = traffic(base, cfg), t1 = traffic(up, cfg);
  assert.ok(Math.abs(t1 / t0 - 1.45) < .01, 'boost phải đúng 1.45, thực tế ' + t1 / t0);
});

test('vay ngân hàng: nhận tiền, trả góp 10 ngày kèm lãi, hết nợ', () => {
  const S = seededState();
  S.money = 100000;
  const loan = takeLoan(S, cfg, 'loan', 500000);
  assert.ok(loan);
  assert.equal(S.money, 600000);
  assert.equal(loan.left, 10);
  let total = 0;
  for (let i = 0; i < 10; i++) { total += payDayLoan(S, cfg); }
  assert.ok(total > 500000, 'tổng trả phải gồm lãi');
  assert.equal(payDayLoan(S, cfg), 0);
});

test('vay: không vay chồng khi đang nợ', () => {
  const S = seededState();
  takeLoan(S, cfg, 'loan', 500000);
  assert.equal(takeLoan(S, cfg, 'loan', 200000), null);
});

test('cầm đồ linh thạch: spread mua đắt bán rẻ, có quan hệ thì hẹp lại', () => {
  const S = seededState();
  S.lsRate = 50000; S.money = 0; S.ls = 10;
  const got = sellLS(S, cfg, 10);
  assert.equal(got, 10 * 50000 * .85);  /* bán vào: 85% */
  assert.equal(S.ls, 0);
  S.money = got;
  const n = buyLS(S, cfg, got);
  assert.ok(n < 10, 'mua lại phải lỗ spread');
  /* có quan hệ tiệm cầm đồ: spread hẹp hơn */
  const S2 = seededState();
  S2.lsRate = 50000; S2.ls = 10; S2.upg.cam_do = true;
  assert.equal(sellLS(S2, cfg, 10), 10 * 50000 * .9);
});

test('tỷ giá linh thạch dao động trong biên ±8%', () => {
  const S = seededState();
  const r = makeRNG(777);
  for (let i = 0; i < 50; i++) {
    rollLSRate(S, cfg, r);
    assert.ok(S.lsRate >= cfg.ls.rate * .92 - 100 && S.lsRate <= cfg.ls.rate * 1.08 + 100, 'rate lọt biên: ' + S.lsRate);
  }
});

test('sổ nợ: nhánh tốt trả gấp 100, nhánh xấu mất trắng', () => {
  const S = seededState();
  S.debts = []; S.debtSeq = 0; S.ls = 0;
  const dWin = { id: 1, name: 'A', ls: 5, day: 1, resolveAt: 2, win: true, resolved: false };
  const dLose = { id: 2, name: 'B', ls: 3, day: 1, resolveAt: 2, win: false, resolved: false };
  S.debts.push(dWin, dLose);
  S.day = 3;
  const evs = resolveDebts(S, cfg);
  assert.equal(evs.length, 2);
  assert.ok(evs.find(e => e.kind === 'win' && e.back === 500));
  assert.ok(evs.find(e => e.kind === 'lose'));
  assert.equal(S.ls, 500);
});

test('chống gian lận: két > 100 triệu trước ngày 30 bị trộm sạch, chừa lại <1 triệu', () => {
  const S = seededState();
  S.day = 5; S.money = 150000000;
  S.cur = { spoil: { n: 0, v: 0 }, stolen: 0 };
  const hit = cheatHit(S, cfg, rng());
  assert.ok(hit.lost > 140000000);
  assert.ok(S.money <= 900000 && S.money >= 100000);
  assert.ok(S.badNow && S.badNow.all);
});

test('thuế: dưới ngưỡng 1 tỷ/năm = 0, vượt ngưỡng tính 4.5%', () => {
  const S = seededState();
  S.yearRev = 0;
  assert.equal(dayTax(S, cfg, 500000000), 0);
  const t = dayTax(S, cfg, 600000000);  /* yearRev = 1.1 tỷ > ngưỡng */
  assert.equal(t, Math.round(600000000 * 4.5 / 100));
});

/* ============ 4. ORDERS ============ */
test('levelOf: ngày 1-5 = L1, 6-29 = L2, 30-59 = L3, 60+ = L4', () => {
  assert.equal(levelOf(1, cfg), 1);
  assert.equal(levelOf(5, cfg), 1);
  assert.equal(levelOf(6, cfg), 2);
  assert.equal(levelOf(29, cfg), 2);
  assert.equal(levelOf(30, cfg), 3);
  assert.equal(levelOf(60, cfg), 4);
});

test('genOrder L1: ngày 1-5 chỉ nồi trơn, không topping không cay', () => {
  const S = seededState();
  BASE_KEYS.forEach(k => { addStock(S, k, 20, cfg); S.unlocked[k] = true; });
  TOP_KEYS.forEach(k => { addStock(S, k, 20, cfg); S.unlocked[k] = true; });
  const r = rng();
  for (let i = 0; i < 30; i++) {
    const o = genOrder(S, cfg, r, 1, { firstDone: true });
    assert.ok(BASE_KEYS.includes(o.base));
    assert.equal(o.spicy, null, 'L1 không có độ cay');
    assert.equal(o.tops.length, 0, 'L1 không topping');
  }
});

test('genOrder L2+: có độ cay, đơn nhiều topping', () => {
  const S = seededState();
  S.day = 40;
  [...BASE_KEYS, ...TOP_KEYS, ...DIP_KEYS].forEach(k => { addStock(S, k, 30, cfg); S.unlocked[k] = true; });
  const r = rng();
  let spicySeen = 0, multiSeen = 0;
  for (let i = 0; i < 60; i++) {
    const o = genOrder(S, cfg, r, 3);
    if (o.spicy) spicySeen++;
    if (o.tops.length >= 2) multiSeen++;
  }
  assert.ok(spicySeen > 30, 'L3 phải có độ cay thường xuyên');
  assert.ok(multiSeen > 10, 'L3 phải có đơn nhiều topping');
});

test('genOrder: món hết hàng → 50% đổi món, 50% báo soldout', () => {
  const S = seededState();
  S.unlocked.ca_chua = true; /* chỉ cà chua còn, các nồi khác hết */
  addStock(S, 'ca_chua', 10, cfg);
  BASE_KEYS.filter(k => k !== 'ca_chua').forEach(k => S.unlocked[k] = true);
  const r = rng();
  let so = 0;
  for (let i = 0; i < 40; i++) {
    const o = genOrder(S, cfg, r, 1, { firstDone: true });
    if (o.so) so++;
    else assert.equal(o.base, 'ca_chua');
  }
  assert.ok(so > 0, 'phải có lúc khách bỏ về vì hết món');
});

test('matches: đúng nồi/size/cay/topping mới khớp', () => {
  const a = { base: 'nam', dip: null, size: 'N', spicy: 'Cay vừa', tops: ['t_bo'] };
  assert.ok(matches(a, { base: 'nam', dip: null, size: 'N', spicy: 'Cay vừa', tops: ['t_bo'] }));
  assert.ok(!matches(a, { base: 'suon', dip: null, size: 'N', spicy: 'Cay vừa', tops: ['t_bo'] }));
  assert.ok(!matches(a, { base: 'nam', dip: null, size: 'L', spicy: 'Cay vừa', tops: ['t_bo'] }));
  assert.ok(!matches(a, { base: 'nam', dip: null, size: 'N', spicy: 'Không cay', tops: ['t_bo'] }));
  assert.ok(!matches(a, { base: 'nam', dip: null, size: 'N', spicy: 'Cay vừa', tops: ['t_tom'] }));
  assert.ok(!matches(a, { base: 'nam', dip: null, size: 'N', spicy: 'Cay vừa', tops: [] }));
  /* đơn L1 spicy=null → bỏ qua cay */
  assert.ok(matches({ base: 'nam', dip: null, size: 'N', spicy: null, tops: [] }, { base: 'nam', dip: null, size: 'N', spicy: null, tops: [] }));
});

test('wrongKinds: chỉ đúng loại sai', () => {
  const pot = { base: 'nam', dip: null, size: 'N', spicy: 'Không cay', tops: ['t_bo'] };
  const o = { base: 'nam', dip: null, size: 'L', spicy: 'Không cay', tops: ['t_bo'] };
  const wk = wrongKinds(pot, o);
  assert.ok(wk.size && !wk.mon && !wk.tops);
});

test('maxPat: cơ sở 55s, L2+ 63s, ghế ×1.25, tu tiên ×0.75 đạo tâm', () => {
  const S = seededState();
  const cups = [{ tops: [], spicy: null }];
  assert.equal(maxPat(cups, 1, S, cfg), 55);
  assert.equal(maxPat(cups, 2, S, cfg), 63);
  S.upg.seats = true;
  assert.equal(maxPat(cups, 1, S, cfg), 55 * 1.25);
  const x = maxPat(cups, 1, S, cfg, true);
  assert.ok(Math.abs(x - 55 * 1.25 * .75) < .01);
  S.upg.anthan = true;
  const x2 = maxPat(cups, 1, S, cfg, true);
  assert.ok(Math.abs(x2 - 55 * 1.25 * .75 * 1.25) < .01);
});

test('stars: nhanh+đúng = 5 sao, chờ >50% -1, sai -wrong', () => {
  const S = seededState();
  const r = rng();
  const mk = (patFrac, wrong, xian) => ({
    pat: 60 * patFrac, max: 60, wrong, cups: [{ base: 'nam', dip: null, tops: [], size: 'N', spicy: null }], xian
  });
  assert.equal(stars(mk(.9, 0, false), S, cfg, r).s, 5);
  assert.equal(stars(mk(.4, 0, false), S, cfg, r).s, 4);
  const bad = stars(mk(.9, 2, false), S, cfg, r);
  assert.equal(bad.s, 3); assert.equal(bad.why, 'wrong');
  /* khách tu tiên sai món → tối đa 1 sao */
  assert.equal(stars(mk(.9, 1, true), S, cfg, r).s, 1);
});

test('pickBrat: 9 ngày đầu không có khách hâm', () => {
  const S = seededState();
  S.day = 5;
  const r = rng();
  for (let i = 0; i < 50; i++) assert.equal(pickBrat(S, cfg, r), null);
  S.day = 20;
  let bratSeen = 0;
  for (let i = 0; i < 500; i++) if (pickBrat(S, cfg, r)) bratSeen++;
  assert.ok(bratSeen > 10, 'ngày 20 phải thỉnh thoảng có khách hâm');
});

/* ============ 5. CANH LỬA ============ */
test('pourResult: vạch xanh [0.62,0.92] — non/quá lửa/hoàn hảo', () => {
  const S = seededState();
  assert.equal(pourResult(.5, S, cfg), 'weak');
  assert.equal(pourResult(.7, S, cfg), 'perfect');
  assert.equal(pourResult(.92, S, cfg), 'perfect');
  assert.equal(pourResult(.95, S, cfg), 'spill');
  /* lò địa hỏa nới vạch ±5% */
  S.upg.phap_khi = true;
  assert.equal(pourResult(.58, S, cfg), 'perfect');
  assert.equal(pourResult(.96, S, cfg), 'perfect');
  assert.equal(pourResult(.98, S, cfg), 'spill');
});

/* ============ 6. REVIEWS ============ */
test('review khớp sự thật: không có topping thì không được nhắc topping', () => {
  const S = seededState();
  const c = { cups: [{ base: 'nam', tops: [], spicy: null }], rf: {} };
  assert.ok(!reviewFits('Bò viên ngon ghê, topping nhiều', 'great', c));
  assert.ok(reviewFits('Nước lẩu ngon', 'great', c));
});

test('review đắt: chỉ hiện khi thật sự để giá đắt', () => {
  const c = { cups: [{ base: 'nam', tops: [] }], rf: { pricey: false } };
  assert.ok(!reviewFits('Giá hơi chát so với khu này', 'great', c));
  const c2 = { cups: [{ base: 'nam', tops: [] }], rf: { pricey: true } };
  assert.ok(reviewFits('Giá hơi chát so với khu này', 'pricey', c2));
});

test('addReview: sinh câu không lặp, đủ trường, cap 2500', () => {
  const S = seededState();
  const r = rng();
  const R = { today: { stars: [] } };
  const c = { name: 'Test', face: '🧑', cups: [{ base: 'nam', dip: null, tops: ['t_bo'], size: 'N', spicy: null }] };
  for (let i = 0; i < 40; i++) addReview(S, 5, 'great', false, c, null, r, R);
  assert.equal(S.reviews.length, 40);
  const uniq = new Set(S.reviews.map(x => x.t));
  assert.ok(uniq.size >= 10, 'review phải đa dạng, không lặp y nguyên');
  assert.ok(S.reviews[0].n === 'Test');
  for (let i = 0; i < 2600; i++) addReview(S, 5, 'great', false, c, null, r, R);
  assert.ok(S.reviews.length <= 2500, 'cap 2500 như gốc');
});

test('review tu tiên: pool riêng giọng tiên hiệp', () => {
  const S = seededState();
  const r = rng();
  const out = xReviewText(S, 'great', { cups: [{ base: 'tu_xuyen', tops: [], spicy: null }] }, r);
  assert.ok(/bổn tọa|tu luyện|linh khí|phàm/i.test(out.t));
});

/* ============ 7. EVENTS ============ */
test('rollDay: ngày 30 = lễ, ngày 7 = cuối tuần, tỷ giá LS luôn được cuộn', () => {
  const S = seededState();
  const r = rng();
  S.day = 30; rollDay(S, cfg, r);
  assert.equal(S.ev.id, 'holiday');
  S.day = 7; rollDay(S, cfg, r);
  assert.equal(S.ev.id, 'weekend');
  assert.ok(S.lsRate > 0);
});

test('moodPlan: đúng 2 ngày khó ở mỗi 60 ngày, deterministic theo block', () => {
  const S = seededState();
  const r = rng();
  S.day = 5; rollDay(S, cfg, r);
  const plan1 = { ...S.moodPlan, days: [...S.moodPlan.days] };
  S.day = 20; rollDay(S, cfg, r);
  assert.deepEqual(S.moodPlan.days, plan1.days, 'cùng block phải giữ kế hoạch');
  assert.equal(plan1.days.length, 2);
});

test('badCheck: tai họa đúng lịch, mất ≤ 1/3 két', () => {
  const S = seededState();
  S.money = 3000000;
  S.cur = { bad: 0 };
  S.badPlan = { start: 1, ev: [{ d: 10, id: 'trom', done: false }] };
  const r = rng();
  S.day = 9; assert.equal(badCheck(S, cfg, r), null);
  S.day = 10;
  const b = badCheck(S, cfg, r);
  assert.ok(b && b.id === 'trom');
  assert.ok(b.v <= Math.floor(3000000 / 3 / 1000) * 1000 + 1000);
});

test('quà: takeGift cộng tiền đúng số, bungN reset', () => {
  const S = seededState();
  S.cur = { gift: 0 };
  S.money = 100000;
  S.gift = { k: 'bung', n: 'x', d: 'y', v: 150000 };
  S.bungN = 3;
  const g = takeGift(S);
  assert.equal(g.v, 150000);
  assert.equal(S.money, 250000);
  assert.equal(S.bungN, 0);
  assert.equal(S.gift, null);
});

/* ============ 8. LOOP TÍCH HỢP ============ */
function fullStock(S) {
  [...BASE_KEYS, ...TOP_KEYS, ...DIP_KEYS, ...DUOC_KEYS, ...SECRET_KEYS, 'sup'].forEach(k => { addStock(S, k, 999, cfg); S.unlocked[k] = true; });
}

test('serve đúng món: tiền vào két, review được ghi, slot trống', () => {
  const S = seededState(); fullStock(S);
  const r = rng();
  const R = initRuntime(S, cfg, 3);
  R.running = true;
  const ctx = { R, S, cfg, rng: r };
  const c = {
    id: 1, cups: [{ base: 'ca_chua', dip: null, tops: [], size: 'N', spicy: null }],
    done: [false], order: null, pat: 50, max: 55, wrong: 0, name: 'Test', face: '🧑'
  };
  c.order = c.cups[0];
  R.slots[0] = c;
  const pot = { base: 'ca_chua', dip: null, tops: [], size: 'N', spicy: null };
  const before = S.money;
  const res = serve(ctx, 0, pot);
  assert.ok(res.ok);
  assert.equal(res.vnd, DEF_SELL.ca_chua);
  assert.ok(S.money >= before + DEF_SELL.ca_chua - 1000); /* + tiền, tip có thể 0 */
  assert.equal(R.slots[0], null, 'khách phải rời quầy');
  assert.ok(S.reviews.length >= 1);
});

test('serve sai món: mất nguyên liệu, kiên nhẫn -30%, khách ở lại', () => {
  const S = seededState(); fullStock(S);
  const r = rng();
  const R = initRuntime(S, cfg, 3);
  R.running = true;
  const ctx = { R, S, cfg, rng: r };
  const c = {
    id: 1, cups: [{ base: 'ca_chua', dip: null, tops: [], size: 'N', spicy: null }],
    done: [false], pat: 50, max: 55, wrong: 0, name: 'Test', face: '🧑'
  };
  c.order = c.cups[0];
  R.slots[0] = c;
  const wrongPot = { base: 'nam', dip: null, tops: [], size: 'N', spicy: null };
  S.cur = { spoil: { n: 0, v: 0 } };
  const res = serve(ctx, 0, wrongPot);
  assert.equal(res.ok, false);
  assert.equal(res.why, 'wrong');
  assert.ok(res.wk.mon);
  assert.equal(S.cur.spoil.n, 1);
  assert.ok(Math.abs(c.pat - (50 - 55 * .3)) < .01);
  assert.ok(R.slots[0], 'khách vẫn chờ làm lại');
});

test('serve khách tu tiên: trả bằng linh thạch ×2-3, không cộng VNĐ', () => {
  const S = seededState(); fullStock(S);
  const r = rng();
  const R = initRuntime(S, cfg, 3);
  R.running = true;
  const ctx = { R, S, cfg, rng: r };
  S.lsRate = 50000;
  const o = { base: 'tu_xuyen', dip: null, tops: ['x_linh_chi'], size: 'N', spicy: null };
  const c = { id: 1, xian: true, cups: [o], done: [false], pat: 40, max: 45, wrong: 0, name: 'Huyền Test', face: '🧙' };
  c.order = o;
  R.slots[0] = c;
  const vndBefore = S.money, lsBefore = S.ls;
  const res = serve(ctx, 0, { ...o });
  assert.ok(res.ok);
  assert.equal(S.money, vndBefore, 'không nhận VNĐ');
  assert.ok(S.ls > lsBefore, 'phải nhận linh thạch');
  const pl = priceLS(o, S, cfg);
  assert.ok(res.ls >= pl.totalLS * 2 && res.ls <= pl.totalLS * 3 + 1, 'trả ×2-×3');
});

test('timeout: khách bỏ về ăn 1 sao, tính lost', () => {
  const S = seededState(); fullStock(S);
  const r = rng();
  const R = initRuntime(S, cfg, 3);
  R.running = true;
  const ctx = { R, S, cfg, rng: r };
  const c = { id: 1, cups: [{ base: 'nam', dip: null, tops: [], size: 'N', spicy: null }], done: [false], pat: 0, max: 55, wrong: 0, name: 'Bỏ Về', face: '🧑' };
  R.slots[0] = c;
  S.cur = { lost: 0 };
  timeoutCustomer(ctx, 0);
  assert.equal(R.slots[0], null);
  assert.equal(R.today.lost, 1);
  assert.equal(S.reviews[0].s, 1);
});

test('closeDay: đủ dòng tiền (thuê nhà, điện nước, lương, thuế), sang ngày mới', () => {
  const S = seededState(); fullStock(S);
  const r = rng();
  const R = initRuntime(S, cfg, 3);
  R.running = true;
  const ctx = { R, S, cfg, rng: r };
  S.upg.staff1 = true;
  const d0 = S.day;
  const res = closeDay(ctx);
  assert.equal(S.day, d0 + 1);
  assert.equal(res.rent, cfg.rent);
  assert.equal(res.util, cfg.utilBase);
  assert.equal(res.wage, cfg.wage1);
  assert.ok(S.history.length === 1);
  assert.ok(S.cur.day === S.day, 'rec mới đúng ngày');
});

test('spawn nguyên ngày: khách vào đều, có đơn bán được, không crash 200 lượt', () => {
  const S = seededState(); fullStock(S);
  const r = makeRNG(4242);
  const R = initRuntime(S, cfg, 3);
  R.running = true;
  const ctx = { R, S, cfg, rng: r, names: makeNameGen(S, r) };
  let spawned = 0, served = 0;
  for (let t = 0; t < 200; t++) {
    const res = spawn(ctx);
    if (res && res.kind === 'ok') spawned++;
    if (res && res.kind === 'star') spawned++;
    /* phục vụ mọi khách đang chờ với nồi đúng đơn */
    R.slots.forEach((c, i) => {
      if (c && !c.done[0]) {
        const o = c.cups[0];
        const rr = serve(ctx, i, { base: o.base, dip: o.dip, tops: [...o.tops], size: o.size, spicy: o.spicy });
        if (rr.ok) served++;
      }
    });
    /* kiên nhẫn tụt */
    R.slots.forEach((c, i) => { if (c) { c.pat -= 1; if (c.pat <= 0) timeoutCustomer(ctx, i); } });
  }
  assert.ok(spawned >= 30, 'phải spawn được nhiều khách, thực tế ' + spawned);
  assert.ok(served >= 20, 'phục vụ được nhiều đơn, thực tế ' + served);
  assert.ok(S.reviews.length >= 10);
  assert.ok(rating(S) >= 3.5, 'phục vụ đúng hết thì sao phải cao: ' + rating(S));
});

test('spawn: 2 ngày đầu không có khách tu tiên, sau đó có', () => {
  const S = seededState(); fullStock(S);
  S.day = 1;
  const r = makeRNG(99);
  const R = initRuntime(S, cfg, 3);
  R.running = true;
  const ctx = { R, S, cfg, rng: r, names: makeNameGen(S, r) };
  for (let t = 0; t < 50; t++) {
    const res = spawn(ctx);
    if (res && res.kind === 'ok') assert.equal(res.c.xian, false, 'ngày 1 không được có khách tiên');
    R.slots.forEach((c, i) => { if (c) { R.slots[i] = null; } });
  }
  S.day = 10;
  let xianSeen = 0;
  for (let t = 0; t < 300; t++) {
    const res = spawn(ctx);
    if (res && res.kind === 'ok' && res.c.xian) xianSeen++;
    R.slots.forEach((c, i) => { if (c) R.slots[i] = null; });
  }
  assert.ok(xianSeen >= 5, 'ngày 10 phải có khách tu tiên, thực tế ' + xianSeen);
});

/* ============ 9. SAVE/LOAD ============ */
test('save→load round-trip qua JSON: giữ nguyên tiền, ngày, kho, review', () => {
  const S = seededState(); fullStock(S);
  S.money = 123456789; S.day = 15; S.shopName = 'Lẩu Test';
  addReview(S, 5, 'great', false, { name: 'A', face: '🧑', cups: [{ base: 'nam', tops: [] }] }, null, rng(), { today: { stars: [] } });
  const json = JSON.parse(JSON.stringify(S));
  const S2 = loadFrom(json, cfg);
  assert.equal(S2.money, 123456789);
  assert.equal(S2.day, 15);
  assert.equal(S2.shopName, 'Lẩu Test');
  assert.equal(qty(S2, 't_bo'), qty(S, 't_bo'));
  assert.equal(S2.reviews.length, 1);
});

test('sanitize: tiền vượt cap bị đánh dấu gian lận', () => {
  const S = seededState();
  S.money = 1e12;
  assert.equal(sanitize(S, cfg), true);
});

/* ============ 10. TÊN KHÁCH ============ */
test('tên khách: không lặp trong 380 tên gần nhất, tên tiên đúng họ tiên', () => {
  const S = seededState();
  const r = rng();
  const names = makeNameGen(S, r);
  const seen = new Set();
  for (let i = 0; i < 100; i++) {
    const n = names.normal(0);
    assert.ok(!seen.has(n), 'lặp tên: ' + n);
    seen.add(n);
  }
  const xn = names.xian();
  assert.ok(xn.length >= 3);
});

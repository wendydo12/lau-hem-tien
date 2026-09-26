/* tests/stats.test.js — THỐNG KÊ ngày/tuần/tháng + SAVEPOINT giữa ngày (Phase 5b) */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCFG } from '../js/engine/config.js';
import { fresh, newRec } from '../js/engine/state.js';
import { dayStats, rangeStats, bestSellers, bestLine, recOfDay, weekRange, monthRange } from '../js/engine/stats.js';
import { closeDay, initRuntime } from '../js/engine/loop.js';
import { makeRNG } from '../js/engine/rng.js';
import { addReview } from '../js/engine/reviews.js';

const cfg = makeCFG();
const rng = () => makeRNG(246810);

function seeded(day = 5) {
  const S = fresh(cfg);
  S.seed = 246810;
  S.day = day;
  return S;
}

/* giả lập 3 ngày đã đóng: ngày 2 bán 5 nồi cà chua 2 nồi nấm, ngày 3 bán 3 nồi sườn, ngày 4 lỗ */
function withHistory(S) {
  const mk = (day, sales, served, lost) => {
    const r = newRec(day);
    r.sales = sales; r.served = served; r.lost = lost;
    return r;
  };
  S.history = [
    mk(4, { suon: { q: 2, a: 100000 } }, 2, 1),
    mk(3, { suon: { q: 3, a: 150000 } }, 3, 0),
    mk(2, { ca_chua: { q: 5, a: 175000 }, nam: { q: 2, a: 80000 } }, 7, 0),
  ];
  return S;
}

test('stats: recOfDay tìm đúng ngày trong history', () => {
  const S = withHistory(seeded(5));
  assert.equal(recOfDay(S, 2).served, 7);
  assert.equal(recOfDay(S, 3).served, 3);
  assert.equal(recOfDay(S, 99), null);
});

test('stats: dayStats ngày 2 — served/lost/profit/bán chạy', () => {
  const S = withHistory(seeded(5));
  const d = dayStats(S, 2, cfg);
  assert.ok(d);
  assert.equal(d.served, 7);
  assert.equal(d.lost, 0);
  assert.equal(d.rev, 255000);
  assert.equal(d.bestMon, 'ca_chua');
  assert.equal(d.bestQ, 5);
});

test('stats: dayStats ngày chưa bán → null', () => {
  const S = withHistory(seeded(5));
  assert.equal(dayStats(S, 1, cfg), null);
});

test('stats: rangeStats tuần gộp đúng 3 ngày', () => {
  const S = withHistory(seeded(5));
  const [from, to] = weekRange(S);
  assert.equal(from, 1); assert.equal(to, 4);
  const rg = rangeStats(S, from, to, cfg);
  assert.equal(rg.days, 3);
  assert.equal(rg.served, 12);   // 7+3+2
  assert.equal(rg.lost, 1);
  assert.equal(rg.rev, 505000); // 255+150+100k
});

test('stats: bestSellers top N theo số lượng, bỏ key L', () => {
  const S = withHistory(seeded(5));
  const top = bestSellers(S, 1, 4, 3);
  /* cà chua ngày 2 = 5 nồi, sườn ngày 3+4 = 3+2 = 5 → hòa nhau, kiểm theo set */
  const byKey = Object.fromEntries(top.map(x => [x.k, x.q]));
  assert.equal(byKey.ca_chua, 5);
  assert.equal(byKey.suon, 5);
  assert.equal(byKey.nam, 2);
  const withL = withHistory(seeded(5));
  withL.history[2].sales.L = { q: 9, a: 90000 };
  const top2 = bestSellers(withL, 2, 2, 3);
  assert.ok(!top2.some(x => x.k === 'L'), 'không được tính key L (size)');
});

test('stats: bestLine trả chuỗi tên món', () => {
  const S = withHistory(seeded(5));
  const bl = bestLine(S, 1, 4);
  assert.ok(bl.includes('('), 'phải kèm số lượng');
  assert.ok(bl.length > 3);
});

test('stats: rangeStats rỗng → null; monthRange kẹp về ngày 1', () => {
  const S = fresh(cfg);
  assert.equal(rangeStats(S, 1, 10, cfg), null);
  const [f] = monthRange({ day: 5 });
  assert.equal(f, 1);
});

test('stats: review ngày nào tính sao ngày đó (addReview ghi starSum vào S.cur)', () => {
  const S = seeded(5);
  const r = makeRNG(1);
  const fakeC = { cups: [{ base: 'ca_chua', dip: null, tops: [], size: 'N' }], name: 'Test', face: '🙂' };
  addReview(S, 5, 'great', false, fakeC, null, r, null);
  assert.equal(S.cur.starSum, 5);
  assert.equal(S.cur.starN, 1);
  addReview(S, 3, 'meh', false, fakeC, null, r, null);
  assert.equal(S.cur.starSum, 8);
  assert.equal(S.cur.starN, 2);
});

/* ============ SAVEPOINT giữa ngày ============ */
test('savepoint: closeDay xóa midDay + midSnap', () => {
  const S = seeded(5);
  S.midDay = true;
  S.midSnap = { today: { served: 3 }, gameSec: 5000 };
  const R = initRuntime(S, cfg, 3);
  closeDay({ R, S, cfg, rng: rng() });
  assert.equal(S.midDay, false);
  assert.equal(S.midSnap, null);
  assert.equal(S.day, 6);
});

test('savepoint: S.cur.served tăng khi bán (cả khách thường lẫn tu tiên)', async () => {
  const { serve, spawn } = await import('../js/engine/loop.js');
  const S = seeded(5);
  S.xianUnlock = true;
  /* cấp hàng */
  const { addStock } = await import('../js/engine/stock.js');
  addStock(S, 'ca_chua', 10, cfg); addStock(S, 'sup', 10, cfg);
  const R = initRuntime(S, cfg, 3);
  R.running = true;   // serve() chỉ chạy khi quán đang mở
  const r = makeRNG(777);
  const ctx = { R, S, cfg, rng: r };
  /* ép 1 đơn cố định vào slot 0 */
  const o = { base: 'ca_chua', dip: null, tops: [], size: 'N', spicy: null };
  R.slots[0] = { id: 1, cups: [o], done: [false], order: o, pat: 100, max: 100, wrong: 0, paid: 0, name: 'T', face: '🙂' };
  const pot = { ...o, perfect: true };
  const res = serve(ctx, 0, pot);
  assert.equal(res.ok, true);
  assert.equal(S.cur.served, 1, 'khách thường phải tăng S.cur.served');
});

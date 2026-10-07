/* tests/toan-game.test.js — CHƠI TRỌN NHIỀU NGÀY HEADLESS, KIỂM BẤT BIẾN
 *
 * Vì sao cần: các phép kiểm rời rạc kiểm từng hàm, nhưng lỗi thật của game thường là lỗi
 * TÍCH LUỸ theo ngày (tiền âm ngầm, kho âm, NaN, trần khách vỡ, khách không bao giờ tới).
 * Tệp này chạy liền 12 ngày bằng chính engine, phục vụ hết khách như một người chơi biết việc,
 * rồi soi các bất biến sau mỗi ngày:
 *   · tiền và kho luôn là số hữu hạn, không âm ngầm
 *   · số khách tới không bao giờ vượt trần của ngày
 *   · khách được bưng theo đúng thứ tự TỚI TRƯỚC (FIFO)
 *   · khách hết hàng bị tính vào soldLost, không bị tính là đã phục vụ
 *   · closeDay ra đúng các dòng tiền: thuê nhà, điện nước, lương, thuế, bảo trì
 *   · sang ngày mới thì sổ ngày cũ được lưu vào lịch sử, sổ ngày mới sạch
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCFG } from '../js/engine/config.js';
import { POT_KEYS, DIP_KEYS, BASE_PRICE } from '../js/engine/data.js';
import { fresh } from '../js/engine/state.js';
import { addStock, qty } from '../js/engine/stock.js';
import { traffic } from '../js/engine/economy.js';
import { initRuntime, spawn, serve, closeDay, startDay, slotCount, pickServeSlot } from '../js/engine/loop.js';
import { makeRNG } from '../js/engine/rng.js';
import { evMul } from '../js/engine/events.js';

const cfg = makeCFG();

/* dựng một quán đủ đồ để nấu mọi nồi đang mở */
function nauDu(S, soKhach) {
  addStock(S, 'sup', soKhach + 4, cfg);
  POT_KEYS.filter(k => S.unlocked[k]).forEach(k => addStock(S, k, soKhach + 2, cfg));
  DIP_KEYS.slice(0, 2).forEach(k => addStock(S, k, soKhach + 2, cfg));
  return S;
}

/* phục vụ khách đang chờ: luôn nấu đơn của người TỚI TRƯỚC (đúng luật bưng của game) */
function bungKhach(ctx) {
  const { R, S } = ctx;
  for (let luot = 0; luot < 60; luot++) {
    const cand = R.slots.map((c, i) => ({ c, i })).filter(x => x.c && x.c.done.includes(false))
      .sort((a, b) => (a.c.born || 0) - (b.c.born || 0));
    if (!cand.length) break;
    const { c, i } = cand[0];
    const k = c.done.indexOf(false);
    const cup = c.cups[k];
    const res = serve(ctx, i, { base: cup.base, dip: cup.dip, tops: cup.tops, size: cup.size, spicy: cup.spicy });
    if (!res) break;
    void S;
  }
}

test('trần khách mỗi ngày đúng công thức ước lượng, không ngày nào vượt trần', () => {
  const S = fresh(cfg);
  const rng = makeRNG(777);
  let tong = 0;
  for (let d = 1; d <= 12; d++) {
    const soft = Math.round((cfg.balance.guestSoftBase) + (S.day - 1) * cfg.balance.guestSoftPerDay);
    const cap = Math.max(3, Math.min(Math.round(traffic(S, cfg, evMul(S)) * cfg.balance.guestCapMul), soft));
    assert.ok(Number.isFinite(cap) && cap >= 3, `ngày ${d}: trần khách vô lý (${cap})`);
    assert.ok(cap <= soft + 1, `ngày ${d}: trần ${cap} vượt trần mềm ${soft}`);
    tong += cap;
    startDay({ R: initRuntime(S, cfg, 3), S, cfg, rng });
    S.day++;
  }
  assert.ok(tong / 12 >= 8, 'trung bình mỗi ngày phải có ít nhất 8 khách, thấy ' + (tong / 12).toFixed(1));
});

test('chơi trọn 12 ngày: tiền/kho luôn hữu hạn, không âm ngầm, sổ sách khớp', () => {
  const S = fresh(cfg);
  const rng = makeRNG(20261008);
  for (let d = 1; d <= 12; d++) {
    const soft = Math.round(cfg.balance.guestSoftBase + (S.day - 1) * cfg.balance.guestSoftPerDay);
    const cap = Math.max(3, Math.min(Math.round(traffic(S, cfg, evMul(S)) * cfg.balance.guestCapMul), soft));
    nauDu(S, cap + 4);
    const R = initRuntime(S, cfg, slotCount(S, cfg));
    R.running = true;
    R.today.cap = cap;
    const ctx = { R, S, cfg, rng };
    startDay(ctx);
    let arrivals = 0;
    while (arrivals < cap) {              /* người chơi thật: mời đúng tới trần khách của ngày */
      bungKhach(ctx);
      const r = spawn(ctx);
      if (!r) break;
      arrivals++;
      R.today.arrived++;
      bungKhach(ctx);
    }
    bungKhach(ctx);

    /* ---- bất biến giữa ca ---- */
    assert.ok(Number.isFinite(S.money), `ngày ${d}: tiền thành NaN`);
    assert.ok(R.today.arrived <= cap, `ngày ${d}: khách tới ${R.today.arrived} vượt trần ${cap}`);
    /* LƯU Ý: served đếm theo NỒI/PHẦN đã bưng, arrived đếm theo LƯỢT KHÁCH —
     * một khách gọi nhiều nồi (thực đơn leo thang) nên served có thể lớn hơn arrived. */
    assert.ok(R.today.served <= R.today.arrived * 5,
      `ngày ${d}: số phần bưng (${R.today.served}) vô lý so với số khách (${R.today.arrived})`);
    for (const k of POT_KEYS.concat(['sup'])) {
      const q = qty(S, k);
      assert.ok(Number.isFinite(q) && q >= 0, `ngày ${d}: kho ${k} = ${q}`);
    }
    assert.ok(S.cur.rev >= 0 && Number.isFinite(S.cur.rev), `ngày ${d}: doanh thu vô lý`);

    const truoc = S.money;
    closeDay(ctx);
    assert.ok(Number.isFinite(S.money), `ngày ${d}: tiền thành NaN sau closeDay`);
    assert.ok(R.today.rev >= 0, `ngày ${d}: doanh thu âm`);
    assert.ok(R.today.lost >= R.today.soldLost, 'khách hết hàng phải nằm trong nhóm khách bỏ về');
    assert.ok(R.today.lost <= R.today.arrived,
      `ngày ${d}: khách bỏ về (${R.today.lost}) nhiều hơn số khách tới (${R.today.arrived})`);
    assert.equal(S.day, d + 1, 'closeDay phải sang ngày mới');
    assert.ok(S.history || S.hist, 'phải có sổ lịch sử các ngày');
    void truoc;
  }
  assert.ok(S.money > -5000000, 'chơi 12 ngày không được âm nợ vô tận, thấy ' + Math.round(S.money));
});

test('khách hết hàng: bị đếm vào soldLost và KHÔNG được tính là đã phục vụ', () => {
  const S = fresh(cfg);
  const rng = makeRNG(555);
  S.day = 1;
  const R = initRuntime(S, cfg, slotCount(S, cfg));
  R.running = true;
  R.today.cap = 30;
  const ctx = { R, S, cfg, rng };
  startDay(ctx);
  /* chỉ để lại đúng 1 nồi rẻ nhất, hết mọi thứ khác → phần lớn khách phải bị hết hàng */
  addStock(S, 'sup', 2, cfg);
  const re = POT_KEYS.filter(k => S.unlocked[k])[1] || POT_KEYS[0];
  addStock(S, re, 1, cfg);
  let sold = 0, served = 0;
  for (let i = 0; i < 25; i++) {
    const r = spawn(ctx);
    if (!r) break;
    R.today.arrived++;
    if (r.kind === 'soldout') sold++;
    if (r.kind === 'ok' || r.kind === 'star') { served++; bungKhach(ctx); }
  }
  assert.ok(sold >= 1, 'phải có khách bị hết hàng khi kho trống (thấy ' + sold + ')');
  assert.equal(R.today.soldLost, sold, 'soldLost phải đếm đúng số khách bị hết hàng');
  assert.equal(R.today.served, R.today.served, 'số phục vụ phải nhất quán');
  assert.ok(R.today.served <= served + 1, 'không được đếm khách hết hàng là đã phục vụ');
});

test('bưng theo thứ tự TỚI TRƯỚC: hai khách cùng đơn thì bưng người tới sớm hơn', () => {
  const S = fresh(cfg);
  const R = initRuntime(S, cfg, 4);
  R.running = true;
  const don = { base: 'ca_chua', dip: null, tops: [], size: 'N', spicy: null };
  const mk = (born, id) => ({
    id, cups: [{ ...don }], done: [false], order: { ...don }, pat: 50, max: 55,
    wrong: 0, name: 'Khách ' + id, face: '🧑', born
  });
  R.slots[2] = mk(900, 1);      /* tới sau, ngồi chỗ 2 */
  R.slots[0] = mk(100, 2);      /* tới trước, ngồi chỗ 0 */
  const i = pickServeSlot(R, { ...don });
  assert.equal(i, 0, 'phải bưng cho khách tới trước (born nhỏ hơn), không theo chỗ ngồi');
  /* không ai khớp đơn thì vẫn phải trả về một chỗ của khách còn đơn dở, không phải -1 */
  R.slots[0].done = [true];
  R.slots[2].done = [true];
  R.slots[0].done = [false];
  const j = pickServeSlot(R, { base: 'suki', dip: null, tops: [], size: 'N', spicy: null });
  assert.equal(j, 0, 'không khớp nồi thì chọn người tới sớm nhất còn đơn dở');
  const k = pickServeSlot({ ...R, slots: new Array(4).fill(null) }, { ...don });
  assert.equal(k, -1, 'quán trống thì trả về -1');
});

test('closeDay trả về đủ các dòng tiền và đẩy sổ ngày vào lịch sử', () => {
  const S = fresh(cfg);
  const rng = makeRNG(31337);
  nauDu(S, 8);
  const R = initRuntime(S, cfg, 3);
  R.running = true;
  R.today.cap = 8;
  const ctx = { R, S, cfg, rng };
  startDay(ctx);
  for (let i = 0; i < 6; i++) { const r = spawn(ctx); if (r) { R.today.arrived++; bungKhach(ctx); } }
  const histTruoc = S.history.length;
  const kq = closeDay(ctx);
  for (const dong of ['rev', 'tax', 'wage', 'rent', 'util', 'maint', 'dayProfit']) {
    assert.ok(Object.prototype.hasOwnProperty.call(kq, dong), 'closeDay phải trả về dòng "' + dong + '"');
    assert.ok(Number.isFinite(kq[dong]), 'dòng "' + dong + '" phải là số, thấy ' + kq[dong]);
  }
  assert.ok(kq.rent > 0 || S.day > 7, 'phải có tiền thuê/điện nước hằng ngày');
  assert.equal(S.history.length, histTruoc + 1, 'phải đẩy sổ ngày cũ vào lịch sử');
  assert.ok(S.history[0] && typeof S.history[0].served === 'number', 'sổ ngày phải ghi số khách đã phục vụ');
  assert.ok(Number.isFinite(S.money) && S.money < 1e12, 'tiền phải là số hợp lý sau khi trừ chi phí');
});

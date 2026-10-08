/* tools/mo-phong-kinh-te.mjs — MÔ PHỎNG KINH TẾ (công cụ đo, không phải mã game)
 *
 * Mục đích: trả lời câu hỏi "chơi có nhanh giàu quá không?" bằng SỐ ĐO THẬT thay vì cảm giác.
 * Cách làm: chạy n ván bằng chính engine của game, với một người chơi biết việc:
 *   - mỗi ngày nhập đủ hàng theo số khách dự kiến,
 *   - phục vụ hết khách (nấu đúng món, không sai, không để khách bỏ về),
 *   - đóng ngày, trả tiền nhà/điện nước/lương/thuế, trả nợ phòng,
 *   - không mua nâng cấp (để đo dòng tiền thuần từ bán hàng).
 * In bảng: ngày · khách · doanh thu · chi phí · lãi · tiền còn · sao.
 *
 * Chạy: node tools/mo-phong-kinh-te.mjs [sốNgày]
 */
import { makeCFG } from '../game/js/engine/config.js';
import { ROOM } from '../game/js/engine/data.js';
import { hieuUngPhong } from '../game/js/engine/room.js';
import { fresh, newPot } from '../game/js/engine/state.js';
import { ITEMS, POT_KEYS, DIP_KEYS, TOP_KEYS, BASE_PRICE } from '../game/js/engine/data.js';
import { addStock, qty, costOf } from '../game/js/engine/stock.js';
import { traffic, recRev, recCost, rating, price } from '../game/js/engine/economy.js';
import { initRuntime, spawn, serve, closeDay, startDay, slotCount, roomDebt, payRoomDebt } from '../game/js/engine/loop.js';
import { makeRNG } from '../game/js/engine/rng.js';
import { evMul } from '../game/js/engine/events.js';

const N = Number(process.argv[2] || 20);
const EFF0 = Number(process.env.EFF || 1);   // EFF=0.8 → bỏ sót 20% khách (người chơi lơ đễnh)
/* FURN=1 (08/10): đo ảnh hưởng của bộ nội thất đang bày lên kinh tế.
 * HAI GIẢ ĐỊNH đo được, ghi rõ để không tự lừa mình:
 *   · kiên nhẫn +X% → số khách bị bỏ sót giảm X% của phần đang mất: EFF = EFF0 + (1-EFF0)×X%
 *   · khách tới +Y%  → trần khách mỗi ca ×(1+Y%)
 * Chỉ áp hai trục này vì mô phỏng chỉ mô hình được hai trục đó. */
const FURN = process.env.FURN === '1';
const FURN_STYLE = process.env.FURN_STYLE || 'hemViet';
const cfg = makeCFG();
/* hiệu ứng bộ nội thất đang bày — chỉ tính khi FURN=1 */
const muaHetPhong = Object.keys(ROOM[FURN_STYLE]).reduce((o, k) => (o[k] = true, o), {});
const P = (() => {
  const u = FURN ? hieuUngPhong(muaHetPhong, FURN_STYLE).so : {};
  const kn = u.kienNhan || 0, kh = u.khach || 0;
  return { eff: u, kienNhan: kn, khach: kh, effEFF: Math.min(1, EFF0 + (1 - EFF0) * kn / 100) };
})();
const rng = makeRNG(Number(process.env.SEED || 20261007));   /* SEED= để đo nhiều ván, tránh kết luận từ 1 ván */
const S = fresh(cfg);
S.shopName = 'Mô phỏng';
const rows = [];

for (let day = 1; day <= N; day++) {
  /* ---- CHUẨN BỊ: nhập hàng cho số khách dự kiến ---- */
  const b = cfg.balance || {};
  const soft = Math.round((b.guestSoftBase ?? 13) + (S.day - 1) * (b.guestSoftPerDay ?? 0.45));
  /* 08/10 tối (KPI mềm): chỉ tiêu = dự báo (không trần mềm); mô phỏng người chơi biết việc
   * phục vụ được chỉ tiêu + ~15% khách vượt (những ai tới đúng giờ). */
  const chiTieu = Math.max(6, Math.round(traffic(S, cfg, evMul(S)) * (b.guestCapMul ?? 12) * (1 + (P.eff.khach || 0) / 100)));
  /* 08/10 ĐÊM (KPI mềm tới 22:00): lịch khách vãng lai = chỉ tiêu × khachVuotKpi, phủ kín ca —
   * mô phỏng phải đo đúng luật game thật, không dùng công thức +15% cũ. */
  const cap = Math.round(chiTieu * (b.khachVuotKpi ?? 2));
  /* Người chơi biết việc: mua trong phạm vi tiền đang có, ưu tiên nồi rẻ trước,
   * mua đủ cho số khách dự kiến chứ không ôm cả 12 loại nồi. */
  let spend = 0;
  const cash = S.money;
  /* người chơi thật không dồn hết tiền vào hàng: tối đa 55% tiền đang có, chừa 20k */
  const budget = () => Math.max(0, Math.min(cash * 0.55, S.money - spend - 20000));
  const mua = (k, q) => {
    const donGia = costOf(cfg, k);
    const qm = Math.min(q, Math.floor(budget() / Math.max(1, donGia)));
    if (qm > 0) { addStock(S, k, qm, cfg); spend += qm * donGia; }
    return qm;
  };
  /* nồi chén trước (không có là không nấu được) */
  const needSup = cap + 2;
  if (qty(S, 'sup') < needSup) mua('sup', needSup - qty(S, 'sup'));
  /* rồi tới vài loại nồi chính, rẻ trước, mỗi loại chia đều phần còn thiếu */
  const keys = POT_KEYS.filter(k => S.unlocked[k]).sort((a, b) => costOf(cfg, a) - costOf(cfg, b)).slice(0, 4);
  const canMua = Math.ceil(chiTieu * 1.05);   /* mua theo CHỈ TIÊU +5% dự phòng (không theo cap toàn bộ) */
  const per = Math.ceil(canMua / Math.max(1, keys.length));
  keys.forEach(k => { const q = Math.max(0, per - qty(S, k)); if (q) mua(k, q); });
  /* nước chấm + vài topping cơ bản */
  ['d_muoi_ot', 'd_chao', 't_bo_vien', 't_rau_muong', 't_mi_goi'].forEach(k => {
    if (!ITEMS[k]) return;
    const q = Math.max(0, Math.ceil(chiTieu * 1.05) - qty(S, k));
    if (q) mua(k, q);
  });
  S.money -= spend;
  S.cur.restock = (S.cur.restock || 0) + spend;

  /* ---- MỞ QUÁN ---- */
  const R = initRuntime(S, cfg, slotCount(S, cfg));
  R.running = true;
  R.today.cap = cap;   /* 08/10 tối: cap = chỉ tiêu + phần vượt (khách vào thêm) */
  const ctx = { R, S, cfg, rng };
  startDay(ctx);
  let arrivals = 0;
  while (arrivals < cap) {
    const r = spawn(ctx);
    if (!r) break;
    arrivals++;
    R.today.arrived++;
    /* người chơi thật không hoàn hảo: EFF<1 thì có khách bị bỏ quên, họ bỏ về */
    const EFF = P.effEFF;
    if (EFF < 1 && rng.next() > EFF) { R.today.lost++; continue; }
    if (r.kind !== 'ok' && r.kind !== 'star') continue;
    const i = r.slot;
    const c = R.slots[i];
    if (!c) continue;
    /* phục vụ trọn đơn: nấu đúng từng nồi */
    for (let k = 0; k < c.cups.length; k++) {
      const o = c.cups[k];
      for (const t of o.tops) if (qty(S, t) > 0) { /* topping tiêu hao do recSale, không cần take */ }
      const pot = { base: o.base, size: o.size, tops: [...o.tops], dip: o.dip, spicy: o.spicy, perfect: true };
      serve(ctx, i, pot);
      if (!R.slots[i]) break;
    }
  }
  /* khách còn ngồi thì cho hết kiên nhẫn rời đi (không tính là phục vụ được) */
  R.slots.forEach((c, i) => { if (c) { R.slots[i] = null; R.today.lost++; } });

  /* ---- ĐÓNG NGÀY ---- */
  { const rd = roomDebt(S, cfg); if (!rd.paid && S.money >= rd.owed) payRoomDebt(S, cfg); }
  if (process.env.DEBUG) console.error(`[ngày ${day}] tiền trước khi đóng ${Math.round(S.money)} · nhập hàng ${spend} · doanh thu ${recRev(S.cur)} · restock ghi ${S.cur.restock}`);
  const res = closeDay(ctx);
  const rev = recRev(res.rev != null ? S.history[0] : S.history[0]);
  const h = S.history[0];
  rows.push({ day, cap, arrived: R.today.arrived, served: R.today.served, lost: R.today.lost,
    rev: recRev(h), cost: recCost(h, cfg), profit: recRev(h) - recCost(h, cfg),
    money: Math.round(S.money), rating: rating(S).toFixed(1) });
}

/* ---- IN BẢNG ---- */
const fm = n => (n < 0 ? '-' : '') + Math.abs(Math.round(n)).toLocaleString('vi-VN');
console.log('ngày | khách | phục vụ | bỏ về |   doanh thu |     chi phí |        lãi |     tiền còn | sao');
console.log('-'.repeat(96));
rows.forEach(r => console.log(
  String(r.day).padStart(4) + ' |' + String(r.arrived).padStart(6) + ' |' + String(r.served).padStart(8) + ' |' +
  String(r.lost).padStart(6) + ' |' + fm(r.rev).padStart(12) + ' |' + fm(r.cost).padStart(12) + ' |' +
  fm(r.profit).padStart(11) + ' |' + fm(r.money).padStart(12) + ' | ' + r.rating));
const last = rows[rows.length - 1], first = rows[0];
console.log('-'.repeat(96));
console.log(`sau ${N} ngày: tiền ${fm(last.money)} · lãi trung bình/ngày ${fm(rows.reduce((a, r) => a + r.profit, 0) / rows.length)}`);
console.log(`lãi ngày đầu ${fm(first.profit)} → ngày ${N}: ${fm(last.profit)} (gấp ${(last.profit / Math.max(1, first.profit)).toFixed(1)} lần)`);
console.log(`tỷ lệ khách bỏ về: ${(rows.reduce((a, r) => a + r.lost, 0) / Math.max(1, rows.reduce((a, r) => a + r.arrived, 0)) * 100).toFixed(1)}%`);

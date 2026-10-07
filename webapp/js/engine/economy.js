/* engine/economy.js — giá, chi phí, lượng khách, thuế, vay, cầm đồ linh thạch, sổ nợ. */
import { ITEMS, POT_KEYS, DIP_KEYS, TOP_KEYS, SECRET_KEYS, UPG, BASE_PRICE, XTOP_KEYS } from './data.js?v=54';
import { costOf } from './stock.js?v=54';
import { trafficMul } from './cult.js?v=54';
import { ruinTrafficMul } from './ruin.js?v=54';
import { pendTrafficMul } from './surprise.js?v=54';

/* món secret bán bằng linh thạch (sell = số LS hạ phẩm) */
const isLSItem = k => ITEMS[k] && ITEMS[k].type === 'secret' && ITEMS[k].sell <= 10;

/* ---------- định dạng tiền (1k = 1.000đ cho dễ đọc) ---------- */
export const fmt = n => (Math.round(n / 100) / 10).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'k';
export const fmtBig = n => n >= 1e9 ? (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ'
  : n >= 1e6 ? (n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' triệu'
  : fmt(n);

/* ---------- giá bán ---------- */
export const sv = (S, k) => { const v = +S.sell[k]; return isFinite(v) && v > 0 ? Math.min(v, sellMax(k)) : 0; };
export const sellMax = k => k === 'L' ? 50000 : 200000;

/* giá 1 nồi: base + chấm + toppings + cỡ lớn */
export function price(o, S) {
  const sell = S.sell;
  return sv(S, o.base)
    + (o.dip && ITEMS[o.dip] ? sv(S, o.dip) : 0)
    + o.tops.reduce((a, t) => a + sv(S, t), 0)
    + (o.size === 'L' ? sv(S, 'L') : 0);
}
/* giá tính bằng linh thạch (đơn tu tiên): phần VNĐ quy LS theo tỷ giá + món secret bán LS tính thẳng */
export function priceLS(o, S, cfg) {
  const rate = S.lsRate || cfg.ls.rate;
  const vnd = sv(S, o.base) + (o.dip && ITEMS[o.dip] ? sv(S, o.dip) : 0)
    + o.tops.filter(t => !isLSItem(t)).reduce((a, t) => a + sv(S, t), 0)
    + (o.size === 'L' ? sv(S, 'L') : 0);
  const ls = o.tops.filter(isLSItem).reduce((a, t) => a + (ITEMS[t].sell || 0), 0);
  return { vnd, ls, totalLS: Math.max(1, Math.round(vnd / rate)) + ls };
}

/* giá gốc (giá mặc định của menu) để so sánh (index đắt/rẻ) */
export const priceIdx = (o, S) => price(o, S) / price(o, { sell: BASE_PRICE });
export const overCap = (o, S, cfg) => price(o, S) > cfg.priceCap;

/* ---------- "đắt" theo ngưỡng ---------- */
export const potCap = (S, cfg) => cfg.potCap;
export const itemPricey = (S, k, cfg) => k === 'L' ? lPricey(S, cfg)
  : ITEMS[k] && ITEMS[k].type === 'base' ? S.sell[k] >= cfg.potCap
  : S.sell[k] / BASE_PRICE[k] > 1.3;
export const lPricey = (S, cfg) => S.sell.L > cfg.sizeWarn;
/* CỠ NỒI L (yêu cầu thiết kế 07/10, chỉnh lại 2 lần 08/10 theo phản hồi chủ dự án).
 *
 * Lịch sử: 07/10 để 0% ngày 1-3 (sợ sốc) → người chơi KHÔNG BAO GIỜ gặp nồi lớn.
 * 08/10 sửa thành 6% → vẫn quá hiếm: ca tối chỉ ~9-12 khách, 6% nghĩa là chỉ ~46% số ca có
 * một nồi lớn, tức HƠN NỬA số ngày chơi vẫn không thấy → chủ dự án lại báo "ko thấy khách order
 * nồi lớn". Nguyên nhân gốc: xác suất PHẢI tính theo số khách THẬT của một ca, không phải theo
 * cảm giác "hiếm".
 *
 * Nay: ngày 1-3 = 15% → với ca ~10 khách, P(gặp ≥1 nồi lớn) = 1-0,85^10 ≈ 80%, trung bình ~1,5 nồi
 * mỗi ca: THẤY ĐƯỢC mà không ngập. Rồi leo đều 22% → 28% → 33% → 38%. Vẫn giữ hai luật giá:
 * bán nồi lớn quá sizeWarn → còn 3,5%; chạm sizeCap → 0% (không ai gọi). */
export const lChance = (S, cfg) => {
  if (S.sell.L >= cfg.sizeCap) return 0;
  if (lPricey(S, cfg)) return .035;
  const d = S.day || 1;
  return d <= 3 ? .15 : d <= 7 ? .22 : d <= 15 ? .28 : d <= 29 ? .33 : .38;
};
export const pricyItems = (S, cfg) => [...POT_KEYS.filter(k => S.unlocked[k] && itemPricey(S, k, cfg)), ...(S.sell.L >= cfg.sizeCap ? ['L'] : [])];
export function orderPricey(o, S, cfg) {
  return overCap(o, S, cfg) || [o.base, ...(o.dip ? [o.dip] : []), ...o.tops, ...(o.size === 'L' ? ['L'] : [])].some(k => itemPricey(S, k, cfg));
}
/* topping/nước chấm đắt quá thì khách bỏ qua */
export const addOk = (S, k, cfg) => sv(S, k) <= cfg.addCap;
export const addSkip = (S, k, cfg, rng) => sv(S, k) > cfg.addWarn && rng.next() >= .2;

/* ---------- chi phí ---------- */
export const unitCost = (o, cfg) => costOf(cfg, o.base)
  + (o.dip && ITEMS[o.dip] ? costOf(cfg, o.dip) : 0)
  + o.tops.filter(t => ITEMS[t] && !isLSItem(t)).reduce((a, t) => a + costOf(cfg, t), 0)
  + costOf(cfg, 'sup');
export const upgCount = S => UPG.filter(u => u.tier === 'equip' && S.upg[u.id]).length;
export const xUpgCount = S => UPG.filter(u => u.tier === 'xian' && S.upg[u.id]).length;
export const wageDay = (S, cfg) => STAFF_WAGE(S, cfg);
function STAFF_WAGE(S, cfg) {
  let w = 0;
  if (S.upg.staff1) w += cfg.wage1;
  if (S.upg.staff2) w += cfg.wage2;
  if (S.upg.staffOn) w += cfg.wageOn;
  if (S.upg.staff3) w += (cfg.wage3 || 150000);
  return w;
}
/* chi phí cố định mỗi ngày: tiền nhà + điện nước (lớn dần theo ngày) + phí bảo trì thiết bị
 * (1,2% tổng giá trị trang bị đang có — càng nhiều đồ càng tốn tiền giữ). */
export function fixed(S, cfg) {
  const b = cfg.balance || {};
  const g = 1 + Math.max(0, (S.day - 1)) * (b.rentGrowthPerDay || 0);
  const upgVal = UPG.filter(u => S.upg[u.id]).reduce((a, u) => a + (u.cost || 0), 0);
  /* điện nước tăng theo LƯỢNG KHÁCH thật đã phục vụ (gas, đá, nước rửa, điện) */
  const perGuest = Math.round((S.cur?.served || 0) * (b.utilPerGuest || 0));
  return {
    rent: Math.round(cfg.rent * g),
    util: Math.round((cfg.utilBase + upgCount(S) * cfg.utilPerUpg) * g) + perGuest,
    maint: Math.round(upgVal * (b.maintenanceOf || 0)),
    perGuest
  };
}

/* ---------- uy tín quán ---------- */
/* điểm sao trung bình của 40 review gần nhất; quán mới chưa có ai đánh giá thì lấy 4 sao */
export function rating(S) {
  const r = S.reviews.slice(0, 40);
  if (!r.length) return 4;
  return r.reduce((a, x) => a + x.s, 0) / r.length;
}
export const starStr = v => { const f = Math.round(v); return '★'.repeat(f) + '☆'.repeat(5 - f); };

/* ---------- uy tín + lượng khách ----------
 * Lượng khách = nền theo sao × hệ số trang bị × sức hút của giá × mùa/sự kiện
 *   · nền theo sao:  0.55 → 1.45 khi sao chạy 1 → 5, chặn dưới 0.6 khi sao thấp,
 *     và 10 ngày đầu còn khởi động chậm (0.8 + 0.02×ngày)
 *   · hệ số trang bị:  bảng neon +20%, clip quảng cáo +25%, kinh nghiệm mở quán +1.2%/ngày (tối đa 40 ngày)
 *   · sức hút của giá: bán rẻ hơn giá mặc định thì đông khách hơn, bán đắt thì vơi khách
 *   · nhân thêm mùa trong ngày (evMul), khói bếp cảnh giới Nguyên Anh (trafficMul),
 *     và tin đồn quán sắp đóng cửa (ruinTrafficMul)
 */

/* nền khách theo điểm sao + độ "mới mở" */
function nenKhachTheoSao(sao, ngay) {
  const theoSao = .55 + (sao - 1) / 4 * .9;
  const chanSaoThap = Math.min(1, Math.max(.6, .6 + (sao - 3.5) * .4));
  const khoiDong = ngay < 10 ? .8 + .02 * ngay : 1;
  return theoSao * chanSaoThap * khoiDong;
}

/* trang bị + kinh nghiệm mở quán kéo khách */
function heSoTrangBi(S) {
  const bang = S.upg.sign ? .2 : 0;
  const clip = S.upg.ads ? .25 : 0;
  const caoCap = (S.upg.premium ? .15 : 0) + (S.upg.branch ? .30 : 0);   /* 08/10: đích dài hạn */
  const kinhNghiem = Math.min(S.day, 40) * .012;
  return 1 + bang + clip + caoCap + kinhNghiem;
}

/* chỉ số giá 1.0 = bán đúng giá mặc định; dưới 1 là rẻ hơn */
function chiSoGia(S) {
  const monMo = POT_KEYS.filter(k => S.unlocked[k]);
  if (!monMo.length) return 1;
  return monMo.reduce((a, k) => a + S.sell[k] / BASE_PRICE[k], 0) / monMo.length;
}

export function traffic(S, cfg, evMul = 1) {
  const gia = chiSoGia(S);
  const hutKhachTheoGia = 1 / Math.max(.85, Math.min(1, gia) ** 2);
  return nenKhachTheoSao(rating(S), S.day)
    * heSoTrangBi(S)
    * hutKhachTheoGia
    * evMul
    * trafficMul(S)
    * pendTrafficMul(S)     /* ảnh hưởng của sự kiện bất ngờ hôm qua (engine/surprise.js) */
    * ruinTrafficMul(S);
}

/* ---------- ghi nhận doanh thu ngày ----------
 * Ghi tiền THEO TỪNG MÓN (base + size + dip + từng topping) để tổng sales = đúng giá nồi,
 * không double-count. r.ing đếm số phần nguyên liệu tiêu thụ (cho báo cáo chi phí). */
export function recSale(S, o, amount, online = false) {
  const r = S.cur;
  const add = (k, v) => { r.sales[k] = r.sales[k] || { q: 0, a: 0 }; r.sales[k].q++; r.sales[k].a += v; };
  add(o.base, sv(S, o.base));
  if (o.size === 'L') add('L', sv(S, 'L'));
  if (o.dip && ITEMS[o.dip]) add(o.dip, sv(S, o.dip));
  o.tops.forEach(t => {
    if (!ITEMS[t]) return;
    r.ing[t] = (r.ing[t] || 0) + 1;
    if (!isLSItem(t)) add(t, sv(S, t));   // món bí mật bán linh thạch — không ghi doanh thu VNĐ
  });
  /* đối soát tiền THỰC nhận (khách trả giá/bùng) — chênh lệch so với giá niêm yết ghi vào base */
  if (typeof amount === 'number' && o.base) {
    const diff = amount - potListedTotal(o, S);
    if (diff !== 0) r.sales[o.base].a += diff;
  }
  if (online) { r.onl += amount; r.fee += Math.round(amount * 0.2); }
}
function potListedTotal(o, S) {
  return sv(S, o.base) + (o.size === 'L' ? sv(S, 'L') : 0)
    + (o.dip && ITEMS[o.dip] ? sv(S, o.dip) : 0)
    + o.tops.reduce((a, t) => a + (ITEMS[t] && !isLSItem(t) ? sv(S, t) : 0), 0);
}

/* ---------- tổng kết: doanh thu / chi phí ----------
 * Mô hình: nhập hàng trả tiền TRƯỚC (S.cur.restock) — giống "Nấu và nhập hàng" của thể loại.
 * Có restock → COGS = restock (hàng hỏng/hết hạn đã nằm trong đó). Không có → fallback ing+waste. */
export const recRev = r => Object.values(r.sales || {}).reduce((a, x) => a + (x.a || 0), 0) + (r.tips || 0) + (r.gift || 0);
export function recCost(r, cfg) {
  const ingCost = Object.entries(r.ing || {}).reduce((a, [k, q]) => a + q * costOf(cfg, k), 0);
  const cogs = r.restock != null ? r.restock : ingCost + (r.waste?.v || 0);
  return cogs + (r.rent || 0) + (r.util || 0) + (r.maint || 0) + (r.tax || 0) + (r.wage || 0) + (r.fee || 0);
}

/* ---------- thuế hộ kinh doanh (VAT 3% + PIT 1.5%, ngưỡng 1 tỷ/năm) ---------- */
/* Thuế hộ kinh doanh, LUỸ TIẾN theo doanh thu năm (08/10):
 * dưới ngưỡng miễn thuế → 0; vượt ngưỡng → mức cơ bản (VAT+TNCN);
 * vượt mốc cao (gấp 3 ngưỡng) → mức cao — quán càng lớn đóng càng nhiều, đúng luật thật. */
export function dayTax(S, cfg, dayRevenue) {
  S.yearRev = (S.yearRev || 0) + dayRevenue;
  const nguong = cfg.taxThreshold;
  if (S.yearRev <= nguong) return 0;
  const cao = S.yearRev > nguong * 3;
  const muc = cao ? (cfg.vat + cfg.pit) * 1.6 : (cfg.vat + cfg.pit);
  return Math.round(dayRevenue * muc / 100);
}

/* ---------- vay nóng / vay ngân hàng ---------- */
export const LOANS = [
  { id: 'loan', n: 'Vay ngân hàng', max: cfg => cfg.bankMax, rate: cfg => cfg.bankRate, opts: cfg => [200000, 500000, cfg.bankMax] },
  { id: 'hot', n: 'Vay nóng hắc thị', max: cfg => cfg.hotMax, rate: cfg => cfg.hotRate, opts: cfg => [1000000, 2000000, cfg.hotMax], hide: 1 }
];
export const debtsOf = S => LOANS.filter(L => S[L.id] && S[L.id].left > 0);
export const inDebt = S => debtsOf(S).length > 0;
export function takeLoan(S, cfg, id, amount) {
  const L = LOANS.find(x => x.id === id); if (!L) return null;
  if (S[id] && S[id].left > 0) return null;
  if (amount > L.max(cfg)) return null;
  const pay = Math.round(amount / 10), it = Math.round(amount * L.rate(cfg) / 100 / 360);
  S[id] = { left: 10, pay, int: it, amt: amount };
  S.money += amount;
  return S[id];
}
export function payDayLoan(S, cfg) { /* trừ cuối ngày */
  let out = 0;
  LOANS.forEach(L => {
    const x = S[L.id];
    if (x && x.left > 0) { const t = x.pay + x.int; S.money -= t; out += t; x.left--; if (x.left <= 0) S[L.id] = null; }
  });
  return out;
}
export function payOff(S) {
  const due = debtsOf(S).reduce((a, L) => a + S[L.id].pay * S[L.id].left, 0);
  if (S.money < due) return false;
  S.money -= due;
  LOANS.forEach(L => { if (S[L.id]) S[L.id] = null; });
  return true;
}

/* ---------- LINH THẠCH: tỷ giá + tiệm cầm đồ ---------- */
export function rollLSRate(S, cfg, rng) {
  const drift = cfg.ls.drift;
  const f = 1 + (rng.next() * 2 - 1) * drift;
  S.lsRate = Math.round(cfg.ls.rate * f / 100) * 100;
  return S.lsRate;
}
export function sellLS(S, cfg, haPham) { /* bán linh thạch lấy VNĐ — giá mua vào thấp */
  const spread = S.upg.cam_do ? 0.9 : 0.85;
  const vnd = Math.round(haPham * S.lsRate * spread / 1000) * 1000;
  S.ls -= haPham; S.money += vnd;
  return vnd;
}
export function buyLS(S, cfg, vnd) { /* mua linh thạch bằng VNĐ — giá bán ra cao */
  const spread = S.upg.cam_do ? 1.15 : 1.2;
  const unit = Math.round(S.lsRate * spread);
  const haPham = Math.floor(vnd / unit);
  if (haPham < 1) return 0;
  const cost = haPham * unit;
  S.money -= cost; S.ls += haPham;
  return haPham;
}

/* ---------- SỔ NỢ khách tu tiên (cơ chế nhánh của mình) ---------- */
export function addDebt(S, cfg, name, ls, rng) {
  const [lo, hi] = cfg.ls.debtDays;
  const resolveAt = S.day + lo + Math.floor(rng.next() * (hi - lo + 1));
  const win = rng.next() < cfg.ls.debtWin;
  const d = { id: ++S.debtSeq, name, ls, day: S.day, resolveAt, win, resolved: false };
  S.debtSeq = S.debtSeq || 1;
  S.debts.push(d);
  return d;
}
export function resolveDebts(S, cfg) { /* gọi đầu ngày — trả về các biến cố để UI hiện */
  const out = [];
  (S.debts || []).forEach(d => {
    if (d.resolved || S.day < d.resolveAt) return;
    d.resolved = true;
    if (d.win) {
      const back = d.ls * cfg.ls.debtMul;
      S.ls += back;
      out.push({ kind: 'win', d, back });
    } else {
      out.push({ kind: 'lose', d });
    }
  });
  S.debts = (S.debts || []).filter(d => !d.resolved || S.day - d.resolveAt < 3);
  return out;
}

/* ---------- chống gian lận: quán bị cạy két */
export function cheatHit(S, cfg, rng) {
  const keep = (1 + Math.floor(rng.next() * 9)) * 100000;
  const lost = Math.max(0, S.money - keep);
  S.money = keep;
  S.cur.stolen = (S.cur.stolen || 0) + lost;
  S.badNow = { id: 'trom', all: 1, v: lost, keep };
  return { keep, lost };
}

export { XTOP_KEYS };

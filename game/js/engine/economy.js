/* engine/economy.js — giá, chi phí, traffic, thuế, vay, cầm đồ linh thạch, sổ nợ. Port công thức gốc. */
import { ITEMS, BASE_KEYS, DIP_KEYS, TOP_KEYS, XTOP_KEYS, UPG, DEF_SELL } from './data.js';
import { costOf } from './stock.js';

/* ---------- định dạng tiền (như gốc: 1k = 1.000đ) ---------- */
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
/* giá tính bằng linh thạch (đơn tu tiên): base quy LS + xtop tính LS trực tiếp */
export function priceLS(o, S, cfg) {
  const rate = S.lsRate || cfg.ls.rate;
  const vnd = sv(S, o.base) + (o.dip && ITEMS[o.dip] ? sv(S, o.dip) : 0)
    + o.tops.filter(t => ITEMS[t]?.type === 'top').reduce((a, t) => a + sv(S, t), 0)
    + (o.size === 'L' ? sv(S, 'L') : 0);
  const ls = o.tops.filter(t => ITEMS[t]?.type === 'xtop').reduce((a, t) => a + (ITEMS[t].sell || 0), 0);
  return { vnd, ls, totalLS: Math.max(1, Math.round(vnd / rate)) + ls };
}

/* giá gốc để so sánh (index đắt/rẻ) */
export const priceIdx = (o, S) => price(o, S) / price(o, { sell: DEF_SELL });
export const overCap = (o, S, cfg) => price(o, S) > cfg.priceCap;

/* ---------- "đắt" theo ngưỡng ---------- */
export const potCap = (S, cfg) => cfg.potCap;
export const itemPricey = (S, k, cfg) => k === 'L' ? lPricey(S, cfg)
  : ITEMS[k] && ITEMS[k].type === 'base' ? S.sell[k] >= cfg.potCap
  : S.sell[k] / DEF_SELL[k] > 1.3;
export const lPricey = (S, cfg) => S.sell.L > cfg.sizeWarn;
export const lChance = (S, cfg) => S.sell.L >= cfg.sizeCap ? 0 : lPricey(S, cfg) ? .035 : .35;
export const pricyItems = (S, cfg) => [...BASE_KEYS.filter(k => S.unlocked[k] && itemPricey(S, k, cfg)), ...(S.sell.L >= cfg.sizeCap ? ['L'] : [])];
export function orderPricey(o, S, cfg) {
  return overCap(o, S, cfg) || [o.base, ...(o.dip ? [o.dip] : []), ...o.tops, ...(o.size === 'L' ? ['L'] : [])].some(k => itemPricey(S, k, cfg));
}
/* topping/nước chấm đắt thì khách bỏ qua (addOk/addSkip gốc) */
export const addOk = (S, k, cfg) => sv(S, k) <= cfg.addCap;
export const addSkip = (S, k, cfg, rng) => sv(S, k) > cfg.addWarn && rng.next() >= .2;

/* ---------- chi phí ---------- */
export const unitCost = (o, cfg) => costOf(cfg, o.base)
  + (o.dip && ITEMS[o.dip] ? costOf(cfg, o.dip) : 0)
  + o.tops.filter(t => ITEMS[t]?.type === 'top').reduce((a, t) => a + costOf(cfg, t), 0)
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
export const fixed = (S, cfg) => ({ rent: cfg.rent, util: cfg.utilBase + upgCount(S) * cfg.utilPerUpg });

/* ---------- uy tín + traffic ---------- */
export function rating(S) { const r = S.reviews.slice(0, 40); if (!r.length) return 4; return r.reduce((a, x) => a + x.s, 0) / r.length; }
export const starStr = v => { const f = Math.round(v); return '★'.repeat(f) + '☆'.repeat(5 - f); };

/* công thức traffic port nguyên xi từ gốc: rating → hệ số khách, boost trang bị, giá RẺ hút khách (avgIdx<1), giá đắt bị phạt qua pricyItems ở spawn */
export function traffic(S, cfg, evMul = 1) {
  const r = rating(S);
  const rf = (.55 + (r - 1) / 4 * .9) * Math.min(1, Math.max(.6, .6 + (r - 3.5) * .4)) * (S.day < 10 ? .8 + .02 * S.day : 1);
  const boost = 1 + (S.upg.sign ? .2 : 0) + (S.upg.ads ? .25 : 0) + Math.min(S.day, 40) * .012;
  const avgIdx = BASE_KEYS.filter(k => S.unlocked[k]).reduce((a, k) => a + S.sell[k] / DEF_SELL[k], 0) / Math.max(1, BASE_KEYS.filter(k => S.unlocked[k]).length);
  return rf * boost * evMul / Math.max(.85, Math.min(1, avgIdx) ** 2);
}

/* ---------- ghi nhận doanh thu ngày (recSale gốc) ---------- */
export function recSale(S, o, amount, online = false) {
  const k = o.base;
  const r = S.cur;
  r.sales[k] = r.sales[k] || { q: 0, a: 0 };
  r.sales[k].q++; r.sales[k].a += amount;
  [o.dip, ...o.tops].filter(Boolean).forEach(t => {
    if (!ITEMS[t]) return;
    const p = ITEMS[t].type === 'xtop' ? 0 : sv(S, t);
    r.ing[t] = (r.ing[t] || 0) + 1;
    if (p) { r.sales[t] = r.sales[t] || { q: 0, a: 0 }; r.sales[t].q++; r.sales[t].a += p; }
  });
  if (online) { r.onl += amount; r.fee += Math.round(amount * 0.2); }
}

/* ---------- tổng kết: doanh thu / chi phí ---------- */
export const recRev = r => Object.values(r.sales || {}).reduce((a, x) => a + (x.a || 0), 0) + (r.tips || 0) + (r.gift || 0);
export function recCost(r, cfg) {
  const ing = Object.entries(r.ing || {}).reduce((a, [k, q]) => a + q * costOf(cfg, k), 0);
  return ing + (r.rent || 0) + (r.util || 0) + (r.waste?.v || 0) + (r.tax || 0) + (r.wage || 0) + (r.fee || 0);
}

/* ---------- thuế hộ kinh doanh (giữ nguyên luật gốc: VAT 3% + PIT 1.5%, ngưỡng 1 tỷ/năm) ---------- */
export function dayTax(S, cfg, dayRevenue) {
  S.yearRev = (S.yearRev || 0) + dayRevenue;
  if (S.yearRev <= cfg.taxThreshold) return 0;
  return Math.round(dayRevenue * (cfg.vat + cfg.pit) / 100);
}

/* ---------- vay (port LOANS gốc) ---------- */
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

/* ---------- chống gian lận (port cheatHit gốc) ---------- */
export function cheatHit(S, cfg, rng) {
  const keep = (1 + Math.floor(rng.next() * 9)) * 100000;
  const lost = Math.max(0, S.money - keep);
  S.money = keep;
  S.cur.stolen = (S.cur.stolen || 0) + lost;
  S.badNow = { id: 'trom', all: 1, v: lost, keep };
  return { keep, lost };
}

export { XTOP_KEYS };

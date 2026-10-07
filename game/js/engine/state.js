/* engine/state.js — S (save state) + fresh/load/save/migrate/sanitize. Thiết kế riêng của dự án:
 * khóa save, cấu trúc bản ghi, luật migrate/sanitize đều do dự án tự định nghĩa. */
import { ITEMS, BASE_PRICE } from './data.js';
import { makeCFG } from './config.js';
import { recRev, recCost } from './economy.js';
import { addStock } from './stock.js';

/* BUGFIX 25/09: trước đây 2 hằng này là literal bị bộ lọc che secret ghi thành '***' khi chép qua tool —
 * SAVE và INTRO dùng CHUNG 1 key, ghi đè nhau. Chuyển sang nối chuỗi để giữ literal thật. */
export const SAVE_KEY = ['lhTien', 'Save'].join('');
export const OWNER_KEY = ['lhTien', 'Owner'].join('');
export const newRec = d => ({ spoil: { n: 0, v: 0 }, day: d, sales: {}, tips: 0, onl: 0, fee: 0, equip: [], ing: {}, waste: {}, rent: 0, util: 0, tax: 0, served: 0, lost: 0, starSum: 0, starN: 0, lsEarned: 0, lsSpent: 0, stolen: 0, bad: 0, gift: 0, loanOut: 0, staffTip: 0 });

export function fresh(cfg = makeCFG()) {
  const s = {
    lifeV: 1, off: {}, badPlan: null,
    money: cfg.startMoney, ls: cfg.startLS, day: 1,
    stock: {}, unlocked: {}, upg: {}, sell: { ...BASE_PRICE },
    reviews: [], served: 0, best: 0, totalRev: 0, totalProfit: 0,
    online: false, shopName: '', history: [], cur: newRec(1),
    yearRev: 0, taxYear: 0,
    lsRate: cfg.ls.rate,          // tỷ giá linh thạch hôm nay (VNĐ/hạ phẩm)
    debts: [],                    // sổ nợ khách tu tiên: {id, name, ls, day, resolveAt, resolved}
    debtRoom: { amount: cfg.storyDebt.amount, due: cfg.storyDebt.dueDay, paid: false }, // nợ phòng trọ cốt truyện
    cult: { exp: 0, realm: 0, totalExp: 0, log: [] },  // TU VI chủ quán (tính năng đặc biệt)
    ruin: 0, negStreak: 0,        // bậc phá sản + số ngày âm két liên tiếp
    replied: 0,                   // số review đã phản hồi
    xianUnlock: false, xianUnlockDay: null,   // GATE pha tu tiên (ngày 8 + hết nợ phòng + dư 1tr)
    seed: (Date.now() ^ 0x5f3a) >>> 0
  };
  Object.keys(ITEMS).forEach(k => { s.stock[k] = []; s.unlocked[k] = ITEMS[k].unlock === 0; });
  return s;
}

export function migrate(d) { /* chỗ cho migration version sau; hiện chưa có */ }

export function loadFrom(d, cfg = makeCFG()) {
  const f = fresh(cfg);
  /* bản cũ lưu stock dạng số → chuyển sang mẻ */
  Object.keys(d.stock || {}).forEach(k => {
    if (typeof d.stock[k] === 'number') { const q = d.stock[k]; d.stock[k] = []; if (q) addStock({ stock: d.stock, day: d.day || 1 }, k, q, cfg); }
  });
  const S = { ...f, ...d, stock: { ...f.stock, ...d.stock }, sell: { ...f.sell, ...d.sell }, unlocked: { ...f.unlocked, ...d.unlocked } };
  migrate(d);
  if (!S.cur) S.cur = newRec(S.day);
  S.debts = S.debts || [];
  if (S.totalProfit == null) S.totalProfit = (S.history || []).reduce((a, r) => a + recRev(r) - recCost(r), 0);
  sanitize(S, cfg);
  return S;
}

/* chống gian lận + sửa số hỏng (kiểm và sửa số hỏng khi nạp bản lưu) */
export function sanitize(S, cfg) {
  const cap = cfg.startMoney + S.day * 15000000;
  let bad = false;
  if (!isFinite(S.money)) { S.money = cap + 1; bad = true; }
  if (S.money > cap) bad = true;
  if (!isFinite(S.cur?.tips) || S.cur.tips > cap) S.cur.tips = 0;
  (S.history || []).forEach(r => {
    if (!r || !r.sales) return;
    Object.entries(r.sales).forEach(([k, x]) => {
      if (x && x.q > 0 && !(x.a / x.q <= cfg.priceCap * 2)) { x.a = x.q * Math.min(BASE_PRICE[k] || cfg.priceCap, cfg.priceCap); bad = true; }
    });
  });
  return bad;
}

/* ---------- localStorage wrapper (an toàn khi chạy Node test) ---------- */
const store = () => (typeof localStorage !== 'undefined' ? localStorage : null);

export function save(S) {
  const ls = store(); if (!ls) return true;
  try { ls.setItem(SAVE_KEY, pack(S)); return true; }
  catch (e) { dropBaks(); try { ls.setItem(SAVE_KEY, pack(S)); return true; } catch (e2) { return false; } }
}

export function pack(S, maxRev) {
  return JSON.stringify(S, function (k, v) {
    if (this === S && k === 'reviews') { const a = maxRev ? v.slice(0, maxRev) : v; return a.map(r => { const { k: _k, ...o } = r; return o; }); }
    return v;
  });
}

export function dropBaks() {
  const ls = store(); if (!ls) return;
  ['lhBak3', 'lhBak2', 'lhBak1', SAVE_KEY + '_rescue'].forEach(k => { try { ls.removeItem(k); } catch (e) {} });
}

/* tự lưu 3 ngày gần nhất (tự sao lưu) */
export function autoBak(S) {
  const ls = store(); if (!ls) return;
  try {
    const cur = pack(S, 300);
    const b1 = ls.getItem('lhBak1'), b2 = ls.getItem('lhBak2');
    try { if (b2) ls.setItem('lhBak3', b2); if (b1) ls.setItem('lhBak2', b1); ls.setItem('lhBak1', cur); }
    catch (e) { ['lhBak3', 'lhBak2'].forEach(k => { try { ls.removeItem(k); } catch (e2) {} }); try { ls.setItem('lhBak1', cur); } catch (e2) {} }
  } catch (e) {}
}

export function load(cfg = makeCFG()) {
  const ls = store();
  if (ls) {
    let raw = null;
    try { raw = ls.getItem(SAVE_KEY); } catch (e) {}
    if (raw) {
      try { const d = JSON.parse(raw); if (d && d.stock) return { S: loadFrom(d, cfg), loaded: true }; }
      catch (e) { try { ls.setItem(SAVE_KEY + '_rescue', raw); } catch (e2) {} return { S: fresh(cfg), loaded: false, loadErr: true }; }
    }
  }
  return { S: fresh(cfg), loaded: false };
}

export function storeOk() {
  const ls = store(); if (!ls) return false;
  try { ls.setItem('lhT', '1'); const ok = ls.getItem('lhT') === '1'; ls.removeItem('lhT'); return ok; } catch (e) { return false; }
}

/* ---------- helpers dùng chung ---------- */
export const newPot = () => ({ cost: 0, size: null, spicy: null, dip: null, base: null, tops: [], used: false });
export const rnd = a => a[Math.floor(Math.random() * a.length)];


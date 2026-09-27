/* engine/stock.js — kho theo mẻ có hạn dùng (port nguyên cơ chế gốc) */
import { ITEMS } from './data.js';

/* thêm q phần nguyên liệu k vào kho, mẻ hạn dùng tính từ ngày hiện tại */
export function addStock(S, k, q, cfg) {
  if (!q) return;
  const life = cfg?.life?.[k] ?? ITEMS[k]?.life ?? 0;
  const exp = life ? S.day + life - 1 : 99999;
  const arr = S.stock[k] = S.stock[k] || [];
  const b = arr.find(x => x.exp === exp);
  if (b) b.q += q;
  else { arr.push({ q, exp }); arr.sort((a, c) => a.exp - c.exp); }
}

export const qty = (S, k) => (S.stock[k] || []).reduce((a, b) => a + b.q, 0);

/* lấy 1 phần (mẻ cận date dùng trước) */
export function take(S, k) {
  const b = (S.stock[k] || []).find(x => x.q > 0);
  if (!b) return false;
  b.q--;
  S.stock[k] = S.stock[k].filter(x => x.q > 0);
  return true;
}

/* đổ bỏ hàng hết hạn cuối ngày — trả về danh sách {k,q,v} để ghi tổng kết */
export function expireStock(S, cfg) {
  const out = [];
  Object.keys(S.stock).forEach(k => {
    let q = 0;
    S.stock[k] = S.stock[k].filter(b => { if (b.exp <= S.day) { q += b.q; return false; } return true; });
    if (q) out.push({ k, q, v: q * costOf(cfg, k) });
  });
  return out;
}

export function costOf(cfg, k) { return cfg.cost?.[k] ?? ITEMS[k]?.cost ?? 0; }

export function lifeTxt(S, k, cfg) {
  const l = cfg?.life?.[k] ?? ITEMS[k]?.life ?? 0;
  return l ? (l === 1 ? 'Dùng trong ngày' : `Để được ${l} ngày`) : 'Không hết hạn';
}

/* hàng cận date hôm nay (để cảnh báo UI) */
export function expiringToday(S, k) {
  return (S.stock[k] || []).filter(b => b.exp === S.day).reduce((a, b) => a + b.q, 0);
}

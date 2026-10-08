/* engine/stats.js — THỐNG KÊ ngày/tuần/tháng + bán chạy (bảng theo ngày / tuần / tháng).
 * Đọc S.history (rec ngày đã đóng) + S.cur (ngày đang bán) — không đổi state. */
import { rating } from './economy.js?v=60';
import { recRev, recCost } from './economy.js?v=60';
import { iname } from './data.js?v=60';

/* lấy rec của 1 ngày đã qua (history lưu mới→cũ) */
export function recOfDay(S, day) {
  return (S.history || []).find(r => r && r.day === day) || null;
}

/* thống kê 1 ngày cụ thể: null nếu ngày chưa có dữ liệu */
export function dayStats(S, day, cfg) {
  const r = recOfDay(S, day);
  if (!r) return null;
  const rev = recRev(r), cost = recCost(r, cfg);
  const stars = (S.reviews || []).filter(x => x.d === day);
  const avg = stars.length ? stars.reduce((a, x) => a + x.s, 0) / stars.length : null;
  const best = bestSellers(S, day, day, 1)[0] || null;
  return {
    day,
    served: r.served || 0,
    lost: r.lost || 0,
    wrong: (r.spoil && r.spoil.n) || 0,
    rating: avg,
    ratingAll: rating(S),
    reviews: (S.reviews || []).filter(x => x.d === day).length,
    rev, cost, profit: rev - cost,
    tips: r.tips || 0,
    lsEarned: r.lsEarned || 0,
    bestMon: best ? best.k : null,
    bestQ: best ? best.q : 0
  };
}

/* gộp nhiều ngày [from..to] (ngày đã đóng trong history) */
export function rangeStats(S, from, to, cfg) {
  const recs = (S.history || []).filter(r => r && r.day >= from && r.day <= to);
  if (!recs.length) return null;
  let served = 0, lost = 0, rev = 0, cost = 0, tips = 0, ls = 0;
  recs.forEach(r => {
    served += r.served || 0; lost += r.lost || 0;
    rev += recRev(r); cost += recCost(r, cfg);
    tips += r.tips || 0; ls += r.lsEarned || 0;
  });
  const stars = (S.reviews || []).filter(x => x.d >= from && x.d <= to);
  const avg = stars.length ? stars.reduce((a, x) => a + x.s, 0) / stars.length : null;
  return {
    from, to, days: recs.length,
    served, lost, rev, cost, profit: rev - cost, tips, lsEarned: ls,
    rating: avg, reviews: stars.length
  };
}

/* món bán chạy nhất trong khoảng ngày — đếm theo sales[k].q (bỏ 'L' size và topping lẻ? KHÔNG:
 * giữ mọi key bỏ riêng cỡ nồi 'L' — trả về top N) */
export function bestSellers(S, from, to, n = 3) {
  const agg = {};
  (S.history || []).forEach(r => {
    if (!r || r.day < from || r.day > to) return;
    Object.entries(r.sales || {}).forEach(([k, x]) => {
      if (k === 'L' || !x || !x.q) return;
      agg[k] = (agg[k] || 0) + x.q;
    });
  });
  return Object.entries(agg)
    .map(([k, q]) => ({ k, q }))
    .sort((a, b) => b.q - a.q)
    .slice(0, n);
}

/* tuần = 7 ngày gần nhất đã đóng, tháng = 30 ngày */
export const weekRange = S => [Math.max(1, S.day - 7), S.day - 1];
export const monthRange = S => [Math.max(1, S.day - 30), S.day - 1];

/* dòng "🔥 Bán chạy: ..." như bảng thống kê */
export function bestLine(S, from, to) {
  const top = bestSellers(S, from, to, 3);
  if (!top.length) return '';
  return top.map(x => iname(x.k) + ' (' + x.q + ')').join(', ');
}

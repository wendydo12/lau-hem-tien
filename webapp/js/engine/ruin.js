/* engine/ruin.js — THANG PHÁ SẢN: hậu quả kinh doanh thua lỗ âm tiền (sáng tác gốc).
 * Tách file riêng để tránh vòng import economy ↔ replies.
 * 3 bậc leo thang theo số ngày ÂM KÉT liên tiếp, tính lúc closeDay:
 * bậc 1 "Chủ nhà nhắc nợ": banner + traffic -10%
 * bậc 2 "Tin đồn lan ra": khách e dè, traffic -25%
 * bậc 3 "Ngân siết quán": mất 30% két dương + 1 trang bị, traffic -45%;
 *         ÂM QUÁ ruinDeep hoặc bậc 3 kéo dài (streak ≥ 6) → GAME OVER "Quán đóng cửa".
 * Lãi dương bất kỳ ngày nào → reset về 0 ngay (cho đường sống). */

export const RUIN_TIERS = [
  { tier: 0, n: 'Êm đẹp', d: '', traffic: 1 },
  { tier: 1, n: 'Chủ nhà nhắc nợ', d: 'Sáng nay chủ nhà đứng trước quán lâu hơn thường lệ. Hàng xóm bắt đầu bàn ra tán vào.', traffic: .9 },
  { tier: 2, n: 'Tin đồn lan ra', d: 'Cả hẻm đồn quán sắp đóng cửa. Khách quen ngần ngại không dám ghé.', traffic: .75 },
  { tier: 3, n: 'Ngân siết quán', d: 'Chủ nợ tới kê biên! Họ lấy đi một phần tài sản và dọa: không gượng dậy nổi là dán cáo thị đóng cửa.', traffic: .55 }
];

export function ruinUpdate(S, cfg, dayProfit) {
  if (dayProfit >= 0) { S.negStreak = 0; S.ruin = 0; return null; }
  S.negStreak = (S.negStreak || 0) + 1;
  const streak = S.negStreak;
  S.ruin = streak >= 4 ? 3 : streak >= 2 ? 2 : 1;
  const deep = S.money < -(cfg.ruinDeep || 5000000);
  const events = { tier: S.ruin, deep, streak, over: false, lostMoney: 0, lostUpg: null };
  if (S.ruin >= 3) {
    /* kê biên: mất 30% két còn lại (phần dương) + 1 trang bị gần nhất */
    const grab = Math.max(0, Math.round(S.money * .3 / 1000) * 1000);
    if (grab > 0) { S.money -= grab; events.lostMoney = grab; }
    const eq = Object.keys(S.upg).filter(k => S.upg[k] && ['sign', 'ads', 'seats', 'ac', 'sealer', 'slot4'].includes(k));
    if (eq.length) { const k = eq[eq.length - 1]; S.upg[k] = false; events.lostUpg = k; }
    if (streak >= 6 || deep) events.over = true;
  }
  return events;
}

export const ruinTrafficMul = S => (RUIN_TIERS[S.ruin || 0] || RUIN_TIERS[0]).traffic;
export const ruinInfo = S => RUIN_TIERS[S.ruin || 0] || RUIN_TIERS[0];

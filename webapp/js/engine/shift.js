/* engine/shift.js — CA TỐI của quán (yêu cầu thiết kế 07/10/2026)
 *
 * Quán chỉ mở 19:00 → 22:00, đồng hồ nhảy từng 10 PHÚT kiểu Stardew Valley (19:00, 19:10…).
 * Nhịp thật: 8 giây cho mỗi 10 phút game → cả ca = 18 nhịp = 144 giây = 2 phút 24 giây thật.
 * 08/10 (chủ dự án chốt): ĐÓNG CỬA ĐÚNG 22:00. Con số 👥 ở màn chuẩn bị là CHỈ TIÊU (KPI) —
 * phục vụ đủ là ĐẠT, khách vẫn vào thêm tới sát giờ đóng nên VƯỢT CHỈ TIÊU là chuyện thường.
 * Khách rải theo ĐƯỜNG CONG QUÁN ĂN TỐI (đông → vừa → vãn) thay vì dồn một cục như trước,
 * để người chơi kịp nấu mà vẫn thấy căng ở cao điểm.
 *
 * Tách riêng khỏi main.js: mọi hàm ở đây THUẦN (không đụng DOM) nên đo được bằng test.
 */

export const SHIFT = { startH: 19, endH: 22, tickMin: 10, tickSec: 8 };

/* tổng thời gian THẬT của một ca (ms) — 18 nhịp × 8 giây = 144 000 */
export const shiftMs = (sh = SHIFT) =>
  Math.round(((sh.endH - sh.startH) * 60 / sh.tickMin) * sh.tickSec * 1000);

/* đồng hồ trong ca: '19:00' … '22:00' — phút LUÔN làm tròn xuống mốc 10 phút */
export function clockText(elapsedMs, sh = SHIFT) {
  const total = shiftMs(sh);
  const frac = Math.max(0, Math.min(1, elapsedMs / total));
  const phut = Math.floor(frac * (sh.endH - sh.startH) * 60);
  const hh = sh.startH + Math.floor(phut / 60);
  const mm = Math.floor((phut % 60) / sh.tickMin) * sh.tickMin;
  return String(Math.min(sh.endH, hh)).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

/* tỉ lệ ca đã trôi qua (0..1) — dùng cho thanh tiến độ ca trên HUD */
export const shiftFrac = (elapsedMs, sh = SHIFT) =>
  Math.max(0, Math.min(1, elapsedMs / shiftMs(sh)));

/* ĐƯỜNG CONG KHÁCH TRONG CA — chốt 07/10 sau khi cân với sức phục vụ thật:
 *   1 nồi ≈ 8-10 giây thao tác · 3 chỗ ngồi (4 khi mở trang bị) · khách chịu chờ ≈ 55 giây.
 *   Nhịp khách ~14-16 giây ở cao điểm là vừa căng mà không bí; cuối ca thưa để dọn dẹp.
 * `to` = mốc kết thúc đoạn (tỉ lệ ca) · `share` = phần khách của đoạn · `jitter` = độ lệch
 * ngẫu nhiên trong đoạn (0 = đều tăm tắp, 1 = trải hết đoạn). */
export const GUEST_CURVE = [
  { to: 0.375, share: 0.45, jitter: 0.55 },   // 19:00 → 20:30 — đông nhất (45% khách)
  { to: 0.710, share: 0.36, jitter: 0.75 },   // 20:30 → 21:50 — vừa (36%)
  { to: 1.000, share: 0.19, jitter: 0.95 },   // 21:50 → 22:00 — vãn dần (19%)
];

/* Mốc thời gian (ms, tính từ lúc mở cửa) khách ghé trong ca.
 * - đúng `cap` khách (không thiếu, không thừa)
 * - đã sắp xếp tăng dần, không ai cách nhau dưới 2,5 giây (khỏi dồn cục)
 * - có nhiễu ngẫu nhiên nên ngày nào cũng khác nhau, nhưng vẫn theo đường cong. */
export const MIN_GAP_MS = 2500;

/* KHE LIÊN TỤC (yêu cầu chủ dự án 08/10/2026: "cho khách tần suất vào liên tục")
 * Khách không được thưa quá `khe` giây trong PHẦN ĐẦU ca — lúc quán đông khách nhất; về cuối ca
 * vẫn vãn dần để chủ quán dọn hàng. TỔNG SỐ KHÁCH KHÔNG ĐỔI (vẫn đúng trần hôm nay) nên kinh tế
 * giữ nguyên, chỉ đổi NHỊP phân bố.
 * Cách kéo: soi từng khe một theo mốc GỐC, khe nào xa quá `khe` thì kéo mốc sau về; KHÔNG kéo
 * dây chuyền (nếu kéo dây chuyền thì cả ca dồn vào một phút đầu rồi bỏ trống nửa sau).
 * Lịch nền giữ khe tối đa KHE_NEN_MS (18 giây). 08/10 ĐÊM (sửa luật dồn cục): mốc mời khách nay
 * = max(mốc nền ÷ moiNhanhNhat, lượt mời trước + KHE_LIEN_TUC_MS) — phục vụ nhanh thì khách vào
 * đều mỗi 6 giây SUỐT CA thay vì bị hút hết vào 1/3 thời gian đầu như công thức cũ. */
export const KHE_LIEN_TUC_MS = 6000;    /* khe MỤC TIÊU khi chủ quán phục vụ kịp (đẩy nhanh 3×) */
export const KHE_NEN_MS = 18000;         /* khe TỐI ĐA của lịch nền ở phần đầu ca = 3 × khe mục tiêu */
export function buildArrivals(cap, total = shiftMs(), rng, curve = GUEST_CURVE, khe = KHE_NEN_MS, den = 0.75) {
  const out = [];
  let from = 0, con = cap;
  curve.forEach((seg, i) => {
    const n = i === curve.length - 1 ? con : Math.max(0, Math.round(cap * seg.share));
    con -= n;
    const start = from * total;
    const span = (seg.to - from) * total;
    for (let k = 0; k < n; k++) {
      const within = (k + 0.5) / Math.max(1, n);                     // rải đều trong đoạn
      const jit = (rng.next() - 0.5) * seg.jitter * (span / Math.max(1, n));
      out.push(start + within * span + jit);
    }
    from = seg.to;
  });
  while (out.length < cap) out.push(total * (0.85 + rng.next() * 0.1));   // chống lệch làm tròn
  out.sort((a, b) => a - b);
  /* nén khe ở phần đầu ca (khách vào liên tục); cuối ca giữ nhịp thưa.
   * Chạy 3 lượt liên tiếp để khe nào cũng co lại, nhưng mỗi lượt chỉ soi khe GỐC của lượt đó
   * nên không dồn dây chuyền (không kéo cả ca vào một phút đầu). */
  for (let luot = 0; luot < 3; luot++) {
    const goc = out.slice();
    for (let i = 1; i < out.length; i++) {
      const kheThat = goc[i] - goc[i - 1];
      if (kheThat > khe && goc[i - 1] < total * den) out[i] = goc[i - 1] + khe;
    }
    out.sort((a, b) => a - b);
  }
  for (let i = 1; i < out.length; i++) if (out[i] - out[i - 1] < MIN_GAP_MS) out[i] = out[i - 1] + MIN_GAP_MS;
  return out.slice(0, cap).map(t => Math.max(0, Math.min(total, Math.round(t))));
}

/* js/assets.js — NGUỒN SỰ THẬT DUY NHẤT về prefix asset (fix 26/09: "ảnh nhân vật vỡ trên link GitHub").
 *
 * GỐC LỖI (đã đo 3 mã HTTP trên host thật): các file hardcode `const A = '../../assets/'`.
 * - Web GitHub Pages: trang ở /lau-hem-tien/game/, prefix `../../` LÊN 2 CẤP → RA NGOÀI site → 404.
 *   (Đo thật: game/../assets/...=200, game/../../assets/...=404)
 * - APK/iOS: trang nằm ở GỐC origin (https://localhost/) → `../` bị kẹp ở / nên `../../` "vô tình" đúng.
 *   → Cùng 1 mã nguồn, APK chạy mà web vỡ ảnh.
 *
 * FIX (đồng bộ 3 nền tảng, prefix TÍNH TỪ TRANG game/index.html):
 *   `../assets/` — lên ĐÚNG 1 cấp:
 *   - Web (Pages): /lau-hem-tien/game/ → /lau-hem-tien/ (repo root, có assets/) ✅
 *   - APK/iOS:    / → `../` kẹp lại / → /assets/ ✅
 *   - Local:      /game/ → / → /assets/ ✅
 */

/** Prefix asset cho <img src> / template string — LUÔN tính từ trang (game/index.html). */
export const A = '../assets/';

/** URL tuyệt đối của 1 asset (Audio, fetch, canvas — nơi không nên phụ thuộc URL trang).
 *  Tính TỪ FILE MODULE NÀY (game/js/assets.js): lên 2 cấp = repo root → assets/ — KHÁC prefix của trang (1 cấp). */
export function absAsset(rel) {
  if (/^(https?:|data:|blob:)/.test(rel)) return rel;
  if (typeof import.meta === 'undefined' || !import.meta.url) return A + rel;
  try { return new URL('../../' + rel, import.meta.url).href; } catch (e) { return A + rel; }
}

/** URL tuyệt đối của trang chính (manifest start_url, og:link — tính từ module, lên 1 cấp = game/). */
export const START_URL = (() => {
  if (typeof import.meta === 'undefined' || !import.meta.url) return './index.html';
  try { return new URL('../index.html', import.meta.url).href; } catch (e) { return './index.html'; }
})();

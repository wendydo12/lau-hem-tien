/* js/assets.js — NGUỒN SỰ THẬT DUY NHẤT về đường dẫn asset (fix 27/09: "nhạc mất tiêu" + "ảnh vỡ link github").
 *
 * NGUYÊN TẮC (chốt sau 2 lần debug): MỌI asset đều tính TỪ TRANG (game/index.html), prefix `../assets/` —
 * prefix này ĐO THẬT đúng trên 3 môi trường (web GitHub Pages / APK Capacitor / iOS PWA):
 *   - Web:   /lau-hem-tien/game/  → ../ = /lau-hem-tien/ (repo root) → /lau-hem-tien/assets/…  ✅ 200
 *   - APK:   trang ở gốc origin / → ../ bị kẹp ở /                 → /assets/…               ✅ (webDir public/assets/)
 *   - iOS:   như APK                                                  → /assets/…               ✅
 *
 * LỖI ĐÃ GẶP (ghi lại để không phạm lại):
 *   1) hardcode `'../../assets/'` trong mỗi file: APK "vô tình" đúng, web vỡ ảnh (404 ra ngoài site).
 *   2) absAsset() dùng `new URL('../../'+rel, import.meta.url)` — tính TỪ FILE MODULE (game/js/),
 *      khác gốc với trang → nhạc BGM/SFX/ambience 404 ("nhạc mất tiêu"). CẤM import.meta.url cho asset.
 *
 * VÌ VẬY: chỉ còn MỘT hằng prefix `A` + `absAsset` cũng trả về cùng URL (tính từ trang).
 * CẤM thêm path asset kiểu khác vào file này. */

/** Prefix asset cho <img src> / template string — LUÔN tính từ trang (game/index.html). */
export const A = '../assets/';

/** URL tuyệt đối của 1 asset (Audio, fetch, canvas). Tính TỪ TRANG — cùng gốc với prefix A,
 *  để nhạc không bị sai thư mục như bug import.meta.url. (Không dùng import.meta.url.) */
export function absAsset(rel) {
  if (/^(https?:|data:|blob:)/.test(rel)) return rel;
  try { return new URL(A + rel, document.baseURI).href; } catch (e) { return A + rel; }
}

/** URL trang chính (manifest start_url). */
export const START_URL = (() => {
  try { return new URL('./index.html', document.baseURI).href; } catch (e) { return './index.html'; }
})();

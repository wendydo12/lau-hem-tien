/* js/safe.js — LÀM SẠCH CHUỖI NGƯỜI CHƠI NHẬP (vá lỗ hổng 08/10/2026)
 *
 * Vì sao có tệp này: rà bảo mật phát hiện tên quán do người chơi nhập được nhét THẲNG vào HTML
 * (`innerHTML`) ở màn chuẩn bị và màn tổng kết. Gõ `<img src=x onerror=...>` làm tên quán là mã
 * độc chạy được trong trang — đúng lỗi A05 Injection (XSS) trong danh sách OWASP.
 *
 * Cách vá: hai lớp.
 *   1. cleanName() — làm sạch NGAY LÚC NHẬP: cắt khoảng trắng thừa, bỏ ký tự điều khiển và
 *      các ký tự < > " ' ` =, chặn độ dài. Đây là lớp chặn chính.
 *   2. esc() — thoát ký tự HTML NGAY LÚC HIỂN THỊ: dù dữ liệu cũ trong bản lưu có dính mã
 *      (người chơi sửa tay localStorage), khi in ra HTML cũng chỉ ra chữ chứ không chạy.
 *
 * Quy tắc nhà: mọi chỗ nối chuỗi người chơi vào HTML đều phải đi qua esc().
 */

/* thoát ký tự HTML — dùng cho MỌI chuỗi người chơi đưa vào innerHTML */
export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/* làm sạch ngay lúc nhập: bỏ ký tự phá HTML, gộp khoảng trắng, chặn độ dài */
export function cleanName(s, max = 24) {
  return String(s == null ? '' : s)
    .replace(/[\u0000-\u001F\u007F]/g, '')      /* ký tự điều khiển */
    .replace(/[<>"'`=&\\]/g, '')                 /* ký tự phá thẻ / phá thuộc tính */
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/* khoá dùng cho localStorage: chỉ cho phép chữ, số, khoảng trắng, gạch, dấu tiếng Việt */
export function cleanKey(s, max = 32) {
  return String(s == null ? '' : s).replace(/[^\p{L}\p{N} _.-]/gu, '').slice(0, max);
}

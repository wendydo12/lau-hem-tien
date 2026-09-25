# Credits log — meowa.ai
Mọi job pixel-gen ghi vào đây. Balance khởi điểm 25/09/2026: 1.215 (đã nạp thêm, trước đó 615).

| Ngày | Job ID | Template | Nội dung | Cost | Balance | Kết quả |
|---|---|---|---|---|---|---|
| 25/09 | job_360b5e07 | xlarge_3_4 | Cảnh quán lẩu hẻm đêm (bg chính, 378x498) | 25 | 1190 | ✅ QA 8/10 — dùng được; nit: glow alpha mượt (sửa bằng dither khi composite), thiếu bếp rời (nồi liền chân — chấp nhận) |
| 25/09 | job_89525c13 | xlarge_4_3 | UI kit sheet (panel/button/banner/bars/coin/gem/star, 516x387) | 25 | 1165 | ⚠️ QA 7/10 — element đủ nhưng VI PHẠM no-text (meowa tự thêm chữ "MY ADVENTURE/ATTACK..."). Xử lý: chỉ crop các phần tử không chữ (frame, coin, gem, sao, progress bar) làm sprite; panel/button thật sẽ render bằng CSS theo token — không regenerate vội |
| 25/09 | job_631402df | food (advanced bg) | 7 nồi lẩu + 1 biến thể hải sản (64x64 x8) | 20 | 1145 | ✅ QA 9/10 — cả 8 sprite phân biệt rõ, không chữ, không lỗi; sprite 8 (lẩu hải sản) giữ làm nồi đặc biệt mở khóa muộn |

Tổng chi batch 1: 70cr. Còn lại: 1.145cr.

## Art direction gốc của dự án (mọi prompt sau phải theo)
"Cozy hi-bit pixel art, uniform 1px dark brown-black sticker outline, warm palette
(cream #f3e5c2, caramel #b8894c, deep brown #5f4523) with teal #74cfbf + violet #9a5fd4
magic-glow accents, flat 2-3 tone shading, crisp pixels no anti-aliasing, NO TEXT."
- Cảnh: thêm "NO PEOPLE, NO TEXT"; chữ trên biển hiệu để trống, sau tự vẽ bằng bitmap font.
- Icon nhỏ: 24px_icon/object_1; nhân vật: 48px characters/pixel_char; đồ tiên giới: thêm "soft teal-violet magical glow".

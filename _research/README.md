# Research — thể loại game quản lý quán (KHÔNG còn mã nguồn tham khảo trong kho)

## Trạng thái hiện tại

Ngày 06/10/2026, toàn bộ tệp mã nguồn của game tham khảo đã được **xoá khỏi kho**:
`original_game.html`, `script_0.js`, `script_1.js`, `script_2.js`, `script_dom_245k.js`.

Lý do: giữ mã nguồn của người khác trong kho vừa là rủi ro pháp lý vừa không cần thiết.
Phần hiểu biết về thể loại đã được ghi lại bằng chữ của chính dự án ở
`co-che-tham-khao.md` (bản tóm tắt tự viết, không chứa mã của ai).

## Bản ghi để đối chiếu (chỉ giữ dấu vết, không giữ nội dung)

| Tệp đã xoá | Kích thước | MD5 (để đối chiếu về sau) |
|---|---|---|
| original_game.html | 420.209 byte | (ghi lúc xoá — xem `vet-xoa.txt`) |
| script_0.js | 1.652 byte | |
| script_1.js | 356.138 byte | |
| script_2.js | 138 byte | |
| script_dom_245k.js | 266.193 byte | |

## Điều dự án cam kết (đã kiểm bằng script so khớp)

- Không còn câu chữ nào của bản tham khảo trong game: mọi chuỗi **≥ 20 ký tự** đều sạch;
  các chuỗi ngắn còn trùng chỉ là **nhãn giao diện chung** (Tạm dừng, Trả lời, Chủ quán…)
  và **họ người Việt** — hai thứ không thể và không cần "viết lại".
- Công thức lõi (lượng khách theo sao, sức hút của giá, hệ số trang bị) đã viết lại thành
  các bước có tên riêng trong `engine/economy.js`.
- Bảng nhận diện ý trong câu review đã viết mới (`Y_REVIEW` trong `engine/reviews.js`).
- Tên biến nội bộ vay mượn đã đổi: `POT_KEYS`, `BASE_PRICE`, `chiSoGia`, `Y_REVIEW`.

## Việc còn lại (cần phu quân quyết)

1. Gửi tin nhắn ghi nhận tới tác giả game tham khảo (bản nháp ở `docs/04-xin-phep-tac-gia.md`).
2. Kiểm giấy phép 2 nguồn ngoài: âm thanh tiengdong.com và ảnh pixel meowa.ai.

## Số đo đối chiếu (chạy 06/10/2026, TRƯỚC khi xoá bản gốc)

| Ngưỡng | Số chuỗi trong game | Trùng bản gốc | Trong đó tiếng Việt |
|---|---|---|---|
| ≥ 20 ký tự | 737 | 5 | **0** |
| ≥ 12 ký tự | 1.158 | 17 | 4 |
| ≥ 8 ký tự | 1.547 | 35 | 8 |

Trước khi dọn: 92 chuỗi ≥ 18 ký tự trùng nguyên văn (tên khách + câu đánh giá),
15 chuỗi ≥ 20 ký tự trùng (câu đánh giá dài).

Sau khi dọn: **0** chuỗi có nghĩa (≥ 20 ký tự) trùng. Còn lại chỉ là nhãn giao diện ngắn
("Tạm dừng", "Trả lời", "Chủ quán"…) và họ người Việt — danh sách đóng, không cần viết lại.

⚠️ Bản gốc đã xoá khỏi máy nên KHÔNG chạy lại được phép đo này. Muốn đo lại về sau thì
tải lại bản gốc từ nguồn cũ (xem `vet-xoa.txt` để đối chiếu MD5).

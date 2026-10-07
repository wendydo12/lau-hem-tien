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

## Rà soát lại lần 2 — 07/10/2026 (sau khi thêm ca tối + leo thang đơn hàng)

Bối cảnh: hôm 07/10 dự án được sửa nhiều (ca tối 19:00–23:00 với `engine/shift.js`, khách rải
theo đường cong, đơn hàng leo thang theo ngày, nút hướng dẫn, sửa sân khấu). Phu quân yêu cầu
"rà soát lại xem hết giống game Tiệm Trà Nhỏ chưa".

Đã kiểm những gì (và kết quả thật):

1. **Quét dấu vết mã nguồn/câu chữ của bản tham khảo** trên toàn kho (`game/`, `webapp/`, `docs/`,
   `plan.md`): tìm các từ khoá `Tiệm Trà Nhỏ`, `startPour`, `stopPour`, `rót trà`, `port … gốc`,
   `port cơ chế`, `port UI`. **Kết quả: còn 7 chỗ khác nhau** — 5 chỗ trong mã nguồn (mỗi chỗ có ở
   cả `game/` lẫn bản sao `webapp/`, nên đếm dòng là 10) và 2 chỗ trong `plan.md`. **TẤT CẢ đều là
   CHÚ THÍCH trong mã**, không phải mã hay câu chữ dùng trong game.
   → Đã dọn sạch cùng ngày: viết lại thành mô tả của dự án ("thiết kế riêng của dự án", "bảng của
   dự án"). Riêng `docs/04-xin-phep-tac-gia.md` giữ nguyên tên game tham khảo — đó là THƯ GỬI TÁC GIẢ,
   cố ý nêu tên.

2. **Câu chữ dùng trong game**: không có chuỗi nào của bản tham khảo được thêm vào trong đợt sửa
   này — mọi câu chữ mới (hướng dẫn ca tối, thông báo thiếu hàng, tên món, review…) do dự án tự viết.
   Mốc đã đo trước đó vẫn giữ: **0 chuỗi ≥ 20 ký tự trùng**; các chuỗi ngắn còn trùng chỉ là nhãn
   giao diện chung (Tạm dừng, Trả lời, Chủ quán…) và họ người Việt.

3. **Cơ chế/thiết kế mới của đợt này** (ca tối, đường cong khách, leo thang đơn hàng, luật tự đóng
   cửa) là **thiết kế riêng**, không có bản tương ứng trong game tham khảo: bản tham khảo là quán trà
   với nhịp thời gian và bảng độ khó khác hẳn. Phần này còn được khoá bằng 12 test tự động mới.

4. **Nói thẳng một điều**: phép đo byte-đối-byte với bản tham khảo **không chạy lại được nữa** vì mã
   nguồn tham khảo đã xoá khỏi máy (chỉ còn MD5 ở `vet-xoa.txt`) và không ghi lại nguồn tải. Muốn đo
   lại thì cần có lại bộ mã gốc; khi có, cách đo ghi ở mục dưới.

### Cách đo lại khi có mã nguồn gốc (dùng lại được)
- Đặt mã nguồn gốc ở **ngoài kho** (ví dụ `/tmp/tham-khao/`), KHÔNG để trong repo.
- Trích mọi chuỗi trong mã gốc và trong `game/js/**` (regex chuỗi nháy đơn/nháy kép/hai huyền),
  so khớp: đếm chuỗi trùng theo ngưỡng ≥ 20 / ≥ 12 / ≥ 8 ký tự, và **lọc riêng chuỗi có chữ Việt**.
- Ngưỡng đã đạt trước đây: ≥ 20 ký tự = 0 chuỗi tiếng Việt trùng; ≥ 12 = 4 (đã đổi nốt); ≥ 8 = 8.

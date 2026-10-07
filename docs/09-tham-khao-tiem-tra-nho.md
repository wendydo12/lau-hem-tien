# Tham khảo game Tiệm Trà Nhỏ — bảng đối chiếu và bản sáng tạo riêng

Ngày 07/10/2026 · người viết: dự án · nguồn: 20 ảnh chụp màn hình + 1 video màn hình + 1 mã QR
(do người đặt hàng gửi trong ~/Downloads). **Cách làm: chỉ nhìn hình người chơi nhìn thấy và đọc chữ trên
màn hình — tuyệt đối không đọc mã nguồn của họ.**

## 1. Game tham khảo có gì (ghi lại để so)

Tên hiển thị: Tiệm Trà Nhỏ (tên quán do người chơi đặt, ví dụ "Tiệm Trà Yuumi", "lynk lynk"),
phiên bản 3.4, pixel art dọc, chơi trên trình duyệt điện thoại.

Vòng lặp: **Lobby → Chuẩn bị (mua nguyên liệu, chỉnh menu, định giá, đọc đánh giá) → Mở cửa ngày N
→ chạy ca bán → Tổng kết → lặp.**

| nhóm | chi tiết họ có |
|---|---|
| Thanh tab chính | Kho · Nâng cấp · Giá bán · Đánh giá · Tổng kết |
| Tab con khi chuẩn bị | Trà (món nền) · Hương (vị) · Topping · Trang bị · Nhân viên · Online |
| Đơn của khách | 5 thông số: loại trà + size M/L + topping + % đường + mức đá; kèm thanh "kiên nhẫn" tụt dần |
| Quy trình pha | lấy ly → chọn trà → topping → đá/đường → siro → máy dập nắp báo "READY" |
| Kho | tồn theo "ly"; mua theo chai 200k (+45 ly); **hạn sử dụng theo ngày**; tồn gộp nhiều lô hạn khác nhau |
| Giá bán | mỗi món hiện **Giá bán · Vốn · Lãi**, người chơi tự sửa giá |
| Nâng cấp | buff định lượng: +20%/+25% khách, khách chờ lâu hơn 25%, phục vụ 4 khách cùng lúc, tip +30%, và **thu nhập thụ động +8k/ngày** |
| Đánh giá | danh sách review có tên khách, ngày, sao, nội dung; chủ quán **phản hồi** từng cái, có nút `Sửa` |
| Sự kiện | popup sự kiện có hậu quả tiền (ví dụ: `"Đầu tư" tiền ảo — lỗ 567k`) kèm **một nút cảm xúc** `Buồn ghê` |
| Tùy biến | **12 màu giao diện** (Kem sữa, Nâu cà phê, Sô cô la, Hồng đào, Cam đào, Trà Thái, Vàng chanh, Xanh matcha, Bạc hà, Xanh biển, Tím khoai môn, Đêm dịu) |
| Tổng kết | tab thống kê theo kỳ, số ly bán, khách bỏ về, đánh giá, dòng món bán chạy |
| Khác | sửa tên quán, lưu nhiều slot, chia sẻ bằng mã QR dẫn tới web app |

**Video (đã đọc xong, 51 giây):** đây không phải một mạch chơi liền mạch mà là video cắt ghép
(montage) của một trang tổng hợp, gồm khoảng 11 clip từ nhiều ván khác nhau (Ngày 02 → Ngày 6 →
Ngày 21 → Ngày 44 → Ngày 45), có chữ quảng cáo phủ lên. Nhưng nhờ vậy dự án thấy được thêm mấy thứ
ảnh tĩnh không có:

- Đơn **nhiều ly trong một lượt** (Ly 1, Ly 2), mỗi ly một yêu cầu riêng, kèm nhắc "Xong ly 1, làm tiếp ly 2".
- **Hướng dẫn theo bước** hiện ngay trong lúc chơi (popup xanh: "Bước 2: nhấn giữ hũ Matcha, thả tay khi trở về vạch xanh").
- Khách có **cấp độ** (ví dụ "Na Lv 32").
- **Thanh điều hướng đáy 5 icon** không nhãn: kho · nâng cấp · menu/giá · đánh giá · thống kê.
- Popup sự kiện bị trộm nguyên văn: `Trộm ghé quán! — Đêm qua trộm cạy két, lấy sạch 1,96 tỷ. Trong két chỉ còn 500k.` + nút `Buồn ghê`.
- Popup sự kiện tốt: `Trả lại ví cho khách — Bạn nhặt được ví khách để quên và trả lại, khách gửi tiền cảm ơn +120k vào két` + nút `Tuyệt quá`.
- Màn tổng kết cuối ngày của họ: doanh thu, chi phí chi tiết (lương nhân viên 200k, tăng ca 40k, tip nhân viên giữ 276,9k, 1 ly hỏng 20,5k), danh sách món bán ra, lãi, số dư két.
- **Lỗ hổng cân bằng của họ:** cho đặt giá vô lý (trong video có món ghi giá 1.000.000k, thậm chí 100.000.000k) rồi tự bán cho mình để kiếm tiền tỷ. Game mình đã có trần giá (`priceCap`) nên không dính lỗi này — mình hơn một bậc ở khoản cân bằng.



## 2. Đối chiếu với Lẩu Hẻm Tiên (đo trong mã ngày 07/10)

| tính năng | họ | mình |
|---|---|---|
| Vòng lặp Chuẩn bị → Mở quán → Tổng kết | có | **đã có** |
| Đặt giá từng món | có | **đã có** (bảng giá theo nồi + chấm/cay/topping/cỡ) |
| Kho + hạn sử dụng | có | **đã có** (kho theo mẻ, `cfg.life`, có mục "Hỏng/hết hạn" trong tổng kết) |
| Nâng cấp buff định lượng | có | **đã có** (trang bị tiền mặt + trang bị linh thạch) |
| Trả lời đánh giá | có, chỉ 1 kiểu | **đã có và sâu hơn: 3 tông giọng, mỗi tông có hệ quả thật** |
| Sự kiện ngẫu nhiên | có, chỉ 1 nút cảm xúc | **đã có** (quà, tai họa, tin đồn) — nhưng chưa có sự kiện TRONG CA |
| Thống kê theo kỳ | có | **đã có** (theo ngày/tuần/tháng) |
| Đổi màu giao diện | có | **thiếu — mà bảng 12 bảng màu đã nằm sẵn trong mã (`THEMES`), chưa nối vào đâu** |
| Hiện Vốn · Lãi từng món | có | **thiếu** (mình chỉ hiện lãi ở bảng tổng kết cuối ngày) |
| Nền kinh tế | quán trà, giá 25k–30k/ly | lẩu hẻm + linh thạch + nợ phòng + thuế + lạm phát giá |
| Chất riêng | đời thường, teencode | **đời thường Sài Gòn + tu tiên (hẻm nhỏ, khách tu tiên, đại năng vi hành)** |

Kết luận: mình **không thua** ở phần lõi; mình thiếu ba thứ nhỏ (đổi màu giao diện, hiện vốn/lãi,
sự kiện trong ca) và mình có thứ họ không có (linh thạch, tầng tu tiên, 3 tông đáp trả).

## 3. Bản sáng tạo riêng (KHÔNG bắt chước — mỗi ý làm khác đi)

**A. Sự kiện trong ca có LỰA CHỌN, không chỉ một nút "buồn ghê".**
Họ thông báo rồi cho bấm một nút cảm xúc. Mình làm khác: mỗi sự kiện đưa ra **2–3 cách xử lý**, người
chơi chọn và chịu hậu quả. Ví dụ khách quỵt tiền: `Đuổi theo` (rủi ro mất thêm, 60% đòi được) ·
`Nhịn cho qua` (mất tiền, +1 uy tín vì "quán hiền") · `Đăng lên bảng tin hẻm` (30% khách tới tò mò,
70% mang tiếng chủ quán khó tính). Không có lựa chọn nào là "đúng chắc" — đúng chất làm ăn.

**B. Đổi màu giao diện bằng chính 12 bảng màu đã có sẵn trong mã.**
Biến `THEMES` (Tử Vân Các, Hồng Hoang, Thanh Trúc, U Minh, Kim Hồ, Bạch Tuyết, Đào Trăng, Đại Lửa,
Mặc Rồng, Vân Lâm, Cẩm Nang, Bình Minh) thành nút đổi màu thật, mở dần theo mốc trong game.

**C. Hiện Vốn · Lãi ngay trên bảng giá ở màn Chuẩn bị.**
Mỗi món một dòng nhỏ: `Vốn 12k · Lãi 8k` — người chơi tính tiền ngay lúc đặt giá, không phải mở
bảng tổng kết. Cảnh báo đỏ khi đặt giá dưới vốn.

**D. Ba tầng khách theo giờ trong ca (chất Sài Gòn).**
19:00–21:00 khách gia đình và dân công sở (gọi nồi lớn, ăn chậm, tip khá) → 21:00–22:30 dân nhậu và
sinh viên (gọi bia-lẩu, ồn, gọi thêm liên tục, cà khịa nhiều hơn) → 22:30–23:00 shipper và khách đêm
(gọi mang về, gấp, kiên nhẫn thấp nhưng tip nóng). Mỗi tầng có ngân hàng câu nói và kiểu đánh giá riêng.

**E. Sổ khách quen lên cấp.** Khách ruột (đã có khái niệm trong câu review) thành hệ thống thật:
`người quen → khách ruột → tri kỷ`. Cấp cao thì nhớ món tủ, chờ lâu không cằn nhằn, thỉnh thoảng
dẫn bạn tới (thêm 1 khách miễn phí trong ca), và khi quán gặp tin xấu thì họ đứng ra nói đỡ.

**F. Bảng tin hẻm.** Mỗi ngày hẻm có một tin: tin tốt (một clip lẩu lên xu hướng) kéo thêm khách,
tin xấu (quán "dùng hàng đông lạnh") đẩy khách đi. Phản bác bằng cách phục vụ tốt 2 ngày liền —
biến uy tín thành thứ chơi được chứ không chỉ là con số.

**G. Cuộc thi "Vua Lẩu Hẻm" mỗi 30 ngày** (trùng nhịp tiền trọ): 5 đơn khó liên tiếp trong một ca,
thắng thì được cúp vàng **treo lên tường trong màn Phòng ở** (nối với mục 06) + thưởng tiền.

**H. Hắc thị + Phòng ở** — đã có thiết kế riêng, xem `docs/06-hac-thi-phong-o.md`
và cẩm nang vẽ `docs/08-noi-that-phong-tro.md`.

## 4. Cách mình giữ mình khác họ

- Chủ đề: lẩu hẻm Sài Gòn + tu tiên (họ là quán trà đời thường). Nguyên liệu, món, khách, câu chữ
  đều khác hệ.
- Mỗi tính năng lấy ý tưởng đều được làm khác đi: sự kiện có lựa chọn (họ chỉ có 1 nút), đáp trả 3 tông
  có hệ quả (họ chỉ sửa câu), thống kê có linh thạch và tầng tu tiên (họ không có).
- Không dùng lại một tệp hình, câu chữ, mã nguồn nào của họ. Những gì chung (bảng giá, kho có hạn
  dùng, vòng lặp ngày) là quy ước chung của cả thể loại game quản lý quán.

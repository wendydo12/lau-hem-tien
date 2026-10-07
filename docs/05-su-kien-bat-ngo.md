# Sự kiện bất ngờ TRONG CA — bản thiết kế (chờ phu quân gật)

Ngày 07/10/2026 · trạng thái: **đề xuất, chưa code** · người viết: Uyển Nhi

## 1. Kiểm tra hiện trạng (đo thật trong mã, 07/10)

**Đã có**
- Sự kiện theo NGÀY (`engine/events.js` → `rollDay`): lễ 30 ngày, cuối tuần, trời nóng,
  mưa, sinh viên, khách review, món lên xu hướng, món giảm giá.
- Quà tặng ngày (10%/ngày), trong đó có "khách ruột trúng số" lì xì 50k–200k.
- Lịch tai họa 90 ngày (`BAD`): két bị cạy (trộm), rắc rối sổ sách, đoàn kiểm tra đột xuất,
  cuộc gọi giả danh, sàn linh thạch ảo sập, thú triều — đều xảy ra **đầu ngày**, trừ tiền một lần.
- Chống gian lận: két > 100 triệu trước ngày 30 → mất sạch (chừa 500k).
- Tiền tip cơ bản: `loop.js` → tip theo độ kiên nhẫn còn lại, ×1.3 nếu có máy đậy nắp.

**Chưa có (đúng thứ phu quân vừa liệt kê)**
- Sự kiện nổ **ngay lúc đang bán**, khách đang ngồi trong quán.
- Khách **quỵt tiền** (ăn xong bỏ đi).
- **Thanh tra vệ sinh** đột xuất tại chỗ (khác với đoàn kiểm tra sổ sách).
- **Vé số** trúng ngay trong ca, **tip nóng** khi phục vụ chuỗi hoàn hảo.
- Hàng xóm phàn nàn, giật túi ngoài hẻm.

## 2. Nguyên tắc cân bằng (để vui chứ không ức chế)

1. **Ngày 1–4 yên ổn tuyệt đối** (chỉ có tin vui); **từ ngày 5–6 mới bắt đầu có sự kiện xui**
   (lệnh phu quân 07/10/2026). Ngày thứ 5: mở màn bằng đúng 1 sự kiện xui nhẹ cho người chơi
   biết "đời không như mơ", rồi từ ngày 6 trở đi mới chạy theo tỉ lệ dưới đây.
2. Mỗi ca tối đa **1 sự kiện xấu**, tối đa 1 sự kiện tốt. Tổng tỉ lệ có sự kiện: ~28%/ca.
3. Sự kiện xấu **không bao giờ lấy quá 12% tiền đang có** (trừ khi có đồ chống thì ít hơn).
4. Mỗi sự kiện chỉ thông báo **một lần** (bong bóng 1,2 giây + icon), không dội toast.
5. Cuối ca có mục "Chuyện trong ca" liệt kê lại — người chơi đọc một lần là hiểu.

## 3. Tám sự kiện (bảng thi công)

| id | tên | khi nào | tỉ lệ | hệ quả | đồ chống |
|---|---|---|---|---|---|
| `quyt` | Khách quỵt | khách rời quán, chưa trả | 4%/khách, tối đa 1/ca | mất đúng tiền nồi đó | Hộ pháp quán → bắt lại 75% |
| `trom_vat` | Trộm vặt | giữa ca, quán ≥3 khách | 5%/ca | mất 1–4% tiền (tối đa 80k) | Hộ pháp quán → 0 |
| `ve_sinh` | Thanh tra vệ sinh | giữa ca, từ ngày 6 | 6%/ca | phạt 100k–400k; **sạch thì thoát** | dọn bàn + ít hao hụt thì miễn |
| `ve_so` | Khách trúng vé số | khách hài lòng rời đi | 3%/ca | +50k–300k lì xì | — (tin vui) |
| `tip_nong` | Tip nóng | 5 khách liên tiếp 5 sao | 1 lần/ca | +80k–200k + 1 uy tín | máy đậy nắp → +30% |
| `ong_dia` | Ông địa ghé | sau 22:00, quán vắng | 4%/ca | có tủ thờ: +1 uy tín, hôm sau đông hơn; không có: quên hết | Tủ thờ ông địa (hắc thị) |
| `hang_xom` | Hàng xóm phàn nàn | sau 22:20, còn khách | 5%/ca | phạt 50k–150k | Mái che + hơi nước (đã có) → giảm nửa |
| `giat_tui` | Giật túi ngoài hẻm | đóng cửa, tiền mặt > 3 triệu | 3%/ca | mất 3–6% tiền mặt | gửi két sớm / Hộ pháp |

**Thanh tra vệ sinh** là sự kiện đáng giá nhất vì nó biến "hao hụt" thành thứ người chơi
phải để tâm: điểm sạch = 100 − (hao hụt% ×2) − (số bàn chưa dọn ×8). ≥80 điểm → khen,
không phạt; 50–79 → nhắc nhở; <50 → phạt.

## 4. Cách hiện

- Bong bóng trên đầu nhân vật + icon (💸 🧹 🍀 🛵), 1,2 giây, kèm 1 dòng chữ ngắn.
- Bảng "Chuyện trong ca" ở màn tổng kết, mỗi dòng một sự kiện kèm số tiền.
- Ghi vào `S.cur.surprise = []` để lưu vào lịch sử ngày và thống kê "chuyện đã gặp".

## 5. Kiểm thử dự kiến (thêm vào `game/tests/`)

- `sukien.test.js`: ngày 1–5 không sinh sự kiện xấu; tối đa 1 xấu + 1 tốt mỗi ca;
  sự kiện xấu không lấy quá 12% tiền; `quyt` có Hộ pháp thu hồi 75%; `ve_sinh` sạch thì miễn.
- Chạy 400 ca giả lập, in bảng tần suất thật để so với bảng trên (không đoán bằng mắt).

## 6. Luật giọng kể (bài học 07/10 — phu quân bắt được lỗi)

Game là SẢN PHẨM CHO NHIỀU NGƯỜI CHƠI, không phải sổ riêng của ai. Câu chữ trong game chỉ được
dùng giọng của quán: người kể xưng **"mình"** (chủ quán), gọi người chơi là **"bạn"** khi cần.
TUYỆT ĐỐI không dùng cách xưng hô riêng của trợ lý (thiếp / phu quân / sư huynh / tên riêng của
trợ lý) trong câu chữ hiển thị — kể cả trong thoại khách tu tiên.

Hàng rào tự động: `game/tests/giong.test.js` quét toàn bộ `game/js/**` và `index.html`, bỏ ghi chú
trong mã rồi soi phần chuỗi còn lại. Ai (kể cả trợ lý) viết lọt giọng là bộ kiểm thử đỏ ngay.

## 7. Câu chữ

Toàn bộ lời thoại, tên sự kiện, câu bong bóng do dự án tự viết (đậm chất hẻm Sài Gòn,
có bà bán rau, chú shipper, sinh viên trọ, khách tu tiên). Không dùng lại câu của bản tham khảo.

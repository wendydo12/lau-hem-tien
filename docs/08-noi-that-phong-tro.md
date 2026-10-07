# Nội thất phòng trọ — cẩm nang tạo asset 2 bộ style (Hẻm Việt · Động Tiên)

Ngày 07/10/2026 · dùng cho màn "Phòng ở" (xem `docs/06-hac-thi-phong-o.md`) · người viết: dự án

## 1. Nguồn tham khảo người đặt hàng gửi (đã đọc, 4 ảnh)

Bốn ảnh là mô hình tiểu cảnh (diorama) góc phòng kiểu Việt Nam thập niên 80–2000, phối cảnh
isometric 3/4, đồ gỗ nâu đỏ, nhiều đồ lặt vặt. Rút ra được một bộ "chất Việt" rất rõ — dự án ghi
lại thành bảng dưới đây để lúc vẽ không bị lạc sang kiểu Nhật/Hàn/Trung.

## 2. Bảng "chất Việt" — nét nhận diện và cách thể hiện ở sprite 32×32

| nét nhận diện | vì sao giữ | cách thể hiện ở 32×32 |
|---|---|---|
| Tường hai màu: vàng mù tạt + xanh ngọc | kiểu sơn nhà/phòng trọ cũ, nhìn là biết ngay | 2 mảng màu phẳng, chia bằng 1 đường dọc 1px, thêm dải sáng trên + tối sát sàn |
| Rèm vải hoa đỏ buộc thắt giữa | gần như chữ ký của nội thất Việt | 2 vạt dọc, nền đỏ, rải 4–6 điểm hoa kem 1px, eo thắt ở giữa |
| Tủ / kệ gỗ nhiều ô không đều | bộ bàn thờ – tủ ly "kiểu ông bà" | lưới 3–4 ô ngang × 2 tầng, mỗi ô 1–2 điểm màu làm đồ trong kệ |
| TV CRT có ăng-ten râu chữ V | dấu hiệu thời bao cấp – đổi mới | hộp đen, màn hình xanh nhạt 1 điểm sáng, 2 gạch chéo 1px làm ăng-ten |
| Đài cassette / ampli đỏ cam | món "pop" duy nhất về màu | hộp cam đỏ, mặt kem, 2–3 nút đen, 1 khe băng ngang |
| Máy khâu đen trên bàn gỗ | biểu tượng máy khâu gia đình | silhouette đầu máy + bánh đà, gần như đen tuyền, 1 điểm kim loại sáng |
| Ghế bành gỗ lưng chấn song | ghế phòng khách mini | 3–4 khe nan dọc 1px xen sáng/tối + tay vịn + đệm 1 khối |
| Sàn gạch bông hoa văn lặp | sàn nhà Việt | tile 4×4 lặp, hoạ tiết đối xứng tâm 2×2, 3 màu |
| Bằng khen / giấy khen treo tường | chi tiết rất Việt, hay bị bỏ sót | nền kem, viền đỏ vàng, 2–3 gạch ngang gợi dòng chữ, 1 chấm đỏ làm huy hiệu |
| Lốc lịch + ảnh thờ + ảnh cưới | cụm ảnh treo tường | 2×3 khung nâu/trắng xếp cột dọc, dùng như hoạ tiết tường |
| Tranh sơn mài đỏ son | trang trí nội thất đặc sản | khung dọc, nền đỏ son, 2–3 vệt vàng/xanh gợi hoa lá |
| Chiếu cói + mâm nhôm + ấm tích chén trà | đồ dùng bình dân | chiếu: khối vàng nhạt có 3 gạch dọc; mâm: hình tròn viền sáng; ấm tích: bầu + nắp + 2 chén 2px |
| Phích nước nóng | món không thể thiếu | trụ đứng 2 màu, 1 tay xách 1px |
| Quạt cây cũ | mùa nóng Sài Gòn | cánh quạt 3 lá gợi bằng 3 nan, lồng tròn, chân chữ thập |
| Ổ cắm + dây điện chạy chân tường | rẻ mà tăng chất Việt cực mạnh | 1–2 đường 1px xám sát chân tường + 1 ô vuông trắng viền đen |
| Dép nhựa trước cửa, can nhựa, xô chậu | đời thường | 2 cục nhỏ cạnh mép sàn, màu nhựa tươi |

## 3. Bảng màu chính (rút từ 4 ảnh, đã hạ độ tươi cho hợp pixel art)

- Tường vàng mù tạt: sáng `#E8C87A` · vừa `#E3B23C` · tối `#C79A2E`
- Tường xanh ngọc: vừa `#42AEB0` · tối `#2E8487`
- Gỗ nâu đậm (tủ, ghế, kệ): sáng `#8A5F35` · vừa `#6B4525` · tối `#452C15`
- Gỗ nâu vừa (kệ, bàn): `#9A6B3E` · sàn gỗ `#C49A6C`
- Đỏ son / đỏ vải: `#C62828` · sáng `#E05A46` · tối `#8E241E`
- Cam đỏ (đài, TV đỏ): `#D4581F`
- Kem giấy / khung: `#F5EEDC` · mặt đồng hồ `#F2EBD8`
- Xanh đệm ghế: `#6E8C52` · xanh lá cây cảnh `#3C7A46`
- Đen máy khâu / vỏ TV: `#1B1B1B` · kim loại sáng `#C0C0C0`
- Sàn gạch bông: kem `#EADFC4`, hoạ tiết nâu `#8C6A47`, viền `#C9B48C`
- Outline gỗ: `#3A2412` — dùng cho mọi sprite gỗ, 1px.

## 4. Quy tắc vẽ (áp cho cả hai bộ)

1. Một nguồn sáng duy nhất: trên – trái – trước. Mọi sprite cùng hướng sáng.
2. Isometric 2:1, không phối cảnh, không gradient (pixel art cần khối màu dứt khoát).
3. Bảng màu giới hạn 12–16 màu cho toàn bộ phòng; mỗi vật liệu có đúng 3 tông sáng/vừa/tối.
4. Mỗi sprite 32×32 chỉ giữ **một** đặc điểm nhận dạng (rèm thì giữ dây thắt, TV thì giữ ăng-ten…).
5. Nền trong suốt; bóng đổ là 1–2 pixel tối dưới chân, không vẽ bóng đổ mờ.

## 5. Bộ A — Hẻm Việt: 14 món (đã chỉnh theo ảnh tham khảo)

| món | giá | hiệu ứng trong game |
|---|---|---|
| Tủ thờ ông địa (kèm lư hương) | 1.200.000 | mở sự kiện ông địa ghé thăm |
| Rèm hoa đỏ | 250.000 | +2 uy tín, quán "có hồn" hơn |
| TV CRT ăng-ten râu | 700.000 | khách trẻ ngồi lâu hơn, +1 review/ngày |
| Đài cassette đỏ | 450.000 | khách nghe nhạc chờ, kiên nhẫn +8% |
| Máy khâu đen + bàn gỗ | 600.000 | hàng xóm quý: giảm nửa tiền phạt hàng xóm phàn nàn |
| Ghế bành gỗ chấn song | 500.000 | khách ngồi đợi lâu hơn 12% |
| Bàn trà thấp + chiếu cói | 400.000 | khách đợi có chỗ ngồi tử tế, khó ở bớt cằn nhằn |
| Lốc lịch + cụm khung ảnh | 200.000 | +1 uy tín |
| Bằng khen "Người tốt việc tốt" | 150.000 | thanh tra vệ sinh dễ bỏ qua lỗi nhỏ |
| Tranh sơn mài đỏ son | 350.000 | khách tu tiên thấy "có gu", +5% khách tu tiên |
| Phích nước + ấm tích chén trà | 180.000 | khách chờ được rót nước: kiên nhẫn +6% |
| Quạt cây cũ | 450.000 | ngày nóng bớt phạt, khách vui hơn |
| Ổ cắm + dây điện chân tường | 120.000 | rẻ, +1 uy tín (đời thường chân thật) |
| Xe Wave tàu | 900.000 | đi chợ nhanh: giá nhập nguyên liệu −5% |

## 6. Bộ B — Động Tiên: 12 món (giữ như bản trước)

Bồ đoàn, lư hương đồng, kiếm trận bảy thanh, đèn lưu ly, gương đồng, bàn cờ vây đá,
bình tụ linh khí, thác nước mini, tranh cuộn sơn thuỷ, ngọc bội trấn trạch, đèn cá chép,
cờ phướn "LẨU" linh khí. Bảng màu riêng: tím `#6A3FA0`, ngọc `#2B7D63`, lưu ly `#74CFBF`,
vàng linh `#E0C060`, gỗ mun `#2A2418`.

## 7. Ánh xạ mẫu vẽ meowa (đã đọc từ API, 07/10)

| loại món | template nên dùng | ghi chú |
|---|---|---|
| Đồ vật thấp (đài, phích, mâm, ấm, dép) | `object_2` (64px) hoặc `object` (64px) | xuất 64 rồi hạ về 32 bằng nearest — nét sạch hơn vẽ thẳng 32 |
| Đồ cao (tủ thờ, rèm, khung ảnh, kệ, quạt cây) | `32x64_object` | giữ tỉ lệ cao, không bị bẹp |
| Icon hắc thị, icon phòng ở | `24px_icon` | icon 24px đọc rõ ở thanh nút |
| Nồi lẩu, chén, đồ ăn | `food` (64px) | món ăn đã có sẵn bộ, chỉ dùng khi cần thêm |
| Đồ tu tiên (kiếm trận, bồ đoàn, cờ phướn) | `wuxia_character_5x5` (32px) | mẫu gốc thiên về nhân vật võ hiệp, dùng cho đồ vật cần chất kiếm hiệp |
| Chậu kiểng, lu nước, cây | `盆栽` hoặc `植物` (64px) | mẫu chậu cây có sẵn, hợp cả hai bộ |

Prompt mẫu (tiếng Anh ngắn, meowa hiểu tốt):
`"single object, old Vietnamese CRT television with V-shaped rabbit-ear antenna, red-brown plastic
case, 1px dark outline, isometric 2:1 view, flat colors, no gradient, transparent background, no people"`

Ba lưu ý rút từ kinh nghiệm cũ: (1) luôn ghi rõ "no people" nếu không meowa chèn bóng người;
(2) nền meowa hay dính màu phẳng — tách bằng flood-fill từ viền ảnh; (3) QA bằng đếm pixel, đừng tin mắt.

## 8. Ghi chú bản quyền

Bốn ảnh tham khảo là sản phẩm của một trang bán tiểu cảnh Việt Nam. Dự án **không** dùng lại
hình ảnh, mô hình, hay tệp nào của họ. Thứ dự án lấy là **đặc trưng văn hoá của đồ vật đời thường
Việt Nam** (rèm hoa, tủ gỗ nhiều ô, TV ăng-ten râu, phích nước…) — đó là kiến thức chung, không
ai độc quyền. Toàn bộ sprite sẽ do dự án tự gọi meowa vẽ theo cẩm nang này.

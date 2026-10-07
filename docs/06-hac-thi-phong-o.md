# Hắc thị + Phòng ở (2 bộ style: Hẻm Việt · Động Tiên) — bản thiết kế (chờ phu quân gật)

Ngày 07/10/2026 · trạng thái: **đề xuất, chưa code, chưa tiêu credit nào** · người viết: Uyển Nhi

## 1. Vì sao có màn này

Cốt truyện đã có **nợ phòng trọ 2 triệu, hạn 7 ngày** (`cfg.storyDebt`). Vậy chỗ ở của chủ quán
là thứ có thật trong truyện mà chưa bao giờ nhìn thấy. Màn "Phòng ở" mở ra đúng chỗ đó:
khi tiền dư nhiều, chủ quán sửa sang chỗ ở — và **hắc thị** là nơi bán đồ (tiền mặt hoặc linh thạch).

Hai bộ style đối lập nhau, người chơi tự chọn hướng:
- **Bộ A — Hẻm Việt**: đời thường Sài Gòn (nồi gang, ghế nhựa đỏ, tủ thờ ông địa, xe Wave cũ…).
- **Bộ B — Động Tiên**: tu tiên (bồ đoàn, lư hương, kiếm trận, đèn lưu ly, gương đồng…).

## 2. Mở khoá

- Hắc thị chỉ hiện khi: **ngày ≥ 10** và **tiền ≥ 5.000.000** (hoặc có ≥ 20 linh thạch).
- Lần đầu mở: một tin nhắn lạ trong máy ("chỗ này bán đồ không có hoá đơn…") — 1 lần duy nhất, không lặp.
- Vào từ màn Chuẩn bị: nút **🏮 Hắc thị** (góc dưới), cạnh nút Hướng dẫn.

## 3. Bộ A — Hẻm Việt (12 món, giá tính bằng tiền mặt)

| món | giá | hiệu ứng thật |
|---|---|---|
| Tủ thờ ông địa | 1.200.000 | mở sự kiện `ong_dia` (may mắn đêm khuya) |
| Nồi gang cũ | 400.000 | canh lửa dễ hơn: vạch chuẩn rộng +5% |
| Ghế nhựa đỏ | 300.000 | khách ngồi đợi lâu hơn 10% |
| Bàn nhựa + khăn bàn | 500.000 | điểm vệ sinh +8 (đỡ bị phạt) |
| Quạt cây cũ | 450.000 | khách khó ở bớt cằn nhằn |
| Xe Wave tàu | 900.000 | đi chợ nhanh: giá nhập nguyên liệu −5% |
| Dây phơi + kệ chén | 250.000 | hao hụt giảm 5% |
| Đèn bàn thờ | 200.000 | mở ông địa sớm hơn (từ ngày 8) |
| Lồng chim chào mào | 350.000 | +2 uy tín |
| Chậu kiểng + lu nước | 300.000 | bàn chờ mát: khách kiên nhẫn +8% |
| Lò than tổ ong | 600.000 | nấu nhanh hơn 8% |
| Tivi cũ có ăng-ten | 700.000 | khách trẻ ngồi lâu hơn, +1 review/ngày |

## 4. Bộ B — Động Tiên (12 món, giá tính bằng linh thạch)

| món | giá (LS) | hiệu ứng thật |
|---|---|---|
| Bồ đoàn cũ | 15 | chủ quán đỡ mệt: tay bưng nhanh hơn 8% |
| Lư hương đồng | 20 | khách tu tiên +8% |
| Kiếm trận bảy thanh | 60 | khách tu tiên không dám gây sự (bỏ sự kiện quỵt) |
| Đèn lưu ly | 25 | quán sáng hơn: khách đêm +5% |
| Gương đồng soi đạo tâm | 35 | đạo tâm khách tu tiên +10% |
| Bàn cờ vây đá | 30 | khách tu tiên ngồi lâu hơn 15% |
| Bình tụ linh khí | 70 | linh thạch kiếm được +10% |
| Thác nước mini | 45 | điện nước +5k/ngày, đổi lại bớt hao hụt 8% |
| Tranh cuộn sơn thuỷ | 20 | +3 uy tín |
| Ngọc bội trấn trạch | 55 | chống trộm/quỵt 30% |
| Đèn cá chép | 30 | khách quay clip: 3% viral/ca |
| Cờ phướn "LẨU" linh khí | 80 | khách tu tiên tìm tới +15% |

Giá quy đổi tạm: 1 linh thạch = 50.000 VNĐ (theo `cfg.ls.rate`), tỷ giá dao động mỗi ngày.

## 5. Luật thẩm mỹ (điểm style) — chỗ này mới là phần vui

- Mỗi món thuộc một bộ. Điểm style = số món của bộ đó / tổng số món đã mua.
- **≥ 60% Hẻm Việt** → khách đời thường +10%, ông địa ghé nhiều hơn.
- **≥ 60% Động Tiên** → khách tu tiên +15%, linh khí +5%.
- Trộn đều (mỗi bộ ~50%) → không buff gì nhưng **+5 uy tín** vì "quán có gu".
- Không trừ tiền vì thẩm mỹ — chỉ thưởng. Không phạt người chơi vì gu của họ.

## 6. Màn "Phòng ở"

- Lưới 12×8 ô, 32×32 pixel, phối cảnh nghiêng 3/4 giống sân khấu bán hàng hiện tại.
- Kéo thả đồ từ kho vào ô; chạm 2 lần để cất lại (trả lại 50% giá).
- Trần nhà, cửa sổ, ổ gà, vũng nước… là nền tĩnh; đồ mua được xếp lên trên.
- Mở từ nút **🛏 Phòng ở** ở màn Chuẩn bị; có nút xem nhanh trong bảng tổng kết.

## 7. Asset cần vẽ (dự kiến 31 tệp pixel)

- 24 sprite đồ vật 32×32 (12 món mỗi bộ, tên tệp `a-tu-tho.png`, `b-bo-doan.png`…).
- 1 nền phòng tĩnh 384×256 (`room-base.png`) + 1 lớp tường trên cùng.
- 1 icon hắc thị 24×24 (`ico-hac-thi.png`), 1 icon phòng ở 24×24.
- 2 ảnh bìa cho thư mời / bảng giới thiệu hắc thị (16:9 nhỏ).
- Bảng màu: dùng lại bảng của game (gỗ nâu, đỏ hẻm, khói xanh) + bộ tu tiên (tím, ngọc).

## 8. Cách làm asset (meowa.ai — đã kiểm tra hôm nay)

- Tài khoản meowa: **885 credit** (chưa tiêu credit nào cho việc này). Một job thường 25 credit
  → ngân sách hiện tại đủ ~35 job. Mọi job ghi vào `credits-log/credits.md` như lệ cũ.
- Mẫu vẽ có sẵn để chọn (đọc từ API `template-info`):
  `object_2` (64px) và `object` (64px) cho đồ vật; `32x64_object` cho đồ cao (tủ thờ, dây phơi);
  `24px_icon` cho icon; `food` (64px) cho nồi lẩu; `wuxia_character_5x5` (32px) cho đồ tu tiên;
  `盆栽`/`植物` cho chậu kiểng, lu nước.
- Quy trình mỗi tệp: brief 6 dòng → gửi job → chờ ~3 phút → tải sprite → **QA bằng numpy + mắt**
  (đếm pixel, kiểm nền trong suốt, kiểm bóng đổ) → sửa bằng PIL nếu cần → commit.
- Nhớ luật đã ghi trong skill: đồ vật nhỏ **QA bằng đếm pixel**, không tin mắt mô hình;
  nền meowa hay dính màu phẳng → tách bằng flood-fill từ viền ảnh.

## 9. Tiền trọ 2 triệu MỖI THÁNG (lệnh phu quân 07/10/2026)

Hiện tại game chỉ có **một món nợ phòng duy nhất 2 triệu, hạn ngày 7** (`cfg.storyDebt`) — trả xong là hết.
Phu quân chốt: tiền trọ là **chi phí cố định 2.000.000 mỗi tháng**, trả đều đặn suốt game.

- Chu kỳ 30 ngày. Mốc thu: **ngày 7** (món đầu, theo cốt truyện), rồi **ngày 37, 67, 97…**
  (tức cứ 30 ngày một lần, không phải ngày 30-60-90 để không đè lên mốc lễ và mốc lên cấp).
- Nhắc trước 5 ngày bằng băng-rôn trên màn Chuẩn bị (đã có sẵn băng-rôn nợ phòng, chỉ đổi nội dung).
- Trả sớm được, trả xong băng-rôn chuyển sang màu xanh "Đã trả tiền phòng tháng này".
- Quá hạn 3 ngày: phạt thêm 10% (200k) và chủ nhà gọi điện nhắc.
- Quá hạn 7 ngày: **không** game over (game over vẫn chỉ do thâm hụt tiền theo `ruinDeep`);
  thay vào đó chủ nhà khoá cửa sau: mất chỗ nghỉ → chủ quán mệt, bưng chậm 10% cho tới khi trả xong.
  Nhẹ nhàng nhưng dai, buộc phải để dành tiền — đúng chất "làm ăn".
- Ghi vào sổ ngày: `S.cur.roomRent`, hiện trong bảng tổng kết cạnh "Tiền nhà + điện nước".
- Giữ nguyên `cfg.rent` 40.000/ngày (tiền mặt bằng cái xe lẩu ngoài hẻm) — hai khoản khác nhau:
  **mặt bằng ngoài hẻm** (hằng ngày) và **phòng trọ của mình** (hằng tháng). Đây cũng là lý do
  màn "Phòng ở" ở mục 6 có nghĩa: nhà mình thì mình sửa.

## 10. Việc còn chờ phu quân

1. Gật hướng thiết kế này (nhất là: 12+12 món, luật style 60%, giá).
2. Hai ảnh chàng gửi hôm nay **đã bị macOS xoá** (thư mục tạm của công cụ chụp hình tự dọn) —
   thiếp không đọc được. Chàng lưu lại vào Desktop rồi cho thiếp đường dẫn nhé.
3. "spirit gen" chàng nói là công cụ nào — phải ý chàng là mục **Sprite packs** trên meowa,
   hay một trang khác? Thiếp chưa rõ nên chưa dám tiêu credit.

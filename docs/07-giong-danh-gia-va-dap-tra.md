# Giọng đánh giá khách + màn đáp trả — bản thiết kế (chờ phu quân gật)

Ngày 07/10/2026 · trạng thái: **đề xuất, chưa code** · người viết: Uyển Nhi

## 1. Kiểm tra hiện trạng (đếm thật trong mã, 07/10)

**Đã có — và đã chạy trong game**
- Máy ghép review khớp sự thật (`engine/reviews.js`): câu khách viết phải khớp chuyện đã xảy ra
  (kêu chờ thì phải có chờ thật, kêu đắt thì phải có bị chê đắt…), có chống lặp câu.
- Kho chữ hiện tại: **45 câu ngắn** (khen 30, khen kiểu tiên hiệp 9, chê kiểu tiên hiệp 6),
  **14 nhóm ghép 2 vế** (537 cách ghép), **10 nhóm ghép nhiều vế** (749 cách ghép),
  24 đuôi emoji, 6 câu cho đại năng vi hành.
- **Màn đáp trả đã có**: 3 tông giọng — Dịu dàng 🌸 / Hài hước 😄 / Cà khịa 🔥 — mỗi tông có
  kho câu riêng chia 3 ngăn (khen / góp ý / chê), và hệ quả thật: Dịu dàng có thể kéo khách
  từ 1–2 sao lên; Hài hước 10% thành clip viral (+50k–150k); Cà khịa 18% viral nhưng 30%
  phản tác dụng, riêng cà khịa khách tu tiên thì **luôn** toang. Ô tự viết tay cũng đã có.

**Chưa có (đúng chỗ phu quân muốn đậm hơn)**
- **Giọng theo tầng khách**: hiện mọi khách nói cùng một giọng. Chưa có chuyện sinh viên trọ
  nói khác shipper, dân văn phòng nói khác bà bán rau.
- **Giọng genZ** đúng chất (mlem, đỉnh nóc, hết nước chấm, chấm 1 sao, "tus", "flex"…).
- Kho câu còn mỏng: 45 câu ngắn là hết sau vài chục ngày chơi là thấy trùng.

## 2. Đề xuất A — sáu tầng giọng khách

Mỗi tầng có kho câu riêng + cách xưng hô riêng. Khách nào thuộc tầng nào do loại khách quyết định.

| tầng | ai | giọng | xưng hô |
|---|---|---|---|
| `sinhvien` | sinh viên trọ, ở ghép | lầy, tự trào, khen rẻ là chính | mình / tui — gọi quán là "quán" |
| `shipper` | chạy xe công nghệ | gấp, ngắn, quan tâm thời gian chờ | em / anh chị |
| `vanphong` | dân công sở tan làm | lịch sự, kỹ tính, hay so sánh | mình / quán |
| `hangxom` | bà bán rau, cô tạp hoá | thẳng, nói giá, nhắc chuyện hẻm | cô/chú / con |
| `genz` | khách trẻ đi ăn đêm | câu cụt, từ lóng, icon nhiều | tui / quán |
| `tutien` | khách tu tiên (đã có) | cổ phong, ít icon | bổn tọa / tiên hữu |

## 3. Đề xuất B — mở rộng kho câu (con số cụ thể)

| kho | hiện | đề xuất | ghi chú |
|---|---|---|---|
| Câu ngắn chung | 30 | **90** | chia đều 5 tầng, mỗi tầng ≥ 15 câu |
| Nhóm ghép 2 vế | 2 vế/nhóm | **6 vế/nhóm** | 14 nhóm × 6 × 6 = 504 cách ghép/nhóm |
| Nhóm ghép nhiều vế | 3 vế/nhóm | **5 vế/nhóm** | câu dài, kể chuyện |
| Đuôi emoji | 24 | **40** | thêm đuôi genZ (💀😭🔥🧋) |
| Câu tu tiên | 15 | **40** | giữ giọng cổ phong |

Ước lượng độ phong phú sau khi thêm: **hơn 12.000 câu khác nhau** cho một ca — người chơi
chơi 200 ngày vẫn chưa thấy trùng.

## 4. Đề xuất C — màn đáp trả: 3 tông → 5 lựa chọn

| tông | hệ quả (giữ cân bằng cũ) |
|---|---|
| 🌸 Dịu dàng | an toàn; 40% kéo khách 1–2 sao nguôi giận (+1 sao) |
| 😄 Hài hước | 10% viral +50k–150k; khách khó ở vẫn vui |
| 🔥 Cà khịa | 18% viral +100k–300k; 30% phản tác dụng; khách tu tiên → luôn toang |
| 🤝 **Chốt đơn** *(mới)* | biến khách chê thành khách quay lại: +1 khách cho ca sau, +1 uy tín, không rủi ro — nhưng không bao giờ viral |
| 😐 **Bơ luôn** *(mới)* | không phản hồi: không rủi ro, không lợi; 35% khách tự nguôi, phần còn lại rơi 1 sao chậm |

Thêm 2 lựa chọn này vì hiện tại người chơi chỉ có "an toàn / vui / mạo hiểm" — thiếu
hướng "làm ăn" và hướng "nhịn". Có 5 lựa chọn thì màn đáp trả thành chỗ chơi thật sự.

## 5. Nguyên tắc chữ nghĩa

- 100% tự viết; không lấy câu nào của bản tham khảo (đã rà soát hai lần hôm 06–07/10).
- Giọng genZ nhưng không lố, không xúc phạm, không chửi tục; vẫn giữ "hữu tình".
- Mỗi câu phải qua được bộ kiểm `reviewFits` — không được khen chê sai sự thật của ca.

## 6. Kiểm thử dự kiến (thêm vào `game/tests/`)

- `giong.test.js`: mỗi tầng khách có ≥ 15 câu; câu của tầng này không trùng tầng khác;
  genZ không chứa từ cấm; 1000 lần ghép không lặp câu (so bằng khoá đã chuẩn hoá).
- `daptra.test.js`: 5 tông, mỗi tông trả về hệ quả đúng bảng trên; "Bơ luôn" không bao giờ viral.

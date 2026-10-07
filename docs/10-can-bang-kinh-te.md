# Cân bằng kinh tế — số đo và cách chỉnh (08/10/2026)

Người viết: dự án · công cụ đo: `tools/mo-phong-kinh-te.mjs` (không phải mã game, chỉ để đo)

## 1. Vì sao phải cân lại

Chủ dự án chơi thử và thấy tiền về quá nhanh. Đo bằng công cụ mô phỏng (chạy 20 ngày bằng chính
engine, người chơi phục vụ hết khách):

| chỉ số | TRƯỚC khi cân | SAU khi cân |
|---|---|---|
| lãi ngày 1 | 178.500đ | 59.000đ |
| lãi ngày 20 | 2.890.000đ | ~1.600.000đ |
| tiền trong két ngày 12 | 11.900.000đ | ~4.900.000đ |
| tiền trong két ngày 20 | 26.900.000đ | ~8.000.000đ |
| tiền trong két ngày 45 | (không đo) | 14.400.000đ |
| lãi trung bình/ngày | 1.610.000đ | ~1.350.000đ (ngày 45: ~2.000.000đ) |

Điểm quan trọng không phải con số cuối cùng, mà là **tiền dư có chỗ tiêu**: nâng cấp giờ đắt gấp đôi
và có hai món cao cấp 12 triệu / 40 triệu làm đích dài hạn, nên người chơi luôn đang dành dụm cho
một thứ gì đó thay vì thấy két đầy mà không biết làm gì.

## 2. Bốn tay vặn (nằm gọn trong `cfg.balance`)

| tay vặn | giá trị | ý nghĩa |
|---|---|---|
| `costMul` | 1,60 | giá nhập nguyên liệu ×1,6 → biên lợi nhuận từ ~4,4× còn ~2,7× (gần với quán thật) |
| `rentGrowthPerDay` | 0,0167 | tiền nhà + điện nước lớn dần theo ngày: ×1,5 sau 30 ngày |
| `maintenanceOf` | 0,012 | mỗi ngày trừ 1,2% tổng giá trị trang bị đang có = phí bảo trì |
| `guestCapMul` + `guestSoftBase/PerDay` | 12 · 13 · 0,45 | trần khách/ngày, có TRẦN MỀM: 13 khách + 0,45/ngày (ngày 30 ≈ 26, ngày 60 ≈ 40) — quán hẻm không đông vô hạn |

Thêm hai thứ chỉnh riêng:
- `utilPerUpg`: 8.000 → 20.000 — mỗi món trang bị tốn thêm điện nước.
- `utilPerGuest`: 1.500 — điện nước/nấu nướng tính theo **khách thật đã phục vụ** (chi phí tự lớn
  lên khi quán đông, không cần chỉnh tay theo ngày).

## 3. Thuế (đã có ý nghĩa)

- Ngưỡng miễn thuế năm: 1 tỷ → **120 triệu** (`taxThreshold`).
- Mức cơ bản: VAT 4% + TNCN 2% = **6%** doanh thu (trước 4,5%).
- **Luỹ tiến**: vượt gấp ba ngưỡng (360 triệu/năm) thì mức thuế ×1,6 → **9,6%**.
- Tác dụng: khoảng ngày 35–40 thuế bắt đầu ăn vào lãi, quán càng lớn đóng càng nhiều.

## 4. Nâng cấp = đích tiêu tiền

| món | giá cũ | giá mới |
|---|---|---|
| Bảng neon "LẨU" | 400k | 800k |
| Ghế nhựa + quạt máy | 500k | 1.000k |
| Quay clip đăng mạng | 600k | 1.200k |
| Cơi nới vỉa hè | 800k | 1.600k |
| Mái che + hơi nước | 900k | 1.800k |
| Máy đậy nắp tự chế | 3.000k | 6.000k |
| **Nồi gang Nhật** (mới) | — | 12.000k (+15% khách) |
| **Chi nhánh hẻm bên** (mới) | — | 40.000k (+30% khách, kèm chi phí tăng) |

## 5. Tiền phòng trọ: món mở màn rồi thành chu kỳ 30 ngày

- Món đầu 2 triệu hạn ngày 7 (cốt truyện), sau khi trả thì **mỗi 30 ngày trả 2 triệu** một lần.
- **Gia hạn 7 ngày**: quá hạn chưa mất phòng, chỉ phạt thêm 200k và chủ nhà nhắc; hết 7 ngày ân hạn
  mới mất phòng. Nhờ vậy người chơi mới không bị đá khỏi game vì lỡ một tuần đầu, mà vẫn có sức ép.
- Hạn kỳ sau = ngày trả kỳ trước + 30 ngày (tự động).

## 5b. Nhịp khách: "khách vào liên tục" (yêu cầu chủ dự án 08/10/2026)

Yêu cầu: *"cho khách tần suất vào liên tục"*. Trước đây khách rải theo đường cong với khe ~15-20 giây
(khách thưa, quán vắng ở giữa ca).

Cách làm — **không đổi tổng số khách, chỉ đổi nhịp**:
- Lịch nền (`engine/shift.js`): khe tối đa ở phần đầu ca co từ ~20 giây xuống **KHE_NEN_MS = 18 giây**
  (nén 3 lượt, không kéo dây chuyền), cuối ca vẫn vãn dần.
- Cách mời (`main.js`): khách chỉ ghé khi **còn chỗ ngồi trống**, và được **đẩy nhanh tối đa
  `balance.moiNhanhNhat = 3` lần** so với nhịp nền (không dưới `MIN_GAP_MS = 2,5 giây`). Chủ quán
  phục vụ kịp → khách vào sớm nhất mỗi **KHE_LIEN_TUC_MS = 6 giây**; phục vụ chậm → khách vẫn tới
  theo nhịp nền rồi ngồi chờ như thường.

Đo bằng `tools/do-nhip-khach.mjs` (mô phỏng đúng vòng lặp mời khách, không đụng DOM):

| tình huống | khách tới | khe trung bình | khe xa nhất |
|---|---|---|---|
| trần 12 khách · phục vụ 20s/chỗ | 12/12 | 6,4s | 10,8s |
| trần 20 khách · phục vụ 20s/chỗ | 20/20 | 6,5s | 15,0s |
| trần 26 khách · phục vụ 20s/chỗ | 26/26 | 6,6s | 15,3s |
| trần 20 khách · phục vụ 35s/chỗ (chậm) | 18/20 | 10,7s | 30,0s |

Kinh tế KHÔNG đổi: tổng khách vẫn đúng trần hôm nay, nên chạy lại hai lệnh đo ở mục 6 ra đúng bảng số
cũ (lãi ngày 1 = 59.000đ; chơi lơ đễnh ngày 30: lãi 442.242đ, khách bỏ về 50,6%).

## 5c. Nồi + muỗng + chén: MIỄN PHÍ (yêu cầu chủ dự án 08/10/2026)

Câu chốt của chủ dự án: *"nồi muỗng chén thì ko tính tiền"*. Đây là ĐỒ DÙNG của quán, không phải
nguyên liệu mua về → `ITEMS.sup.cost = 0`; màn chuẩn bị ghi **"miễn phí"** thay vì "0đ/phần"; nút ＋
không bao giờ mờ vì món này (ví sạch tiền vẫn thêm được). Số lượng vẫn tốn kho và vẫn bị `take()`
khi nấu, nên nhịp phục vụ không đổi.

Số đo trước/sau (cùng hai lệnh ở mục 6):

| chỉ số | TRƯỚC (nồi chén 4.000đ/phần) | SAU (miễn phí) |
|---|---|---|
| lãi ngày 1 | 59.000đ | **107.000đ** (bớt ~48.000đ tiền nồi chén mỗi tối) |
| lãi ngày 20 | 2.234.562đ | 1.431.462đ* |
| lãi ngày 45 | 2.460.738đ | 2.480.122đ |

*Dòng ngày 20 chênh không phải vì bỏ phí, mà vì mô phỏng rất nhạy: đổi một khoản chi là đổi luôn
đường tiền → đổi thời điểm mua nâng cấp. Xu hướng đúng cần nhìn là **ngày đầu nhẹ hơn hẳn**, các
ngày sau tương đương.

## 6. Đo lại thế nào

```
node tools/mo-phong-kinh-te.mjs 45          # chơi giỏi: phục vụ hết khách
EFF=0.75 node tools/mo-phong-kinh-te.mjs 30  # chơi lơ đễnh: bỏ sót 25% khách
```
Bảng in ra: ngày · khách · phục vụ · bỏ về · doanh thu · chi phí · lãi · tiền còn · sao.
Mọi thay đổi cân bằng sau này PHẢI chạy lại hai lệnh trên và ghi bảng trước/sau vào tệp này.

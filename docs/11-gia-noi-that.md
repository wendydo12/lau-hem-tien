# Định giá & cân bằng nội thất phòng ở — 32 món (08/10/2026)

Lệnh của chủ dự án (07/10): *"mấy cái nội thất nàng nhớ định giá luôn vs phải balance nha"*.

## 1. Vì sao phải làm lại bảng giá

Bảng giá cũ nằm rải trong `docs/06` và `docs/08`, và có ba chỗ sai:

1. **Không khớp kho ảnh.** Bảng chỉ phủ 14 món bộ A, trong khi kho có **16** tệp `hv_*`;
   bộ B cũng 16 tệp `tt_*` mà bảng mới có 6 món.
2. **Có món không còn sprite.** Bảng cũ có "Xe Wave tàu", "Tủ thờ ông địa", "Bàn cờ vây đá",
   "Ngọc bội trấn trạch"… — những tên đó **không có tệp ảnh nào** trong `assets/do-vat/`.
3. **Không có neo giá trị**, nên không ai biết một món đắt hay rẻ là đúng.

Nay bảng giá nằm **trong mã** (`ROOM` ở `game/js/engine/data.js`), là nguồn sự thật duy nhất;
kho ảnh, trang kho ảnh, và hàng rào kiểm thử đều đọc từ đó.

## 2. Bốn luật định giá

**Luật 1 — neo theo nâng cấp đã có.** Nâng cấp trong game đã có giá tham chiếu:
bảng neon 800.000đ cho +20% khách = **40.000đ cho 1%**; ghế nhựa 1.000.000đ cho +25% kiên nhẫn = **40.000đ cho 1%**.
Nội thất neo ở **45.000đ cho 1%** — nhích hơn nâng cấp một chút, vì hiệu ứng nội thất bị chặn trần
(không cộng vô hạn) và mua một lần là dùng mãi.

**Luật 2 — món mở nội dung đắt hơn món cho %.** Bàn thờ ông địa (1,2 triệu) không cho phần trăm nào,
nhưng mở ra sự kiện ông địa ghé thăm — thứ không mua được bằng hiệu ứng số. Tương tự: giá kiếm bảy thanh
(chống quỵt), rương khoá đồng (mất trộm còn một nửa), bằng khen (thanh tra bỏ qua lỗi nhỏ).

**Luật 3 — hai bộ dùng hai loại tiền khác nhau.** Bộ Hẻm Việt trả **tiền mặt** (đời thường, mua sớm được);
bộ Động Tiên trả **linh thạch** (xa hoa, để dành cuối game). Tỷ giá nội bộ của game là 50.000đ / 1 linh thạch
(`cfg.ls.rate`), nên hai bảng quy đổi được về cùng một thước.

**Luật 4 — cộng dồn giảm dần và có trần.** Ba việc này ở `game/js/engine/room.js`:
- **Chỉ bộ đang bày có hiệu lực.** Mua cả hai bộ thì bộ kia nằm trong kho — nhờ vậy hai bộ không nhân lên.
- **Cùng một trục thì món thứ n chỉ còn `0.8^(n-1)`.** Món thứ 7 còn 26% giá trị → khuyến khích trải đều,
  không dồn hết vào một trục.
- **Trần theo bộ**, đặt sao cho mua đủ bộ thì vừa chạm trần, không hơn.

## 3. Bảng giá bộ A — HẺM VIỆT (16 món, tiền mặt, tổng 4.200.000đ)

Xếp từ rẻ tới đắt. Cột "hiệu ứng" là **hiệu ứng thật trong game** (số cộng dồn giảm dần, xem mục 5).

| món | giá | hiệu ứng |
|---|---|---|
| Đôi dép nhựa trước cửa | 80.000 | uy tín +1 |
| Tủ gỗ nhiều ô | 120.000 | kiên nhẫn +3%, uy tín +1 |
| Ổ cắm + dây điện chân tường | 120.000 | mở dùng đồ điện trong phòng |
| Phích nước nóng | 120.000 | kiên nhẫn +3% |
| Chậu kiểng | 130.000 | khách +3% |
| Tranh sơn mài đỏ son | 150.000 | khách tu tiên +5% |
| Bằng khen "Người tốt việc tốt" | 150.000 | thanh tra vệ sinh bỏ qua lỗi nhỏ |
| Chiếu cói | 160.000 | kiên nhẫn +4% |
| Ấm tích + chén trà | 160.000 | kiên nhẫn +4% |
| Lốc lịch + cụm khung ảnh | 200.000 | uy tín +1 |
| Quạt cây cũ | 200.000 | kiên nhẫn +5% |
| Đài cassette đỏ | 240.000 | kiên nhẫn +6% |
| Rèm hoa đỏ | 250.000 | uy tín +2 |
| TV CRT ăng-ten râu | 320.000 | kiên nhẫn +8% |
| Máy khâu đen + bàn gỗ | 600.000 | tiền phạt hàng xóm còn một nửa |
| Bàn thờ ông địa + lư hương | 1.200.000 | mở sự kiện ông địa ghé thăm |

Mua đủ bộ được: **kiên nhẫn +20%** (chạm trần), **khách +3%**, **khách tu tiên +5%**, **uy tín +4**, hai lối mở.

## 4. Bảng giá bộ B — ĐỘNG TIÊN (16 món, linh thạch, tổng 124 LS ≈ 6,2 triệu)

| món | giá | hiệu ứng |
|---|---|---|
| Đế gỗ kê nồi | 4 LS | vạch canh lửa +5% |
| Thảm cỏ đan | 4 LS | kiên nhẫn +3% |
| Đèn lồng đỏ | 4 LS | khách +3% |
| Bình phong gỗ | 5 LS | khách tu tiên +3%, uy tín +2 |
| Kệ gỗ nhiều tầng | 5 LS | kiên nhẫn +4% |
| Tranh trúc sơn thuỷ | 5 LS | khách tu tiên +4% |
| Bình lam gốm | 6 LS | uy tín +2 |
| Ghế gỗ chấn song | 6 LS | kiên nhẫn +5% |
| Bàn trà đá | 6 LS | kiên nhẫn +5% |
| Ấn thư gỗ mun | 6 LS | khách tu tiên +5% |
| Đèn lưu ly | 6 LS | khách đêm +5% |
| Bồ đoàn cũ | 8 LS | bưng bê nhanh hơn 8% |
| Lư hương đồng | 9 LS | khách tu tiên +7% |
| Gương đồng soi đạo tâm | 12 LS | đạo tâm khách tu tiên +10% |
| Rương gỗ khoá đồng | 14 LS | mất trộm còn một nửa |
| Giá kiếm bảy thanh | 24 LS | khách tu tiên không dám quỵt |

Mua đủ bộ được: **khách tu tiên +15%** (chạm trần), **kiên nhẫn +13,1%**, **khách +3%**,
**đạo tâm +10%**, **bưng bê +8%**, **canh lửa +5%**, hai lối mở.

So sánh nhanh: 124 LS là **khoảng 4 đêm** khách tu tiên trả tiền mặt (lượng linh thạch vào khoảng 30/đêm
ở giai đoạn giữa game), và **rẻ hơn gói nâng cấp tiên gia** (5 món = 350 LS). Nội thất là tầng mua trước, nâng cấp là tầng mua sau.

## 5. Hiệu ứng cộng lại thành gì

`engine/room.js` gom hiệu ứng của bộ đang bày. Ví dụ trục kiên nhẫn của bộ A:
các món cho kiên nhẫn là 8%, 6%, 5%, 4%, 4%, 3%, 3% → cộng giảm dần `0.8^(n-1)`:

```
8 + 6×0.8 + 5×0.64 + 4×0.512 + 4×0.41 + 3×0.328 + 3×0.262 = 20,6% → cắt trần còn 20%
```

Trần từng trục: bộ A `kiên nhẫn 20 · khách 6 · khách tu tiên 8 · uy tín 6`;
bộ B `kiên nhẫn 15 · khách tu tiên 15 · khách 3 · khách đêm 5 · đạo tâm 10 · uy tín 4 · canh lửa 5 · bưng bê 8`.

## 6. Số đo cân bằng (đo thật, không đoán)

Công cụ: `tools/mo-phong-kinh-te.mjs` chạy chính engine của game. Thêm cờ `FURN=1` (và `FURN_STYLE=`)
để áp hiệu ứng bộ đang bày, `SEED=` để chạy nhiều ván. Lệnh: `bash tools/do-noi-that.sh`.

Cách đo — nói rõ hai giả định, vì mô phỏng chỉ mô hình được hai trục:

- kiên nhẫn +X% → số khách bị bỏ sót giảm đúng X% của phần đang mất: `EFF = EFF0 + (1 − EFF0) × X%`;
- khách tới +Y% → trần khách mỗi ca nhân `(1 + Y%)`.

Giá trị còn lại của bộ B (khách tu tiên trả ×2–×3 bằng linh thạch, đạo tâm, chống quỵt, chống trộm)
**chưa** mô hình hoá, nên con số của bộ B là **cận dưới**.

Kết quả (45 ngày, người chơi EFF = 0,9, trung bình 3 hạt giống):

| | lãi trung bình/ngày | so với không nội thất |
|---|---|---|
| không nội thất | 1.276.459đ | — |
| bày đủ bộ Hẻm Việt | 1.284.086đ | +0,6% |
| bày đủ bộ Động Tiên | 1.376.142đ | +7,8% |

Chênh lệch giữa các hạt giống là ±20%, nên kết luận đúng là: **mua đủ nội thất làm dòng tiền đổi
không quá ~10%** — tức là nội thất không phá cân bằng, cũng không phải đường tắt làm giàu.
Đổi lại nó cho thứ khác: tỉ lệ khách bỏ về tụt (đo một ván: 19,0% → 13,3% khi bày đủ bộ A),
cộng hai lối mở nội dung và chất riêng của quán.

**Thời gian hoàn vốn:** bộ A tốn 4.200.000đ, lãi tăng ~80.000đ/ngày ở giai đoạn này → hoàn vốn khoảng
50 ngày. Đắt hơn nâng cấp (quảng cáo 1,2 triệu hoàn vốn trong vài ngày) — **cố ý**: nội thất là đồ chơi
và chất riêng của quán, không phải cỗ máy in tiền. Ai muốn tối ưu tiền thì mua nâng cấp trước;
ai muốn quán "có hồn" thì sửa sang nhà.

## 7. Hàng rào kiểm thử

`game/tests/room.test.js` (11 phép kiểm) chặn đúng những lỗi vừa xảy ra:

1. mỗi bộ đúng 16 món, món nào cũng có giá;
2. danh mục giá khớp **1:1** với kho ảnh trong manifest (không còn món có giá mà không có hình, hoặc ngược lại);
3. bộ A trả tiền mặt, bộ B trả linh thạch, không lẫn;
4. giá từng món trong dải hợp lý (A: 80k–1,5 triệu; B: 4–30 LS);
5. tổng bộ trong ngân sách (A: 3,5–5,5 triệu; B: 100–160 LS);
6. **neo giá trị**: mỗi 1% hiệu ứng phải tốn 30k–120k, so với nâng cấp 40k/1%;
7. mua đủ bộ thì chạm trần, không vượt;
8. mua lẻ từng món không bao giờ vượt trần của cả bộ;
9. hai bộ không cộng dồn;
10. món mở nội dung là cờ thật;
11. công thức giảm dần đúng `0.8^(n-1)`.

## 8. Còn chờ chủ dự án gật

Phần **giá và luật cân bằng** đã xong và đã vào mã. Phần **màn "Phòng ở" + hắc thị** (nơi người chơi
thật sự tiêu số tiền này) vẫn là bản thiết kế ở `docs/06`, chưa code — vì đó là tính năng lớn, phải
chủ dự án gật mới làm.

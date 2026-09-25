# summarize.md — nhật ký phase (cập nhật sau mỗi phase)

## Phase 0 — Plan ✅ (25/09/2026)
- plan.md đầy đủ: concept, ánh xạ cơ chế, kiến trúc, asset plan meowa, 8 phase + blockgate.
- docs/ skeleton: 01-tong-quan, 02-ky-thuat.
- git init + commit fc72e2e; gitnexus analyze: 30 nodes | 26 edges.

## Phase 1 — Backend engine ✅ (25/09/2026)
Task table:
| # | Task | Trạng thái | Blockgate |
|---|---|---|---|
| 1 | config.js — CFG cân bằng kinh tế lẩu | ✅ | import OK trong test |
| 2 | data.js — ITEMS 7 nồi + 21 topping + 4 xtop + 5 dip; UPG 6+5; STAFF 4; EVS 9; GIFTS 10; BAD 6; STARS 8; PERSONA/XPERSONA; TXT/PARTS/LONG review; 12 THEME | ✅ | test #1-3 pass |
| 3 | rng.js — mulberry32 seed được | ✅ | test deterministic pass |
| 4 | state.js — fresh/load/save/pack/autoBak 3 bản/sanitize chống gian lận | ✅ | test round-trip + sanitize pass |
| 5 | stock.js — kho theo mẻ có hạn dùng, expire cuối ngày | ✅ | test kho/hạn dùng pass |
| 6 | economy.js — price/unitCost/traffic/rating/vay 10 ngày/cầm đồ LS spread/tỷ giá drift ±8%/sổ nợ nhánh/cheatHit/thuế 4.5% | ✅ | 9 test kinh tế pass |
| 7 | orders.js — levelOf ngày 6/30/60, genOrder, matches, wrongKinds, maxPat 55s, stars, pickBrat | ✅ | 8 test pass |
| 8 | reviews.js — máy ghép review khớp sự thật (reviewFits), pool tu tiên riêng, cap 2500 | ✅ | 4 test pass |
| 9 | events.js — rollDay (lễ 30/cuối tuần 7/mood 2 ngày per 60/quà 10%), mkBadPlan, badCheck ≤1/3 két, takeGift, rollLSRate | ✅ | 4 test pass |
| 10 | loop.js — initRuntime, pourResult 3 nhánh (weak/perfect/spill) + lò địa hỏa nới vạch, spawn (thường/tiên/đại năng), serve (VNĐ/LS/brat mac-bung + hộ pháp), timeout, closeDay (thuê+điện+lương+vay+thuế), startDay | ✅ | 7 test tích hợp pass |
| 11 | tests — 46 test node:test | ✅ | **46/46 PASS, 353ms** |

### QUYẾT ĐỊNH BẢN QUYỀN (lệnh phu quân 25/09)
- **Pixel art: 100% sinh mới bằng meowa.ai theo art direction riêng — KHÔNG dùng asset game gốc, KHÔNG sao chép sprite của artist khác.**
- **Nội dung chữ: viết lại 100% nguyên bản** (đã rewrite toàn bộ TXT/PARTS/LONG/PERSONA/tên khách/GIFTS/BAD/UPG/STAFF mô tả bằng giọng riêng của dự án — file data.js có header tuyên bố bản quyền).
- Cơ chế/vòng lặp/con số cân bằng: tham khảo thể loại (không được bảo hộ biểu đạt).
- Source gốc trong _research/ CHỈ để đọc tham khảo, đã gitignore script, không ship.

### Phase 2 cần lưu ý (Meowa batch 1)
- Check credit TRƯỚC khi submit (615 khởi điểm; batch 1 dự kiến ~75-125cr).
- Template: xlarge_4_3 cho cảnh quán + UI kit (25cr/job); 24px_icon/object cho icon nồi.
- Prompt chuẩn theo skill meowa-pixel-gen: style prefix riêng của dự án (xem docs/02-ky-thuat.md design tokens) + "NO PEOPLE" cho cảnh + lặp lại nếu cần.
- Art direction GỐC của dự án (không phải copy Chef RPG — chỉ lấy NGUYÊN TẮC ấm áp): khung gỗ nâu đậm viền 2px #5f4523, panel kem #f3e5c2, nameplate hổ phách, linh quang cyan/tím cho yếu tố tu tiên, nền hẻm đêm tương phản ấm-lạnh.
- Vision QA + pixel-scan numpy cho vật nhỏ; cap 3 vòng fix mỗi defect; meowa hay sai chữ trên biển → wipe+repaint.
- Ghi credits-log MỌI job.
- Sau batch: git commit + gitnexus analyze + cập nhật file này + DỪNG chờ duyệt.

## Phase 2+3 — Meowa assets ✅ (25/09, gộp báo cáo)
- 17 job / 350cr, còn 865cr. Chi tiết + QA từng job: credits-log/credits.md.
- Kho: 1 cảnh nền, 8 nồi lẩu, 8 khách Việt, 16 khách tu tiên (64px ĐỒNG BỘ scale khách thường — lệnh phu quân), 41 icon topping/chấm, 16 props, UI kit sheet.
- 3 vòng sửa theo lệnh phu quân: cá điêu hồng 3 lát, bỏ trùng (bún/kim châm bó/linh chi), thực đơn extra bí mật 8 món type 'secret' (test xác nhận khách thường không bao giờ gọi), gộp 1 menu topping, khách tiên 64px.
- Gallery: assets/gallery.html (mở bằng `open`).

## Phase 4 — Frontend serve loop ✅ (25/09)
| # | Task | Blockgate |
|---|---|---|
| 1 | manifest.js map sprite↔key engine | ✅ hết ảnh vỡ (QA broken=0) |
| 2 | index.html + main.css design token (VT323, palette gỗ-kem-linh quang, [hidden] fix) | ✅ font Việt render đúng |
| 3 | main.js: splash/prep/sell/summary router, HUD, modal, toast | ✅ chơi được全流程 trên browser |
| 4 | Prep rút gọn: nhập hàng −/+ trả tiền trước, chặn mở quán khi thiếu lẩu/nồi chén | ✅ tiền trừ đúng 400k, nút disable đúng |
| 5 | Sell: khách spawn theo giờ cao điểm, bubble đơn, thanh kiên nhẫn tụt, timeout bỏ về 1 sao | ✅ playtest 2 ngày, khách vào/đi/bỏ về đúng |
| 6 | Minigame canh lửa 3 nhánh: perfect (nồi chín)/weak (non lửa mất nguyên liệu)/spill (khét) | ✅ test thật cả 3 nhánh trên browser |
| 7 | Serve đúng (+tiền +tip +review 5★) / sai (đổ nồi, đạo tâm −30%) | ✅ +35k/+55k đúng giá, sai món phạt đúng |
| 8 | Tổng kết ngày: doanh thu/típ/nhập/nhà+điện/lãi/két, sang ngày mới | ✅ kế toán khớp: 210−400−60=−250, két 150k |
| 9 | QA visual: khách đứng TRƯỚC quầy, bubble không tràn, nút hành động luôn thấy, 8/10 | ✅ screenshot QA pass |

### Bugs phát hiện qua playtest (không thấy được nếu chỉ đọc code) + đã sửa:
1. `recSale` double-count topping → viết lại ghi doanh thu THEO TỪNG MÓN + đối soát tiền thực nhận (khách trả giá/bùng).
2. genOrder để khách bỏ về khi hết topping → luật mới: ngày 1-5 đơn trơn, lv2+ topping phải còn hàng (giống gốc).
3. Modal `[hidden]` không ẩn vì CSS display:flex → `[hidden]{display:none !important}`.
4. Sprite path thiếu tiền tố assets/ → helper `spriteOf()` + hằng `A`.
5. servePot chọn sai khách → ưu tiên khách CÓ ĐƠN KHỚP nồi đang bưng.
6. Bubble đơn hàng thiếu "chấm X" → orderText hiển thị đủ base/size/cay/chấm/topping.

### Phase 5 cần lưu ý (Prep đầy đủ)
- 5 tab: Kho (xem mẻ + hạn dùng + đổ bỏ), Nâng cấp (6 trang bị VNĐ + 5 trang bị LINH THẠCH — chưa mua được tới Phase 6), Giá bán (sửa giá + cảnh báo đắt theo ngưỡng cfg), Đánh giá (danh sách review + ô trả lời như game gốc), Tổng kết (lịch sử ngày/tuần).
- Đặt tên quán (modal input), đổi 12 theme (CSS vars có sẵn trong data THEMES).
- Tiền hiển thị fmtD (tiền giấy VN: 400.000đ) — lệnh phu quân 25/09. Linh thạch quy đổi do engine quyết định (1💎≈50k, drift ±8%/ngày).
- Engine đã có đủ hàm cho Phase 5: recRev/recCost, LOANS/takeLoan, rollLSRate, addDebt/resolveDebts, UPG/STAFF.
- NHỚ: browser cache module JS rất dai — test thay đổi engine phải reload hard + đổi query string.

## Tech facts
- Node 22.23.2, `node --test game/tests/*.test.js` (47/47 pass).
- Server dev: `python3 -m http.server 8793` từ gốc repo (đang chạy background proc_585c573f99fe).
- Game URL: http://localhost:8793/game/index.html — localStorage key lhTienSave.
- Asset path từ game/: `../../assets/` (hằng A trong main.js).
- gitnexus: chạy sau mỗi commit.

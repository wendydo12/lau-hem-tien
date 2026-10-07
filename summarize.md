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

### QUYẾT ĐỊNH BẢN QUYỀN (yêu cầu thiết kế 25/09)
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
- Kho: 1 cảnh nền, 8 nồi lẩu, 8 khách Việt, 16 khách tu tiên (64px ĐỒNG BỘ scale khách thường — yêu cầu thiết kế), 41 icon topping/chấm, 16 props, UI kit sheet.
- 3 vòng sửa theo yêu cầu thiết kế: cá điêu hồng 3 lát, bỏ trùng (bún/kim châm bó/linh chi), thực đơn extra bí mật 8 món type 'secret' (test xác nhận khách thường không bao giờ gọi), gộp 1 menu topping, khách tiên 64px.
- Gallery: assets/gallery.html (mở bằng `open`).

## Phase 4 — Frontend serve loop ✅ (25/09)
| # | Task | Blockgate |
|---|---|---|
| 1 | manifest.js map sprite↔key engine | ✅ hết ảnh vỡ (QA broken=0) |
| 2 | index.html + main.css design token (VT323, palette gỗ-kem-linh quang, [hidden] fix) | ✅ font Việt render đúng |
| 3 | main.js: splash/prep/sell/summary router, HUD, modal, toast | ✅ chơi được toàn bộ vòng lặp trên browser |
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

### Phase 4b — fix theo yêu cầu thiết kế + ÂM THANH ✅ (25/09, commit 6ab85e6)
1. Tên-sprite-giọng KHỚP giới tính/tuổi: WHO_SPR=[6,2,3,4,5,1,7] map cố định, manifest.vn đổi thành OBJECT theo số file, PERSONA viết lại 7 giọng đúng vai (chị/em nữ sinh/anh VP/bà cụ/bé trai/ông chú/shipper). vn_00 = chủ quán, không spawn làm khách.
2. Khách đứng CÙNG mặt đất (bottom 3% cố định, hết lơ lửng).
3. Hướng dẫn tự hiện lần đầu chơi (lhTienGuide flag).
4. Đơn lẩu ngày 1+ luôn có đồ nhúng nếu còn hàng (hết hàng → đơn trơn; KHÔNG BAO GIỜ sinh món hết hàng).
5. Bubble = "menu request" có icon từng món (nồi + topping + chấm + 🌶).
6. New game đúng nghĩa: chưa save → nút "🍲 Mở quán" (ẩn Quán mới); có save → "Chơi tiếp (Ngày N)" + Quán mới. ?reset=1 xóa sạch localStorage trước khi load. BẪY: tên SAVE_KEY thật ≠ 'lhTienSave' (bị mask) — reset phải dùng localStorage.clear().
7. AUDIO (game/js/audio.js): 100% Web Audio tự tổng hợp — không file, không copy asset âm thanh game nào. 20 SFX + vòng sôi lăn tăn khi giữ lửa + ambience hẻm đêm (dế) + nút 🔊 trên HUD. Bảng ánh xạ khoảnh khắc→âm trong file.
8. BẪY CACHE (quan trọng): Safari/Chrome cache ES module RẤT dai — main.js + mọi engine import giờ đều kèm ?v=N (v=10). Sửa engine xong phải tăng N ở TẤT CẢ import + script tag. Test engine thay đổi: node --test trước, browser sau.

### Phase 5 cần lưu ý (Prep đầy đủ)
- 5 tab: Kho (xem mẻ + hạn dùng + đổ bỏ), Nâng cấp (6 trang bị VNĐ + 5 trang bị LINH THẠCH — chưa mua được tới Phase 6), Giá bán (sửa giá + cảnh báo đắt theo ngưỡng cfg), Đánh giá (danh sách review + ô trả lời như game gốc), Tổng kết (lịch sử ngày/tuần).
- Đặt tên quán (modal input), đổi 12 theme (CSS vars có sẵn trong data THEMES).
- Tiền hiển thị fmtD (tiền giấy VN: 400.000đ) — yêu cầu thiết kế 25/09. Linh thạch quy đổi do engine quyết định (1💎≈50k, drift ±8%/ngày).
- Engine đã có đủ hàm cho Phase 5: recRev/recCost, LOANS/takeLoan, rollLSRate, addDebt/resolveDebts, UPG/STAFF.
- NHỚ: browser cache module JS rất dai — test thay đổi engine phải reload hard + đổi query string.

## Tech facts
- Node 22.23.2, `node --test game/tests/*.test.js` (47/47 pass).
- Server dev: `python3 -m http.server 8793` từ gốc repo (đang chạy background proc_585c573f99fe).
- Game URL: http://localhost:8793/game/index.html — localStorage key lhTienSave.
- Asset path từ game/: `../../assets/` (hằng A trong main.js).
- gitnexus: chạy sau mỗi commit.

## Phase 4c (25/09) — INTRO MOVIE + cốt truyện nợ + difficulty ramp + composite nồi lẩu

### 1. Pixel movie intro (kiểu Stardew Valley — yêu cầu thiết kế)
Cốt truyện: Minh 26 tuổi, nhân viên văn phòng → bị sếp mắng → stress đêm mưa → nghỉ việc
(còn đúng 500k) → phòng trọ nợ 2 triệu hạn 7 ngày → đẩy xe lẩu đêm → mở quán LẨU HẺM TIÊN.
- 6 cảnh: 14 job meowa xlarge_3_4 (350cr, balance 865→515). Meowa trả cutout thiếu nền
  → composite PIL (assets/intro/compose.py): nền pixel tự vẽ (văn phòng ngày/đêm mưa, phố VN,
  hẻm đèn lồng) + grade màu cutout theo ánh sáng + bóng tiếp xúc dính chân + Ken Burns.
- BUG tự phát hiện: grade() nhân tint 0-255 không chia 255 → tràn uint8 → nhiễu cầu vồng.
  QA bộ final: 8.5/10.
- game/js/intro.js: trình chiếu DOM, phụ đề tiếng Việt timeline, skip/chạm/phím,
  nhớ đã xem (localStorage), chạy khi mở quán mới / quán mới / game over làm lại.
- Âm thanh THẬT theo cảnh (tiengdong.com): bàn phím VP, mưa+sấm, xe máy, đếm tiền,
  bếp+phố (playIntroSfx trong audio.js, decode OK cả 5 file).

### 2. Kinh tế cốt truyện
- startMoney 400k → **500k** (đúng lời thoại "trong túi còn 500 nghìn").
- Nợ phòng trọ **2.000.000đ hạn ngày 7**: banner ở màn prep (đỏ nhấp nháy khi ≤2 ngày),
  nút "Trả ngay"; sáng ngày 8 chưa trả → **game over cốt truyện** (mất phòng, bán xe) → làm lại.
- Engine: cfg.storyDebt + S.debtRoom + roomDebt/payRoomDebt/roomDebtOverdue (loop.js).
- Debug hook ?testday=8&testmoney=300000 để test không phải chơi 7 ngày.

### 3. Difficulty ramp (yêu cầu thiết kế: tăng topping từ từ + balance kiên nhẫn)
- maxTops(day) dùng CHUNG engine+UI: ngày 1-2:1 → 3-5:2 → 6-12:2 → 13-29:3 → 30-45:3
  → 46-59:4 → 60+:5. Phân phối đơn lệch dần về trần.
- maxPat mới: +18%/món nhúng, món lâu chín (tôm/mực/nghêu/cá/dê/dược/secret) +20%/món
  → đơn phức tạp khách chờ lâu hơn, không bỏ về oan.

### 4. Composite nồi lẩu (yêu cầu thiết kế: "bỏ topping nào lẩu hiện đúng topping đó kiểu trà sữa")
- renderPotVisual: thả icon topping vào elip miệng nồi, xếp vòng theo mặt nước,
  animation dropIn (rơi-tõm nảy), món secret phát sáng tím, nồi L topping to hơn.
- QA screenshot: cải cúc nằm gọn lòng nồi. Không tốn credit meowa.

### 5. BUG NẶNG phát hiện + sửa: literal '***' trong source
- SAVE_KEY/OWNER_KEY (state.js) và KEY intro bị bộ lọc che-secret ghi đè thành '***'
  khi chép qua tool → save game và intro flag DÙNG CHUNG 1 key, ghi đè nhau.
- Fix: nối chuỗi ['lhTien','Save'].join('') — grep toàn repo sạch.

### Khác
- Slogan splash mới: "Hẻm nhỏ, vị tiên — hương vị lẩu ăn quên lối về."
- Test: 47 → **51/51 pass** (ramp 3 test + nợ phòng 1 test). Cache-bust v=15.

## Phase 5a — 25/09 tối (commit cfd43d0, v=16)

### Tính năng ĐẶC BIỆT (không có ở game gốc)
1. **Creator nhân vật** (trước intro): tên tự đặt + nam/nữ + 4 diện mạo thuần Việt mỗi giới
   (áo thun trắng, sơ mi xanh, ÁO BÀ BA, flannel — nữ có thêm khăn rằn). Sprite meowa 16 hình.
2. **Intro v2 đồng bộ nhân vật**: 6 cảnh nền meowa mới (văn phòng ngày có sếp, đêm mưa,
   PHỐ BITEXCO, phòng trọ, hẻm xe lẩu, quán sáng đèn) + pose desk/money của ĐÚNG nhân vật
   người chơi chọn ghép canvas lúc chạy (pixel-perfect, bóng tiếp xúc). Tên nhân vật thay "Minh"
   trong phụ đề (xưng cậu/cô theo giới tính).
3. **Đặt tên quán** sau intro (12 tên gợi ý thuần Việt + 🎲 + ô tự viết).
4. **GATE pha tu tiên ngày 7** (yêu cầu thiết kế): ngày ≥8 + trả hết nợ phòng + dư ≥1 triệu
   mới mở khách tu tiên/đại năng/thực đơn bí mật. Kèm lễ "thức tỉnh" 7 dòng cốt truyện
   (mưa sao băng → cứu tu sĩ → được tặng linh thạch + tụ linh trận). Banner tiến độ 3 ✅/⬜ ở màn chuẩn bị.
5. **Hệ tu vi 9 cảnh giới** (engine/cult.js): Phàm nhân nấu lẩu → Sơ nhập hỏa đạo → Trúc Cơ vị giác
   → Kim Đan nước dùng → Nguyên Anh khói bếp → Hóa Thần gia vị → Luyện Hư đao công → Hợp Thể lẩu đạo
   → Đại Thừa phàm tiên → Độ Kiếp Lẩu Tiên Tôn. Mỗi cấp buff THẬT (rộng vạch lửa +3%, kiên nhẫn +6%,
   típ +12%, traffic +10%, giảm hàng hỏng 25%, nấu nhanh 15%, khách hâm -40%, LS +10%, all +5%).
   Exp từ: bưng đúng +2/nồi, lửa chuẩn +1, 5 sao +3, khách tiên +4, đại năng +15, hộ pháp tóm bùng +3,
   trọn ngày lãi +5; nghiệp: khách bỏ về -2, sai món -2, 1 sao -1. Đột phá có màn lễ riêng + thoại sáng tác.
   Khách tiên Kim Đan+ có 40% "nhận ra cảnh giới" trong review.
6. **Tường đánh giá** (ảnh tham khảo làm mẫu): card review có avatar, tên, ngày, sao, chữ,
   HÌNH NỒI LẨU khách đã gọi bên phải, ô "Phản hồi của quán". Phản hồi = lượt chơi chiến lược:
   3 tông (Dịu dàng 0% rủi ro, Hài hước 10% viral +50-150k, Cà khịa 30% phản tác dụng ăn 1 sao bóc phốt,
   viral +100-300k; cà khịa khách tiên 85% toang; khách chê vô lý thì risk -15%).
   3 CÂU GỢI Ý chọn được theo tông + tự viết + 4 avatar phản hồi (mặt mình theo creator/ẩn danh/đầu bếp/ếch).
7. **Thang phá sản 3 bậc** (engine/ruin.js): lãi dương reset. Âm 1 ngày → "Chủ nhà nhắc nợ" (traffic -10%);
   âm 2-3 ngày → "Tin đồn lan ra" (-25%); âm 4+ ngày → "Ngân siết quán" (-45%, kê biên 30% két + 1 trang bị);
   âm quá 5tr hoặc 6 ngày liên tiếp → GAME OVER tổng kết hành trình (ngày trụ, nồi đã bán, doanh thu,
   rating, cảnh giới, món chạy nhất) + "Làm lại cuộc đời".

### Kỹ thuật
- File mới: engine/cult.js, engine/ruin.js, engine/replies.js, creator.js; intro.js viết lại v2;
  assets/intro/compose_v2.py; assets/chars/creator_*.png (8 đứng + 16 pose).
- Tests: 75/75 pass (51 cũ + 24 mới: cult buff/đột phá/nghiệp, ruin leo thang/kê biên/game over,
  replies risk/viral/savage-tiên, gate 4 test).
- QA browser thật: full flow creator→intro→tên quán→prep→tường review→phản hồi savage ẩn danh OK.
- meowa: 515→145cr (10 job, ghi credits-log). Bài học: xlarge_3_4 perfect-pixel LUÔN cắt nội thất
  thành fragment → nền PIL vẽ đặc + dán fragment; Bitexco regen 2 lần mới sạch.

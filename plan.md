# LẨU HẺM TIÊN — plan.md (Phase 0)

Game quản lý quán lẩu pixel-art, web, tiếng Việt. Chủ quán người Việt bình thường
bán lẩu trong hẻm Sài Gòn; đêm xuống khe không gian nứt ra, khách tu tiên bước vào.
Cơ chế thể loại học từ game quản lý quán trà nổi tiếng trong cộng đồng; câu chữ + công thức do dự án viết lại (06/10/2026).
Mọi pixel art sinh bằng meowa.ai (skill meowa-pixel-gen). Backend-first: engine thuần Node chạy
được test headless, frontend chỉ là lớp vẽ.

## Concept chốt (từ brief phu quân)
- Khách 2 tầng: THƯỜNG (VNĐ, review Google Maps) + TU TIÊN (linh thạch, đạo tâm mỏng, típ khủng, sự kiện nhánh).
- Tiền tệ: VNĐ (chi phí phàm trần) + LINH THẠCH hạ/trung/thượng (nâng cấp tiên giới). Tiệm cầm đồ đổi 2 chiều, tỷ giá dao động/ngày.
- Khách tu tiên không có linh thạch → "Từ chối" (giữ an toàn, 10 ngày sau nhánh ẩn) / "Ghi sổ nợ" (nhánh: đại năng trả gấp trăm hoặc mất trắng).
- 7 nồi lẩu: cà chua, nấm, sườn (tầng 1) · Thái, sukiyaki (tầng 2) · đông trùng hạ thảo, Tứ Xuyên (tầng đặc biệt).
- Topping dùng chung + ngăn "tiên giới" khóa chờ mở (linh chi, huyết sen, thịt linh thú — tính linh thạch).
- Minigame canh lửa: giữ-nhả đúng vạch xanh (port từ rót trà), vạch hẹp dần theo nồi (Tứ Xuyên khó nhất). Lẩu hỏng = mất nguyên liệu.
- UI chủ đạo: Chef RPG (parchment #f3e5c2 / gỗ caramel #b8894c / viền nâu #5f4523 / nameplate amber #c98d28)
  + điểm ngọc bích/vàng đồng + linh quang cyan/tím (#74cfbf, #9a5fd4) cho khách/đồ tu tiên. 60-30-10.
- Font: VT323 (Google Fonts, đủ dấu Việt) — Press Start 2P KHÔNG có dấu, cấm dùng.
- Nhịp ngày: 4 phút thật = 11:00–22:00 trong game; 22:00 đóng cửa tổng kết (giống gốc).

## Ánh xạ cơ chế gốc → lẩu tu tiên (từ source 1957 dòng)
| Gốc | Lẩu Hẻm Tiên |
|---|---|
| ITEMS[k]={n,s,type,g,c,life,cost,sell,unlock} | y hệt, key đổi: base=nồi lẩu, top=topping, sup=nồi+muỗng |
| Kho theo mẻ có hạn dùng {q,exp} | y hệt — thịt/nước lẩu có life ngày; hết hạn tự đổ bỏ |
| genOrder theo level (ngày 6/30/60) | y hệt: L1 nồi trơn → L2 thêm độ cay/nước chấm → L3 đơn 2 nồi, 4 topping → L4 đơn 5 nồi |
| Kiên nhẫn 55s + 8s(L≥2), ×1.25 ghế, ×(1+.8(n-1)), × topping chậm | y hệt; khách tu tiên đạo tâm = kiên nhẫn × 0.75 nhưng trả ×2-3 |
| matches(a,b) so base/flav/size/sugar/ice/tops | matches so nồi/độ cay/nước chấm/topping/cỡ nồi (nhỏ/lớn) |
| Sai món: đổ ly, pat −30% max, wrongKinds | y hệt: đổ nồi, đạo tâm −30%, ghi rõ sai gì (để review khớp sự thật) |
| 8 sự kiện ngày + 10 quà + 5 tai họa lên lịch + chống gian lận | port nguyên: nóng→"linh khí bạo động", mưa, cuối tuần, tan học→"tan khóa lễ tông môn", reviewer→"thực thần tu tiên", trend, sale→"thương hội giảm giá", lễ→"đại hội tiên盟"; tai họa: trộm, thuế, lừa đảo, "đầu tư tiền ảo"→"sàn linh thạch sập", quản lý→"đội trật tự phường" |
| Vay ngân hàng 1tr lãi 25%/năm trả 10 ngày | y hệt + "vay nóng hắc thị" ẩn (lãi 45%) |
| traffic(): rating→khách, boost sign/ads, giá đắt phạt 80% | y hệt; thêm boost tụ linh trận (khách tu tiên +20%) |
| stars(): chờ>50% −1, >82% −1, >96% −1, sai −wrong, pricey −1, mood ngày khó ở | y hệt |
| Review máy ghép PARTS/LONG khớp sự thật, chống lặp 2500 cap | port văn phong: khách thường (giọng Sài Gòn) + khách tu tiên (giọng tiên hiệp "bổn tọa", "đạo hữu") |
| Khách khó tính: hối/đổi ý/trả giá/bùng tiền + bảo vệ | y hệt; ma tu bùng tiền → hộ pháp quán tóm (nâng cấp) |
| Nhân viên (phụ quầy/pha chế/online) + lương + tăng ca | đệ tử học việc/pháp khí tự nấu/nhân viên giao hàng tiên hạc |
| Đơn online (ngày 60, lời 15tr, 4 sao) — app Soppi | "Tiên Hạc Truyền Tin" — đơn bay từ tông môn xa, hạc chờ 90s |
| Sao (idol Kpop/Thái/Trung ghé 30 ngày/lần, trả ×3, luôn 5 sao) | "đại năng Nguyên Anh vi hành" — nói tiếng tiên kèm [Tự động dịch], trả ×3 |
| Thuế hộ kinh doanh (VAT 3% + PIT 1.5% trên doanh thu, ngưỡng 1 tỷ/năm) | y hệt nguyên xi — chủ quán người Việt thì đóng thuế Việt |
| tiền nhà 40k/ngày + điện nước 20k + 8k/trang bị | y hệt |
| priceCap 120k/ly, itemCap 50k, sizeCap 50k | cân lại theo lẩu: nồi lẩu đắt hơn ly trà → cap ≈ 250k; cảnh báo trong Giá bán |
| 12 màu giao diện | 12 theme: Tử Vân Các (mặc định), Hồng Hoang, Thanh Trúc, U Minh, Kim Ô... |
| Sao lưu mã 8 số + localStorage 3 bản dự phòng | y hệt |

## Danh mục data (cân bằng kinh tế — điều chỉnh được trong CFG)
NỒI LẨU [key, tên, màu, life, nhập, bán, mở khóa]:
- ca_chua Cà chua #e8542e life3 nhập8k bán35k free
- nam Nấm #c9a86a life3 nhập9k bán40k free
- suon Sườn #b5651d life3 nhập12k bán50k free
- thai Thái #e8842e life3 nhập10k bán45k mở 150k
- suki Sukiyaki #7a4a2a life2 nhập15k bán65k mở 250k
- dong_trung Đông trùng hạ thảo #d4a017 life2 nhập25k bán95k mở 600k (tiên giới ưa, khách thường chê mùi)
- tu_xuyen Tứ Xuyên #c1121f life3 nhập14k bán70k mở 400k (hỏa hệ mê, khách thường thở ra khói)

TOPPING thường (đơn vị k): bò 8/15, gầu 7/13, sườn sụn 6/12, tôm 10/18, mực 9/16,
ngêu 6/12, bò viên 5/10, cá viên 4/9, đậu hũ ky 3/7, rau muống 2/5, cải cúc 3/6,
nấm kim châm 4/8, mì gói 2/4, miến 2/5, bún 2/4, udong 3/6, trứng 3/7
TOPPING tiên giới (linh thạch hạ phẩm): linh chi 2/5, huyết sen 3/6, thịt linh thú 5/9, băng tằm 4/8
NƯỚC CHẤM: muối ớt xanh, chao, sa tế, tương tiên giới (khóa)
CỠ NỒI: Nhỏ (free) / Lớn (+15k, +2 topping)

## Kiến trúc kỹ thuật
```
game/
  index.html          — shell, canvas + DOM overlay
  css/main.css        — theme vars (12 theme đổi bằng CSS custom properties)
  js/
    engine/           — BACKEND THUẦN (không DOM): chạy được trên Node để test
      config.js       — CFG mặc định + migrate version
      data.js         — ITEMS/UPG/STAFF/EVS/GIFTS/BAD/STARS/PERSONA/TXT review
      state.js        — S (save), R (runtime), fresh/load/save/migrate/sanitize
      stock.js        — kho theo mẻ, hạn dùng, expire, nấu-nhập
      economy.js      — price/unitCost/traffic/lChance/pricy/loan/tax/cầm đồ linh thạch
      orders.js       — genOrder theo level, matches, wrongKinds, stars()
      reviews.js      — máy ghép review khớp sự thật, chống lặp
      events.js       — rollDay, evCard, giftCheck, badCheck/mkBadPlan, cheatHit
      loop.js         — tick ngày, spawn khách (thường/tiên/VIP/hạc), serve, tổng kết newRec/recRev/recCost
    ui/               — FRONTEND (DOM/canvas): renderPrep, quầy nấu pixel, khách sprite, FX, sound (Web Audio), theme
    main.js           — boot, router prep/sell, bind events
  tests/              — node --test: engine/*.test.js (blockgate phase 1)
assets/               — meowa outputs: ui/ chars/ food/ props/ (git LFS không cần, PNG nhỏ)
docs/                 — 01-tong-quan.md 02-ky-thuat.md 03-san-pham.md 04-van-hanh.md 99-ghi-chu.md
credits-log/credits.md — mọi job meowa: ngày, job id, template, cost, balance, kết quả
```
Nguyên tắc: engine/ KHÔNG import DOM → test headless bằng `node --test`. UI chỉ đọc state + gọi engine.
Save: localStorage key 'lhTienSave' + 3 bản backup + mã 8 số (port cơ chế gốc).

## Meowa asset plan (615 credit hiện có — ngân sách chặt)
Ưu tiên template: xlarge_4_3 cho cảnh/UI lớn (25cr/job), sprite-pack 48px/64px cho icon+nhân vật (~10-15cr).
- Batch 1 (P2): cảnh quán hẻm đêm + quầy lẩu (xlarge 1 job 25cr) · UI kit panel/button/nameplate (xlarge 1 job) · 7 nồi lẩu sprite (2 job pack) · nồi đang nấu các trạng thái lửa.
- Batch 2 (P3): nhân vật chủ quán (sheet 48px) · 6-8 khách thường chibi + 6 khách tu tiên (phát sáng viền) · ~35 icon topping 24px_icon (3 job) · props (ghế nhựa, bảng neon, hạc tiên, kiếm, linh thạch coin).
- QA mọi asset: vision checklist + pixel-scan numpy (bài học skill); meowa hay sai chữ trên biển → wipe+repaint bitmap font.
- Prompt chuẩn: "Stardew Valley style pixel art, 16x16 tile grid, uniform 1px dark outline sticker-style, warm palette, flat contact shadows, no anti-aliasing, NO PEOPLE" (scene) / chef-RPG palette hex đưa thẳng vào prompt.

## Phases + blockgates (dừng chờ duyệt SAU MỖI PHASE)
- P0 Plan: plan.md + docs/ + git init + commit + gitnexus analyze. Gate: git log có commit P0, gitnexus báo node count.
- P1 Backend engine: 9 module engine + tests. Gate: `node --test game/tests` exit 0, ≥30 test pass (kho/hạn dùng, price, genOrder theo level, matches, stars, traffic, reviews khớp-sự-thật, events rollDay deterministic-seed, cầm đồ+sổ nợ, chống gian lận cheatHit, tax).
- P2 Meowa batch 1: cảnh quán + UI kit + 7 nồi. Gate: file PNG tồn tại, vision QA ≥7/10 mỗi asset, credits-log ghi đủ, commit.
- P3 Meowa batch 2: nhân vật + topping + props. Gate như P2.
- P4 Serve loop UI: màn bán hàng playable với asset thật. Gate: mở browser, rót-canh-lửa 3 nhánh (đúng/sớm/tràn) hoạt động, khách vào-đợi-bỏ-đi, tiền nhảy đúng, screenshot QA.
- P5 Prep UI: 5 tab chuẩn bị + tổng kết ngày. Gate: nhập hàng trừ tiền đúng, giá bán đổi được + cảnh báo đắt, review hiển thị + trả lời được, tổng kết đủ dòng (doanh thu/chi phí/lương/thuế/lãi).
- P6 Tầng tu tiên: khách tiên, linh thạch, cầm đồ, sổ nợ nhánh, topping tiên giới. Gate: test engine nhánh sổ nợ (đại năng trả/mất trắng), chơi thật thấy khách tiên phát sáng trả linh thạch.
- P7 Sự kiện/quà/tai họa + âm thanh Web Audio + 12 theme + khách VIP đại năng + hạc online. Gate: seed sự kiện chạy đúng lịch, âm thanh bật/tắt được, đổi theme không vỡ layout.
- P8 Deploy LAN (python http.server + token như FCC) + QA mobile CDP + docs 04-van-hanh + tổng kết. Gate: điện thoại chàng mở được qua WiFi nhà, cdp_mobile_shot clientWidth==scrollWidth.

## Quy tắc sắt (house)
- KHÔNG skip phase, KHÔNG batch task; mỗi task 1 blockgate; sau mỗi phase: git commit + gitnexus analyze + summarize.md + dừng chờ duyệt.
- Meowa: mọi job ghi credits-log; không đoán balance — check trước mỗi batch.
- Engine trước UI sau; không claim chưa chạy; phu quân chấm cuối.
- Tiếng Việt 100% trong game text; font VT323; palette Chef RPG + linh quang; 60-30-10; max 3 font.

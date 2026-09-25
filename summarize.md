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

## Tech facts
- Node 22.23.2, `node --test game/tests/*.test.js` (type: module trong package.json).
- Engine thuần không DOM → chạy headless; UI sẽ import engine như ES modules trong browser (không cần bundler).
- localStorage keys: lhTienSave + lhBak1/2/3.
- gitnexus: chạy sau mỗi commit.

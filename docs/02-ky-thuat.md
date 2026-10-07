# 02 — Kỹ thuật

## Stack
- Vanilla HTML/CSS/JS (ES modules), KHÔNG framework, KHÔNG build step — deploy tĩnh 1 file server.
- Canvas 2D cho cảnh quán + sprite nhân vật; DOM overlay cho panel quản lý (prep tabs) — giống kiến trúc game gốc.
- Web Audio API tự sinh âm thanh (không file audio) — toàn bộ do dự án tự tổng hợp.
- Node.js `node --test` cho engine tests (engine thuần, không DOM).
- Font: VT323 (Google Fonts) — đủ dấu tiếng Việt. CẤM Press Start 2P (không dấu).
- Assets: meowa.ai pixel-gen API (xem skill meowa-pixel-gen + credits-log/credits.md).

## Cấu trúc
```
game/
  index.html
  css/main.css        — CSS custom properties cho 12 theme
  js/engine/*.js      — BACKEND THUẦN, không DOM, test được bằng Node
  js/ui/*.js          — render + input
  js/main.js          — boot/router
  tests/*.test.js     — node --test
assets/{ui,chars,food,props}/ — PNG từ meowa
```

## Quy ước engine
- `S` = save state (persist localStorage 'lhTienSave'), `R` = runtime state (không persist).
- Mọi hàm kinh tế/order/review là pure function nhận (S, CFG) → kết quả; RNG qua `S.rng` seed được để test deterministic.
- Tiền VNĐ lưu đơn vị đồng (integer), hiển thị fmt() theo k/triệu/tỷ thống nhất toàn game.
- Linh thạch: {ha, trung, thuong} integer; tỷ giá S.exchange rate đổi mỗi ngày trong rollDay.

## Design tokens (art direction GỐC của dự án — tự thiết kế, không sao chép asset ai)
Nguyên tắc ấm-áp-đồ-ăn là kiến thức thể loại chung; mọi giá trị + sprite bên dưới là thiết kế riêng:
- Gỗ khung: #b8894c, bevel sáng #d2a862, tối #9a7038, viền vạn vật #5f4523
- Giấy kem panel: #f3e5c2, kẻ ô #e2d1a7, trắng #fbf4e4
- Nameplate amber #c98d28, chữ cream #f8ecd2, phẩm chất teal #74cfbf
- Nút đóng rose #d4506b, chọn magenta #e0568c
- Linh quang (tu tiên): cyan #74cfbf, tím #9a5fd4, phát sáng glow 2px
- Phẩm chất: Thường teal → Linh lục #7fbf5f → Huyền lam #5f8fd4 → Địa tím #9a5fd4 → Thiên kim #e0a03c
- Góc vát pixel 4px, bóng đổ cứng lệch 3px phải-dưới, viền 2px nâu đậm mọi panel
- Tỷ lệ 60-30-10: 60 kem/gỗ, 30 nâu đậm+amber, 10 linh quang

## Deploy
- Local: python3 -m http.server 8793 (port chốt sau, tránh 8790 FCC/8792 Laya) + token query như FCC.
- PWA manifest để cài vào máy.

## Kiểm thử nhanh trên trình duyệt (QA)
Mở `python3 -m http.server 8794` (CỔNG 8794 — TUYỆT ĐỐI KHÔNG dùng 8793: đó là cổng server
nhúng của app macOS Lẩu Hẻm Tiên; chiếm cổng 8793 là app hiện "Directory listing for /" và
KHÔNG vào được game, lại còn phơi danh sách tệp của dự án ra mạng LAN) rồi vào
`http://127.0.0.1:8794/game/index.html`.
Xong việc PHẢI tắt server test (`pkill -f "http.server 8794"`). Trình duyệt sạch
(chưa có save) sẽ đi qua: splash → `#btnPlay` → lớp tạo nhân vật → nút "🍲 Bắt đầu câu chuyện" →
màn mở đầu (nút "Bỏ qua ⏭") → đặt tên quán (nút "Giữ ...") → màn chuẩn bị.
- Màn chuẩn bị: nút nhập hàng có `data-inc="<mã nguyên liệu>"` (ví dụ `ca_chua`, `sup`); mỗi lần
  bấm là một lượt nhập (món chính 5 phần, nồi chén 10 phần). Nhập xong bấm `#btnOpen` để mở cửa.
- `window.__lht` (QA handle, luôn có sẵn): `R` (runtime), `S` (save), `canCook()`,
  `autoCloseCheck()`, `guestCapFor()`, `pickServeSlot()`, `endDay()`.
- Thử nhanh "hết khách → tự đóng cửa": vào màn bán rồi `__lht.R.slots = [null,null,null]`;
  quán phải tự tổng kết sau `cfg.autoCloseSec` (15) giây trống liên tục.
  Thử nhanh "hết hàng": `__lht.S.stock = {}` → mỗi khách ghé chỉ nhắc một lần, không dội thông báo.
- LƯU Ý khi test tự động: tab phải đang hiển thị. Tab bị ẩn sẽ bị Chrome bóp nhịp timer,
  `dayTimer` gần như đứng, nên việc tự đóng cửa sẽ không xảy ra (không phải lỗi game).
- `js/main.js` KHÔNG chạy được trong test node (đụng DOM ngay khi nạp). Mọi sửa đổi main.js
  phải mở trang thật kiểm tra — lỗi kiểu `ReferenceError: X is not defined` (ví dụ quên đổi
  tên hàm trong `__lht`) chỉ hiện ở trình duyệt, test node vẫn xanh 90/90.
  Mẹo: `Page.addScriptToEvaluateOnNewDocument` gắn `window.addEventListener('error', ...)`
  trước khi nạp trang để bắt lỗi nạp module.

## Ca tối 19:00–23:00 (chốt 07/10/2026)
- `game/js/engine/shift.js`: CA = 19:00→23:00, đồng hồ nhảy từng 10 phút; nhịp thật 8 giây/10 phút
  → cả ca 192 giây. Hàm thuần (`shiftMs`, `clockText`, `shiftFrac`, `buildArrivals`) nên test được:
  `game/tests/shift.test.js` (7 test).
- Khách KHÔNG còn dồn cục theo nhịp cứng: `buildArrivals(cap, …)` rải `cap` khách theo ĐƯỜNG CONG
  quán ăn tối — 45% (19:00-20:30) · 36% (20:30-21:50) · 19% (21:50-23:00), có nhiễu nên mỗi ngày
  một khác, khoảng cách tối thiểu 2,5 giây. Lịch dựng ở `startSell` (`R.arrivals`) và dựng lại khi
  vào giữa ca (`resumeSell`).
- Tự đóng cửa: CHỈ khi đã đủ trần khách hôm nay + quán trống liên tục `cfg.autoCloseSec` (20) giây;
  chưa đủ trần thì cứ bán tới 23:00. Nút "Đóng cửa hôm nay" trong menu tạm dừng vẫn giữ.
- Tạm dừng giờ ĐỨNG YÊN thật (`R.pauseMs` được gán khi pause — trước đây quên nên đồng hồ vẫn chạy).
- Đo thật trên Chrome (ca ngày 1, trần 11 khách): nhịp khách thực tế 7-12 giây lúc cao điểm; đồng hồ
  19:00→19:10→19:20… mỗi ~8 giây; thanh tiến độ ca chạy trên HUD.

## Leo thang đơn hàng theo ngày (chốt 07/10/2026)
Bảng đo thật (`game/tests/ramp.test.js`, 400 đơn/ngày) — mỗi ngày một nhích, không nhảy bậc:
```
ngày | đòi-thêm/đơn | %chấm | %cay | %nồi-lớn | nồi/khách | trần nhúng
   1 |         1.00 |    0% |   0% |       0% |      1.00 |   1
   6 |         1.99 |   31% |  27% |       8% |      1.10 |   2
  15 |         3.00 |   47% |  42% |      22% |      1.20 |   3
  30 |         3.47 |   62% |  65% |      35% |      1.94 |   3
  50 |         4.25 |   70% |  83% |      31% |      2.16 |   4
  60 |         5.01 |   73% |  93% |      34% |      2.70 |   5
```
Trước 07/10: ngày 1 đã có 35% nồi lớn, ngày 6 là 100% khách đòi cay, ngày 30 nhảy phát thành 1-5 nồi.
Nay: `potCount` · `dipChance` · `spicyChance` · `lChance` · `pickBrat` đều leo thang theo ngày.

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
Mở `python3 -m http.server 8793` rồi vào `http://127.0.0.1:8793/game/index.html`. Trình duyệt sạch
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

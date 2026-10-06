1|# 02 — Kỹ thuật
2|
3|## Stack
4|- Vanilla HTML/CSS/JS (ES modules), KHÔNG framework, KHÔNG build step — deploy tĩnh 1 file server.
5|- Canvas 2D cho cảnh quán + sprite nhân vật; DOM overlay cho panel quản lý (prep tabs) — giống kiến trúc game gốc.
6|- Web Audio API tự sinh âm thanh (không file audio) — toàn bộ do dự án tự tổng hợp.
7|- Node.js `node --test` cho engine tests (engine thuần, không DOM).
8|- Font: VT323 (Google Fonts) — đủ dấu tiếng Việt. CẤM Press Start 2P (không dấu).
9|- Assets: meowa.ai pixel-gen API (xem skill meowa-pixel-gen + credits-log/credits.md).
10|
11|## Cấu trúc
12|```
13|game/
14|  index.html
15|  css/main.css        — CSS custom properties cho 12 theme
16|  js/engine/*.js      — BACKEND THUẦN, không DOM, test được bằng Node
17|  js/ui/*.js          — render + input
18|  js/main.js          — boot/router
19|  tests/*.test.js     — node --test
20|assets/{ui,chars,food,props}/ — PNG từ meowa
21|```
22|
23|## Quy ước engine
24|- `S` = save state (persist localStorage 'lhTienSave'), `R` = runtime state (không persist).
25|- Mọi hàm kinh tế/order/review là pure function nhận (S, CFG) → kết quả; RNG qua `S.rng` seed được để test deterministic.
26|- Tiền VNĐ lưu đơn vị đồng (integer), hiển thị fmt() theo k/triệu/tỷ thống nhất toàn game.
27|- Linh thạch: {ha, trung, thuong} integer; tỷ giá S.exchange rate đổi mỗi ngày trong rollDay.
28|
29|## Design tokens (art direction GỐC của dự án — tự thiết kế, không sao chép asset ai)
30|Nguyên tắc ấm-áp-đồ-ăn là kiến thức thể loại chung; mọi giá trị + sprite bên dưới là thiết kế riêng:
31|- Gỗ khung: #b8894c, bevel sáng #d2a862, tối #9a7038, viền vạn vật #5f4523
32|- Giấy kem panel: #f3e5c2, kẻ ô #e2d1a7, trắng #fbf4e4
33|- Nameplate amber #c98d28, chữ cream #f8ecd2, phẩm chất teal #74cfbf
34|- Nút đóng rose #d4506b, chọn magenta #e0568c
35|- Linh quang (tu tiên): cyan #74cfbf, tím #9a5fd4, phát sáng glow 2px
36|- Phẩm chất: Thường teal → Linh lục #7fbf5f → Huyền lam #5f8fd4 → Địa tím #9a5fd4 → Thiên kim #e0a03c
37|- Góc vát pixel 4px, bóng đổ cứng lệch 3px phải-dưới, viền 2px nâu đậm mọi panel
38|- Tỷ lệ 60-30-10: 60 kem/gỗ, 30 nâu đậm+amber, 10 linh quang
39|
40|## Deploy
41|- Local: python3 -m http.server 8793 (port chốt sau, tránh 8790 FCC/8792 Laya) + token query như FCC.
42|- PWA manifest để cài vào máy.
43|
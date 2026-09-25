# 02 — Kỹ thuật

## Stack
- Vanilla HTML/CSS/JS (ES modules), KHÔNG framework, KHÔNG build step — deploy tĩnh 1 file server.
- Canvas 2D cho cảnh quán + sprite nhân vật; DOM overlay cho panel quản lý (prep tabs) — giống kiến trúc game gốc.
- Web Audio API tự sinh âm thanh (không file audio) — port từ gốc.
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
- Tiền VNĐ lưu đơn vị đồng (integer), hiển thị fmt() theo k/triệu/tỷ như gốc.
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
- PWA manifest (port từ gốc) để cài vào máy.

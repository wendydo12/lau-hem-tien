/* tools/tao-gallery.mjs — SINH TRANG KHO ẢNH ĐẦY ĐỦ (assets/gallery.html)
 *
 * Vì sao có tệp này: trang kho ảnh trước đây viết tay nên hay sót món mới (từng sót 12 nồi lẩu
 * và các món thêm sau). Nay sinh tự động: đọc manifest + danh mục món, liệt kê MỌI tệp ảnh có
 * trong assets/, chia theo mục. Thêm món mới chỉ cần chạy lại lệnh này.
 *
 * Chạy: node tools/tao-gallery.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { SPRITES } from '../game/js/manifest.js';
import { ITEMS, POT_KEYS, DIP_KEYS, TOP_KEYS, DUOC_KEYS, SECRET_KEYS, UPG } from '../game/js/engine/data.js';

const ROOT = path.join(import.meta.dirname, '..');
const ASSETS = path.join(ROOT, 'assets');
const out = path.join(ASSETS, 'gallery.html');

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const card = (src, label, note = '') =>
  `<div class="card"><img src="${esc(src)}" alt="${esc(label)}" loading="lazy">` +
  `<div class="label">${esc(label)}${note ? ` <small>${esc(note)}</small>` : ''}</div></div>`;
const grid = items => `<div class="grid">\n${items.join('\n')}\n</div>`;
const h2 = (title, badge = '') => `<h2>${esc(title)}${badge ? ` <span class="badge">${esc(badge)}</span>` : ''}</h2>`;
const note = t => `<div class="note">${esc(t)}</div>`;

const itName = k => (ITEMS[k] ? ITEMS[k].n : k);
const parts = [];

parts.push(h2('🌃 Cảnh nền & nền phòng', 'vẽ bằng meowa · art direction của dự án'));
parts.push(note('Nền sân khấu bán hàng + nền cho màn "Phòng ở": mỗi bộ style có sàn và màu tường riêng.'));
parts.push(grid([
  card('canh-nen/scene_alley_night.png', 'Hẻm đêm — sân khấu bán hàng'),
  card('canh-nen/phong-tu-tien.png', 'Nền bộ Động Tiên', 'sàn gỗ + tường be'),
  card('canh-nen/phong-hem-viet.png', 'Nền bộ Hẻm Việt', 'sàn gạch bông + tường vàng/xanh'),
]));

parts.push(h2(`🍲 Nồi lẩu — ${POT_KEYS.length} món`, 'mỗi nồi một sprite 64×64'));
parts.push(grid(POT_KEYS.map(k => card(SPRITES.pot?.[k] || SPRITES.item?.[k], itName(k),
  ITEMS[k].unlock ? `mở ở ${(ITEMS[k].unlock / 1000).toFixed(0)}k` : 'có sẵn'))));

parts.push(h2(`🥣 Nước chấm — ${DIP_KEYS.length} món`));
parts.push(grid(DIP_KEYS.map(k => card(SPRITES.item?.[k], itName(k), ITEMS[k].unlock ? `mở ở ${(ITEMS[k].unlock / 1000).toFixed(0)}k` : 'có sẵn'))));

parts.push(h2(`🥩 Đồ nhúng lẩu — ${TOP_KEYS.length + DUOC_KEYS.length} món`));
parts.push(grid([...TOP_KEYS, ...DUOC_KEYS].map(k => card(SPRITES.item?.[k], itName(k),
  ITEMS[k].unlock ? `mở ở ${(ITEMS[k].unlock / 1000).toFixed(0)}k` : 'có sẵn'))));

parts.push(h2(`🔮 Thực đơn bí mật — ${SECRET_KEYS.length} món`, 'chỉ khách tu tiên gọi được'));
parts.push(grid(SECRET_KEYS.map(k => card(SPRITES.item?.[k], itName(k)))));

parts.push(h2(`🧑 Khách người Việt — ${Object.keys(SPRITES.vn).length} hình`, '64×64'));
parts.push(grid(Object.entries(SPRITES.vn).map(([i, f]) => card(f, 'Khách ' + i))));

parts.push(h2(`🧙 Khách tu tiên — ${SPRITES.xian.length} hình`, '64×64'));
parts.push(grid(SPRITES.xian.map((f, i) => card(f, 'Tu tiên ' + String(i).padStart(2, '0')))));

const props = Object.entries(SPRITES.prop || {});
if (props.length) {
  parts.push(h2(`🏮 Đồ vật & biển hiệu — ${props.length} món`));
  parts.push(grid(props.map(([k, f]) => card(f, k))));
}

if (SPRITES.room) {
  const r = SPRITES.room;
  parts.push(h2(`🏮 Nội thất ĐỘNG TIÊN — ${Object.keys(r.dongTien).length} món`, 'thư phòng · thiền thất tu tiên'));
  parts.push(note('Dùng cho bộ B của màn "Phòng ở". Vẽ mới 07/10, đọc từng ô khi kiểm.'));
  parts.push(grid(Object.entries(r.dongTien).map(([k, f]) => card(f, k))));
  parts.push(h2(`🏠 Nội thất HẺM VIỆT — ${Object.keys(r.hemViet).length} món`, 'phòng trọ Việt Nam thập niên 80–2000'));
  parts.push(note('Dùng cho bộ A của màn "Phòng ở": rèm hoa đỏ, TV ăng-ten râu, máy khâu, bằng khen…'));
  parts.push(grid(Object.entries(r.hemViet).map(([k, f]) => card(f, k))));
}

parts.push(h2(`⚡ Trang bị nâng cấp — ${UPG.length} món`, 'đích tiêu tiền trong game'));
parts.push(grid(UPG.map(u => card(
  u.tier === 'equip' ? (SPRITES.prop?.neon || 'do-vat/prop_07.png') : 'do-vat/prop2_04.png',
  u.n, u.cost ? (u.cost / 1000000).toFixed(1) + 'tr' : (u.costLS + ' linh thạch')))));

/* đếm mọi tệp ảnh thật có trong assets/ để cuối trang đối chiếu */
const allPng = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== 'icon') walk(p); }
    else if (e.name.endsWith('.png')) allPng.push(path.relative(ASSETS, p));
  }
})(ASSETS);

const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LẨU HẺM TIÊN — Kho ảnh đầy đủ</title>
<style>
  :root { --bg:#1a1426; --panel:#241c33; --wood:#b8894c; --cream:#f3e5c2; --amber:#c98d28; --teal:#74cfbf; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--cream); font-family:'Trebuchet MS','Segoe UI',sans-serif;
         padding:36px 4vw 90px; background-image:radial-gradient(ellipse at 50% -10%, rgba(154,95,212,.12), transparent 60%); }
  h1 { font-size:34px; letter-spacing:2px; text-align:center; margin-bottom:6px; text-shadow:0 0 24px rgba(201,141,40,.5); }
  .sub { text-align:center; color:#a89bb8; margin-bottom:26px; font-size:14px; }
  .tong { text-align:center; color:var(--teal); margin-bottom:44px; font-size:14px; }
  h2 { font-size:20px; color:var(--amber); margin:44px 0 6px; display:flex; align-items:center; gap:12px; }
  h2::after { content:''; flex:1; height:2px; background:linear-gradient(90deg, var(--wood), transparent); }
  .badge { font-size:11px; background:rgba(116,207,191,.15); color:var(--teal); border:1px solid rgba(116,207,191,.4);
           padding:2px 8px; border-radius:99px; font-weight:400; }
  .note { color:#a89bb8; font-size:13px; margin-bottom:18px; }
  .grid { display:grid; gap:14px; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); }
  .card { background:var(--panel); border:2px solid #3a2f4d; border-radius:12px; padding:12px; text-align:center; }
  .card img { width:100%; max-width:128px; image-rendering:pixelated; display:block; margin:0 auto 8px; }
  .label { font-size:12.5px; line-height:1.35; }
  .label small { color:#a89bb8; display:block; font-size:11px; }
  footer { margin-top:60px; color:#a89bb8; font-size:12.5px; text-align:center; }
</style>
</head>
<body>
<h1>LẨU HẺM TIÊN — KHO ẢNH</h1>
<div class="sub">Trang này sinh tự động từ danh mục trong mã — thêm món mới thì chạy lại <code>node tools/tao-gallery.mjs</code></div>
<div class="tong">${allPng.length} tệp ảnh trong kho · ${POT_KEYS.length} nồi lẩu · ${TOP_KEYS.length + DUOC_KEYS.length} đồ nhúng · ${DIP_KEYS.length} nước chấm · ${Object.keys(SPRITES.room?.dongTien || {}).length + Object.keys(SPRITES.room?.hemViet || {}).length} món nội thất</div>
${parts.join('\n\n')}
<footer>Toàn bộ hình trong trang này được vẽ riêng cho dự án bằng meowa.ai theo art direction của game.<br>
Sổ chi phí từng đợt: <code>credits-log/credits.md</code></footer>
</body>
</html>
`;
fs.writeFileSync(out, html, 'utf8');
fs.writeFileSync(path.join(ROOT, 'webapp/assets/gallery.html'), html, 'utf8');
console.log('đã ghi', path.relative(ROOT, out), '+ bản sao webapp/assets —', allPng.length, 'tệp ảnh,',
  parts.length, 'mục');

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
import { ITEMS, POT_KEYS, DIP_KEYS, TOP_KEYS, DUOC_KEYS, SECRET_KEYS, UPG, ROOM } from '../game/js/engine/data.js';
import { hieuUngPhong, TRAN_PHONG, giaBo } from '../game/js/engine/room.js';

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

/* ---- NỘI THẤT: hiện GIÁ + HIỆU ỨNG (định giá 08/10) ---- */
const fmtV = n => n.toLocaleString('vi-VN') + 'đ';
const TRUC_PHAN_TRAM = ['kienNhan', 'khach', 'khachTuTien', 'khachDem', 'daoTam', 'nhanhPhucVu', 'vachCanhLua'];
const moTruc = (e = {}) => Object.entries(e).map(([t, v]) => {
  const ten = NHAN_TRUC[t] || t;
  if (typeof v !== 'number') return ten;
  if (TRUC_PHAN_TRAM.includes(t)) return `${ten} +${v}%`;
  if (t === 'uyTin') return `${ten} +${v}`;
  if (t === 'giamPhat' || t === 'giamTrom') return `${ten} còn ${Math.round(v * 100)}%`;
  return `${ten} +${v}`;
}).join(' · ');
const NHAN_TRUC = {
  kienNhan: 'kiên nhẫn', khach: 'khách', khachTuTien: 'khách tu tiên', khachDem: 'khách đêm',
  daoTam: 'đạo tâm', uyTin: 'uy tín', nhanhPhucVu: 'bưng bê', vachCanhLua: 'canh lửa',
  moSuKien: 'mở sự kiện', boQuaThanhTra: 'bỏ qua lỗi nhỏ', boQuyt: 'chống quỵt', giamTrom: 'giảm mất trộm',
  giamPhat: 'giảm tiền phạt', moDoDien: 'mở đồ điện'
};
if (SPRITES.room) {
  const r = SPRITES.room;
  const bangBo = (style, tieuDe, badge, ghiChu) => {
    const ds = Object.entries(r[style]);
    const g = giaBo(style);
    const u = hieuUngPhong(ds.reduce((o, [k]) => (o[k] = true, o), {}), style).so;
    const tong = moTruc(u);
    const tran = moTruc(TRAN_PHONG[style]);
    parts.push(h2(`${tieuDe} — ${ds.length} món`, badge));
    parts.push(note(`${ghiChu} Tổng bộ: ${g.vnd ? fmtV(g.vnd) : g.ls + ' linh thạch'}` +
      `${g.vnd && g.ls ? ' + ' + g.ls + ' LS' : ''}. Mua đủ bộ được: ${tong} (trần mỗi trục: ${tran}).`));
    parts.push(grid(ds.sort((a, b) => (a[1].p || a[1].pls * 50000) - (b[1].p || b[1].pls * 50000))
      .map(([k, f]) => card(f, ROOM[style][k].n,
        (ROOM[style][k].p ? fmtV(ROOM[style][k].p) : ROOM[style][k].pls + ' LS') + ' — ' + moTruc(ROOM[style][k].e)))));
  };
  bangBo('dongTien', '🏮 Nội thất ĐỘNG TIÊN', 'thư phòng · thiền thất tu tiên',
    'Trả bằng LINH THẠCH (xa hoa, để dành cuối game). Hiệu ứng thiên về khách tu tiên.');
  bangBo('hemViet', '🏠 Nội thất HẺM VIỆT', 'phòng trọ Việt Nam thập niên 80–2000',
    'Trả bằng TIỀN MẶT (đời thường, mua sớm được). Hiệu ứng thiên về kiên nhẫn của khách.');
  parts.push(note('Luật cân bằng: chỉ BỘ ĐANG BÀY có hiệu lực (hai bộ không cộng dồn); cùng một trục thì cộng dồn giảm dần ×0.8 và bị cắt trần — chi tiết ở docs/11-gia-noi-that.md.'));
}

parts.push(h2(`⚡ Trang bị nâng cấp — ${UPG.length} món`, 'đích tiêu tiền trong game'));
parts.push(note('Mỗi món một hình riêng (vẽ 08/10). Trước đây kho ảnh dùng lại một hình chung nên nhìn không phân biệt được.'));
/* 08/10: đọc hình riêng từng món trong SPRITES.upg — thiếu thì mới rơi về hình chung */
const upgSprite = u => SPRITES.upg?.[u.id] || (u.tier === 'equip' ? 'do-vat/prop_07.png' : 'do-vat/prop2_04.png');
parts.push(grid(UPG.map(u => card(
  upgSprite(u),
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

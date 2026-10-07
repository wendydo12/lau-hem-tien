/* tests/sprite.test.js — HÀNG RÀO ẢNH: mọi hình khai báo trong manifest phải CÓ THẬT trên đĩa
 * (lệnh phu quân 07/10/2026: "không được để xuất hiện tình trạng không hiện hình ảnh nhân vật,
 * khách, đồ ăn, nồi lẩu").
 *
 * Bối cảnh lỗi: màn hình game chạy trong app macOS ở địa chỉ /webapp/index.html nên đường dẫn
 * ảnh tính theo gốc kho (../assets/... → /assets/...). Nếu ai mở game từ một thư mục khác
 * (ví dụ trỏ thẳng vào game/) thì mọi ảnh vỡ mà không có gì báo. Tệp này chặn đúng lỗi đó:
 * quét manifest, kiểm từng tệp có tồn tại, đúng định dạng PNG, và không rỗng.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SPRITES } from '../js/manifest.js';
import { UPG, TOP_SECTIONS } from '../js/engine/data.js';

const GAME = new URL('..', import.meta.url).pathname;              // .../game/
/* Trang game nằm ở /webapp/index.html nên đường dẫn ảnh "../assets/..." trỏ về assets/ ở GỐC KHO
 * — đó mới là kho ảnh app phục vụ. webapp/assets là bản sao để đóng gói (tools/dong-bo.py giữ khớp). */
const ASSETS = path.join(GAME, '..', 'assets');
const ASSETS_WEB = path.join(GAME, '..', 'webapp', 'assets');

/* gom mọi đường dẫn tệp trong manifest (lồng bao nhiêu tầng cũng lấy) */
function pathsOf(obj, acc = []) {
  if (typeof obj === 'string') acc.push(obj);
  else if (Array.isArray(obj)) obj.forEach(x => pathsOf(x, acc));
  else if (obj && typeof obj === 'object') Object.values(obj).forEach(x => pathsOf(x, acc));
  return acc;
}

test('mọi hình trong manifest đều có tệp thật trong webapp/assets', () => {
  const all = pathsOf(SPRITES);
  assert.ok(all.length >= 80, 'manifest phải khai báo ít nhất 80 hình, thực tế: ' + all.length);
  const thieu = all.filter(p => !fs.existsSync(path.join(ASSETS, p)));
  assert.deepEqual(thieu, [], 'Thiếu tệp hình (sẽ hiện ô vỡ trong game): ' + thieu.join(', '));
});

test('hình phải là PNG thật (có chữ ký PNG) và không rỗng', () => {
  const hong = [];
  for (const p of pathsOf(SPRITES)) {
    const f = path.join(ASSETS, p);
    if (!fs.existsSync(f)) { hong.push(p + ' (không có tệp)'); continue; }
    const buf = fs.readFileSync(f);
    if (buf.length < 100) { hong.push(p + ' (quá nhỏ: ' + buf.length + ' byte)'); continue; }
    const sig = buf.slice(0, 8).toString('hex');
    if (sig !== '89504e470d0a1a0a') hong.push(p + ' (không phải PNG)');
  }
  assert.deepEqual(hong, [], 'Hình lỗi: ' + hong.join(', '));
});

test('nhân vật và nồi lẩu: tệp phải đúng cỡ 64x64 pixel (không bị thu nhỏ lệch)', () => {
  /* đọc thẳng kích thước từ khối IHDR của PNG (byte 16..24) — không cần thư viện ngoài */
  const size = f => {
    const b = fs.readFileSync(f);
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  };
  const canCheck = [];
  for (const p of pathsOf(SPRITES)) {
    if (!/^(nhan-vat|mon-an)\//.test(p)) continue;
    const f = path.join(ASSETS, p);
    if (!fs.existsSync(f)) continue;
    const { w, h } = size(f);
    assert.ok(w > 0 && h > 0, p + ' phải có kích thước dương');
    canCheck.push({ p, w, h });
  }
  assert.ok(canCheck.length >= 40, 'phải kiểm được ít nhất 40 hình nhân vật/món ăn');
  const lech = canCheck.filter(x => x.w !== x.h).map(x => `${x.p} (${x.w}x${x.h})`);
  assert.deepEqual(lech, [], 'Hình nhân vật/món ăn phải VUÔNG: ' + lech.join(', '));
});

test('đường dẫn trong manifest là đường dẫn TƯƠNG ĐỐI, không có ../ hay ổ đĩa', () => {
  const xau = pathsOf(SPRITES).filter(p => p.startsWith('/') || p.includes('..') || /^[a-zA-Z]:/.test(p));
  assert.deepEqual(xau, [], 'Đường dẫn tuyệt đối sẽ vỡ khi chạy trong app: ' + xau.join(', '));
});

test('kho ảnh: assets/ (app phục vụ) và webapp/assets (bản sao) phải có cùng bộ tệp', () => {
  const gom = dir => new Set([...fs.readdirSync(dir, { recursive: true })]
    .filter(x => String(x).endsWith('.png'))
    .map(x => String(x).replace(/\\/g, '/'))
    .filter(x => !x.startsWith('icon/')));
  const a = gom(ASSETS), b = gom(ASSETS_WEB);
  const thieu = [...a].filter(x => !b.has(x));
  const la = [...b].filter(x => !a.has(x));
  assert.deepEqual({ thieu, la }, { thieu: [], la: [] }, 'hai kho ảnh lệch nhau — chạy tools/dong-bo.py');
});

test('mỗi món trang bị nâng cấp phải có HÌNH RIÊNG (lỗi 08/10: kho ảnh dùng lại 1 hình chung)', () => {
  const upg = SPRITES.upg;
  assert.ok(upg, 'manifest phải có khối upg — mỗi món nâng cấp một hình riêng');
  const thieu = UPG.map(u => u.id).filter(id => !upg[id]);
  assert.deepEqual(thieu, [], 'món nâng cấp chưa có hình riêng: ' + thieu.join(', '));
  const ds = UPG.map(u => upg[u.id]);
  assert.equal(new Set(ds).size, ds.length,
    'trang bị dùng trùng hình nhau — phải vẽ riêng từng món: ' + ds.join(', '));
  for (const [id, f] of Object.entries(upg)) {
    assert.ok(fs.existsSync(path.join(ASSETS, f)), `hình trang bị ${id} thiếu tệp ${f}`);
  }
  /* tệp riêng biệt thật, không phải 13 tên cùng trỏ 1 ảnh */
  const noiDung = UPG.map(u => fs.readFileSync(path.join(ASSETS, upg[u.id])).length);
  assert.ok(new Set(noiDung).size >= 10, 'nhiều món trang bị có tệp ảnh trùng kích thước — nghi dùng lại 1 ảnh');
});

test('mọi món khai báo trong thực đơn phải có hình (lỗi 08/10: thêm món mà quên hình)', () => {
  const thieu = [...new Set(TOP_SECTIONS.flatMap(s => s.ks))]
    .filter(k => !SPRITES.item[k] && !SPRITES.pot[k]);
  assert.deepEqual(thieu, [], 'món chưa có hình trong manifest: ' + thieu.join(', '));
});

test('BỐN kho ảnh phải có cùng bộ tệp (lỗi 08/10: bản nhúng android/ios thiếu 73 ảnh → app điện thoại vỡ hình)', () => {
  const gom = dir => {
    if (!fs.existsSync(dir)) return null;
    return new Set([...fs.readdirSync(dir, { recursive: true })]
      .filter(x => String(x).endsWith('.png'))
      .map(x => String(x).replace(/\\/g, '/'))
      .filter(x => !x.startsWith('icon/')));
  };
  const goc = gom(ASSETS);
  assert.ok(goc && goc.size > 250, 'kho ảnh gốc phải có hơn 250 tệp, thấy ' + (goc ? goc.size : 'không có'));
  const kho = {
    'webapp/assets': ASSETS_WEB,
    'android/app/src/main/assets/public/assets': path.join(GAME, '..', 'android', 'app', 'src', 'main', 'assets', 'public', 'assets'),
    'ios/App/App/public/assets': path.join(GAME, '..', 'ios', 'App', 'App', 'public', 'assets')
  };
  const loi = [];
  for (const [ten, dir] of Object.entries(kho)) {
    const b = gom(dir);
    if (!b) { loi.push(ten + ': KHÔNG CÓ thư mục ảnh'); continue; }
    const thieu = [...goc].filter(x => !b.has(x));
    const la = [...b].filter(x => !goc.has(x));
    if (thieu.length || la.length) loi.push(`${ten}: thiếu ${thieu.length}, thừa ${la.length} (vd ${(thieu[0] || la[0])})`);
  }
  assert.deepEqual(loi, [], 'kho ảnh lệch nhau — chạy tools/dong-bo.py:\n' + loi.join('\n'));
});

test('game/ và webapp/ khai báo cùng một bộ hình (không lệch tên tệp)', () => {
  const wa = fs.readFileSync(path.join(GAME, '..', 'webapp', 'js', 'manifest.js'), 'utf8');
  const ga = fs.readFileSync(path.join(GAME, 'js', 'manifest.js'), 'utf8');
  const grab = t => [...t.matchAll(/'([a-z0-9_/-]+\.png)'/gi)].map(m => m[1]).sort();
  assert.deepEqual(grab(wa), grab(ga), 'manifest hai cây phải giống nhau');
});

/* tests/giong.test.js — HÀNG RÀO CHỐNG LỌT GIỌNG CÁ NHÂN VÀO GAME (lệnh phu quân 07/10/2026)
 *
 * Vì sao có tệp này: game Lẩu Hẻm Tiên là SẢN PHẨM CHO NHIỀU NGƯỜI CHƠI, không phải sổ riêng.
 * Cách xưng hô riêng của trợ lý (thiếp / phu quân / sư huynh / Uyển Nhi) TUYỆT ĐỐI không được
 * xuất hiện trong câu chữ người chơi đọc. Ghi chú trong mã (comment) thì được phép giữ, vì đó là
 * sổ tay kỹ thuật của dự án. Tệp này quét mã nguồn, bỏ comment rồi soi phần chuỗi còn lại.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;      // .../game/
const CAM = [/thiếp/i, /phu quân/i, /sư huynh/i, /uyển nhi/i, /mộ uyển/i];

/* bỏ comment kiểu C mà vẫn giữ nguyên nội dung chuỗi (chuỗi chứa // hoặc /* thì không bị cắt) */
function stripComments(src) {
  let out = '', i = 0, mode = 'code', q = '';
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (mode === 'code') {
      if (c === '/' && n === '*') { mode = 'block'; i += 2; continue; }
      if (c === '/' && n === '/') { mode = 'line'; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') { mode = 'str'; q = c; out += c; i++; continue; }
      out += c; i++; continue;
    }
    if (mode === 'block') { if (c === '*' && n === '/') { mode = 'code'; i += 2; } else i++; continue; }
    if (mode === 'line') { if (c === '\n') { mode = 'code'; out += c; } i++; continue; }
    /* mode === 'str' */
    if (c === '\\') { out += c + (n || ''); i += 2; continue; }
    if (c === q) { mode = 'code'; }
    out += c; i++;
  }
  return out;
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p, acc); }
    else if (/\.(js|html)$/.test(e.name) && !/\.test\.js$/.test(e.name)) acc.push(p);
  }
  return acc;
}

test('câu chữ trong game: không lọt cách xưng hô riêng của trợ lý (thiếp/phu quân/sư huynh/Uyển Nhi)', () => {
  const files = walk(ROOT);
  const viPham = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const code = f.endsWith('.html') ? src.replace(/<!--[\s\S]*?-->/g, '') : stripComments(src);
    code.split('\n').forEach((line, k) => {
      for (const rx of CAM) {
        if (rx.test(line)) {
          viPham.push(path.relative(ROOT, f) + ':' + (k + 1) + ' → ' + line.trim().slice(0, 120));
          break;
        }
      }
    });
  }
  assert.deepEqual(viPham, [], 'Còn câu chữ lọt giọng cá nhân:\n' + viPham.join('\n'));
});

test('hàng rào tự kiểm: bộ lọc phải bắt được chữ cấm và phải tha cho ghi chú trong mã', () => {
  const coChuCam = `const x = 'Đêm nay thiếp ngủ ngon';`;
  const chiGhiChu = `/* lệnh phu quân 07/10: đổi giờ mở quán */\nconst y = 1; // phu quân dặn\n`;
  const strip = s => stripComments(s);
  assert.ok(CAM.some(rx => rx.test(strip(coChuCam))), 'phải bắt được chữ cấm trong chuỗi');
  assert.ok(!CAM.some(rx => rx.test(strip(chiGhiChu))), 'ghi chú trong mã thì phải tha');
  /* chuỗi có // bên trong (địa chỉ web) không được làm bộ lọc cắt nhầm rồi bỏ sót */
  const url = `const u = 'https://meowa.ai'; const z = 'thiếp';`;
  assert.ok(CAM.some(rx => rx.test(strip(url))), 'chuỗi chứa // không được che mất chữ cấm phía sau');
});

test('mọi câu chữ có thật trong game đều đọc được như lời của quán, không phải lời trợ lý', () => {
  /* kiểm mẫu đại diện: câu sự kiện phải xưng "mình" hoặc gọi "bạn", không xưng giọng riêng */
  const src = fs.readFileSync(path.join(ROOT, 'js/engine/surprise.js'), 'utf8');
  const code = stripComments(src);
  assert.ok(/mình/.test(code), 'câu sự kiện phải xưng "mình" (giọng chủ quán)');
  assert.ok(!/thiếp/i.test(code), 'không được còn "thiếp" trong câu sự kiện');
});

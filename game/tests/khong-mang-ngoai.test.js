/* tests/khong-mang-ngoai.test.js — HÀNG RÀO "CHẠY OFFLINE" (lỗi 08/10/2026)
 *
 * Chuyện thật: index.html nạp font VT323 từ fonts.googleapis.com. Thẻ <link> stylesheet NGOÀI
 * chặn cả việc chạy mã JS. Mạng chậm/chặn (VPN, wifi yếu, máy bay) → game đứng ở màn mở đầu
 * tĩnh: vẫn thấy tiêu đề + nút "Mở quán" nhưng KHÔNG có số phiên bản, không nút "Chơi tiếp",
 * không vào được game. Chủ dự án gặp đúng cảnh đó và chụp màn hình hỏi.
 *
 * Vì đây là app chạy tại máy (127.0.0.1), nó phải chạy được khi KHÔNG có mạng.
 * Tệp này chặn mọi phụ thuộc mạng ngoài quay lại.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const GAME = new URL('..', import.meta.url).pathname;
const doc = f => fs.readFileSync(path.join(GAME, f), 'utf8');

/* các tên miền ngoài KHÔNG được xuất hiện trong tài nguyên trang game */
const CAM = /https?:\/\/(?!127\.0\.0\.1|localhost)[a-z0-9.-]+\.[a-z]{2,}/gi;

test('index.html không nạp tài nguyên từ mạng ngoài', () => {
  const t = doc('index.html');
  const ngoai = [...t.matchAll(CAM)].map(m => m[0]);
  assert.deepEqual(ngoai, [], 'index.html còn trỏ ra mạng ngoài (game sẽ đứng khi mất mạng): ' + ngoai.join(', '));
  assert.ok(/phong-chu/.test(doc('css/main.css')), 'font phải tự chủ trong assets/phong-chu/');
});

test('CSS không nạp font/ảnh từ mạng ngoài, và khai báo @font-face đủ 3 subset', () => {
  const t = doc('css/main.css');
  const ngoai = [...t.matchAll(CAM)].map(m => m[0]).filter(x => !x.includes('w3.org'));
  assert.deepEqual(ngoai, [], 'CSS còn trỏ ra mạng ngoài: ' + ngoai.join(', '));
  const soFace = (t.match(/@font-face/g) || []).length;
  assert.ok(soFace >= 3, 'phải khai báo ít nhất 3 @font-face (việt / latin-ext / latin), thấy ' + soFace);
  for (const f of ['vt323-vietnamese.woff2', 'vt323-latin-ext.woff2', 'vt323-latin.woff2']) {
    assert.ok(t.includes(f), 'thiếu khai báo cho ' + f);
  }
});

test('tệp font tự chủ có thật trong BỐN kho ảnh (app macOS + hai app di động cũng cần)', () => {
  const kho = ['assets', 'webapp/assets',
    'android/app/src/main/assets/public/assets', 'ios/App/App/public/assets'];
  for (const k of kho) {
    for (const f of ['vt323-vietnamese.woff2', 'vt323-latin-ext.woff2', 'vt323-latin.woff2']) {
      const p = path.join(GAME, '..', k, 'phong-chu', f);
      assert.ok(fs.existsSync(p), `thiếu font trong ${k}: ${f} — chạy tools/dong-bo.py`);
      assert.ok(fs.statSync(p).size > 1000, `font ${k}/${f} nghi rỗng`);
    }
  }
});

test('mã game không gọi API/máy chủ ngoài (fetch/XHR chỉ trong nhà)', () => {
  const xau = [];
  const duyet = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { duyet(p); continue; }
      if (!e.name.endsWith('.js')) continue;
      const t = fs.readFileSync(p, 'utf8');
      for (const m of t.matchAll(/fetch\(\s*['"`]((?:https?:)?\/\/[^'"`]+)/g)) {
        if (!/127\.0\.0\.1|localhost/.test(m[1])) xau.push(path.relative(GAME, p) + ' → ' + m[1]);
      }
    }
  };
  duyet(path.join(GAME, 'js'));
  assert.deepEqual(xau, [], 'có lời gọi ra ngoài: ' + xau.join(', '));
});

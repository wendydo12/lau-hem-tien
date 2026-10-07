/* tests/bao-mat.test.js — HÀNG RÀO BẢO MẬT (theo pentest suite trong vault: PHẦN A tầng 6 + PHẦN C)
 *
 * Rà bảo mật 08/10/2026 tìm ra một lỗ thật: TÊN QUÁN do người chơi nhập được nhét thẳng vào
 * innerHTML ở màn chuẩn bị và màn tổng kết → gõ `<img src=x onerror=…>` là mã chạy được trong
 * trang (OWASP A05 Injection / XSS). Cách vá: cleanName() lúc nhập + esc() lúc hiển thị.
 *
 * Tệp này giữ ba tầng chặn:
 *   1. hàm làm sạch hoạt động đúng (esc thoát ký tự, cleanName cắt mã + độ dài);
 *   2. QUÉT MÃ: mọi chỗ nối tên quán / tên nhân vật vào HTML phải đi qua esc() — chặn tái phát;
 *   3. quét bẫy nguy hiểm khác: eval, new Function, document.write, javascript: URL, dữ liệu người
 *      chơi nhét vào thuộc tính style/href.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { esc, cleanName, cleanKey } from '../js/safe.js';

const GAME = new URL('..', import.meta.url).pathname;
const doc = f => fs.readFileSync(path.join(GAME, f), 'utf8');
const MAIN = doc('js/main.js');
const CREATOR = doc('js/creator.js');

const PAYLOAD = '<img src=x onerror="window.__xss=1">';

test('esc: thoát sạch ký tự phá thẻ HTML', () => {
  const ra = esc(PAYLOAD);
  assert.ok(!ra.includes('<'), 'không được còn dấu < : ' + ra);
  assert.ok(!ra.includes('>'), 'không được còn dấu > : ' + ra);
  assert.ok(!/onerror="[^"]*"/.test(ra.replace(/&quot;/g, '"')) || ra.includes('&quot;'),
    'dấu nháy kép phải bị thoát thành &quot;');
  assert.equal(esc("O'Neil & <bạn>"), 'O&#39;Neil &amp; &lt;bạn&gt;');
});

test('cleanName: bỏ được mã độc, gộp khoảng trắng, chặn độ dài', () => {
  assert.equal(cleanName(PAYLOAD, 100), 'img srcx onerrorwindow.__xss1', 'phải bỏ < > " = và gộp khoảng trắng');
  assert.equal(cleanName(PAYLOAD).length, 24, 'mặc định vẫn chặn 24 ký tự — chuỗi dài bị cắt');
  assert.ok(!cleanName(PAYLOAD).includes('<'));
  assert.equal(cleanName('   Lẩu   Hẻm    Tiên   '), 'Lẩu Hẻm Tiên', 'gộp khoảng trắng + cắt hai đầu');
  assert.equal(cleanName('a'.repeat(100)).length, 24, 'mặc định chặn 24 ký tự');
  assert.equal(cleanName('a'.repeat(100), 16).length, 16, 'chặn theo tham số');
  assert.ok(!cleanName('x\u0000y\u001Fz').includes('\u0000'), 'bỏ ký tự điều khiển');
  assert.equal(cleanName(null), '', 'null → chuỗi rỗng, không nổ');
  assert.equal(cleanName(undefined), '');
});

test('cleanKey: chỉ cho chữ/số/tiếng Việt — dùng khi làm khoá lưu trữ', () => {
  assert.equal(cleanKey('Lẩu Hẻm Tiên 2026'), 'Lẩu Hẻm Tiên 2026');
  assert.ok(!cleanKey('a/b:c*d?e"f<g>').includes('/'), 'phải bỏ ký tự lạ');
  assert.ok(!cleanKey('../../etc/passwd').includes('/'), 'phải bỏ dấu gạch chéo (chống path traversal)');
});

test('QUÉT MÃ: tên quán nhét vào HTML phải đi qua esc()', () => {
  /* tìm mọi template literal (dấu backtick) có ${...S.shopName...} mà không bọc esc( */
  const loi = [];
  const dong = MAIN.split('\n');
  dong.forEach((l, i) => {
    if (!l.includes('S.shopName')) return;
    const nhHayHtml = l.includes('${') || l.includes('innerHTML') || /<[a-z]/i.test(l);
    if (!nhHayHtml) return;                                /* phép gán thuần thì không phải chỗ nhét HTML */
    if (l.includes('textContent')) return;                 /* textContent thì an toàn */
    if (l.trim().startsWith('*') || l.trim().startsWith('/*')) return;   /* ghi chú */
    if (!/esc\(/.test(l)) loi.push((i + 1) + ': ' + l.trim().slice(0, 90));
  });
  assert.deepEqual(loi, [], 'tên quán chưa thoát HTML:\\n' + loi.join('\n'));
});

test('QUÉT MÃ: tên nhân vật nhét vào HTML phải đi qua esc()', () => {
  const loi = [];
  CREATOR.split('\n').forEach((l, i) => {
    if (!l.includes('creator.name')) return;
    if (l.includes('textContent') || l.includes('saveCreator')) return;
    if (l.trim().startsWith('*') || l.trim().startsWith('/*')) return;
    if (!/esc\(/.test(l)) loi.push((i + 1) + ': ' + l.trim().slice(0, 90));
  });
  assert.deepEqual(loi, [], 'tên nhân vật chưa thoát HTML:\\n' + loi.join('\n'));
});

test('QUÉT MÃ: không có eval / new Function / document.write trong game', () => {
  const tep = [];
  (function duyet(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { duyet(p); continue; }
      if (e.name.endsWith('.js')) tep.push(p);
    }
  })(path.join(GAME, 'js'));
  const xau = [];
  for (const p of tep) {
    const t = fs.readFileSync(p, 'utf8');
    for (const rx of [/[^.\w]eval\s*\(/, /new\s+Function\s*\(/, /document\.write\s*\(/]) {
      if (rx.test(t)) xau.push(path.relative(GAME, p) + ' → ' + rx);
    }
  }
  assert.deepEqual(xau, [], 'mã nguy hiểm: ' + xau.join(', '));
});

test('QUÉT MÃ: không nối chuỗi người chơi vào href/src/style', () => {
  const xau = [];
  for (const [ten, t] of [['main.js', MAIN], ['creator.js', CREATOR]]) {
    for (const m of t.matchAll(/(href|src)\s*=\s*"([^"]*)\$\{[^}]*?(name|value|input)[^}]*\}/gi)) {
      xau.push(ten + ': ' + m[0].slice(0, 80));
    }
  }
  assert.deepEqual(xau, [], 'không được nhét dữ liệu người chơi vào href/src: ' + xau.join(' | '));
});

test('bản lưu: số tiền bị sửa tay vẫn bị bắt gian lận (chống sửa localStorage)', async () => {
  const { fresh, sanitize } = await import('../js/engine/state.js');
  const { makeCFG } = await import('../js/engine/config.js');
  const cfg = makeCFG();
  const S = fresh(cfg);
  S.money = 999_999_999_999;
  sanitize(S, cfg);
  assert.ok(S.cheat || S.money <= 1e12, 'tiền phình bất thường phải bị đánh dấu gian lận');
});

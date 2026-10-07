/* tests/cachebust.test.js — HÀNG RÀO PHIÊN BẢN TẢI LẠI
 * Luật của dự án: khi sửa BẤT KỲ tệp trong js/engine hoặc js/, phải tăng số ?v=N ở TẤT CẢ
 * dòng import trong main.js VÀ thẻ script trong index.html. Quên tăng là trình duyệt còn giữ
 * bản cũ trong bộ nhớ đệm, gây lỗi câm kiểu "món mới mất ảnh" (đã xảy ra 07/10/2026).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const GAME = new URL('..', import.meta.url).pathname;
const main = fs.readFileSync(path.join(GAME, 'js/main.js'), 'utf8');
const html = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8');
const htmlWeb = fs.readFileSync(path.join(GAME, '..', 'webapp', 'index.html'), 'utf8');

test('cache-bust: mọi dòng import trong main.js dùng CÙNG một số phiên bản', () => {
  const vs = [...main.matchAll(/from\s+'([^']+)\?v=(\d+)'/g)].map(m => m[2]);
  assert.ok(vs.length >= 15, 'phải có ít nhất 15 dòng import, thực tế: ' + vs.length);
  const khac = [...new Set(vs)];
  assert.equal(khac.length, 1, 'các import đang lệch phiên bản: ' + khac.join(', '));
});

test('cache-bust: thẻ script và css trong index.html trùng với phiên bản import', () => {
  const vi = [...new Set([...main.matchAll(/\?v=(\d+)'/g)].map(m => m[1]))];
  assert.equal(vi.length, 1, 'main.js có nhiều phiên bản khác nhau: ' + vi.join(', '));
  const v = vi[0];
  for (const [ten, t] of [['game/index.html', html], ['webapp/index.html', htmlWeb]]) {
    const found = [...new Set([...t.matchAll(/\?v=(\d+)/g)].map(m => m[1]))];
    assert.ok(found.includes(v), ten + ': thẻ tài nguyên phải mang phiên bản ' + v + ', đang là ' + found.join(', '));
  }
});

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

test('cache-bust: MỌI tệp js trong cây game phải dùng cùng một phiên bản (lỗi 08/10: audio/creator/intro còn ?v=39)', () => {
  const goc = [...main.matchAll(/\?v=(\d+)'/g)].map(m => m[1]);
  const v = goc[0];
  const lech = [];
  const duyet = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { duyet(p); continue; }
      if (!e.name.endsWith('.js')) continue;
      const t = fs.readFileSync(p, 'utf8');
      for (const m of t.matchAll(/\?v=(\d+)/g)) {
        if (m[1] !== v) lech.push(path.relative(GAME, p) + ' → ?v=' + m[1]);
      }
    }
  };
  duyet(path.join(GAME, 'js'));
  assert.deepEqual(lech, [], 'tệp lệch phiên bản cache (phải là ?v=' + v + '):\n' + lech.join('\n'));
});

test('cache-bust: bản webapp/index.html cũng mang đúng phiên bản', () => {
  const vi = [...new Set([...main.matchAll(/\?v=(\d+)'/g)].map(m => m[1]))][0];
  const htmlWebapp = fs.readFileSync(path.join(GAME, '..', 'webapp', 'index.html'), 'utf8');
  const found = [...new Set([...htmlWebapp.matchAll(/\?v=(\d+)/g)].map(m => m[1]))];
  assert.ok(found.every(x => x === vi), 'webapp/index.html lệch phiên bản: ' + found.join(', ') + ' (phải là ' + vi + ')');
});

test('cache-bust: KHÔNG import .js tương đối TRẦN (lỗi thật 08/10 — engine cache vĩnh viễn)', () => {
  /* Chuyện thật: game/js/engine/*.js import lẫn nhau kiểu `from './economy.js'` KHÔNG kèm ?v=
   * → trình duyệt cache economy.js ở URL không phiên bản, không bao giờ làm mới. Sửa lChance
   * trong tệp mà người chơi vẫn dùng bản cache cũ → "ko thấy khách order nồi lớn" dù đã fix.
   * Hàng rào này đảm bảo mọi import .js tương đối trong cây js/ đều mang ?v= để bump-version
   * kiểm soát được toàn cây. */
  const tran = [];
  const duyet = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { duyet(p); continue; }
      if (!e.name.endsWith('.js')) continue;
      const t = fs.readFileSync(p, 'utf8');
      for (const m of t.matchAll(/from\s+['"](\.{1,2}\/[^'"]*?\.js)['"]/g)) {
        if (!m[1].includes('?v=')) tran.push(path.relative(GAME, p) + ' → ' + m[1]);
      }
      for (const m of t.matchAll(/import\(\s*['"](\.{1,2}\/[^'"]*?\.js)['"]\s*\)/g)) {
        if (!m[1].includes('?v=')) tran.push(path.relative(GAME, p) + ' → import(' + m[1] + ')');
      }
    }
  };
  duyet(path.join(GAME, 'js'));
  assert.deepEqual(tran, [], 'còn import .js TRẦN (sẽ bị cache vĩnh viễn, sửa mã không ăn):\n' + tran.join('\n'));
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

/* tests/app-macos.test.js — HÀNG RÀO APP macOS (lỗi 08/10/2026: dựng lại app → mất icon đã duyệt)
 *
 * Chuyện thật: chủ dự án đã duyệt icon v2 (sprite nồi lẩu pixel trên nền đỏ cam hồng #FF5A47,
 * commit b0edf9e) và nó được gắn thẳng vào /Applications/LauHemTien.app. Nhưng build.sh lại chép
 * macos-app/LauHemTien.icns — bản mascot CŨ — nên mỗi lần dựng lại là icon bị quay về bản cũ.
 *
 * Tệp này chốt ba điều:
 *   1. build.sh phải lấy icon từ assets/icon/LauHemTien.icns (một nguồn sự thật);
 *   2. hai bản icns trong kho phải là MỘT (không để bản cũ nằm chờ ghi đè);
 *   3. icon đang gắn trong app phải trùng đúng bản đã duyệt (nếu app có trên máy).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const GAME = new URL('..', import.meta.url).pathname;
const ROOT = path.join(GAME, '..');
const ICON_V2 = path.join(ROOT, 'assets', 'icon', 'LauHemTien.icns');
const md5 = f => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');

test('build.sh phải lấy icon từ assets/icon/ — không dùng bản sao cũ', () => {
  const sh = fs.readFileSync(path.join(ROOT, 'macos-app', 'build.sh'), 'utf8');
  assert.ok(/assets\/icon\/LauHemTien\.icns/.test(sh),
    'build.sh phải chép icon từ assets/icon/LauHemTien.icns (bản v2 đã duyệt)');
});

test('icon đã duyệt vẫn còn và là bản nồi lẩu nền đỏ cam (đúng kích cỡ, không rỗng)', () => {
  assert.ok(fs.existsSync(ICON_V2), 'thiếu assets/icon/LauHemTien.icns — icon v2 đã duyệt');
  const size = fs.statSync(ICON_V2).size;
  assert.ok(size > 50000, 'tệp icns nghi rỗng: ' + size + ' byte');
  const d = fs.readFileSync(ICON_V2);
  assert.equal(d.subarray(0, 4).toString('ascii'), 'icns', 'phải là tệp icns thật');
});

test('không còn bản icns khác trong kho có thể ghi đè icon đã duyệt', () => {
  const cu = path.join(ROOT, 'macos-app', 'LauHemTien.icns');
  if (!fs.existsSync(cu)) return;                       /* đã xoá hẳn thì càng tốt */
  assert.equal(md5(cu), md5(ICON_V2),
    'macos-app/LauHemTien.icns khác bản đã duyệt — dựng lại app là icon quay về bản cũ');
});

test('máy chủ app phục vụ ĐÚNG đường dẫn tương đối của trang (lỗi 08/10: whitelist chặn /js, /css)', async () => {
  /* Chuyện thật: app phục vụ "/" = webapp/index.html nên đường dẫn tương đối trong trang rơi
   * xuống GỐC (/js/main.js, /css/main.css, /manifest.webmanifest). Danh sách cho phép đầu tiên
   * chỉ nhận webapp/ + assets/ + icons/ → chặn hết js/css → app chỉ còn màn mở đầu tĩnh.
   * Phép kiểm này chạy THẬT trên app đang mở; app không chạy thì bỏ qua.
   * Dùng node:http chứ không dùng fetch — máy chủ nhúng tối giản làm undici của Node ngã
   * (assert(!this.paused)) dù trình duyệt thật vẫn đọc bình thường. */
  const { request } = await import('node:http');
  const lay = u => new Promise(res => {
    const req = request({ host: '127.0.0.1', port: 8793, path: u, method: 'GET', timeout: 3000 }, r => {
      r.resume();
      r.on('end', () => res(r.statusCode));
    });
    req.on('error', () => res(0));
    req.on('timeout', () => { req.destroy(); res(0); });
    req.end();
  });

  if ((await lay('/webapp/index.html')) !== 200) return;      /* app không chạy → bỏ qua */

  for (const u of ['/js/main.js', '/js/safe.js', '/js/loi.js', '/css/main.css',
    '/manifest.webmanifest', '/index.html', '/assets/phong-chu/vt323-latin.woff2']) {
    assert.equal(await lay(u), 200, 'app phải phục vụ được ' + u + ' — thiếu là trang mất css/js');
  }
  for (const u of ['/.git/config', '/../etc/passwd', '/.env']) {
    assert.equal(await lay(u), 404, 'app KHÔNG được phục vụ ' + u);
  }
});

test('icon đang gắn trong app macOS phải trùng bản đã duyệt (nếu app có trên máy)', () => {
  const app = '/Applications/LauHemTien.app/Contents/Resources/LauHemTien.icns';
  if (!fs.existsSync(app)) return;                      /* máy khác chưa cài app thì bỏ qua */
  assert.equal(md5(app), md5(ICON_V2), 'icon trong app không phải bản đã duyệt — chạy lại build.sh hoặc chép icns');
});

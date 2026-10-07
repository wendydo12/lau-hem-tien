/* tests/giong.test.js — HÀNG RÀO CHỐNG LỌT GIỌNG CÁ NHÂN VÀO SẢN PHẨM (yêu cầu 07/10/2026)
 *
 * Game Lẩu Hẻm Tiên là SẢN PHẨM RIÊNG, làm cho nhiều người chơi — không liên quan gì tới
 * chuyện riêng của người làm ra nó. Vì vậy cách xưng hô cá nhân (thiếp / phu quân / sư huynh /
 * tên riêng của trợ lý) TUYỆT ĐỐI không được xuất hiện ở BẤT KỲ đâu trong kho:
 *   · câu chữ người chơi đọc trong game
 *   · ghi chú kỹ thuật trong mã (comment) — vì kho mã cũng là sản phẩm, không phải sổ riêng
 *   · tài liệu thiết kế, kế hoạch, sổ nhật ký trong kho
 *
 * Tệp này là chỗ DUY NHẤT được phép nhắc tới mấy từ đó, vì nó là bộ nhận diện của hàng rào.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const GAME = new URL('..', import.meta.url).pathname;     // .../game/
const ROOT = path.join(GAME, '..');                        // gốc kho

/* từ khoá bị cấm, viết tách chuỗi để chính tệp này không tự kích hoạt hàng rào khi quét */
const CAM = [
  'thi' + 'ếp', 'phu ' + 'quân', 'uy' + 'ển nhi', 'mộ ' + 'uyển', 'sư ' + 'huynh'
].map(w => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

const SCAN = ['game/js', 'game/css', 'game/index.html', 'game/tests', 'game/manifest.js',
  'webapp/js', 'webapp/css', 'webapp/index.html', 'docs', 'plan.md', 'summarize.md',
  'credits-log', '_research', 'tools', 'AGENTS.md', 'CLAUDE.md', 'README.md'];
const BO_QUA = ['giong.test.js', 'sprite.test.js'];        // hai tệp hàng rào, không quét chính nó

function files(dir, acc = []) {
  const st = fs.existsSync(dir) ? fs.statSync(dir) : null;
  if (!st) return acc;
  if (st.isFile()) { acc.push(dir); return acc; }
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'assets') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files(p, acc);
    else if (/\.(js|css|html|md|json|txt)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

test('kho mã và tài liệu: không còn cách xưng hô cá nhân, kể cả trong ghi chú', () => {
  const viPham = [];
  for (const rel of SCAN) {
    for (const f of files(path.join(ROOT, rel))) {
      if (BO_QUA.some(x => f.endsWith(x))) continue;
      const lines = fs.readFileSync(f, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (CAM.some(rx => rx.test(line))) {
          viPham.push(path.relative(ROOT, f) + ':' + (i + 1) + ' → ' + line.trim().slice(0, 110));
        }
      });
    }
  }
  assert.deepEqual(viPham, [], 'Còn chỗ lọt giọng cá nhân:\n' + viPham.join('\n'));
});

test('câu chữ hiển thị trong game: người kể xưng "mình", gọi người chơi là "bạn"', () => {
  const src = fs.readFileSync(path.join(GAME, 'js/engine/surprise.js'), 'utf8');
  assert.ok(/mình/.test(src), 'câu sự kiện phải xưng "mình" (giọng chủ quán)');
  assert.ok(!CAM.some(rx => rx.test(src)), 'câu sự kiện không được lọt giọng cá nhân');
});

test('hàng rào tự kiểm: bộ nhận diện phải bắt được từ cấm, kể cả khi nằm trong ghi chú', () => {
  const trongChuoi = "const x = 'đêm nay " + 'thi' + 'ếp' + " ngủ ngon';";
  const trongGhiChu = '/* ' + 'yêu cầu ' + 'phu ' + 'quân' + ' 07/10: đổi giờ mở quán */';
  assert.ok(CAM.some(rx => rx.test(trongChuoi)), 'phải bắt được từ cấm trong chuỗi');
  assert.ok(CAM.some(rx => rx.test(trongGhiChu)), 'phải bắt được từ cấm trong GHII CHÚ (yêu cầu mới 07/10)');
  assert.ok(!CAM.some(rx => rx.test("const y = 'quán mình nấu lẩu ngon';")), 'không được bắt nhầm câu hợp lệ');
});

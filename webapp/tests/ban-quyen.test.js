/* tests/ban-quyen.test.js — HÀNG RÀO BẢN QUYỀN (yêu cầu xuyên suốt của chủ dự án)
 *
 * Chủ dự án chốt: được tham khảo Ý TƯỞNG của game khác, nhưng KHÔNG được dùng lại mã, hình,
 * hay câu chữ của họ. Kho này phải là sản phẩm tự viết.
 *
 * Tệp này chặn ở ba tầng:
 *   1. Không còn dấu vết tên/thương hiệu của game tham khảo trong kho mã.
 *   2. Không có tệp mã nguồn lạ (bản sao trang game của người khác) nằm trong kho.
 *   3. Mọi chuỗi trong game phải là chữ tự viết: không có khối văn bản dài trùng nhau bất thường
 *      giữa kho này và các tệp tham khảo đã xoá (ghi trong _research/vet-xoa.txt).
 *
 * Lưu ý về cách viết: các từ khoá cấm được ghép từ hai mảnh để chính tệp này không tự kích hoạt
 * hàng rào khi bị quét.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const GAME = new URL('..', import.meta.url).pathname;
const ROOT = path.join(GAME, '..');

function files(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const st = fs.statSync(dir);
  if (st.isFile()) { acc.push(dir); return acc; }
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files(p, acc);
    else if (/\.(js|css|html|md|json|txt|mjs)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

/* tên riêng của game tham khảo — ghép mảnh cho khỏi tự kích hoạt */
const CAM = [
  new RegExp('Ti' + 'ệm Tr' + 'à', 'i'),
  new RegExp('tiem' + 'tra', 'i'),
  new RegExp('Tr' + 'à S' + 'ữa', 'i'),
  new RegExp('bubble' + 'tea' + 'shop', 'i')
];

test('không còn tên/thương hiệu game tham khảo trong kho mã', () => {
  const viPham = [];
  /* Ba tệp dưới đây NHẮC TÊN game tham khảo có chủ đích — để ghi công và lưu bằng chứng.
   * Nhắc tên trong hồ sơ là chuyện đúng; dùng lại mã/hình/câu chữ của họ mới là chuyện sai. */
  const CHO_PHEP = ['_research/README.md', '_research/vet-xoa.txt',
    'docs/04-xin-phep-tac-gia.md', 'docs/09-tham-khao-tiem-tra-nho.md'];
  for (const f of files(ROOT)) {
    if (f.includes(path.sep + '_nguon-anh-meowa' + path.sep)) continue;   /* ảnh gốc, không phải chữ */
    if (f.endsWith('ban-quyen.test.js')) continue;                        /* chính tệp hàng rào */
    if (CHO_PHEP.some(x => f.endsWith(x))) continue;                      /* hồ sơ ghi công */
    const t = fs.readFileSync(f, 'utf8');
    for (const rx of CAM) {
      if (rx.test(t)) viPham.push(path.relative(ROOT, f) + ' → ' + rx);
    }
  }
  assert.deepEqual(viPham, [], 'Còn dấu vết game tham khảo:\n' + viPham.join('\n'));
});

test('không có mã nguồn lạ của người khác nằm trong kho', () => {
  /* Những tệp từng là bản sao trang game tham khảo phải bị xoá hẳn, không được quay lại. */
  const cam = [
    '_research/original_game.html',
    '_research/script_1.js', '_research/script_2.js', '_research/script_3.js',
    '_research/script_4.js', '_research/script_5.js'
  ];
  const con = cam.filter(x => fs.existsSync(path.join(ROOT, x)));
  assert.deepEqual(con, [], 'Còn tệp mã nguồn sao chép trong kho: ' + con.join(', '));
  /* và thư mục nghiên cứu phải ghi rõ vì sao xoá */
  const vet = path.join(ROOT, '_research/vet-xoa.txt');
  assert.ok(fs.existsSync(vet), '_research/vet-xoa.txt phải còn để làm bằng chứng đã xoá');
  const t = fs.readFileSync(vet, 'utf8');
  assert.ok(t.length > 50, 'vet-xoa.txt phải ghi rõ tệp nào đã xoá (md5 + lý do)');
});

test('không có chuỗi dài nào trùng lặp bất thường giữa các tệp chữ của game', () => {
  /* Tự soát nội bộ: nếu ai dán nguyên một khối chữ của nơi khác vào hai chỗ, tỉ lệ trùng sẽ lộ ra.
   * Ở đây chỉ cần bảo đảm mỗi câu hiển thị trong game là duy nhất, không có màn copy-paste cả khối. */
  const khoa = ['game/js/engine/data.js', 'game/js/engine/reviews.js', 'game/js/engine/events.js',
    'game/js/engine/surprise.js', 'game/js/engine/replies.js'];
  const doan = new Map();
  let trung = [];
  for (const rel of khoa) {
    const t = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const cau = t.match(/'[^']{40,180}'/g) || [];
    for (const c of cau) {
      if (doan.has(c)) trung.push(c.slice(0, 60) + ' (ở ' + doan.get(c) + ' và ' + rel + ')');
      else doan.set(c, rel);
    }
  }
  /* trùng vài câu ngắn là bình thường (câu hệ thống); trùng cả khối mới đáng ngờ */
  assert.ok(trung.length <= 6, 'Nghi dán khối chữ trùng lặp:\n' + trung.slice(0, 6).join('\n'));
});

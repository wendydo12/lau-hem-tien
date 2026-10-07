/* tests/luat-giao-dien.test.js — KIỂM LUẬT CHƠI Ở TẦNG GIAO DIỆN (đọc mã main.js)
 *
 * Vì sao cần: mấy luật dưới đây do chủ dự án chốt bằng lời, nhưng trước đây chỉ nằm trong
 * mã main.js — không có gì chặn nếu ai đó sửa lại. Ba luật đó là:
 *   1. QUÁN TRỐNG ĐỦ LÂU + ĐÃ ĐỦ TRẦN KHÁCH → tự đóng cửa sau autoCloseSec giây (chốt 06/10: 15 giây).
 *   2. MỖI KHÁCH BỊ HẾT HÀNG CHỈ BÁO MỘT LẦN — không dội thông báo liên tục.
 *   3. TRẦN KHÁCH MỘT NGÀY lấy từ màn chuẩn bị (số "👥 ~X khách").
 * Tệp này đọc thẳng mã nguồn để bắt lỗi "sửa lại rồi quên luật".
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { makeCFG } from '../js/engine/config.js';

const GAME = new URL('..', import.meta.url).pathname;
const main = fs.readFileSync(path.join(GAME, 'js/main.js'), 'utf8');
const cfg = makeCFG();

test('tự đóng cửa: đúng 15 giây quán trống liên tục khi đã đủ trần khách', () => {
  assert.equal(cfg.autoCloseSec, 15, 'autoCloseSec phải là 15 giây theo yêu cầu thiết kế');
  assert.ok(/autoCloseCheck/.test(main), 'phải có hàm autoCloseCheck');
  assert.ok(/R\.today\.arrived < R\.today\.cap/.test(main),
    'autoCloseCheck phải CHỜ đủ trần khách mới cho phép đóng (không đóng giữa ca)');
  assert.ok(/R\.slots\.some\(c => c\)/.test(main),
    'còn khách ngồi thì không được tự đóng cửa');
  assert.ok(/R\.emptySince/.test(main), 'phải đếm mốc quán trống liên tục');
});

test('tự đóng cửa gọi endDay (tổng kết) chứ không chỉ tắt ca', () => {
  const i = main.indexOf('function autoCloseCheck');
  const than = main.slice(i, i + 1400);
  assert.ok(/endDay\(\)/.test(than), 'autoCloseCheck phải gọi endDay để ra màn tổng kết');
});

test('hết hàng: dải nhắc dùng lại MỘT phần tử cố định, không tạo mới mỗi lần', () => {
  const i = main.indexOf('function soWarnOn');
  const than = main.slice(i, i + 600);
  assert.ok(/getElementById\('soWarn'\)/.test(than), 'phải dùng một dải nhắc cố định id="soWarn"');
  assert.ok(/if \(!el\)/.test(than), 'chỉ tạo phần tử khi CHƯA có — lần sau dùng lại phần tử cũ');
  assert.ok((than.match(/createElement/g) || []).length <= 1, 'trong hàm nhắc chỉ được tạo phần tử một chỗ');
  assert.ok(/soWarnOff/.test(main), 'phải có hàm tắt dải nhắc khi có khách ngồi được');
});

test('hết hàng: toast bị CHỐNG DỘI (một khách = một lần biết, không spam)', () => {
  assert.ok(/SOLD_TOAST_MS/.test(main), 'phải có hằng số chống dội thông báo hết hàng');
  const m = main.match(/SOLD_TOAST_MS\s*=\s*(\d+)/);
  assert.ok(m, 'SOLD_TOAST_MS phải là một con số (mili giây)');
  const ms = Number(m[1]);
  assert.ok(ms >= 5000, 'thời gian chống dội phải đủ dài để không dội liên tục, thấy ' + ms + 'ms');
  const i = main.indexOf("res.kind === 'soldout'");
  const than = main.slice(i, i + 900);
  assert.ok(/lastSoldToast/.test(than), 'nhánh hết hàng phải kiểm mốc chống dội trước khi hiện toast');
  assert.ok(/soWarnOn\(res\.item\)/.test(than), 'vẫn phải bật dải nhắc hết hàng');
});

test('hết khách: chỉ báo MỘT lần nhờ cờ capTold', () => {
  assert.ok(/capTold/.test(main), 'phải có cờ capTold để thông báo hết khách đúng một lần');
});

test('trần khách một ngày: dùng chung công thức với số ước lượng ở màn chuẩn bị', () => {
  const i = main.indexOf('function guestCapFor');
  const than = main.slice(i, i + 900);
  assert.ok(/traffic\(/.test(than) && /guestCapMul/.test(than),
    'trần khách phải tính từ traffic × guestCapMul — đúng con số ước lượng hiện ở màn chuẩn bị');
  assert.ok(/guestSoftBase/.test(than), 'phải áp trần mềm số khách theo ngày');
  assert.ok(/Math\.max\(3,/.test(than), 'trần không bao giờ nhỏ hơn 3 khách');
});

test('thời gian ca tối do engine/shift.js quyết định, main.js không tự bịa nhịp', () => {
  assert.ok(/arrivals/.test(main), 'nhịp khách phải đọc từ lịch R.arrivals của ca');
  assert.ok(!/function spawnRate/.test(main), 'hàm spawnRate cũ phải bị bỏ hẳn (ghi chú nhắc lại thì không sao)');
});

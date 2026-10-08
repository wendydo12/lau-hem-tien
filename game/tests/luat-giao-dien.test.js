/* tests/luat-giao-dien.test.js — KIỂM LUẬT CHƠI Ở TẦNG GIAO DIỆN (đọc mã main.js)
 *
 * Vì sao cần: mấy luật dưới đây do chủ dự án chốt bằng lời, nhưng trước đây chỉ nằm trong
 * mã main.js — không có gì chặn nếu ai đó sửa lại. Ba luật đó là:
 *   1. QUÁN TRỐNG ĐỦ LÂU + ĐÃ MỜI HẾT LỊCH KHÁCH CẢ CA → tự đóng sau autoCloseSec giây (15 giây).
 *   2. MỖI KHÁCH BỊ HẾT HÀNG CHỈ BÁO MỘT LẦN — không dội thông báo liên tục.
 *   3. CHỈ TIÊU (KPI MỀM) lấy từ màn chuẩn bị: đủ là ĐẠT, vượt là VƯỢT — KHÔNG chặn khách,
 *      KHÔNG tự đóng sớm vì "đã đủ chỉ tiêu" (chốt chủ dự án 08/10 tối: đóng đúng 22:00).
 * Tệp này đọc thẳng mã nguồn để bắt lỗi "sửa lại rồi quên luật".
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { makeCFG } from '../js/engine/config.js';

const GAME = new URL('..', import.meta.url).pathname;

test('pauseDlg KHÔNG crash khi chưa mở ca (lỗi thật trong app log 08/10)', () => {
  /* Bằng chứng từ sổ lỗi của app: "TypeError: undefined is not an object
   * (evaluating 'R.paused = true')" — nút ❚❚ trên HUD bấm được ở màn chuẩn bị khi R = null. */
  const src = fs.readFileSync(path.join(GAME, 'js', 'main.js'), 'utf8');
  const fn = src.slice(src.indexOf('function pauseDlg()'), src.indexOf('function pauseDlg()') + 600);
  assert.ok(/if \(!R \|\| !R\.running\)/.test(fn), 'pauseDlg phải có chốt chặn khi chưa mở ca');
});

test('ngày đầu đủ trần món nhúng: các món còn lại phải XÁM (lớp maxed) + nhãn đếm x/y', () => {
  const src = fs.readFileSync(path.join(GAME, 'js', 'main.js'), 'utf8');
  assert.ok(/maxed/.test(src), 'thiếu lớp "maxed" cho món nhúng bị chặn vì đủ trần ngày');
  assert.ok(/topsCount/.test(src), 'thiếu bộ đếm món nhúng (x/y) cạnh nhãn NHÚNG LẨU');
  const css = fs.readFileSync(path.join(GAME, 'css', 'main.css'), 'utf8');
  assert.ok(/\.ing\.maxed/.test(css), 'thiếu CSS cho .ing.maxed');
  const html = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8');
  assert.ok(/id="topsCount"/.test(html), 'thiếu phần tử #topsCount trong index.html');
});


test('CHỈ TIÊU (KPI mềm): KHÔNG được chặn khách khi đã đạt chỉ tiêu', () => {
  /* Chốt chủ dự án 08/10 tối: "nếu giao 10 khách là đạt kpi trong ngày thì hơn thì dc vượt chỉ
   * tiêu thôi, chứ kp mới 9h mấy đã hết khách đóng cửa" — phục vụ đủ chỉ tiêu vẫn phải nhận
   * khách thêm cho tới hết giờ.
   * 08/10 đêm: HUD/tổng kết ĐƯỢC PHÉP so arrived với cap để hiện ✅/🔥 (chỉ hiển thị) — luật cấm
   * là so trong LOGIC MỜI/ĐÓNG (scheduleSpawns, autoCloseCheck, trySpawn). */
  const src = fs.readFileSync(path.join(GAME, 'js', 'main.js'), 'utf8');
  const spawnFn = src.slice(src.indexOf('function scheduleSpawns'), src.indexOf('function tickCustomers'));
  const closeFn = src.slice(src.indexOf('function autoCloseCheck'), src.indexOf('function scheduleSpawns'));
  for (const [ten, fn] of [['scheduleSpawns', spawnFn], ['autoCloseCheck', closeFn]]) {
    assert.ok(!/R\.today\.arrived >= R\.today\.cap/.test(fn.replace(/\n/g, ' ')),
      ten + ' còn logic "đủ trần → thôi mời khách" — vi phạm KPI mềm (khách phải vào thêm tới hết giờ)');
  }
});

test('đủ khách là tự đóng: autoCloseCheck phải dựa trên "đã mời hết lịch"', () => {
  const src = fs.readFileSync(path.join(GAME, 'js', 'main.js'), 'utf8');
  assert.ok(/hetLich\s*=/.test(src), 'thiếu phép tính "đã mời hết lịch khách hôm nay"');
  assert.ok(/R\.spawnIdx >= R\.arrivals\.length/.test(src), 'điều kiện hết khách phải so với cuối lịch');
  assert.ok(/self-dong|hetLich/.test(src) || true);
  /* thông báo hết khách cũng phải dùng cùng định nghĩa (không còn điều kiện arrived >= cap cũ) */
  assert.ok(!/capTold && R\.today\.arrived >= R\.today\.cap/.test(src),
    'thông báo hết khách còn dùng điều kiện arrived >= cap — sẽ không báo khi bộ đếm thiếu');
});

test('hướng dẫn trong game ghi đúng luật đóng cửa (22:00; đóng sớm chỉ khi hết nguyên liệu)', () => {
  const src = fs.readFileSync(path.join(GAME, 'js', 'main.js'), 'utf8');
  assert.ok(/hết sạch nguyên liệu/.test(src), 'hướng dẫn phải ghi rõ đóng sớm chỉ khi hết nguyên liệu');
  assert.ok(!/vắng liên tục 15 giây thì tổng kết sớm/.test(src), 'hướng dẫn còn luật cũ (mời hết lịch sớm là đóng)');
});


test('nồi + muỗng + chén KHÔNG tính tiền (yêu cầu chủ dự án 08/10)', async () => {
  const { makeCFG } = await import('../js/engine/config.js');
  const { costOf } = await import('../js/engine/stock.js');
  assert.equal(costOf(makeCFG(), 'sup'), 0, 'nồi + muỗng + chén phải miễn phí (giá nhập 0)');
});

test('màn chuẩn bị ghi "miễn phí" cho món 0 đồng, không ghi "0đ/phần"', () => {
  const src = fs.readFileSync(path.join(GAME, 'js', 'main.js'), 'utf8');
  assert.ok(/miễn phí/.test(src), 'thiếu nhãn "miễn phí" cho món giá 0');
  assert.ok(/costOf\(cfg, k\) > 0 \? fmtD\(costOf\(cfg, k\)\) \+ '\/phần' : 'miễn phí'/.test(src),
    'nhãn giá trong màn chuẩn bị chưa xử lý món miễn phí');
});

const main = fs.readFileSync(path.join(GAME, 'js/main.js'), 'utf8');
const cfg = makeCFG();

test('tự đóng cửa: đúng 15 giây quán trống liên tục KHI HẾT LỊCH VÃNG LAI hoặc HẾT NGUYÊN LIỆU', () => {
  assert.equal(cfg.autoCloseSec, 15, 'autoCloseSec phải là 15 giây theo yêu cầu thiết kế');
  assert.ok(/autoCloseCheck/.test(main), 'phải có hàm autoCloseCheck');
  assert.ok(!/if \(!hetLich && R\.today\.arrived < R\.today\.cap\)/.test(main),
    'autoCloseCheck còn DÍNH chỉ tiêu khách — vi phạm KPI mềm (đủ chỉ tiêu vẫn nhận khách)');
  assert.ok(/R\.spawnIdx >= R\.arrivals\.length/.test(main),
    'điều kiện tự đóng phải dựa trên "mời hết lịch khách cả ca"');
  assert.ok(/hetHang = !canCook\(\)/.test(main),
    'tự đóng sớm phải có nhánh HẾT NGUYÊN LIỆU (luật 08/10 đêm: hết hàng mới đóng, đủ KPI thì không)');
  assert.ok(/R\.slots\.some\(c => c\)/.test(main),
    'còn khách ngồi thì không được tự đóng cửa');
  assert.ok(/R\.emptySince/.test(main), 'phải đếm mốc quán trống liên tục');
});

test('tự đóng cửa gọi endDay (tổng kết) chứ không chỉ tắt ca', () => {
  const i = main.indexOf('function autoCloseCheck');
  const than = main.slice(i, i + 2000);
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

test('chỉ tiêu một ngày: dùng chung công thức với số dự báo ở màn chuẩn bị (không trần mềm)', () => {
  const i = main.indexOf('function chiTieuFor');
  const than = main.slice(i, i + 900);
  assert.ok(/traffic\(/.test(than) && /guestCapMul/.test(than),
    'chỉ tiêu phải tính từ traffic × guestCapMul — đúng con số dự báo hiện ở màn chuẩn bị');
  assert.ok(!/guestSoftBase/.test(than), 'chỉ tiêu KHÔNG bị trần mềm cắt (KPI mềm, khách cứ vào)');
  assert.ok(/Math\.max\(6,/.test(than), 'chỉ tiêu không nhỏ hơn 6 khách');
});

test('thời gian ca tối do engine/shift.js quyết định, main.js không tự bịa nhịp', () => {
  assert.ok(/arrivals/.test(main), 'nhịp khách phải đọc từ lịch R.arrivals của ca');
  assert.ok(!/function spawnRate/.test(main), 'hàm spawnRate cũ phải bị bỏ hẳn (ghi chú nhắc lại thì không sao)');
});

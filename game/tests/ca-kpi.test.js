/* tests/ca-kpi.test.js — khoá luật CA TỐI chốt 08/10 tối (chủ dự án):
 *   "chỉnh lại khi nào hết giờ tức 10h tối đúng thì mới hết khách và đóng cửa kiểu nếu giao
 *    10 khách là đạt kpi trong ngày thì hơn thì dc vượt chỉ tiêu thôi, chứ kp mới 9h mấy
 *    đã hết khách đóng cửa"
 * Bốn luật:
 *   L1. Ca 19:00 → 22:00 (SHIFT.endH = 22) — đóng cửa ĐÚNG 22:00, không phải 23:00.
 *   L2. Chỉ tiêu (KPI) là mức MỀM: đủ là đạt, vượt càng tốt — KHÔNG chặn khách khi đã đủ.
 *   L3. KHÔNG tự đóng sớm chỉ vì đạt chỉ tiêu — tự đóng duy nhất khi hết lịch khách cả ca
 *       (+ quán trống đủ 15 giây). "9h mấy đã đóng cửa" là lỗi cấm.
 *   L4. Đúng 22:00 (el >= shiftMs) phải endDay — đếm từ lúc mở cửa. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SHIFT, shiftMs } from '../js/engine/shift.js';

const GAME = new URL('..', import.meta.url).pathname;
const main = fs.readFileSync(path.join(GAME, 'js/main.js'), 'utf8');
const shiftSrc = fs.readFileSync(path.join(GAME, 'js/engine/shift.js'), 'utf8');

test('L1 · ca tối 19:00 → 22:00, cả ca 144 giây (đóng cửa đúng 10h tối)', () => {
  assert.equal(SHIFT.startH, 19);
  assert.equal(SHIFT.endH, 22, 'SHIFT.endH phải là 22 — đóng cửa 10h tối');
  assert.equal(shiftMs(), 144000);
  assert.ok(!/endH:\s*23/.test(shiftSrc), 'shift.js còn ghi endH 23 (bản cũ)');
  assert.ok(!/'23:00'/.test(main.replace(/[^']*23:00[^']*/g, "'")), 'main.js còn nhắc 23:00 làm giờ đóng');
});

test('L2 · KPI mềm: scheduleSpawns KHÔNG được chặn khách khi arrived >= cap', () => {
  const i = main.indexOf('function scheduleSpawns');
  const than = main.slice(i, i + 3200);
  assert.ok(!/arrived >= R\.today\.cap/.test(than),
    'scheduleSpawns còn chặn khách khi đủ trần — vi phạm "hơn thì dc vượt chỉ tiêu"');
  assert.ok(/KPI mềm/.test(than), 'scheduleSpawns phải ghi chú KPI mềm để ai sửa cũng thấy luật');
});

test('L3 · autoCloseCheck không dính chỉ tiêu: tự đóng chỉ khi hết lịch vãng lai hoặc hết nguyên liệu', () => {
  const i = main.indexOf('function autoCloseCheck');
  const than = main.slice(i, i + 1600);
  assert.ok(!/R\.today\.arrived < R\.today\.cap/.test(than),
    'autoCloseCheck còn đợi đủ trần khách — sẽ kẹt không đóng, hoặc ngược lại đóng theo chỉ tiêu');
  assert.ok(/R\.spawnIdx >= R\.arrivals\.length/.test(than),
    'phải dựa trên "mời hết lịch khách cả ca"');
  assert.ok(/hetHang/.test(than), 'phải có nhánh hết nguyên liệu (luật 08/10 đêm)');
  assert.ok(/emptySince/.test(than) && /15|autoCloseSec/.test(than),
    'vẫn phải trống đủ autoCloseSec giây rồi mới đóng');
});

test('L4 · đúng 22:00 (shiftMs) phải endDay — giờ hết giờ là nơi duy nhất kết thúc ca', () => {
  const i = main.indexOf('dayTimer = setInterval');
  const than = main.slice(i, i + 900);
  assert.ok(/el >= R\.shiftMs\) endDay\(\)/.test(than.replace(' ', ' ').replace('  ', ' ')) ||
      /el >= R\.shiftMs\)\s*endDay\(\)/.test(than),
    'tick 100ms phải kết thúc ca khi el >= shiftMs (22:00)');
});
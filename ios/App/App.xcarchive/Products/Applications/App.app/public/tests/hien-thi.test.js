/* tests/hien-thi.test.js — HÀNG RÀO HIỂN THỊ vs TIỀN TRỪ THẬT
 *
 * Bài học 08/10: sau khi thêm hệ số cân bằng, giá nhập thật = giá gốc × costMul. Màn chuẩn bị
 * vẫn in giá GỐC nên người chơi thấy 8.000đ mà bị trừ 12.800đ. Tệp này chặn việc in giá gốc
 * ở bất kỳ đâu trong giao diện: mọi chỗ hiện giá nhập phải đi qua costOf().
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ITEMS } from '../js/engine/data.js';
import { costOf } from '../js/engine/stock.js';
import { makeCFG } from '../js/engine/config.js';

const GAME = new URL('..', import.meta.url).pathname;
const main = fs.readFileSync(path.join(GAME, 'js/main.js'), 'utf8');

test('giao diện: không in giá nhập GỐC (phải dùng costOf để khớp tiền trừ thật)', () => {
  const xau = [...main.matchAll(/fmtD\(\s*it\.cost\s*\)|fmtD\(\s*ITEMS\[[^\]]+\]\.cost\s*\)/g)].map(m => m[0]);
  assert.deepEqual(xau, [], 'Còn chỗ in giá gốc: ' + xau.join(', ') + ' — dùng fmtD(costOf(cfg, k))');
  assert.ok(main.includes('fmtD(costOf(cfg, k))'), 'màn chuẩn bị phải hiện giá nhập theo costOf');
});

test('giá nhập hiển thị = giá nhập thật (có nhân hệ số cân bằng)', () => {
  const cfg = makeCFG();
  assert.ok(cfg.balance.costMul > 1, 'phải có hệ số cân bằng lớn hơn 1');
  for (const k of ['ca_chua', 'nam', 'suon', 't_bo']) {
    assert.notEqual(costOf(cfg, k), ITEMS[k].cost, k + ' phải được nhân hệ số');
    assert.equal(costOf(cfg, k), Math.round(ITEMS[k].cost * cfg.balance.costMul));
  }
  /* riêng nồi + muỗng + chén là ĐỒ DÙNG, không phải nguyên liệu: giá 0 và hệ số không đụng tới
   * (yêu cầu chủ dự án 08/10 "nồi muỗng chén thì ko tính tiền") */
  assert.equal(ITEMS.sup.cost, 0, 'nồi + muỗng + chén phải có giá gốc 0');
  assert.equal(costOf(cfg, 'sup'), 0, 'nhân hệ số 0 vẫn phải là 0 — không được tự thêm tiền');
});

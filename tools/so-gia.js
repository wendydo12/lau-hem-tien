#!/usr/bin/env node
/* So giá nhập: giá gốc trong data.js  vs  giá đang hiện trong game */
import { makeCFG } from '../game/js/engine/config.js';
import { ITEMS, POT_KEYS, BASE_PRICE } from '../game/js/engine/data.js';
import { costOf } from '../game/js/engine/stock.js';

const cfg = makeCFG();
const mul = cfg.balance?.costMul ?? 1;
console.log('HỆ SỐ NHÂN GIÁ NHẬP (costMul) =', mul);
console.log('');
const ten = ['t_trung', 't_rau_muong', 't_bun', 't_mien', 't_mi_goi', 't_bo', 't_bo_vien', 't_cai_ngot'];
console.log('MÓN'.padEnd(16), 'GIÁ GỐC'.padStart(9), 'HIỆN TẠI'.padStart(10), 'GIÁ BÁN'.padStart(9), 'LÃI/PHẦN'.padStart(9));
for (const k of ten) {
  const it = ITEMS[k]; if (!it) continue;
  const goc = it.cost, hien = costOf(cfg, k);
  const ban = cfg.sell?.[k] ?? BASE_PRICE?.[k] ?? it.sell;
  console.log(String(it.n).padEnd(16), String(goc).padStart(9), String(hien).padStart(10), String(ban).padStart(9), String(ban - hien).padStart(9));
}
console.log('');
console.log('NỒI LẨU:');
for (const k of POT_KEYS.slice(0, 5)) {
  const it = ITEMS[k];
  const goc = it.cost, hien = costOf(cfg, k);
  const ban = cfg.sell?.[k] ?? BASE_PRICE?.[k] ?? it.sell;
  console.log('  ' + String(it.n).padEnd(22), 'gốc', String(goc).padStart(6), '→ nay', String(hien).padStart(6), '· bán', String(ban).padStart(7), '· lãi', String(ban - hien).padStart(7));
}

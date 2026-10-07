#!/usr/bin/env node
/* ĐO PHÂN BỐ ĐƠN HÀNG theo ngày — soi từng chi tiết có "cân" không:
 *   cỡ nồi (L) · số NỒI mỗi khách · có nước chấm · mức cay · số món nhúng.
 * Dùng chính engine (orders.js + potCount), không đụng DOM.
 * Lưu ý cấu trúc: mỗi "ly" (cup) là một lần genOrder; số nồi mỗi khách do potCount quyết định. */
import { makeCFG } from '../game/js/engine/config.js';
import { fresh } from '../game/js/engine/state.js';
import { genOrder, potCount } from '../game/js/engine/orders.js';
import { makeRNG } from '../game/js/engine/rng.js';

const cfg = makeCFG();
const N = Number(process.argv[2] || 3000);
const ngay = (process.argv[3] || '1,3,5,8,12,20,30,46,60').split(',').map(Number);
const pt = (n, t) => (100 * n / t).toFixed(1).padStart(5) + '%';

const S = fresh(cfg);
const napKho = d => { for (const k of Object.keys(S.stock)) S.stock[k] = [{ q: 999, exp: d + 99 }]; };

console.log('NGÀY | cỡ Lớn | nước chấm | cay | số nồi mỗi khách (1/2/3/4/5) | món nhúng tb | ly mỗi khách');
for (const d of ngay) {
  S.day = d; napKho(d);
  const rng = makeRNG(4242 + d);
  let L = 0, cham = 0, cay = 0, tongTop = 0, ly = 0;
  const demNoi = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < N; i++) {
    const soNoi = potCount(d, rng);
    demNoi[Math.min(5, soNoi)]++;
    for (let c = 0; c < soNoi; c++) {
      const o = genOrder(S, cfg, rng);
      if (o.size === 'L') L++;
      if (o.dip) cham++;
      if (o.spicy && o.spicy !== 'Không cay') cay++;
      tongTop += o.tops.length;
      ly++;
    }
  }
  console.log(
    String(d).padStart(4), '|', pt(L, ly), '|', pt(cham, ly), '|', pt(cay, ly), '|',
    demNoi.slice(1).map(n => pt(n, N)).join(' / ').padEnd(40),
    '|', (tongTop / ly).toFixed(2), '|', (ly / N).toFixed(2)
  );
}

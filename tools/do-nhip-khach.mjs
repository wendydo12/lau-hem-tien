#!/usr/bin/env node
/* ĐO NHỊP KHÁCH TRONG CA THẬT (sau khi bật "khách vào liên tục")
 * Mô phỏng đúng vòng lặp của main.js: khách chỉ ghé khi còn chỗ ngồi, được đẩy nhanh tối đa
 * `moiNhanhNhat` lần so với nhịp nền; chủ quán phục vụ sau mỗi `giayPhucVu` giây.
 * Không đụng DOM — chỉ đo để biết nhịp có thật sự liên tục không. */
import { shiftMs, buildArrivals, MIN_GAP_MS } from '../game/js/engine/shift.js';
import { makeCFG } from '../game/js/engine/config.js';

const cfg = makeCFG();
const nhanh = cfg.balance?.moiNhanhNhat ?? 3;
const rng = (s => { let x = s; return { next: () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648 }; })(7);

const cap = Number(process.argv[2] || 12);
const soCho = Number(process.argv[3] || 3);
const giayPhucVu = Number(process.argv[4] || 20);
const total = shiftMs();
const lich = buildArrivals(cap, total, rng);

/* mô phỏng từng 0,25 giây */
const cho = new Array(soCho).fill(null);      /* thời điểm khách rời chỗ (ms) */
let idx = 0, lastArrival = -1e9, arrived = 0, khe = [], ban = 0;
for (let t = 0; t <= total; t += 250) {
  const conCho = cho.some(c => c === null);
  const moc = lich[idx];
  if (moc == null) break;
  const somNhat = Math.min(moc, moc / nhanh);
  if (t >= somNhat && conCho && t - lastArrival >= MIN_GAP_MS) {
    const k = cho.indexOf(null);
    cho[k] = t + giayPhucVu * 1000;            /* khách ngồi, chủ quán phục vụ xong sau X giây */
    if (lastArrival > 0) khe.push(t - lastArrival);
    lastArrival = t; arrived++; idx++; ban++;
  }
  for (let k = 0; k < cho.length; k++) if (cho[k] !== null && cho[k] <= t) cho[k] = null;
}
const tb = khe.length ? khe.reduce((a, b) => a + b, 0) / khe.length : 0;
const lon = khe.length ? Math.max(...khe) : 0;
console.log(`trần ${cap} khách · ${soCho} chỗ · phục vụ ${giayPhucVu}s/chỗ`);
console.log(`  khách tới thật: ${ban} · khoảng cách TRUNG BÌNH: ${(tb / 1000).toFixed(1)}s · xa nhất: ${(lon / 1000).toFixed(1)}s`);
console.log(`  khách tới trong 60 giây đầu: ${khe.filter((_, i) => khe.slice(0, i + 1).reduce((a, b) => a + b, 0) < 60000).length + 1}`);

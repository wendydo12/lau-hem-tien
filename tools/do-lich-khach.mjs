#!/usr/bin/env node
/* ĐO LỊCH KHÁCH THẬT: khách cuối cùng đến lúc mấy giờ? (để biết vì sao quán đóng lúc 9h mấy) */
import { SHIFT, shiftMs, clockText, buildArrivals, GUEST_CURVE } from '../game/js/engine/shift.js?v=53';

const rng = (s => { let x = s; return { next: () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648) }; })(20261008);
const total = shiftMs();
console.log(`ca hiện tại: ${SHIFT.startH}:00 → ${SHIFT.endH}:00 · ${total/1000} giây thật · ${total/SHIFT.tickSec/1000} nhịp`);
console.log(`đường cong: ${GUEST_CURVE.map(s => `${Math.round(s.share*100)}% tới mốc ${s.to}`).join(' · ')}`);
console.log();

for (const cap of [9, 10, 12]) {
  for (let van = 0; van < 2; van++) {
    const a = buildArrivals(cap, total, rng);
    const gio = a.map(t => clockText(t));
    const cuoi = a[a.length - 1];
    console.log(`trần ${cap} khách (ván ${van+1}): khách cuối đến ${gio[gio.length-1]} = ${(cuoi/1000).toFixed(0)}s/${(total/1000).toFixed(0)}s (${Math.round(cuoi/total*100)}% ca)`);
    console.log(`   giờ từng khách: ${gio.join(' ')}`);
    /* khe lớn nhất ở phần cuối ca — chỗ quán "chết lặng" */
    let kheLon = 0, tai = 0;
    for (let i = 1; i < a.length; i++) if (a[i]-a[i-1] > kheLon) { kheLon = a[i]-a[i-1]; tai = a[i]; }
    console.log(`   khe lớn nhất ${(kheLon/1000).toFixed(1)}s (kết thúc lúc ${clockText(tai)}) → sau đó quán trống ${(total-tai)/1000|0}s mới hết giờ`);
    console.log();
  }
}

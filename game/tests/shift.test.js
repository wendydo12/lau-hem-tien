/* tests/shift.test.js — CA TỐI: đồng hồ 10 phút/nhịp + đường cong khách (yêu cầu thiết kế 07/10) */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHIFT, shiftMs, clockText, shiftFrac, buildArrivals, GUEST_CURVE, MIN_GAP_MS } from '../js/engine/shift.js';
import { makeRNG } from '../js/engine/rng.js';

test('ca tối: 19:00 → 23:00, nhịp 10 phút, cả ca 192 giây thật', () => {
  assert.equal(SHIFT.startH, 19);
  assert.equal(SHIFT.endH, 23);
  assert.equal(SHIFT.tickMin, 10);
  assert.equal(SHIFT.tickSec, 8);
  assert.equal(shiftMs(), 192000);
});

test('đồng hồ: chỉ hiện mốc 10 phút, đúng giờ mở/đóng cửa', () => {
  assert.equal(clockText(0), '19:00');
  assert.equal(clockText(shiftMs()), '23:00');
  assert.equal(clockText(shiftMs() / 2), '21:00');
  const motNhip = shiftMs() / 24;                 // 8 giây thật = 10 phút game
  assert.equal(clockText(motNhip), '19:10');
  assert.equal(clockText(motNhip * 2), '19:20');
  assert.equal(clockText(motNhip * 23.5), '22:50');
  /* quét cả ca: mọi mốc hiện ra đều là bội số 10 phút */
  for (let i = 0; i <= 200; i++) {
    const txt = clockText(shiftMs() * i / 200);
    const mm = Number(txt.slice(3));
    assert.equal(mm % 10, 0, 'phút phải là mốc 10: ' + txt);
    assert.ok(Number(txt.slice(0, 2)) >= 19 && Number(txt.slice(0, 2)) <= 23, txt);
  }
});

test('tiến độ ca: 0 ở đầu, 1 ở cuối, kẹp trong khoảng', () => {
  assert.equal(shiftFrac(0), 0);
  assert.equal(shiftFrac(shiftMs()), 1);
  assert.equal(shiftFrac(-500), 0);
  assert.equal(shiftFrac(shiftMs() * 2), 1);
});

test('khách: đúng số trần, sắp xếp tăng dần, trong ca, không dồn cục', () => {
  for (const cap of [3, 7, 11, 18]) {
    const S = buildArrivals(cap, shiftMs(), makeRNG(2026 + cap * 7));
    assert.equal(S.length, cap, 'đúng ' + cap + ' khách');
    for (let i = 0; i < S.length; i++) {
      assert.ok(S[i] >= 0 && S[i] <= shiftMs(), 'trong ca');
      if (i) {
        assert.ok(S[i] >= S[i - 1], 'tăng dần');
        assert.ok(S[i] - S[i - 1] >= MIN_GAP_MS - 1, 'cách nhau ≥ 2,5 giây');
      }
    }
  }
});

test('khách: rải theo đường cong — đoạn đầu đông nhất, cuối ca thưa', () => {
  const cap = 20;
  const S = buildArrivals(cap, shiftMs(), makeRNG(31415));
  const doan1 = S.filter(t => t < shiftMs() * 0.375).length;
  const doan3 = S.filter(t => t >= shiftMs() * 0.710).length;
  assert.ok(doan1 >= Math.round(cap * 0.30), 'đoạn 19:00-20:30 phải đông: ' + doan1);
  assert.ok(doan3 <= Math.round(cap * 0.35), 'đoạn 21:50-23:00 phải thưa: ' + doan3);
  assert.ok(doan1 > doan3, 'đầu ca phải đông hơn cuối ca');
  /* nhịp trung vị ở đoạn đầu ~ 1 khách/14-30 giây thật (không quá dày, không quá thưa) */
  const gap1 = [];
  for (let i = 1; i < S.length && S[i] < shiftMs() * 0.375; i++) gap1.push(S[i] - S[i - 1]);
  const med = gap1.sort((a, b) => a - b)[Math.floor(gap1.length / 2)];
  assert.ok(med >= 5000 && med <= 30000, 'nhịp cao điểm ~5-30 giây, thực tế: ' + Math.round(med / 1000) + 's');
});

test('khách: mỗi ngày một khác (có nhiễu), nhưng cùng seed thì giống nhau', () => {
  const a = buildArrivals(9, shiftMs(), makeRNG(1));
  const b = buildArrivals(9, shiftMs(), makeRNG(2));
  const c = buildArrivals(9, shiftMs(), makeRNG(1));
  assert.notDeepEqual(a, b, 'khác seed phải khác lịch');
  assert.deepEqual(a, c, 'cùng seed phải giống nhau');
});

test('đường cong khách: tổng phần chia = 100%, mốc tăng dần', () => {
  const tong = GUEST_CURVE.reduce((x, s) => x + s.share, 0);
  assert.ok(Math.abs(tong - 1) < 1e-9, 'tổng share phải bằng 1');
  assert.equal(GUEST_CURVE[GUEST_CURVE.length - 1].to, 1);
  for (let i = 1; i < GUEST_CURVE.length; i++)
    assert.ok(GUEST_CURVE[i].to > GUEST_CURVE[i - 1].to, 'mốc phải tăng dần');
});

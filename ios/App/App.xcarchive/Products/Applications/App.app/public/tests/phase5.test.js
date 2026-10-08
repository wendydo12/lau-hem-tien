/* tests/phase5.test.js — blockgate Phase 5: TU VI + THANG PHÁ SẢN + PHẢN HỒI REVIEW */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCFG } from '../js/engine/config.js';
import { fresh } from '../js/engine/state.js';
import { REALMS, initCult, addExp, EXP, realmOf, cultBuffs, fireZone, tipMul, trafficMul, bratMul, patMul, fillMs, lsMul, wasteMul } from '../js/engine/cult.js';
import { RUIN_TIERS, ruinUpdate, ruinTrafficMul } from '../js/engine/ruin.js';
import { TONES, TONE_KEYS, genReply, applyReply, unanswered, journeyStats, bucketOf } from '../js/engine/replies.js';
import { makeRNG } from '../js/engine/rng.js';
import { pickServeSlot } from '../js/engine/loop.js';

const cfg = makeCFG();
const rng = () => makeRNG(987654);
const seeded = (seed = 987654) => { const S = fresh(cfg); S.seed = seed; return S; };

/* ============ TU VI ============ */
test('cult: 10 cảnh giới, exp tăng dần, buff mỗi cấp', () => {
  assert.equal(REALMS.length, 10);
  for (let i = 1; i < REALMS.length; i++) {
    assert.ok(REALMS[i].exp > REALMS[i - 1].exp, 'exp phải tăng: ' + i);
    assert.ok(REALMS[i].buff, 'cấp ' + i + ' phải có buff');
    assert.ok(REALMS[i].buffD, 'cấp ' + i + ' phải có mô tả buff');
  }
  assert.equal(realmOf(0), 0);
  assert.equal(realmOf(29), 0);
  assert.equal(realmOf(30), 1);
  assert.equal(realmOf(3200), 9);
});

test('cult: addExp tích lũy + đột phá đúng ngưỡng', () => {
  const S = seeded();
  const C = initCult(S);
  assert.equal(C.realm, 0);
  let r = addExp(S, 25, 'test');
  assert.equal(r.broke, false);
  r = addExp(S, 5, 'test');           // 30 → Sơ nhập hỏa đạo
  assert.equal(r.broke, true);
  assert.equal(r.newRealm, 1);
  assert.equal(S.cult.realm, 1);
  assert.ok(S.cult.log.length === 1 && S.cult.log[0].realm === 1);
});

test('cult: exp không âm (nghiệp trừ không thủng đáy)', () => {
  const S = seeded();
  addExp(S, 1, 'x');
  addExp(S, -999, 'khách bỏ về');
  assert.equal(S.cult.exp, 0);
});

test('cult: buff cộng dồn theo realm và tác động đúng công thức', () => {
  const S = seeded();
  S.cult = { exp: 3200, realm: 9, totalExp: 3200, log: [] };
  const b = cultBuffs(S);
  assert.ok(b.fire > 0 && b.pat > 0 && b.tips > 0 && b.traffic > 0);
  assert.ok(tipMul(S) > 1.1);
  assert.ok(trafficMul(S) > 1.1);
  assert.ok(bratMul(S) < 1);          // giảm khách hâm
  assert.ok(patMul(S) > 1);           // khách kiên nhẫn hơn
  assert.ok(fillMs(S, 1600) < 1600);  // nấu nhanh hơn
  assert.ok(lsMul(S) > 1);
  assert.ok(wasteMul(S) < 1);
  /* fireZone nới rộng so với gốc */
  const [lo, hi] = fireZone(S, 0.55, 0.93);
  assert.ok(lo < 0.55 && hi > 0.93);
});

test('cult: phàm nhân không có buff nào', () => {
  const S = seeded();
  const b = cultBuffs(S);
  assert.equal(tipMul(S), 1);
  assert.equal(trafficMul(S), 1);
  assert.equal(bratMul(S), 1);
  assert.equal(fillMs(S, 1600), 1600);
  const [lo, hi] = fireZone(S, 0.55, 0.93);
  assert.equal(lo, 0.55); assert.equal(hi, 0.93);
});

test('fresh() có sẵn cult + ruin trong save state', () => {
  const S = fresh(cfg);
  assert.ok(S.cult && S.cult.exp === 0 && S.cult.realm === 0);
  assert.equal(S.ruin, 0);
  assert.equal(S.negStreak, 0);
});

/* ============ THANG PHÁ SẢN ============ */
test('ruin: lãi dương reset về 0', () => {
  const S = seeded();
  S.negStreak = 3; S.ruin = 2;
  const r = ruinUpdate(S, cfg, 100000);
  assert.equal(r, null);
  assert.equal(S.ruin, 0);
  assert.equal(S.negStreak, 0);
});

test('ruin: leo thang 1→2→3 theo số ngày âm liên tiếp', () => {
  const S = seeded();
  ruinUpdate(S, cfg, -1000); assert.equal(S.ruin, 1);
  ruinUpdate(S, cfg, -1000); assert.equal(S.ruin, 2);
  ruinUpdate(S, cfg, -1000); assert.equal(S.ruin, 2);
  const r4 = ruinUpdate(S, cfg, -1000); assert.equal(S.ruin, 3);
  assert.equal(r4.tier, 3);
  assert.equal(r4.over, false);   // mới bậc 3 ngày đầu, chưa over
});

test('ruin: bậc 3 kê biên 30% két dương + tịch thu trang bị', () => {
  const S = seeded();
  S.money = 1000000;
  S.upg.sign = true; S.upg.ads = true;
  S.negStreak = 3;
  const r = ruinUpdate(S, cfg, -100000);   // streak 4 → bậc 3
  assert.equal(r.tier, 3);
  assert.equal(r.lostMoney, 300000);
  assert.equal(r.lostUpg, 'ads');          // trang bị gần nhất bị kê biên
  assert.equal(S.upg.ads, false);
  assert.ok(S.upg.sign);                   // chỉ mất 1 món
});

test('ruin: âm sâu quá ruinDeep ở bậc 3 → game over', () => {
  const S = seeded();
  S.money = -6000000; S.negStreak = 3;
  const r = ruinUpdate(S, cfg, -500000);
  assert.equal(r.over, true);
  assert.equal(r.deep, true);
});

test('ruin: kéo dài 6 ngày âm → game over', () => {
  const S = seeded();
  S.negStreak = 5;
  const r = ruinUpdate(S, cfg, -1000);
  assert.equal(r.streak, 6);
  assert.equal(r.over, true);
});

test('ruin: traffic giảm dần theo bậc', () => {
  const S = seeded();
  assert.equal(ruinTrafficMul(S), 1);
  S.ruin = 1; assert.equal(ruinTrafficMul(S), .9);
  S.ruin = 2; assert.equal(ruinTrafficMul(S), .75);
  S.ruin = 3; assert.equal(ruinTrafficMul(S), .55);
  assert.equal(RUIN_TIERS.length, 4);
});

/* ============ PHẢN HỒI REVIEW ============ */
const mkReview = (S, s = 3, x = false) => {
  S.reviews.unshift({ s, t: 'Test review ' + Math.random(), k: 'k' + Math.random(), d: S.day, n: 'Chị An', f: '👩', b: 'ca_chua', tp: [], sz: 'N', x });
  return S.reviews[0];
};

test('replies: 3 tông giọng đủ metadata', () => {
  assert.deepEqual(TONE_KEYS, ['polite', 'funny', 'savage']);
  TONE_KEYS.forEach(k => {
    assert.ok(TONES[k].n && TONES[k].d && TONES[k].ico);
    assert.ok(typeof TONES[k].risk === 'number');
  });
  assert.equal(bucketOf(5), 'pos'); assert.equal(bucketOf(3), 'mid'); assert.equal(bucketOf(1), 'neg');
});

test('replies: genReply theo đúng bucket sao, có thế tên/món', () => {
  const r = rng();
  for (let i = 0; i < 30; i++) {
    const t = genReply(r, 'savage', 1, 'Chị Ánh Tuyết', 'lẩu cà chua');
    assert.ok(t.length > 5);
    assert.ok(!t.includes('{n}') && !t.includes('{mon}'));
  }
});

test('replies: polite không bao giờ phản tác dụng', () => {
  for (let seed = 1; seed <= 60; seed++) {
    const S = seeded(seed);
    const rv = mkReview(S, 1);
    const out = applyReply(S, cfg, makeRNG(seed), rv, 'polite');
    assert.equal(out.ok, true);
    assert.equal(out.backfire, false);
    assert.ok(rv.reply && rv.reply.tone === 'polite');
  }
});

test('replies: savage có lúc phản tác dụng — sinh review 1 sao bóc phốt', () => {
  let backfires = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const S = seeded(seed);
    const rv = mkReview(S, 3);
    const n0 = S.reviews.length;
    const out = applyReply(S, cfg, makeRNG(seed), rv, 'savage');
    if (out.backfire) {
      backfires++;
      assert.equal(S.reviews.length, n0 + 1);          // review bóc phốt mới
      assert.equal(S.reviews[0].s, 1);
      assert.ok(S.reviews[0].back);
      assert.ok(rv.s < 3);                             // review gốc bị tụt sao
    }
  }
  assert.ok(backfires > 20 && backfires < 120, 'risk savage ~30% phải nằm trong khoảng, got ' + backfires);
});

test('replies: savage khách tu tiên gần như chắc chắn toang', () => {
  let bf = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const S = seeded(seed);
    const rv = mkReview(S, 4, true);
    const out = applyReply(S, cfg, makeRNG(seed), rv, 'savage');
    if (out.backfire) bf++;
  }
  assert.ok(bf >= 30, 'cà khịa đại năng phải toang gần hết, got ' + bf + '/40');
});

test('replies: không phản hồi 2 lần, unanswered đếm đúng', () => {
  const S = seeded();
  const rv = mkReview(S, 5);
  assert.equal(unanswered(S), 1);
  applyReply(S, cfg, rng(), rv, 'polite');
  assert.equal(unanswered(S), 0);
  const again = applyReply(S, cfg, rng(), rv, 'polite');
  assert.equal(again.ok, false);
});

test('replies: viral cho tiền thật vào két', () => {
  let v = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const S = seeded(seed);
    const rv = mkReview(S, 5);
    const out = applyReply(S, cfg, makeRNG(seed), rv, 'funny');
    if (out.viral) { v++; assert.ok(out.money >= 50000); assert.ok(S.money > cfg.startMoney); }
  }
  assert.ok(v > 5, 'funny phải có lúc viral, got ' + v);
});

test('journeyStats: đủ trường cho màn game over', () => {
  const S = seeded();
  S.day = 10; S.served = 42; S.totalRev = 5000000;
  S.history = [{ sales: { ca_chua: { q: 20, a: 700000 }, L: { q: 3, a: 45000 } }, starN: 2 }];
  const j = journeyStats(S);
  assert.equal(j.days, 9);
  assert.equal(j.served, 42);
  assert.equal(j.bestMon, 'ca_chua');
  assert.equal(j.bestQ, 20);
  assert.equal(j.xianServed, 2);
  assert.ok(j.rating >= 1 && j.rating <= 5);
});

/* ============ GATE PHA TU TIÊN (yêu cầu thiết kế: ngày 7 + hết nợ + dư 1tr) ============ */
import { startDay, spawn, initRuntime } from '../js/engine/loop.js';
import { addStock } from '../js/engine/stock.js';

test('gate: chưa đủ 3 điều kiện → khách tu tiên KHÔNG xuất hiện', () => {
  const S = seeded();
  S.day = 20;                     // quá ngày 8
  S.debtRoom = { amount: 2000000, due: 7, paid: false };  // CHƯA trả nợ phòng
  S.money = 5000000;              // dư tiền nhưng nợ chưa trả
  const R = initRuntime(S, cfg, 4);
  const ctx = { R, S, cfg, rng: makeRNG(777) };
  for (let i = 0; i < 120; i++) { const r = spawn(ctx); if (r && r.kind === 'ok') assert.equal(r.c.xian, false); }
});

test('gate: đủ ngày + nợ + tiền → startDay mở khóa + có khách tiên', () => {
  const S = seeded();
  S.day = 8;
  S.debtRoom = { amount: 2000000, due: 7, paid: true, paidDay: 6 };
  S.money = 1200000;              // dư trên 1 triệu
  S.badPlan = null;
  /* phải có hàng, không thì khách bỏ về vì sold-out trước khi kịp là khách tiên */
  ['ca_chua','nam','suon','sup'].forEach(k => { addStock(S, k, 200, cfg); S.unlocked[k] = true; });
  const R = initRuntime(S, cfg, 4);
  const ctx = { R, S, cfg, rng: makeRNG(888) };
  const out = startDay(ctx);
  assert.equal(S.xianUnlock, true);
  assert.ok(out.xianAwaken);
  /* giờ khách tiên phải xuất hiện được */
  let xianSeen = 0;
  for (let i = 0; i < 400; i++) {
    R.slots.fill(null);
    const r = spawn(ctx);
    if (r && r.kind === 'ok' && r.c.xian) xianSeen++;
  }
  assert.ok(xianSeen > 5, 'sau khi mở gate phải có khách tiên, got ' + xianSeen);
});

test('gate: thiếu tiền dư (mới trả nợ xong còn 500k) → CHƯA mở', () => {
  const S = seeded();
  S.day = 10;
  S.debtRoom = { amount: 2000000, due: 7, paid: true, paidDay: 5 };
  S.money = 500000;
  S.badPlan = null;
  const R = initRuntime(S, cfg, 4);
  const out = startDay({ R, S, cfg, rng: makeRNG(999) });
  assert.equal(S.xianUnlock, false);
  assert.equal(out.xianAwaken, null);
});

test('gate: ngày 7 đúng hạn — chưa qua ngày 7 thì chưa mở dù đủ tiền', () => {
  const S = seeded();
  S.day = 7;
  S.debtRoom = { amount: 2000000, due: 7, paid: true, paidDay: 4 };
  S.money = 3000000;
  S.badPlan = null;
  const R = initRuntime(S, cfg, 4);
  const out = startDay({ R, S, cfg, rng: makeRNG(1010) });
  assert.equal(S.xianUnlock, false, 'ngày 7 chưa mở — phải SANG ngày 8');
});

/* ============ THỨ TỰ BƯNG: AI TỚI TRƯỚC ĐƯỢC BƯNG TRƯỚC (yêu cầu thiết kế 06/10) ============ */
const _donCaChua = () => ({ base: 'ca_chua', dip: null, size: 'N', spicy: null, tops: [] });
const _noiCaChua = () => ({ base: 'ca_chua', dip: null, size: 'N', spicy: null, tops: [] });
const _khach = (id, born) => ({ id, born, cups: [_donCaChua()], done: [false], name: 'Khách ' + id });

test('bưng: nhiều khách cùng khớp nồi → người TỚI TRƯỚC được bưng (không theo chỗ ngồi)', () => {
  const S = seeded();
  const R = initRuntime(S, cfg, 4);
  R.slots = [_khach(2, 2000), _khach(1, 1000), null, null];   // khách tới trước lại ngồi chỗ số 2
  assert.equal(pickServeSlot(R, _noiCaChua()), 1, 'phải bưng cho khách tới trước (chỗ 1)');
});

test('bưng: không ai khớp nồi → chọn người tới sớm nhất còn đơn dở', () => {
  const S = seeded();
  const R = initRuntime(S, cfg, 4);
  const khacMon = _khach(2, 2000);
  khacMon.cups = [{ base: 'nam', dip: null, size: 'N', spicy: null, tops: [] }];
  R.slots = [khacMon, _khach(1, 1000), null, null];
  assert.equal(pickServeSlot(R, _noiCaChua()), 1);
});

test('bưng: có khách đang được chọn → ưu tiên khách đó dù tới sau', () => {
  const S = seeded();
  const R = initRuntime(S, cfg, 4);
  const khacMon = _khach(2, 2000);
  khacMon.cups = [{ base: 'nam', dip: null, size: 'N', spicy: null, tops: [] }];
  const khacMon2 = _khach(1, 1000);
  khacMon2.cups = [{ base: 'nam', dip: null, size: 'N', spicy: null, tops: [] }];
  R.slots = [khacMon, khacMon2, null, null];   // không ai gọi món trong nồi
  assert.equal(pickServeSlot(R, _noiCaChua(), 2), 0, 'khách đang chọn (id 2) phải được ưu tiên');
});

test('bưng: quán không còn ai → -1', () => {
  const S = seeded();
  const R = initRuntime(S, cfg, 4);
  assert.equal(pickServeSlot(R, _noiCaChua()), -1);
});

test('trần khách: runtime mới có sẵn ô đếm khách hôm nay (arrived/cap)', () => {
  const S = seeded();
  const R = initRuntime(S, cfg, 3);
  assert.equal(R.today.arrived, 0);
  assert.equal(R.today.cap, 0);
});

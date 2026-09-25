/* engine/loop.js — vòng lặp ngày: spawn khách (thường/tiên/đại năng/hạc), serve, tổng kết. Port từ GAME LOOP gốc. */
import { ITEMS, UPG, PERSONA, XPERSONA, STARS } from './data.js';
import { levelOf, genOrder, matches, wrongKinds, maxPat, stars, pickBrat, makeNameGen } from './orders.js';
import { qty, take, expireStock } from './stock.js';
import { price, priceLS, sv, unitCost, recSale, recRev, recCost, traffic, pricyItems, orderPricey, priceIdx, wageDay, fixed, dayTax, payDayLoan, resolveDebts } from './economy.js';
import { addReview } from './reviews.js';
import { ev, evIs, evMul, rollDay, badCheck, takeGift, mkBadPlan } from './events.js';
import { newRec, newPot, save, autoBak } from './state.js';
import { makeRNG } from './rng.js';

export const FACES = ['🧑','👩','👨','👧','🧔','👩‍🦰','👵','🧑‍🎓','👦','👱‍♀️','🧑‍💼','👴','👩‍💻','🧑‍🔧','👩‍🎓','👨‍🍳','👩‍🎨','🧑‍🎤','👱','👩‍🦱','👨‍🦱','🧕','👲','🧒','👸','🤵','👷‍♀️','🧑‍🚀','🥷','🧑‍🌾'];
export const XFACE = ['🧙','🧝','🧚','⚔️','🌙','✨','🔥','❄️'];

/* khởi tạo runtime R khi bắt đầu phiên (không persist) */
export function initRuntime(S, cfg, slotsN) {
  const R = {
    mode: 'prep', tab: 'kho', plan: {},
    slots: new Array(slotsN || 3).fill(null),
    online: [], running: false, paused: false, uid: 0,
    today: { rev: 0, served: 0, lost: 0, wrong: 0, tips: 0, onl: 0, fee: 0, stars: [], soldLost: 0, priceLost: 0, lsEarned: 0 },
    focus: null
  };
  return R;
}

export const slotCount = (S, cfg) => S.upg.slot4 ? 4 : 3;
const bigOrder = R => R.slots.some(c => c && !c.staffCooking && c.done.filter(x => !x).length >= 3);

/* ---------- MINIGAME CANH LỬA (port startPour/stopPour rót trà) ----------
   Trả về trạng thái: 'perfect' | 'weak' | 'spill'. Không đụng DOM. */
export function pourResult(fill, S, cfg) {
  let [lo, hi] = cfg.pourPerfect;
  if (S.upg.phap_khi) { lo -= .05; hi += .05; }  /* lò địa hỏa mở rộng vạch xanh */
  hi += (cfg.pourGrace || 0);                    /* dung sai ngón tay thả trễ một nhịp */
  lo = Math.max(0, lo); hi = Math.min(1, hi);
  if (fill > hi) return 'spill';      /* quá lửa — khét nồi */
  if (fill < lo) return 'weak';       /* non lửa */
  return 'perfect';
}

/* ---------- SPAWN khách ---------- */
/* opts: {R, S, cfg, rng, names, elapsedMs} */
export function spawn(ctx) {
  const { R, S, cfg, rng } = ctx;
  const i = R.slots.findIndex(s => !s);
  if (i < 0 || bigOrder(R)) return null;
  const lv = levelOf(S.day, cfg);
  const names = ctx.names || makeNameGen(S, rng);

  /* giá đắt → khách bỏ đi ngay (port gốc) */
  const pi = pricyItems(S, cfg);
  if (pi.length && rng.chance(.8)) {
    R.today.priceLost++;
    if (rng.chance(.08)) addReview(S, rng.pick([1, 2, 2]), 'pricey', false, null, null, rng, R);
    return { kind: 'pricy', item: pi[0] };
  }

  /* đại năng vi hành? (port spawnStar gốc) */
  if (S.starPend) {
    S.starPend = false;
    return spawnStar(ctx, i, lv);
  }

  /* khách tu tiên? */
  let tienChance = cfg.ls.tienChance + (S.upg.tulin ? .2 : 0) * cfg.ls.tienChance;
  if (S.day < 3) tienChance = 0;             /* 2 ngày đầu toàn khách thường cho quen tay */
  const xian = rng.chance(tienChance);

  /* số nồi mỗi khách (port gốc: lv3+ có thể 1-5) */
  const nc = lv >= 3 ? (function () { const r = rng.next(); return r < .45 ? 1 : r < .7 ? 2 : r < .85 ? 3 : r < .95 ? 4 : 5; })()
    : ((evIs(S, 'weekend') || evIs(S, 'holiday')) && lv >= 2 && rng.chance(.3) ? 2 : 1);

  const cups = [];
  for (let k = 0; k < nc; k++) {
    const o = genOrder(S, cfg, rng, lv, { xian, firstDone: R.firstDone });
    if (o.so) { R.today.soldLost++; R.today.lost++; return { kind: 'soldout', item: o.so }; }
    cups.push(o);
  }
  const over = cups.some(o => price(o, S) > cfg.priceCap);
  if ((over && rng.chance(.6)) || (cups.some(o => orderPricey(o, S, cfg)) && rng.chance(.4))) {
    R.today.priceLost++;
    return { kind: 'pricy', item: null };
  }

  const max = maxPat(cups, lv, S, cfg, xian);
  const who = Math.floor(rng.next() * 7);
  const pp = xian ? rng.pick(XPERSONA) : PERSONA[who];
  const brat = xian ? null : pickBrat(S, cfg, rng);
  const name = xian ? names.xian() : names.normal(who);
  const c = {
    id: ++R.uid, who, xian, brat,
    face: xian ? rng.pick(XFACE) : rng.pick(FACES),
    name, say: rng.pick(pp.o), end: rng.pick(pp.e),
    cups, done: cups.map(() => false), order: cups[0],
    pat: max * (brat === 'hoi' ? .6 : 1), max, wrong: 0, paid: 0,
    born: Date.now()
  };
  R.slots[i] = c;
  R.firstDone = true;
  return { kind: 'ok', slot: i, c };
}

function spawnStar(ctx, i, lv) {
  const { R, S, cfg, rng } = ctx;
  const last = S.starLast;
  const pool = STARS.map((x, k) => k).filter(k => k !== last);
  const k = rng.pick(pool);
  S.starLast = k;
  if (S.starSch) S.starSch.done = true;
  let o = genOrder(S, cfg, rng, lv, { xian: true });
  for (let t = 0; t < 8 && o.so; t++) o = genOrder(S, cfg, rng, lv, { xian: true });
  if (o.so) o.so = null;
  const st = STARS[k];
  const max = maxPat([o], lv, S, cfg, true) * 1.6;
  const c = {
    id: ++R.uid, star: k, xian: true, name: st.n, face: '⭐',
    say: 'Bổn tọa muốn', end: '.', cups: [o], done: [false], order: o,
    pat: max, max, wrong: 0, born: Date.now()
  };
  R.slots[i] = c;
  return { kind: 'star', slot: i, c };
}

/* ---------- SERVE (port serve gốc) ---------- */
export function serve(ctx, i, pot) {
  const { R, S, cfg, rng } = ctx;
  const c = R.slots[i];
  if (!c || !R.running) return { ok: false, why: 'nocustomer' };
  if (!pot || !pot.base) return { ok: false, why: 'nopot' };

  const j = c.cups.findIndex((x, k) => !c.done[k] && matches(pot, x));
  if (j < 0) {
    /* SAI MÓN: đổ nồi, đạo tâm -30%, ghi rõ sai gì */
    c.wk = wrongKinds(pot, c.order);
    c.wrong++;
    R.today.wrong++;
    c.pat = Math.max(.5, c.pat - c.max * .3);
    /* mất nguyên liệu (port spoilCup gốc) */
    S.cur.spoil.n++;
    S.cur.spoil.v += unitCost(pot, cfg);
    return { ok: false, why: 'wrong', wk: c.wk, c };
  }

  const o = c.cups[j];
  c.done[j] = true;

  /* thanh toán: khách thường VNĐ / khách tu tiên linh thạch */
  if (c.xian) {
    const isStar = c.star != null;
    const pl = priceLS(o, S, cfg);
    const ls = isStar ? pl.totalLS * 3 : Math.round(pl.totalLS * (cfg.ls.payMul[0] + rng.next() * (cfg.ls.payMul[1] - cfg.ls.payMul[0])));
    S.ls += ls;
    S.cur.lsEarned = (S.cur.lsEarned || 0) + ls;
    R.today.lsEarned += ls;
    recSale(S, o, pl.vnd, false);
    c.paid += ls;
    const left = c.done.filter(x => !x).length;
    if (!left) finishCustomer(ctx, i, c, true);
    return { ok: true, ls, left, c };
  } else {
    let p = price(o, S);
    /* khách trả giá (brat mac): chỉ trả 80% — hộ pháp bắt trả đủ (port gốc) */
    if (c.brat === 'mac') {
      const full = p;
      p = Math.round(p * .8 / 1000) * 1000;
      if (S.upg.ho_phap && rng.next() >= .02) { R.today.gMac = (R.today.gMac || 0) + (full - p); p = full; }
    }
    /* khách bùng tiền (brat bung): nồi cuối ôm chạy — hộ pháp tóm được (port gốc) */
    if (c.brat === 'bung' && c.done.filter(x => !x).length === 1) {
      if (S.upg.ho_phap && rng.next() >= .02) { R.today.gRun = (R.today.gRun || 0) + p; }
      else { S.bungN = (S.bungN || 0) + 1; p = 0; }
    }
    recSale(S, o, p, false);
    S.money += p; S.cur.rev = (S.cur.rev || 0) + p; R.today.rev += p;
    S.totalRev += p; R.today.served++; S.served++;
    const left = c.done.filter(x => !x).length;
    if (!left) finishCustomer(ctx, i, c, false);
    return { ok: true, vnd: p, left, c };
  }
}

export function finishCustomer(ctx, i, c, isXian) {
  const { R, S, cfg, rng } = ctx;
  /* típ (port gốc: tip theo kiên nhẫn còn lại ×5k, sealer +30%, holiday ×2) */
  let tip = Math.round((c.pat / c.max) * 5) * 1000 * (S.upg.sealer ? 1.3 : 1) * (evIs(S, 'holiday') ? 2 : 1) * c.cups.length;
  const rv = stars(c, S, cfg, rng, false);
  const toStaff = ['staff1', 'staff2', 'staff3'].some(x => S.upg[x]);
  if (isXian) {
    /* típ tu tiên = linh thạch */
    const lsTip = Math.max(1, Math.round(tip / (S.lsRate || cfg.ls.rate)));
    S.ls += lsTip; S.cur.lsEarned = (S.cur.lsEarned || 0) + lsTip; R.today.lsEarned += lsTip;
  } else if (toStaff) { S.cur.staffTip = (S.cur.staffTip || 0) + tip; }
  else { S.cur.tips += tip; S.money += tip; S.totalRev += tip; R.today.tips += tip; }

  addReview(S, rv.s, rv.why, false, c, null, rng, R);
  /* reviewer VIP: 3 review (port gốc) */
  if (c.vip) { addReview(S, rv.s, rv.why, false, c, null, rng, R); addReview(S, rv.s, rv.why, false, c, null, rng, R); }
  R.slots[i] = null;
  return rv;
}

/* khách bỏ về vì hết kiên nhẫn */
export function timeoutCustomer(ctx, i) {
  const { R, S, cfg, rng } = ctx;
  const c = R.slots[i];
  if (!c) return null;
  R.today.lost++; S.cur.lost = (S.cur.lost || 0) + 1;
  addReview(S, 1, c.xian ? 'timeout' : 'timeout', false, c, null, rng, R);
  R.slots[i] = null;
  return c;
}

/* ---------- TỔNG KẾT NGÀY (port gốc: doanh thu - chi phí - lương - thuế) ---------- */
export function closeDay(ctx) {
  const { R, S, cfg, rng } = ctx;
  R.running = false;

  /* hàng hết hạn đổ bỏ (tiền đã trả lúc nhập — chỉ ghi nhận số lượng để báo cáo) */
  const expired = expireStock(S, cfg);
  expired.forEach(e => { S.cur.waste[e.k] = (S.cur.waste[e.k] || 0) + e.q; });
  const wasteV = expired.reduce((a, e) => a + e.v, 0);
  S.cur.spoil.n += expired.reduce((a, e) => a + e.q, 0);
  S.cur.spoil.v += wasteV;

  /* chi phí cố định */
  const fx = fixed(S, cfg);
  S.cur.rent = fx.rent; S.cur.util = fx.util;
  S.money -= fx.rent + fx.util;

  /* lương nhân viên + tăng ca */
  const wage = wageDay(S, cfg);
  S.cur.wage = wage;
  S.money -= wage;

  /* trả góp vay */
  const loanOut = payDayLoan(S, cfg);
  S.cur.loanOut = (S.cur.loanOut || 0) + loanOut;

  /* thuế */
  const rev = recRev(S.cur);
  const tax = dayTax(S, cfg, rev);
  S.cur.tax = tax;
  S.money -= tax;

  /* đẩy vào history */
  S.history.unshift(S.cur);
  if (S.history.length > 400) S.history.length = 400;
  S.totalProfit = S.history.reduce((a, r) => a + recRev(r) - recCost(r, cfg), 0);
  S.day++;
  S.cur = newRec(S.day);
  rollDay(S, cfg, rng);
  if (!S.badPlan || S.day > S.badPlan.start + 90) S.badPlan = mkBadPlan(S.day, rng);
  autoBak(S); save(S);
  return { rev, tax, wage, loanOut, expired, rent: fx.rent, util: fx.util };
}

/* ---------- đầu ngày mới: biến cố sổ nợ + tai họa + quà ---------- */
export function startDay(ctx) {
  const { S, cfg, rng } = ctx;
  const out = { debtEvents: [], bad: null, gift: null };
  out.debtEvents = resolveDebts(S, cfg);
  out.bad = badCheck(S, cfg, rng);
  if (!out.bad && S.gift) out.gift = takeGift(S);
  return out;
}

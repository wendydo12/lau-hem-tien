/* engine/events.js — sự kiện ngày, quà, tai họa lên lịch, chống gian lận */
import { EVS, GIFTS, BAD, ITEMS, BASE_KEYS, TOP_KEYS, DIP_KEYS } from './data.js';
import { rating, upgCount, cheatHit, rollLSRate } from './economy.js';

/* cuộn ngày mới: sự kiện + mood + quà + tỷ giá linh thạch (port rollDay gốc) */
export function rollDay(S, cfg, rng) {
  const d = S.day;
  let e = null;
  if (d > 1 && d % 30 === 0) e = { id: 'holiday' };
  else if (d > 1 && (d % 7 === 6 || d % 7 === 0)) e = { id: 'weekend' };
  else if (d > 2 && rng.chance(.25)) {
    const pool = ['hot', 'rain', 'students', 'reviewer', 'trend', 'sale'];
    const id = rng.pick(pool); e = { id };
    if (id === 'trend') { const b = BASE_KEYS.filter(k => S.unlocked[k]); e.k = rng.pick(b); }
    if (id === 'sale') { const b = [...BASE_KEYS, ...TOP_KEYS, ...DIP_KEYS].filter(k => S.unlocked[k]); e.k = rng.pick(b); }
  }
  S.ev = e; S.evDay = d;

  /* khách khó ở: đúng 2 ngày ngẫu nhiên mỗi 60 ngày (port moodPlan gốc) */
  const blk = Math.floor((d - 1) / (cfg.moodBlockDays || 60));
  if (!S.moodPlan || S.moodPlan.blk !== blk) {
    const a = [], lo = Math.max(3, blk * 60 + 1);
    while (a.length < (cfg.moodBadPerBlock || 2)) {
      const x = lo + Math.floor(rng.next() * (blk * 60 + 61 - lo));
      if (!a.includes(x)) a.push(x);
    }
    S.moodPlan = { blk, days: a };
  }
  S.mood = S.moodPlan.days.includes(d) ? 'kho' : (d > 2 && rng.chance(.1) ? 'vui' : null);

  /* quà 10% (port gốc) */
  if (d > 2 && rng.chance(.1)) {
    const g = GIFTS.filter(x => !x.need || x.need(S));
    const bg = g.find(x => x.k === 'bung');
    const x = (bg && rng.chance(.5)) ? bg : rng.pick(g);
    S.gift = { k: x.k || null, n: x.n, d: x.d, v: rng.round5k(x.min, x.max) };
  } else S.gift = null;

  /* tỷ giá linh thạch dao động mỗi ngày */
  rollLSRate(S, cfg, rng);

  /* lịch đại năng vi hành 30 ngày/lần (port starSch gốc) */
  if (!S.starSch || S.day > S.starSch.end) {
    S.starSch = { end: S.day + 29, day: S.day + 1 + Math.floor(rng.next() * 28), done: false };
  }
  S.starPend = S.starSch.day === S.day && !S.starSch.done;
}

export const ev = S => S.ev && S.evDay === S.day ? S.ev : null;
export const evIs = (S, id) => { const e = ev(S); return !!e && e.id === id; };
export const evText = (S, cfg) => { const e = ev(S); if (!e) return ''; return EVS[e.id].d.replace('%', e.k && ITEMS[e.k] ? ITEMS[e.k].n.toLowerCase() : ''); };
export const evMul = (S) => { const e = ev(S); return e ? EVS[e.id].mul : 1; };

/* lịch tai họa: 0-2 vụ trong 90 ngày tới, lên lịch trước (port mkBadPlan gốc) */
export function mkBadPlan(start, rng) {
  const r = rng.next(), n = r < .3 ? 0 : r < .7 ? 1 : 2;
  const ids = BAD.map(b => b.id).sort(() => rng.next() - .5);
  const days = [];
  while (days.length < n) {
    const d = start + 10 + Math.floor(rng.next() * 80);
    if (!days.includes(d)) days.push(d);
  }
  days.sort((a, b) => a - b);
  return { start, ev: days.map((d, i) => ({ d, id: ids[i], done: false })) };
}

/* kiểm tra tai họa + chống gian lận đầu ngày (port badCheck gốc) */
export function badCheck(S, cfg, rng) {
  /* két quá to trước ngày 30 → trộm sạch (chống hack tiền) */
  if (S.day < cfg.thiefDay && S.money > cfg.thiefMoney) cheatHit(S, cfg, rng);
  if (!S.badNow && S.badPlan) {
    const e = S.badPlan.ev.find(x => !x.done && x.d <= S.day);
    if (e) {
      e.done = true;
      if (S.day - e.d <= 1) {
        const v = Math.min(Math.round((200000 + rng.next() * 700000) / 50000) * 50000, Math.floor(S.money / 3 / 1000) * 1000);
        if (v >= 10000) { S.money -= v; S.cur.bad = (S.cur.bad || 0) + v; S.badNow = { id: e.id, v }; }
      }
    }
  }
  const b = S.badNow;
  if (!b) return null;
  S.badNow = null;
  const t = BAD.find(x => x.id === b.id) || BAD[0];
  return { ...t, all: b.all, v: b.v, keep: b.keep };
}

/* nhận quà (port giftCheck gốc) */
export function takeGift(S) {
  if (!S.gift) return null;
  const g = S.gift; S.gift = null;
  if (g.k === 'bung') S.bungN = 0;
  S.money += g.v;
  S.cur.gift = (S.cur.gift || 0) + g.v;
  return g;
}

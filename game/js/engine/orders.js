/* engine/orders.js — sinh đơn hàng theo cấp độ, so khớp nồi, tính sao. Port công thức gốc. */
import { ITEMS, BASE_KEYS, DIP_KEYS, TOP_KEYS, DUOC_KEYS, SECRET_KEYS, SPICY, SIZES, PERSONA, XPERSONA, NM_HO, NM_NU, NM_NAM, NM_BE, NM_TIEN, NM_TIEN_DANH, SLOW_KEYS, slowN } from './data.js';
import { qty } from './stock.js';
import { addOk, addSkip, lChance, priceIdx, orderPricey, overCap } from './economy.js';
import { wpick } from './rng.js';

export const levelOf = (day, cfg) => day >= cfg.levels.l4 ? 4 : day >= cfg.levels.l3 ? 3 : day >= cfg.levels.l2 ? 2 : 1;

/* tên khách thường (port uniqName/PNAME gốc) */
export function makeNameGen(S, rng) {
  const HN = L => rng.pick(NM_HO) + ' ' + rng.pick(L);
  const uniq = gen => {
    const used = new Set(S.nameLog || []);
    let n = gen();
    for (let t = 0; t < 40 && used.has(n); t++) n = gen();
    (S.nameLog = S.nameLog || []).push(n);
    if (S.nameLog.length > 380) S.nameLog.splice(0, S.nameLog.length - 380);
    return n;
  };
  return {
    normal: who => {
      const P = {
        0: () => uniq(() => rng.chance(.5) ? rng.pick(NM_NU) : HN(NM_NU)),
        1: () => uniq(() => rng.chance(.5) ? rng.pick(NM_NU) : rng.pick(NM_BE)),
        2: () => uniq(() => rng.chance(.5) ? 'Anh ' + rng.pick(NM_NAM) : HN(NM_NAM)),
        3: () => uniq(() => 'Chị ' + rng.pick(NM_NU)),
        4: () => uniq(() => rng.chance(.6) ? rng.pick(NM_BE) : 'Bé ' + rng.pick(NM_NU)),
        5: () => uniq(() => 'Chú ' + rng.pick(NM_NAM)),
        6: () => uniq(() => 'Bà ' + rng.pick(NM_NU))
      };
      return (P[who] || P[0])();
    },
    xian: () => uniq(() => rng.pick(NM_TIEN) + ' ' + rng.pick(NM_TIEN_DANH))
  };
}

/* sinh 1 đơn (port genOrder gốc)
 * LUẬT (sửa 25/09 sau playtest): đơn ngày 1-2 không topping; từ ngày 3+ topping phải còn hàng,
 * khách KHÔNG bỏ về vì hết topping nữa (giống game gốc — chỉ base hết mới bỏ). */
export function genOrder(S, cfg, rng, lv = levelOf(S.day, cfg), opts = {}) {
  const un = k => S.unlocked[k], has = k => qty(S, k) > 0;
  const bases = BASE_KEYS.filter(un);
  let so = null;
  const want = ks => { const k = rng.pick(ks); if (has(k)) return k; const av = ks.filter(has); if (av.length && rng.chance(.5)) return rng.pick(av); so = so || k; return k; };
  const dipPool = lv >= 2 ? DIP_KEYS.filter(un).filter(k => addOk(S, k, cfg) && has(k)) : [];
  const base = want(bases);
  let dip = dipPool.length && rng.chance(.6) ? rng.pick(dipPool) : null;
  if (dip && addSkip(S, dip, cfg, rng)) dip = null;

  const isXian = !!opts.xian;
  /* pool topping: chỉ món CÒN HÀNG; thường = top + duoc (duoc hiếm gọi hơn); secret CHỈ cho khách tu tiên */
  let pool = [...TOP_KEYS, ...DUOC_KEYS.filter(k => isXian || rng.chance(.3))];
  if (isXian) pool = [...pool, ...SECRET_KEYS];
  pool = pool.filter(un)
    .filter(k => ITEMS[k].type === 'secret' ? isXian : addOk(S, k, cfg))
    .filter(k => has(k) || lv < 2)      /* ngày 1-2: không cần hàng (đơn trơn) */
    .sort(() => rng.next() - .5);
  const r = rng.next();
  /* lv1 (ngày 1-5): chỉ nồi trơn không topping (như luật thể loại: ngày đầu đơn giản cho quen tay) */
  let n = lv === 1 ? 0
    : lv === 2 ? (r < .2 ? 0 : 1)
    : wpick(rng, [0, 1, 2, 3, 4], [.1, .3, .3, .18, .12]);
  n = Math.min(n, pool.length);
  const pick = [];
  for (const k of pool) {
    if (pick.length >= n) break;
    if (pick.includes(k)) continue;
    if (lv >= 2 && !has(k)) continue;
    if (addSkip(S, k, cfg, rng)) continue;
    pick.push(k);
  }
  return {
    base, dip, tops: pick, size: rng.chance(lChance(S, cfg)) ? 'L' : 'N', so,
    spicy: lv >= 2 ? wpick(rng, SPICY, [.15, .3, .35, .2]) : null
  };
}

/* so khớp nồi đã nấu với đơn (port matches gốc) */
export function matches(a, b) {
  return a.base === b.base
    && (a.dip || 'none') === (b.dip || 'none')
    && a.size === b.size
    && (b.spicy == null || a.spicy === b.spicy)
    && a.tops.length === b.tops.length
    && a.tops.every(t => b.tops.includes(t));
}

/* ghi rõ sai gì (port wrongKinds gốc — để review khớp sự thật) */
export function wrongKinds(pot, o) {
  const k = {};
  if (pot.base !== o.base || (pot.dip || null) !== (o.dip || null)) k.mon = 1;
  if (pot.size !== o.size) k.size = 1;
  if (o.spicy != null && pot.spicy !== o.spicy) k.spicy = 1;
  if (pot.tops.length !== o.tops.length || !o.tops.every(t => pot.tops.includes(t))) k.tops = 1;
  return k;
}

/* kiên nhẫn tối đa (port công thức gốc + đạo tâm tu tiên) */
export function maxPat(cups, lv, S, cfg, isXian = false) {
  const nc = cups.length;
  let max = (55 + (lv >= 2 ? 8 : 0)) * (S.upg.seats ? 1.25 : 1) * (1 + .8 * (nc - 1))
    * (1 + .35 * cups.reduce((a, x) => a + slowN(x) + Math.max(0, x.tops.length - 1), 0) / nc);
  if (isXian) {
    max *= cfg.ls.daoTam;
    if (S.upg.anthan) max *= 1.25;
  }
  return max;
}

/* tính sao khi giao xong đơn (port stars gốc) */
export function stars(c, S, cfg, rng, online = false) {
  if (c.star != null) return { s: 5, why: 'star' };
  const w = 1 - c.pat / c.max;
  const idx = c.cups.reduce((a, x) => a + priceIdx(x, S), 0) / c.cups.length;
  const pricey = c.cups.some(o => orderPricey(o, S, cfg));
  let s = 5, why = 'great';
  c.rf = { wait: w > .5, pricey, wrong: !!c.wrong, cheap: !pricey && idx < .9 };
  if (w > .5) { s--; why = online ? 'late' : 'wait'; }
  if (w > (S.upg.ac ? .9 : .82)) { s--; why = online ? 'late' : 'wait'; }
  if (w > .96) s--;
  if (pricey) { s--; why = 'pricey'; }
  if (c.wrong) { s -= c.wrong; why = 'wrong'; }
  const md = S.mood;
  if (md !== 'vui' && md !== 'kho' && rng.chance(.13)) s--;
  if (md === 'kho') s = Math.min(s, rng.chance(.5) ? 3 : 4);
  if (md === 'vui' && why === 'great') s = 5;
  if (c.rf.cheap && s < 5) { s++; if (why === 'great') why = 'cheap'; }
  /* khách tu tiên: đúng + nhanh thì luôn hài lòng, sai thì gay gắt hơn */
  if (c.xian) {
    if (c.wrong) s = Math.min(s, 1);
    else if (w <= .5 && !pricey) s = 5;
  }
  s = Math.max(1, Math.min(5, s));
  if (why === 'great' || (why === 'cheap' && s < 4)) why = s >= 5 ? 'great' : s === 4 ? 'ok' : s === 3 ? 'meh' : 'bad';
  return { s, why };
}

/* chọn loại khách hâm (port pickBrat gốc: ngày 1-9 không có; xác suất tăng dần) */
export function pickBrat(S, cfg, rng) {
  if (S.day < 10) return null;
  const r = rng.next();
  if (r < .04) return 'hoi';
  if (r < .07) return 'doi';
  if (r < .09) return 'mac';
  if (r < .095) return 'bung';
  return null;
}

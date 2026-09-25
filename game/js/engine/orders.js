/* engine/orders.js — sinh đơn hàng theo cấp độ, so khớp nồi, tính sao. Port công thức gốc. */
import { ITEMS, BASE_KEYS, DIP_KEYS, TOP_KEYS, DUOC_KEYS, SECRET_KEYS, SPICY, SIZES, PERSONA, XPERSONA, NM_HO, NM_NU, NM_NAM, NM_BE, NM_TIEN, NM_TIEN_DANH, SLOW_KEYS, slowN } from './data.js';
import { qty } from './stock.js';
import { addOk, addSkip, lChance, priceIdx, orderPricey, overCap } from './economy.js';
import { wpick } from './rng.js';

export const levelOf = (day, cfg) => day >= cfg.levels.l4 ? 4 : day >= cfg.levels.l3 ? 3 : day >= cfg.levels.l2 ? 2 : 1;

/* ---- DIFFICULTY RAMP (25/09 — lệnh phu quân: "tăng độ khó từ từ, dần tăng nhiều topping, balance với thời gian chờ") ----
 * Trần số món nhúng theo ngày — dùng CHUNG cho cả engine (sinh đơn) lẫn UI (chọn món nấu),
 * để đơn gọi mấy món thì người chơi được phép bỏ đúng bấy nhiêu. Bậc thang mượt: 1→2→3→4→5. */
export function maxTops(day, cfg) {
  const lv = levelOf(day, cfg);
  if (lv === 1) return day <= 2 ? 1 : 2;     // ngày 1-2: 1 món (học việc) · ngày 3-5: tối đa 2
  if (lv === 2) return day <= 12 ? 2 : 3;    // ngày 6-12: 2 · ngày 13-29: 3
  if (lv === 3) return day <= 45 ? 3 : 4;    // ngày 30-45: 3 · ngày 46-59: 4
  return 5;                                   // ngày 60+: 5 món — cao thủ lẩu
}

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
    /* who → tên khớp ĐÚNG sprite (giới tính + tuổi + danh xưng):
     * 0 chị trẻ nữ · 1 em nữ sinh · 2 anh văn phòng · 3 bà cụ · 4 bé trai · 5 ông/chú · 6 anh shipper */
    normal: who => {
      const P = {
        0: () => uniq(() => (rng.chance(.5) ? 'Chị ' : 'Cô ') + rng.pick(NM_NU)),
        1: () => uniq(() => rng.chance(.5) ? 'Em ' + rng.pick(NM_NU) : HN(NM_NU)),
        2: () => uniq(() => rng.chance(.5) ? 'Anh ' + rng.pick(NM_NAM) : HN(NM_NAM)),
        3: () => uniq(() => (rng.chance(.5) ? 'Bà ' : 'Má ') + rng.pick(NM_NU)),
        4: () => uniq(() => rng.chance(.6) ? rng.pick(NM_BE) : 'Bé ' + rng.pick(NM_NAM)),
        5: () => uniq(() => rng.chance(.5) ? 'Chú ' + rng.pick(NM_NAM) : 'Ông ' + rng.pick(NM_NAM)),
        6: () => uniq(() => 'Anh ' + rng.pick(NM_NAM))
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
  /* ---- số món nhúng theo RAMP ngày (maxTops) — phân phối lệch dần về trần khi ngày càng cao ---- */
  const cap = maxTops(S.day, cfg);
  const TOP_DIST = {
    1: [[1], [1]],                                   // ngày 1-2: đúng 1 món (nếu còn hàng)
    2: [[0, 1, 2], [.12, .44, .44]],                 // ngày 3-12: 0-2, thiên về 1-2
    3: [[0, 1, 2, 3], [.07, .25, .42, .26]],         // ngày 13-45: 0-3, thiên về 2
    4: [[0, 1, 2, 3, 4], [.05, .16, .31, .32, .16]], // ngày 46-59
    5: [[0, 1, 2, 3, 4, 5], [.04, .1, .2, .29, .27, .1]] // ngày 60+
  };
  const D = TOP_DIST[Math.min(5, Math.max(1, cap))];
  let n = cap <= 1 ? 1 : wpick(rng, D[0], D[1]);
  n = Math.min(n, pool.length);
  const pick = [];
  for (const k of pool) {
    if (pick.length >= n) break;
    if (pick.includes(k)) continue;
    if (!has(k)) continue;               // KHÔNG BAO GIỜ gọi món hết hàng (mọi cấp)
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

/* kiên nhẫn tối đa (port công thức gốc + đạo tâm tu tiên)
 * RAMP BALANCE 25/09: đơn càng nhiều món nhúng khách càng kiên nhẫn chờ —
 * +18% mỗi món nhúng, món lâu chín (tôm/mực/nghêu/cá/dê/dược thiện/secret) cộng thêm +20% mỗi món,
 * để số topping tăng dần theo ngày không làm khách bỏ về oan. */
export function maxPat(cups, lv, S, cfg, isXian = false) {
  const nc = cups.length;
  const per = cups.reduce((a, x) => a + x.tops.length * .18 + slowN(x) * .2, 0) / nc;
  let max = (55 + (lv >= 2 ? 8 : 0)) * (S.upg.seats ? 1.25 : 1) * (1 + .8 * (nc - 1)) * (1 + per);
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

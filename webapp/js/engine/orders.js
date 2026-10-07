/* engine/orders.js — sinh đơn hàng theo cấp độ, so khớp nồi, tính sao. Tính theo công thức của dự án. */
import { ITEMS, POT_KEYS, DIP_KEYS, TOP_KEYS, DUOC_KEYS, SECRET_KEYS, SPICY, SIZES, PERSONA, XPERSONA, NM_HO, NM_NU, NM_NAM, NM_BE, NM_TIEN, NM_TIEN_DANH, SLOW_KEYS, slowN } from './data.js';
import { qty } from './stock.js';
import { addOk, addSkip, lChance, priceIdx, orderPricey, overCap } from './economy.js';
import { wpick } from './rng.js';
import { patMul, bratMul } from './cult.js';

export const levelOf = (day, cfg) => day >= cfg.levels.l4 ? 4 : day >= cfg.levels.l3 ? 3 : day >= cfg.levels.l2 ? 2 : 1;

/* ---- DIFFICULTY RAMP (25/09 — yêu cầu thiết kế: "tăng độ khó từ từ, dần tăng nhiều topping, balance với thời gian chờ") ----
 * Trần số món nhúng theo ngày — dùng CHUNG cho cả engine (sinh đơn) lẫn UI (chọn món nấu),
 * để đơn gọi mấy món thì người chơi được phép bỏ đúng bấy nhiêu. Bậc thang mượt: 1→2→3→4→5. */
export function maxTops(day, cfg) {
  const lv = levelOf(day, cfg);
  if (lv === 1) return day <= 2 ? 1 : 2;     // ngày 1-2: 1 món (học việc) · ngày 3-5: tối đa 2
  if (lv === 2) return day <= 12 ? 2 : 3;    // ngày 6-12: 2 · ngày 13-29: 3
  if (lv === 3) return day <= 45 ? 3 : 4;    // ngày 30-45: 3 · ngày 46-59: 4
  return 5;                                   // ngày 60+: 5 món — cao thủ lẩu
}

/* ---------- LEO THANG ĐƠN HÀNG THEO NGÀY (yêu cầu thiết kế 07/10/2026) ----------
 * "yêu cầu add-ons của khách tăng từ từ => người chơi hứng thú, balance everything".
 * Nguyên tắc: ngày đầu chỉ đơn trơn (1 nồi, cỡ nhỏ, chưa chấm chưa cay), rồi mỗi thứ mở dần
 * theo bảng — không nhảy bậc. Số liệu cân với ca tối 19:00-23:00 (xem engine/shift.js). */

/* số NỒI khách gọi cùng lúc — trọng số theo ngày */
const POT_MIX = [
  { day: 5,  n: [1],         w: [1] },                                   // 1-5: học việc
  { day: 9,  n: [1, 2],      w: [.90, .10] },                            // 6-9
  { day: 15, n: [1, 2],      w: [.78, .22] },                            // 10-15
  { day: 29, n: [1, 2, 3],   w: [.62, .30, .08] },                       // 16-29
  { day: 45, n: [1, 2, 3, 4, 5], w: [.45, .30, .15, .07, .03] },         // 30-45
  { day: 59, n: [1, 2, 3, 4, 5], w: [.35, .28, .20, .11, .06] },         // 46-59
  { day: 1e9, n: [1, 2, 3, 4, 5], w: [.25, .25, .22, .17, .11] },        // 60+
];
export const potCount = (day, rng, { weekend = false } = {}) => {
  const row = POT_MIX.find(r => day <= r.day) || POT_MIX[POT_MIX.length - 1];
  let n = wpick(rng, row.n, row.w);
  if (weekend && day >= 6 && n < 5 && rng.chance(.20)) n++;   // cuối tuần/lễ: thêm 1 nồi (20%)
  return n;
};

/* nước chấm: từ ngày 6 mới bắt đầu có, và cũng leo thang chứ không bật 60% một cái */
export const dipChance = (day, cfg) => {
  const lv = levelOf(day, cfg);
  if (lv < 2) return 0;
  if (day <= 9) return .30;
  if (day <= 15) return .45;
  if (day <= 29) return .60;
  if (day <= 45) return .65;
  if (day <= 59) return .70;
  return .75;
};

/* độ cay: TRƯỚC ĐÂY từ ngày 6 là MỌI khách đòi cay (kể cả "không cay") → sốc.
 * Nay chỉ một phần khách đòi, và mức cay cũng nặng dần theo ngày. */
export const spicyChance = (day, cfg) => {
  const lv = levelOf(day, cfg);
  if (lv < 2) return 0;
  if (day <= 9) return .25;
  if (day <= 15) return .40;
  if (day <= 29) return .55;
  if (day <= 45) return .70;
  if (day <= 59) return .80;
  return .90;
};
const SPICY_W = [
  { day: 9,   w: [.30, .60, .10, .00] },   // ngày 6-9: chủ yếu "cay vừa"
  { day: 15,  w: [.25, .50, .22, .03] },
  { day: 29,  w: [.20, .45, .27, .08] },
  { day: 45,  w: [.16, .40, .30, .14] },
  { day: 59,  w: [.14, .36, .32, .18] },
  { day: 1e9, w: [.12, .33, .33, .22] },
];
export function spicyForDay(day, cfg, rng) {
  if (!rng.chance(spicyChance(day, cfg))) return null;         // không đòi cay → để trống
  const row = SPICY_W.find(r => day <= r.day) || SPICY_W[SPICY_W.length - 1];
  return wpick(rng, SPICY, row.w);
}

/* tên khách thường  */
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

/* sinh 1 đơn 
 * LUẬT (sửa 25/09 sau playtest): đơn ngày 1-2 không topping; từ ngày 3+ topping phải còn hàng,
 * khách KHÔNG bỏ về vì hết topping nữa (chỉ khi hết món chính khách mới bỏ về). */
export function genOrder(S, cfg, rng, lv = levelOf(S.day, cfg), opts = {}) {
  const un = k => S.unlocked[k], has = k => qty(S, k) > 0;
  const bases = POT_KEYS.filter(un);
  let so = null;
  const want = ks => { const k = rng.pick(ks); if (has(k)) return k; const av = ks.filter(has); if (av.length && rng.chance(.5)) return rng.pick(av); so = so || k; return k; };
  const dipPool = lv >= 2 ? DIP_KEYS.filter(un).filter(k => addOk(S, k, cfg) && has(k)) : [];
  const base = want(bases);
  let dip = dipPool.length && rng.chance(dipChance(S.day, cfg)) ? rng.pick(dipPool) : null;
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
    /* BUGFIX 26/09 (review: "recipe lỗi, chọn đúng bị sai"): UI quầy chỉ hiện độ cay từ level 2 (ngày 6+),
     * nhưng code cũ sinh đơn cay từ lv>=2 — ngày 1-5 khách gọi cay mà người chơi KHÔNG THỂ nêm → luôn "sai món" oan.
     * Giờ: đơn chỉ gọi cay khi UI cho nêm cay. */
    spicy: spicyForDay(S.day, cfg, rng)
  };
}

/* so khớp nồi đã nấu với đơn  */
export function matches(a, b) {
  return a.base === b.base
    && (a.dip || 'none') === (b.dip || 'none')
    && a.size === b.size
    && (b.spicy == null || a.spicy === b.spicy)
    && a.tops.length === b.tops.length
    && a.tops.every(t => b.tops.includes(t));
}

/* ghi rõ sai gì (để review khớp sự thật) */
export function wrongKinds(pot, o) {
  const k = {};
  if (pot.base !== o.base || (pot.dip || null) !== (o.dip || null)) k.mon = 1;
  if (pot.size !== o.size) k.size = 1;
  if (o.spicy != null && pot.spicy !== o.spicy) k.spicy = 1;
  if (pot.tops.length !== o.tops.length || !o.tops.every(t => pot.tops.includes(t))) k.tops = 1;
  return k;
}

/* kiên nhẫn tối đa (công thức của dự án + đạo tâm tu tiên)
 * RAMP BALANCE 25/09: đơn càng nhiều món nhúng khách càng kiên nhẫn chờ —
 * +18% mỗi món nhúng, món lâu chín (tôm/mực/nghêu/cá/dê/dược thiện/secret) cộng thêm +20% mỗi món,
 * để số topping tăng dần theo ngày không làm khách bỏ về oan. */
export function maxPat(cups, lv, S, cfg, isXian = false) {
  const nc = cups.length;
  const per = cups.reduce((a, x) => a + x.tops.length * .18 + slowN(x) * .2, 0) / nc;
  let max = (55 + (lv >= 2 ? 8 : 0)) * (S.upg.seats ? 1.25 : 1) * (1 + .8 * (nc - 1)) * (1 + per) * patMul(S);
  if (isXian) {
    max *= cfg.ls.daoTam;
    if (S.upg.anthan) max *= 1.25;
  }
  return max;
}

/* tính sao khi giao xong đơn  */
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

/* chọn loại khách hâm (ngày 1-9 không có; xác suất tăng dần)
 * TU VI Hợp Thể lẩu đạo: khí chất chủ quán át vía → giảm 40% tổng xác suất */
export function pickBrat(S, cfg, rng) {
  if (S.day < 10) return null;
  /* 07/10 (yêu cầu thiết kế): tổng xác suất khách hâm LEO NHẸ theo ngày — 4,5% ở ngày 10 → ~9%
   * ở ngày 40, trần 12%. Giữ nguyên hình dạng phân bố (hâm kiểu nào) của bản cũ, chỉ đổi tổng. */
  const tong = Math.min(.12, .045 + (S.day - 10) * .0012);
  const he = tong / .095;
  const r = rng.next() / bratMul(S);
  if (r >= he) return null;
  if (r < .04 * he) return 'hoi';
  if (r < .07 * he) return 'doi';
  if (r < .09 * he) return 'mac';
  if (r < .095 * he) return 'bung';
  return null;
}

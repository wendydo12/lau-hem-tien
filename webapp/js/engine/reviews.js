/* engine/reviews.js — máy ghép review khớp sự thật, chống lặp câu (TXT/PARTS/LONG). */
import { TXT, PARTS, LONG, TAIL_MOOD, MOOD, STAR_TXT, STARS, dname, iname, low } from './data.js?v=54';
import { XIAN_RECOGNIZE, initCult } from './cult.js?v=54';

/* bảng nhận diện ý trong câu review — dùng để kiểm câu nói có khớp sự thật không.
 * Mỗi nhóm là một ý khách có thể phàn nàn/khen; tên nhóm đặt theo tiếng Việt cho dễ đọc.
 */
const Y_REVIEW = {
  /* kêu phải chờ, đợi lâu, quán quá đông */
  doiLau: /chờ|đợi|mỏi chân|hàng dài|xếp hàng|đông|chật|cao điểm|trễ|kịp tay|đuối/,
  /* kêu giá cao, tiếc tiền */
  giaCao: /đắt|chát|giá cao|hơi cao|tiền hơi|phí|uổng|tiếc tiền|mặn tiền|túi tiền|kham không nổi|mặt bằng/,
  /* khen giá dễ chịu */
  giaDe: /rẻ|hời|giá mềm|tiền nhẹ|dễ kham|đáng tiền|phải chăng|vừa túi|sinh viên/,
  /* kêu làm sai đơn */
  saiDon: /sai|nhầm|lộn|nấu lại|đổi lại|bưng nhầm|thiếu topping|dặn kỹ|một đằng|một nẻo/,
  /* loại lỗi cụ thể — chỉ xét khi khách kêu làm sai */
  loai: {
    size: /size|nồi lớn|nồi to|cỡ lớn/,
    spicy: /cay|nhạt|lạt/,
    tops: /topping/,
    mon: /nồi khác|sai vị|nhầm món|món khác/
  }
};

/* câu review phải khớp với chuyện thật đã xảy ra trong ca */
export function reviewFits(t, why, c) {
  const f = c && c.rf; if (!f) return true;
  const L = t.toLowerCase();
  if (Y_REVIEW.doiLau.test(L) && !f.wait && !['wait', 'timeout', 'late'].includes(why)) return false;
  if (Y_REVIEW.giaCao.test(L) && !f.pricey) return false;
  if (Y_REVIEW.giaDe.test(L) && f.pricey) return false;
  if (Y_REVIEW.saiDon.test(L) && !f.wrong) return false;
  if (c.cups && c.cups.every(o => !o.tops.length) && /topping/.test(L)) return false;
  if (c.cups && c.cups.every(o => o.spicy == null) && /cay/.test(L) && why !== 'wrong') return false;
  if (/nồi lớn|nồi to/.test(L) && c.cups && !c.cups.some(o => o.size === 'L')) return false;
  if (why === 'wrong' && c.wk) { for (const k in Y_REVIEW.loai) if (!c.wk[k] && Y_REVIEW.loai[k].test(L)) return false; }
  return true;
}

const strip = t => t.replace(/\p{Extended_Pictographic}|\uFE0F/gu, '').trim();
const cap = x => x.charAt(0).toUpperCase() + x.slice(1);

/* ghép câu review từ kho chữ */
export function reviewText(S, why, c, st, extra, rng) {
  const o = c && c.cups ? c.cups[0] : null;
  const mon = o ? low(dname(o)) : 'lẩu';
  const top = o && o.tops.length ? low(iname(o.tops[0])) : 'topping';
  const shop = S.shopName || 'Lẩu Hẻm Tiên';
  const fill = t => {
    t = t.replace(/\{Mon\}/g, cap(mon)).replace(/\{Top\}/g, cap(top))
      .replace(/\{shop\}/g, 'quán ' + shop).replace(/\{mon\}/g, mon).replace(/\{top\}/g, top)
      .replace(/%/g, extra || mon);
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  const make = () => {
    const L = LONG[why];
    if (L && rng.chance(.5)) return fill(L.map(x => rng.pick(x)).join(' '));
    const P = PARTS[why];
    if (P) return fill(rng.pick(P[0]) + ', ' + rng.pick(P[1]));
    return fill(rng.pick(TXT[why] || TXT.great));
  };
  const used = new Set(S.reviews.map(r => r.k || strip(r.t)));
  const fits = x => reviewFits(x, why, c);
  const pool = (TXT[why] || []).map(fill).filter(x => !used.has(strip(x)) && fits(x));
  let t = pool.length && rng.chance(.75) ? rng.pick(pool) : make();
  for (let n = 0; n < 80 && (used.has(strip(t)) || !fits(t)); n++) t = n < 40 && pool.length ? rng.pick(pool) : make();
  if (!fits(t)) { const any = (TXT[why] || []).map(fill).filter(fits); t = any.length ? rng.pick(any) : t; }
  if (!/\p{Extended_Pictographic}/u.test(t)) {
    const lastTail = (S.reviews[0] && S.reviews[0].t.match(/\p{Extended_Pictographic}+$/) || [''])[0];
    const p = TAIL_MOOD[MOOD[why] || 'ok'].filter(x => x.trim() !== lastTail.trim());
    t += rng.pick(p.length ? p : TAIL_MOOD.ok);
  }
  return { t, k: strip(t) };
}

/* review khách tu tiên (giọng tiên hiệp — pool riêng) */
export function xReviewText(S, why, c, rng) {
  const good = why === 'great' || why === 'ok' || why === 'cheap';
  const pool = good ? TXT.xgreat : TXT.xbad;
  const used = new Set(S.reviews.filter(r => r.x).map(r => r.t));
  let t = rng.pick(pool);
  for (let n = 0; n < 20 && used.has(t); n++) t = rng.pick(pool);
  const o = c && c.cups ? c.cups[0] : null;
  if (o) t = t.replace(/\{mon\}/g, low(dname(o)));
  /* TU VI: khách tiên NHẬN RA cảnh giới của chủ quán (Kim Đan trở lên, 40% review tốt) */
  const realm = initCult(S).realm;
  if (good && realm >= 3 && XIAN_RECOGNIZE[realm] && rng.chance(.4)) {
    t = XIAN_RECOGNIZE[realm];
  }
  return { t, k: 'X' + t, x: true };
}

/* review của đại năng vi hành */
export function starReview(c, rng) {
  const st = STARS[c.star];
  const x = rng.pick(STAR_TXT[st.l].rv);
  return { t: x[0] + ' [Thiên đình dịch] ' + x[1], k: '★' + c.star + Math.random(), x: true, star: true };
}

/* ghi review vào sổ của quán */
export function addReview(S, st, why, online, c, extra, rng, R) {
  const isStar = c && c.star != null;
  if (isStar) st = 5;
  let r;
  if (isStar) r = starReview(c, rng);
  else if (c && c.xian) r = xReviewText(S, why, c, rng);
  else r = reviewText(S, why, c, st, extra, rng);
  const o = c && c.cups ? c.cups[0] : null;
  S.reviews.unshift({
    s: st, t: r.t, k: r.k, d: S.day, o: !!online, x: !!r.x,
    ...(isStar ? { st: c.star, tg: STARS[c.star].t } : {}),
    n: c ? c.name : 'Khách', f: c ? c.face : '🙂',
    b: o ? o.base : null, dp: o ? o.dip : null, tp: o ? o.tops : [], sz: o ? o.size : 'N'
  });
  S.revTotal = Math.max(S.revTotal || 0, S.reviews.length - 1) + 1;
  if (S.reviews.length > 2500) S.reviews.length = 2500;
  if (R && R.today) R.today.stars.push(st);
  /* thống kê ngày đang mở (stats.js đọc lại cho tab "Theo ngày" của hôm nay) */
  if (S.cur) { S.cur.starSum = (S.cur.starSum || 0) + st; S.cur.starN = (S.cur.starN || 0) + 1; }
}

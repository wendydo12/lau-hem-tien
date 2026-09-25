/* engine/reviews.js — máy ghép review khớp sự thật, chống lặp (port nguyên cơ chế TXT/PARTS/LONG + reviewFits gốc) */
import { TXT, PARTS, LONG, TAIL_MOOD, MOOD, STAR_TXT, STARS, dname, iname, low } from './data.js';

const RX = {
  wait: /chờ|đợi|lâu|chậm|mỏi chân|xếp hàng|hàng dài|quán đông|đông quá|cao điểm|trễ|xoay không kịp/,
  pNeg: /đắt|giá hơi|giá này|giá cao|hơi phí|phí tiền|tiếc tiền|chát|ví mỏng|so với giá|mạnh tay|đáng với giá|đáng giá|túi tiền|điều chỉnh giá|bảng giá|giảm giá|khuyến mãi/,
  pPos: /giá hợp lý|giá sinh viên|giá mềm|giá tốt|rẻ|đáng tiền|giá ok|giá phải chăng|hạt dẻ|hời|giá dễ thương|tâm lý/,
  wrong: /sai|nhầm|lộn|làm lại|đổi lại|thiếu topping|dặn kỹ|dặn rõ|một đằng/,
  k: { size: /size|nồi lớn|nồi to/, spicy: /cay|ngọt lịm|lạt lẽo/, tops: /topping/, mon: /nhầm|một đằng|sai vị|nồi khác/ }
};

/* review phải khớp sự thật (port reviewFits gốc) */
export function reviewFits(t, why, c) {
  const f = c && c.rf; if (!f) return true;
  const L = t.toLowerCase();
  if (RX.wait.test(L) && !f.wait && !['wait', 'timeout', 'late'].includes(why)) return false;
  if (RX.pNeg.test(L) && !f.pricey) return false;
  if (RX.pPos.test(L) && f.pricey) return false;
  if (RX.wrong.test(L) && !f.wrong) return false;
  if (c.cups && c.cups.every(o => !o.tops.length) && /topping/.test(L)) return false;
  if (c.cups && c.cups.every(o => o.spicy == null) && /cay/.test(L) && why !== 'wrong') return false;
  if (/nồi lớn|nồi to/.test(L) && c.cups && !c.cups.some(o => o.size === 'L')) return false;
  if (why === 'wrong' && c.wk) { for (const k in RX.k) if (!c.wk[k] && RX.k[k].test(L)) return false; }
  return true;
}

const strip = t => t.replace(/\p{Extended_Pictographic}|\uFE0F/gu, '').trim();
const cap = x => x.charAt(0).toUpperCase() + x.slice(1);

/* sinh câu review (port reviewText gốc) */
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
  return { t, k: 'X' + t, x: true };
}

/* review đại năng vi hành (port starLine gốc) */
export function starReview(c, rng) {
  const st = STARS[c.star];
  const x = rng.pick(STAR_TXT[st.l].rv);
  return { t: x[0] + ' [Tự động dịch] ' + x[1], k: '★' + c.star + Math.random(), x: true, star: true };
}

/* ghi review vào S (port addReview gốc) */
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
}

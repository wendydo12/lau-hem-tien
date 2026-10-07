/* engine/replies.js — TƯỜNG ĐÁNH GIÁ + CHỦ QUÁN PHẢN HỒI (tính năng ĐẶC BIỆT).
 * Bố cục ô review tham khảo từ thể loại: review có avatar, tên, ngày, sao, chữ, HÌNH MÓN đã gọi, và ô "Quán đáp lại".
 * Nâng cấp của mình: phản hồi theo 3 TÔNG GIỌNG — mỗi tông có hệ quả thật lên uy tín,
 * biến tường review từ chỗ "đọc cho vui" thành một lượt chơi có chiến lược.
 *
 * Toàn bộ câu chữ phản hồi mẫu + luật tông giọng: SÁNG TÁC GỐC của dự án.
 * (Toàn bộ câu chữ phản hồi do dự án tự viết.)
 */
import { rating } from './economy.js';
import { addExp, EXP } from './cult.js';
import { iname, low } from './data.js';

/* ===== 3 TÔNG GIỌNG ===== */
export const TONES = {
  polite: {
    id: 'polite', n: 'Dịu dàng', ico: '🌸',
    d: 'Cảm ơn khách, xin lỗi chân thành. An toàn, không bao giờ phản tác dụng.',
    risk: 0, base: 1
  },
  funny: {
    id: 'funny', n: 'Hài hước', ico: '😄',
    d: 'Đùa vui có duyên. Khách trẻ thích, khách lớn tuổi đôi khi không hiểu.',
    risk: .1, base: 2
  },
  savage: {
    id: 'savage', n: 'Cà khịa', ico: '🔥',
    d: 'Xéo xắt có muối. Dễ viral, kéo khách tò mò — nhưng đụng tự ái là ăn 1 sao ngay.',
    risk: .3, base: 3
  }
};
export const TONE_KEYS = ['polite', 'funny', 'savage'];

/* ===== NGÂN HÀNG CÂU PHẢN HỒI MẪU (sáng tác gốc, lẩu hẻm Sài Gòn) =====
 * {n} = tên khách · {mon} = tên món · {sao} = số sao khách chấm */
export const REPLY_BANK = {
  /* 26/09 (yêu cầu thiết kế): xưng "quán"/"mình" — tên chủ quán do người chơi đặt,
   * KHÔNG cứng "Minh" trong mẫu. Gọi khách {n} (tên thật của khách, mặc định "bạn"). */
  polite: {
    pos: [
      'Dạ quán cảm ơn {n} nhiều ạ, lần sau ghé quán tặng thêm chén rau nha!',
      'Đọc review của {n} mà quán vui cả buổi. Cảm ơn đã thương quán hẻm nhỏ này.',
      'Cảm ơn {n}! Nồi {mon} hôm đó là mẻ nước dùng quán ưng nhất tuần đấy ạ.',
      'Dạ cảm ơn {n} đã ghé. Quán sẽ giữ lửa đều như bữa nay cho lần sau!'
    ],
    mid: [
      'Dạ quán ghi nhận góp ý của {n}. Mai quán nêm lại tay, mời {n} ghé kiểm chứng ạ!',
      'Cảm ơn {n} đã nói thật. Quán nhỏ nên từng lời góp ý đều quý như vàng.',
      'Dạ quán xin lỗi vì nồi {mon} chưa tới. Lần sau {n} cứ dặn, mình nấu riêng một phần!'
    ],
    neg: [
      'Dạ quán thành thật xin lỗi {n}. Cho quán một cơ hội nấu lại nồi khác tử tế hơn ạ.',
      'Quán xin lỗi vì trải nghiệm chưa vui của {n}. Mình đã tự kiểm điểm tay nghề tối nay.',
      'Dạ mình tiếp thu ạ. {n} ghé lại lần nữa được không, quán chuộc lỗi bằng nồi {mon} chuẩn vị!'
    ]
  },
  funny: {
    pos: [
      '{n} khen vậy mai mình nấu bằng hai tay luôn!',
      'Nồi {mon} hôm đó ngon vì khách dễ thương đó {n} ơi, bí quyết nằm ở chỗ ngồi ăn.',
      'Review của {n} hay hơn cả bảng hiệu quán. Quán in ra dán trước cửa được hông?',
      'Dạ cảm ơn {n}! Mình đã tự thưởng cho mình... một chén nước lẩu còn dư.'
    ],
    mid: [
      '{n} chê nhẹ vậy là còn thương quán lắm rồi. Chê mạnh là mình khóc giữa hẻm luôn á.',
      'Dạ để mình "nâng cấp firmware" cho cái lưỡi, hôm sau {n} ghé test lại giùm nha!',
      'Nồi {mon} hôm đó chắc tại mình vừa nấu vừa nghĩ coi trưa mai ăn gì. Xin lỗi {n}!'
    ],
    neg: [
      'Trời ơi {n}, đọc review mà mình muốn xách nồi chạy theo xin lỗi tận nhà!',
      'Dạ lỗi tại quán. Phạt mình ăn lẩu nhạt một tuần cho thấm. {n} tha lỗi nha!',
      '{n} ơi, quán đã tự cúp lương chính chủ rồi. Cho quán thêm một cơ hội nghen!'
    ]
  },
  savage: {
    pos: [
      'Biết ngon thì dẫn cả xóm qua giùm, một mình {n} ăn hết spotlight rồi.',
      'Dạ cảm ơn. Nhưng khen xong nhớ ghé lại, khen suông quán không nhận nha {n}.',
      'Nồi {mon} đó quán nấu bằng đạo tâm, {n} ăn một miếng là hiểu liền hà. Khỏi khen nhiều.'
    ],
    mid: [
      '{n} chê vậy chứ mai cũng ghé lại thôi, quán biết mà. Hẻm này nghiện lẩu nặng rồi.',
      'Góp ý nhận rồi. Nhưng lần sau góp ý xong nhớ ăn hết dĩa rau giùm, quán xót ruột.',
      'Dạ quán sẽ nấu ngon hơn... sau khi {n} khen quán một câu cho có tinh thần đã.'
    ],
    neg: [
      'Nồi {mon} mà chê thì chắc khẩu vị {n} cần đi "bảo hành" rồi đó.',
      'Dạ 1 sao của {n} quán treo trước cửa cho vui. Khách sau thấy càng tò mò vô ăn.',
      '{n} chê thì quán buồn 5 phút thôi, xong đông khách hơn vì ai cũng muốn thử "quán bị chê". Cảm ơn {n}!'
    ]
  }
};

/* xếp review vào ngăn pos/mid/neg theo số sao */
export const bucketOf = s => s >= 4 ? 'pos' : s === 3 ? 'mid' : 'neg';

/* sinh câu phản hồi theo tông + số sao + ngữ cảnh món */
export function genReply(rng, tone, s, name, mon) {
  const bank = REPLY_BANK[tone] || REPLY_BANK.polite;
  const arr = bank[bucketOf(s)];
  /* 26/09 (yêu cầu thiết kế): luôn xưng hô "bạn" — lịch sự, không gọi thẳng tên riêng khách.
   * Chủ quán xưng "quán"/"mình" (tên chủ do người chơi đặt, không cứng trong mẫu). */
  return rng.pick(arr).replace(/\{n\}/g, 'bạn')
    .replace(/\{mon\}/g, mon || 'lẩu').replace(/\{sao\}/g, s);
}

/* ===== HỆ QUẢ PHẢN HỒI (gọi khi chủ quán bấm gửi) =====
 * Trả về {ok, effect, starsDelta, viral, expGained, backfire}.
 * opts: {text: câu tự viết/custom được duyệt, av: 'me'|'anon'|emoji}
 * Luật (cân bằng 25/09):
 * - polite: +1 uy tín nhẹ, không rủi ro. Review xấu được an ủi có thể sửa sao (+1, 40%).
 * - funny: +mạnh hơn, 10% "viral" → quà tiền 50-150k (clip trả lời lên xu hướng).
 * - savage: +mạnh nhất với review xấu kiểu "khách vô lý", NHƯNG risk 30% phản tác dụng:
 *     khách cũ giận → sao tụt 1, review mới tiêu cực, mất 1 ngày uy tín.
 * - Review của khách tu tiên: savage LUÔN phản tác dụng (đụng tự ái đại năng = tai họa).
 * - Mỗi phản hồi cho chút tu vi (chủ quán "tu" cả đạo đối nhân xử thế). */
export function applyReply(S, cfg, rng, review, tone, opts = {}) {
  if (!review || review.reply) return { ok: false, why: 'already' };
  const out = { ok: true, tone, viral: false, backfire: false, starUp: false, starsDelta: 0, expGained: 0, money: 0 };
  const T = TONES[tone] || TONES.polite;
  const isXian = !!review.x || review.st != null;

  /* chữ: câu người chơi đã duyệt (từ gợi ý hoặc tự viết) hoặc sinh mới */
  const mon = review.b ? low(iname(review.b)) : 'lẩu';
  out.text = opts.text || review.replyDraft || genReply(rng, tone, review.s, review.n, mon);
  const av = opts.av || review.replyAv || 'me';

  let risk = T.risk;
  if (tone === 'savage' && isXian) risk = .85;              // cà khịa đại năng = tự sát
  if (tone === 'savage' && review.s <= 2) risk -= .15;       // khách chê vô lý thì cà khịa lại... hợp lý
  if (tone === 'funny' && review.s >= 4) risk = .02;         // đùa với khách đang vui = gần như miễn nhiễm

  if (rng.chance(risk)) {
    /* PHẢN TÁC DỤNG */
    out.backfire = true;
    review.s = Math.max(1, review.s - 1);
    out.starsDelta = -1;
    S.reviews.unshift({
      s: 1, t: isXian
        ? 'Chủ quán to gan dám mỉa mai bổn tọa. Hừ, lần sau khỏi mong khách tiên ghé.'
        : 'Đã chê cho một câu còn bị chủ quán cà khịa lại. Cạch mặt quán này luôn!',
      k: 'backfire' + S.day + rng.int(999), d: S.day, n: review.n, f: review.f,
      b: review.b, dp: review.dp, tp: review.tp || [], sz: review.sz || 'N', x: isXian, back: true
    });
    addExp(S, EXP.star1 * 2, 'cà khịa trật');
    out.expGained = EXP.star1 * 2;
  } else {
    /* THÀNH CÔNG */
    if (tone === 'polite' && review.s <= 2 && rng.chance(.4)) {
      review.s += 1; out.starUp = true; out.starsDelta = 1;   // khách nguôi giận, sửa sao
    }
    if (tone === 'funny' && rng.chance(.1)) {
      out.viral = true;
      out.money = rng.round5k(50000, 150000);
      S.money += out.money;
      S.cur.gift = (S.cur.gift || 0) + out.money;
    }
    if (tone === 'savage' && rng.chance(.18)) {
      out.viral = true;                                        // cà khịa mặn → clip viral mạnh hơn
      out.money = rng.round5k(100000, 300000);
      S.money += out.money;
      S.cur.gift = (S.cur.gift || 0) + out.money;
    }
    const e = addExp(S, 1, 'đối nhân');
    out.expGained = 1;
    out.broke = e.broke; out.newRealm = e.newRealm;
  }

  review.reply = { tone, text: out.text, day: S.day, av };
  S.replied = (S.replied || 0) + 1;
  out.ok = true;
  return out;
}

/* sửa phản hồi: giữ tông cũ hoặc đổi tông — đổi tông thì roll lại hệ quả (risk/2, nhẹ hơn) */
export function editReply(S, cfg, rng, review, tone, customText) {
  if (!review || !review.reply) return { ok: false };
  const old = review.reply;
  if (customText != null && customText.trim()) {
    review.reply = { ...old, tone, text: customText.trim().slice(0, 400), edited: true, day: S.day };
    return { ok: true, edited: true };
  }
  review.reply = { tone, text: genReply(rng, tone, review.s, review.n, review.b ? low(iname(review.b)) : 'lẩu'), edited: true, day: S.day };
  return { ok: true, edited: true, text: review.reply.text };
}

/* review chưa trả lời (để UI đếm badge) */
export const unanswered = S => (S.reviews || []).filter(r => !r.reply && !r.back).length;

/* thống kê hành trình cho màn GAME OVER (chết cũng phải chết đẹp) */
export function journeyStats(S) {
  const best = { mon: null, q: 0 };
  (S.history || []).forEach(r => Object.entries(r.sales || {}).forEach(([k, x]) => {
    if (x.q > best.q && k !== 'L') { best.q = x.q; best.mon = k; }
  }));
  return {
    days: S.day - 1,
    served: S.served || 0,
    totalRev: S.totalRev || 0,
    reviews: (S.reviews || []).length,
    rating: rating(S),
    bestMon: best.mon,
    bestQ: best.q,
    realm: S.cult ? S.cult.realm : 0,
    xianServed: (S.history || []).reduce((a, r) => a + (r.starN || 0), 0)
  };
}

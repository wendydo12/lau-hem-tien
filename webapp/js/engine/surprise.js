/* engine/surprise.js — SỰ KIỆN BẤT NGỜ TRONG CA (thiết kế riêng của dự án Lẩu Hẻm Tiên)
 *
 * Khác hẳn kiểu "hiện thông báo rồi bấm một nút cảm xúc": mỗi sự kiện ở đây là một TÌNH HUỐNG
 * của con hẻm, đưa ra 2-3 CÁCH XỬ LÝ, người chơi chọn rồi chịu hậu quả thật (tiền, linh thạch,
 * tu vi, lượng khách ngày mai, sổ nợ khách ghi lại). Không có lựa chọn nào ăn chắc.
 *
 * LUẬT CÂN BẰNG (lệnh phu quân 07/10/2026):
 *  1. Ngày 1-4 yên ổn tuyệt đối — không sự kiện xấu.
 *  2. Ngày 5: đúng MỘT sự kiện xấu nhẹ cho biết mùi đời. Từ ngày 6 trở đi mới theo tỉ lệ.
 *  3. Mỗi ca tối đa 1 sự kiện xấu + 1 sự kiện tốt. Mỗi sự kiện chỉ nổ một lần.
 *  4. Sự kiện xấu không bao giờ lấy quá 12% tiền đang có trong két.
 *  5. Mọi con số đều suy từ trạng thái thật của ván (tiền, kho, hao hụt, khách đã phục vụ).
 *
 * Toàn bộ câu chữ, tên sự kiện, cách xử lý: SÁNG TÁC GỐC của dự án (hẻm nhỏ Sài Gòn + tu tiên).
 * GIỌNG KỂ: người kể trong game xưng "mình" (chủ quán), gọi người chơi là "bạn" ở chỗ cần —
 * TUYỆT ĐỐI không dùng giọng cá nhân của trợ lý (thiếp/phu quân/chàng) trong câu chữ trong game.
 */
import { ITEMS, POT_KEYS } from './data.js';
import { qty, addStock } from './stock.js';
import { addExp, EXP } from './cult.js';
import { wpick } from './rng.js';

/* trần thiệt hại cho mọi nhánh xấu (luật 4) */
export const capBad = (S, v) => Math.max(0, Math.min(Math.round(v), Math.floor((S.money || 0) * 0.12)));

/* điểm sạch của quán — dùng cho thanh tra vệ sinh. Suy từ chuyện thật trong ca:
 * hao hụt/hỏng món, nấu sai, khách gọi mà hết hàng; trang bị sẵn có cộng thêm. */
export function cleanScore(S, R) {
  const spoil = (S.cur && S.cur.spoil && S.cur.spoil.n) || 0;
  const wrong = (R && R.today && R.today.wrong) || 0;
  const soldLost = (R && R.today && R.today.soldLost) || 0;
  let sc = 100 - spoil * 6 - wrong * 10 - soldLost * 4;
  if (S.upg && S.upg.seats) sc += 4;
  if (S.upg && S.upg.ac) sc += 4;
  if (S.upg && S.upg.sealer) sc += 4;
  return Math.max(0, Math.min(100, Math.round(sc)));
}

/* số phần nguyên liệu chính còn trong kho (để mô tả thiệt hại cho thật) */
const mainLeft = S => POT_KEYS.reduce((a, k) => a + (S.unlocked[k] ? qty(S, k) : 0), 0);

/* ---------- BẢNG SỰ KIỆN ---------- */
export const SURPRISES = [
  /* ============ XẤU ============ */
  {
    id: 'quyt', n: 'Khách quên trả tiền', ico: '💸', kind: 'bad', from: 5, w: 12,
    need: (S, R) => R.today.served >= 2,
    scene: 'Khách cuối cùng đứng dậy đi thẳng ra hẻm, tay vẫn cầm điện thoại. Chén đũa còn nguyên trên bàn.',
    choices: [
      {
        n: 'Đuổi theo đòi cho bằng được',
        d: 'Khoảng 6 phần được: đòi đủ tiền nồi. Bốn phần hụt: chạy theo một quãng, về tới quán thì mất lửa một nồi.',
        run: (S, R, cfg, rng) => {
          const v = Math.round(Math.max(20000, Math.min(120000, S.money * 0.05)));
          if (rng.chance(0.6)) return { money: v, exp: 1, tone: 'good', msg: 'Rượt theo tới đầu hẻm, khách gãi đầu trả đủ. Còn hơn không!' };
          const lose = capBad(S, v * 0.6);
          return { money: -lose, exp: -1, tone: 'bad', msg: 'Chạy theo một quãng, khách mất hút. Về tới quán thì nồi canh đã khét, mất thêm tiền hàng.' };
        }
      },
      {
        n: 'Nhịn cho qua, coi như đãi khách',
        d: 'Mất đúng tiền nồi đó. Được tiếng quán hiền, đạo tâm nhích lên một chút.',
        run: (S) => {
          const v = capBad(S, Math.round(Math.max(20000, Math.min(120000, S.money * 0.05))));
          return { money: -v, exp: 1, tone: 'bad', msg: 'Mình ghi vào sổ: coi như đãi khách một bữa. Lòng nhẹ hơn nhưng két nhẹ hơn.' };
        }
      },
      {
        n: 'Ghi sổ, hẹn mai ghé trả',
        d: 'Một nửa khách quay lại trả gấp rưỡi vì ngại. Nửa còn lại thì coi như mất trắng.',
        run: (S, R, cfg, rng) => {
          const v = Math.round(Math.max(20000, Math.min(120000, S.money * 0.05)));
          if (rng.chance(0.5)) {
            S.pendCollect = { v: Math.round(v * 1.5), due: S.day + 1 };
            return { collect: Math.round(v * 1.5), tone: 'good', msg: 'Mình ghi sổ hai chữ "mai trả". Sáng mai biết đâu người ta quay lại.' };
          }
          return { money: -capBad(S, v), tone: 'bad', msg: 'Ghi sổ xong, khách đi mất. Sổ thì còn, người thì không.' };
        }
      }
    ]
  },
  {
    id: 'trom_van', n: 'Bóng người lấp ló trước két', ico: '🥷', kind: 'bad', from: 5, w: 10,
    need: (S, R) => S.money > 300000,
    scene: 'Đang bưng nồi thì mình liếc ra cửa sau: một bóng người cúi xuống, tay đặt lên then cửa.',
    choices: [
      {
        n: 'Buông nồi, ra chặn ngay',
        d: 'Bảy phần giữ được tiền nguyên vẹn và bắt quả tang. Ba phần hắn vọt nhanh, mất một ít.',
        run: (S, R, cfg, rng) => {
          if (rng.chance(0.7)) return { exp: 2, tone: 'good', msg: 'Mình ra tới cửa thì bóng người co giò chạy. Két vẫn nguyên, lửa vẫn đỏ.' };
          return { money: -capBad(S, S.money * 0.05), tone: 'bad', msg: 'Hắn vọt qua hàng rào. Két hụt mất một khoản, may không đáng kể.' };
        }
      },
      {
        n: 'Khoá cửa sau, làm thinh bán tiếp',
        d: 'Mất một ít tiền lẻ ngoài sân, nhưng nồi không khét, khách không hay.',
        run: (S) => ({ money: -capBad(S, S.money * 0.03), tone: 'bad', msg: 'Mình lặng lẽ cài then. Sáng mai kiểm lại thiếu một ít, nhưng ca bán vẫn trọn.' })
      },
      {
        n: 'Hô hàng xóm dậy bắt',
        d: 'Không mất tiền, nhưng cả hẻm nghe chuyện: mai quán vắng khách hơn một chút.',
        run: (S) => {
          S.pendTraffic = { mul: -0.06, day: S.day + 1 };
          return { traffic: -0.06, tone: 'neutral', msg: 'Cả hẻm bật đèn. Kẻ kia chạy mất, tiền còn nguyên — mà chuyện thì lan xa.' };
        }
      }
    ]
  },
  {
    id: 've_sinh', n: 'Thanh tra vệ sinh đột xuất', ico: '🧹', kind: 'bad', from: 6, w: 10,
    need: (S, R) => S.day >= 6,
    scene: (S, R) => 'Ba người đeo phù hiệu đứng trước quán, tay cầm kẹp giấy. "Quán mình có giấy tờ đầy đủ chứ? Cho chúng tôi xem khu bếp." — Điểm sạch hiện tại: ' + cleanScore(S, R) + '/100.',
    choices: [
      {
        n: 'Mở cửa cho kiểm tra thẳng',
        d: 'Quán sạch thì được khen (mai đông hơn); tạm được thì nhắc nhở; bẩn thì phạt nặng.',
        run: (S, R, cfg, rng) => {
          const sc = cleanScore(S, R);
          if (sc >= 80) { S.pendTraffic = { mul: 0.05, day: S.day + 1 }; return { exp: 1, traffic: 0.05, tone: 'good', msg: 'Đoàn xem một vòng, gật gù: bếp gọn, đá để đúng chỗ. Còn xin thêm một chén nước dùng.' }; }
          if (sc >= 50) return { tone: 'neutral', msg: 'Họ nhắc nhở vài chỗ rồi đi. Không phạt, nhưng mình nhớ mặt từng cái khăn lau.' };
          return { money: -capBad(S, S.money * 0.07), tone: 'bad', msg: 'Biên bản ghi rõ chỗ đá kê sát lối đi, hàng hết hạn chưa dọn. Phạt tại chỗ.' };
        }
      },
      {
        n: 'Xin khất tới mai dọn lại',
        d: 'Mất chút tiền cho có giấy hẹn, đổi lại không bị lập biên bản.',
        run: (S) => ({ money: -capBad(S, S.money * 0.02), tone: 'neutral', msg: 'Mình xin một giấy hẹn. Tối nay dọn lại từng góc, khuya mới xong.' })
      },
      {
        n: 'Kín đáo gửi chút quà',
        d: 'Bốn phần rưỡi họ đi êm. Năm phần rưỡi bị lập biên bản nặng hơn, mai hẻm còn xì xào.',
        run: (S, R, cfg, rng) => {
          if (rng.chance(0.45)) return { exp: -2, tone: 'neutral', msg: 'Đoàn đi êm. Mình đứng nhìn theo, trong bụng chẳng vui.' };
          S.pendTraffic = { mul: -0.08, day: S.day + 1 };
          return { money: -capBad(S, S.money * 0.09), exp: -2, traffic: -0.08, tone: 'bad', msg: 'Bị lập biên bản vì tội không đàng hoàng. Phạt nặng hơn, mai hẻm kể chuyện.' };
        }
      }
    ]
  },
  {
    id: 'hang_xom', n: 'Hàng xóm gõ cửa phàn nàn', ico: '🚪', kind: 'bad', from: 6, w: 9,
    need: (S, R) => R.today.arrived >= 3,
    scene: 'Bà Tư cạnh nhà đứng ở mép hẻm, tay quạt lia lịa: "Nhà tui có cháu nhỏ, mấy cái chén kêu hoài à".',
    choices: [
      {
        n: 'Xin lỗi, gửi bà một phần ăn',
        d: 'Tốn chút tiền, đổi lại mai cả hẻm quý quán, khách tới thêm chút.',
        run: (S) => {
          S.pendTraffic = { mul: 0.04, day: S.day + 1 };
          return { money: -capBad(S, 40000), traffic: 0.04, tone: 'neutral', msg: 'Bà Tư nhận phần ăn, cười rồi đi. Hẻm nhỏ mà lòng vòng, ai cũng là hàng xóm.' };
        }
      },
      {
        n: 'Giảm lửa, bảo khách nói nhỏ',
        d: 'Không tốn tiền, nhưng khách đang chờ thấy quán rề rà nên sốt ruột.',
        run: (S, R) => {
          const n = (R.slots || []).filter(Boolean).length;
          (R.slots || []).forEach(c => { if (c) c.pat = Math.max(1, c.pat - c.max * 0.12); });
          return { tone: 'neutral', msg: 'Mình vặn nhỏ bếp than. ' + (n ? n + ' khách đang chờ liếc đồng hồ.' : 'Bà Tư gật đầu rồi về.') };
        }
      },
      {
        n: 'Dạ một tiếng rồi làm tiếp',
        d: 'Không tốn gì. Nhưng khoảng một nửa là mai hẻm mách nhau, quán vắng hơn.',
        run: (S, R, cfg, rng) => {
          if (rng.chance(0.5)) { S.pendTraffic = { mul: -0.08, day: S.day + 1 }; return { traffic: -0.08, tone: 'bad', msg: 'Bà Tư đi về, miệng lẩm bẩm. Sáng sau mình nghe loáng thoáng chuyện ở đầu hẻm.' }; }
          return { tone: 'neutral', msg: 'Bà Tư đi về. Tối nay hẻm vẫn yên.' };
        }
      }
    ]
  },
  {
    id: 'giat', n: 'Tiếng rồ ga ngoài đầu hẻm', ico: '🛵', kind: 'bad', from: 7, w: 8,
    need: (S) => S.money > 2000000,
    scene: 'Tiền trong ca đang dày. Ngoài đầu hẻm có tiếng rồ ga, hai bóng người chạy chậm ngang quán rồi vòng lại.',
    choices: [
      {
        n: 'Ôm tiền vào trong, chốt cửa',
        d: 'An toàn. Đêm nay ngủ ngon, khách chờ thêm chút cũng được.',
        run: () => ({ exp: 1, tone: 'good', msg: 'Mình ôm hộp tiền vào nhà sau. Ngoài kia tiếng rồ ga xa dần.' })
      },
      {
        n: 'Đứng nhìn, không sợ',
        d: 'Ba phần rưỡi bị vờn rồi giật mất một khoản. Sáu phần rưỡi không sao.',
        run: (S, R, cfg, rng) => {
          if (rng.chance(0.35)) return { money: -capBad(S, S.money * 0.06), tone: 'bad', msg: 'Xe vòng qua, một tay thò vào giật túi tiền lẻ. Hẻm tối, chạy theo không kịp.' };
          return { exp: 1, tone: 'good', msg: 'Hai người đó nhìn quán rồi phóng mất. Đêm nay coi như thoát.' };
        }
      },
      {
        n: 'Rủ chú hàng xóm đứng chung',
        d: 'Không mất gì, lại thêm tình hẻm: mai khách tới thêm chút.',
        run: (S) => {
          S.pendTraffic = { mul: 0.03, day: S.day + 1 };
          return { traffic: 0.03, tone: 'good', msg: 'Chú Bảy xách ghế ra ngồi trước quán. Hai người đàn ông nhìn nhau tới khi chiếc xe phóng đi.' }
        }
      }
    ]
  },

  /* ============ TỐT ============ */
  {
    id: 've_so', n: 'Khách trúng vé số, lì xì lại quán', ico: '🎟️', kind: 'good', from: 6, w: 10,
    need: (S, R) => R.today.served >= 2,
    scene: 'Một khách quen vỗ đùi đánh đét, khoe tờ vé số vừa trúng, rồi rút phong bì đặt lên bàn.',
    choices: [
      {
        n: 'Nhận lì xì, cảm ơn',
        d: 'Thêm một khoản vào két ngay.',
        run: (S, R, cfg, rng) => {
          const v = rng.round5k(60000, 250000);
          return { money: v, tone: 'good', msg: 'Phong bì đỏ nằm gọn trong két: +' + v + 'đ, số hên của người ta rơi xuống quán.' };
        }
      },
      {
        n: 'Không lấy, mời thêm nồi lẩu',
        d: 'Không thêm tiền, đổi lại mai cả xóm kéo tới.',
        run: (S) => {
          S.pendTraffic = { mul: 0.06, day: S.day + 1 };
          return { traffic: 0.06, tone: 'good', msg: 'Mình đẩy phong bì lại, bưng thêm nồi lẩu. Khách cười tới hẻm vẫn nghe.' };
        }
      },
      {
        n: 'Chia đôi với người phụ quán',
        d: 'Vào két một nửa, nửa kia cho người phụ. Đạo tâm vững.',
        run: (S, R, cfg, rng) => {
          const v = rng.round5k(60000, 250000);
          const half = Math.round(v / 2);
          if (S.upg && (S.upg.staff1 || S.upg.staff2 || S.upg.staff3)) {
            S.cur.staffTip = (S.cur.staffTip || 0) + half;
            return { money: half, exp: 1, tone: 'good', msg: 'Một nửa mình đưa người phụ quán. Ai cũng cười tươi tới hết ca.' };
          }
          return { money: v, exp: 1, tone: 'good', msg: 'Chưa có ai phụ quán, quán gom hết vào két rồi tự thưởng một chén canh.' };
        }
      }
    ]
  },
  {
    id: 'tip_nong', n: 'Khách hào phóng típ nóng', ico: '💵', kind: 'good', from: 6, w: 9,
    need: (S, R) => (R.today.stars || []).includes(5),
    scene: 'Vừa có khách chấm năm sao. Người đó đứng dậy, đặt thêm một xấp tiền nhỏ lên bàn rồi đi trước khi mình kịp cản.',
    choices: [
      {
        n: 'Cảm ơn, nhận vào két',
        d: 'Thêm tiền nóng trong ca.',
        run: (S, R, cfg, rng) => {
          const v = rng.round5k(40000, 120000);
          return { money: v, tone: 'good', msg: 'Tiền tip nóng: +' + v + 'đ. Có thực khách thương thì quán còn đường làm ăn.' };
        }
      },
      {
        n: 'Gói lại chén rau gửi theo',
        d: 'Không thêm tiền, đổi lại mai hẻm truyền tai nhau mà tới.',
        run: (S) => {
          S.pendTraffic = { mul: 0.05, day: S.day + 1 };
          return { traffic: 0.05, tone: 'good', msg: 'Mình gói chén rau với ít nước chấm đuổi theo. Khách cười, hẹn mai dẫn bạn.' };
        }
      },
      {
        n: 'Trả lại, nói quán không lấy thêm',
        d: 'Không tiền, không khách thêm — nhưng đạo tâm vững, tu vi nhích.',
        run: () => ({ exp: 2, tone: 'good', msg: 'Mình đặt lại xấp tiền lên bàn khách vừa ngồi, cúi đầu chào. Bụng nhẹ hơn két.' })
      }
    ]
  },
  {
    id: 'ong_dia', n: 'Ông địa ghé quán đêm khuya', ico: '🕯️', kind: 'good', from: 7, w: 8,
    need: (S, R) => S.money > 100000 && (R.today.arrived >= 2),
    scene: 'Ngọn đèn dầu trước quán lắt lửa rồi sáng đều. Một ông cụ râu dài, áo bà ba, ngồi xuống cái ghế trống, gõ gõ gậy nghe rất quen.',
    choices: [
      {
        n: 'Thắp nhang, cúng chén nước trong',
        d: 'Tốn chút tiền hương khói. Đạo tâm vững, mai hẻm đông hơn.',
        run: (S) => {
          S.pendTraffic = { mul: 0.08, day: S.day + 1 };
          return { money: -Math.min(50000, S.money), exp: 3, traffic: 0.08, tone: 'good', msg: 'Mình thắp ba nén nhang, rót chén nước trong. Ông cụ gật đầu, đêm nay hẻm ấm lạ.' };
        }
      },
      {
        n: 'Cúi đầu chào, rót chén trà nóng',
        d: 'Không tốn tiền, tu vi nhích nhẹ.',
        run: () => ({ exp: 1, tone: 'good', msg: 'Mình rót chén trà nóng đặt trước mặt. Ông cụ nhấp một ngụm, mắt sáng lên rồi biến mất sau cột nhà.' })
      },
      {
        n: 'Đang bận, lơ đi cho xong ca',
        d: 'Không tốn gì. Nhưng khoảng một phần tư là bị quở: mai vắng khách.',
        run: (S, R, cfg, rng) => {
          if (rng.chance(0.25)) { S.pendTraffic = { mul: -0.05, day: S.day + 1 }; return { traffic: -0.05, tone: 'bad', msg: 'Mình quay lại thì ghế trống không. Đêm đó hẻm lạnh, sáng sau vắng khách lạ thường.' }; }
          return { tone: 'neutral', msg: 'Mình lo nồi lẩu, ngoảnh lại thì chẳng còn ai. Chắc ông đi rồi.' };
        }
      }
    ]
  }
];

export const BY_ID = Object.fromEntries(SURPRISES.map(e => [e.id, e]));
export const kindsOf = k => SURPRISES.filter(e => e.kind === k);

/* ---------- BỐC SỰ KIỆN ---------- */
/* Chọn sự kiện theo loại (xấu/tốt). Bốc Ở THỜI ĐIỂM BẮN, không bốc trước lúc mở quán —
 * vì điều kiện của sự kiện dựa vào chuyện đang xảy ra trong ca (đã phục vụ mấy khách,
 * két dày chưa, có khách chấm 5 sao chưa). opts: { mild: chỉ lấy sự kiện nhẹ mở từ ngày 5,
 * exclude: id đã bắn trong ca này } */
export function drawEvent(S, R, cfg, rng, kind, opts = {}) {
  const { mild = false, exclude = [] } = opts;
  const pool = SURPRISES.filter(e => e.kind === kind && S.day >= e.from && !exclude.includes(e.id)
    && (!mild || e.from <= 5) && (!e.need || e.need(S, R)));
  if (!pool.length) return null;
  return wpick(rng, pool, pool.map(e => e.w));
}

/* Kế hoạch cho cả ca: chỉ quyết định LOẠI sự kiện (xấu/tốt) và MỐC THỜI GIAN bắn, không bốc
 * sẵn sự kiện cụ thể — vì đến lúc đó mới biết trong ca có chuyện gì để chọn cho khớp. */
export function planShift(S, R, cfg, rng, shiftMs) {
  if (S.day < 5) return null;
  const plan = { events: [] };
  const total = shiftMs / 1000;
  if (S.day === 5) {
    /* ngày 5: đúng một sự kiện xấu NHẸ (loại mở từ ngày 5), để người chơi biết đời không như mơ */
    plan.events.push({ kind: 'bad', mild: true, at: Math.round(total * (0.35 + rng.next() * 0.3)) });
    if (rng.chance(0.5)) plan.events.push({ kind: 'good', at: Math.round(total * (0.55 + rng.next() * 0.3)) });
    plan.events.sort((a, b) => a.at - b.at);
    return plan;
  }
  const put = (kind, at) => plan.events.push({ kind, at: Math.round(at) });
  /* từ ngày 6: tỉ lệ tăng rất chậm theo ngày, chặn trần để không thành ức chế */
  const badP = Math.min(0.34, 0.2 + (S.day - 6) * 0.006);
  const goodP = 0.2;
  if (rng.chance(badP)) put('bad', total * (0.25 + rng.next() * 0.55));
  if (rng.chance(goodP)) put('good', total * (0.2 + rng.next() * 0.7));
  /* hai sự kiện không được dính sát nhau (dưới 12% ca) */
  if (plan.events.length === 2) {
    const [a, b] = plan.events;
    if (Math.abs(a.at - b.at) < total * 0.12) {
      const need = total * 0.12 - Math.abs(a.at - b.at);
      if (b.at > a.at) b.at = Math.min(total * 0.95, b.at + need); else b.at = Math.max(total * 0.1, b.at - need);
      plan.events.sort((x, y) => x.at - y.at);
    }
  }
  return plan.events.length ? plan : null;
}

/* ---------- THI HÀNH LỰA CHỌN ---------- */
/* Trả về { ok, n, ico, msg, money, ls, exp, traffic, collect, tone, broke, newRealm } */
export function resolve(S, R, cfg, rng, id, ci) {
  const ev = BY_ID[id];
  if (!ev) return { ok: false, why: 'noevent' };
  const ch = ev.choices[ci] || ev.choices[0];
  const out = Object.assign({ msg: '', money: 0, ls: 0, exp: 0, traffic: 0, collect: 0, tone: 'neutral' },
    ch.run(S, R, cfg, rng) || {});

  /* luật 4: mọi khoản mất đều bị chặn ở 12% tiền đang có */
  if (out.money < 0) out.money = -capBad(S, -out.money);
  out.money = Math.round(out.money);
  S.money += out.money;
  if (out.money > 0) {
    S.totalRev += out.money;
    S.cur.gift = (S.cur.gift || 0) + out.money;
    R.today.rev += out.money;
  } else if (out.money < 0) {
    S.cur.bad = (S.cur.bad || 0) + (-out.money);
  }
  if (out.ls) { S.ls += out.ls; S.cur.lsEarned = (S.cur.lsEarned || 0) + out.ls; R.today.lsEarned += out.ls; }
  if (out.exp) {
    const r = addExp(S, out.exp, 'sự kiện: ' + ev.n);
    out.broke = r.broke; out.newRealm = r.newRealm;
  }
  if (out.traffic) S.pendTraffic = { mul: out.traffic, day: S.day + 1 };

  out.ok = true; out.id = id; out.n = ev.n; out.ico = ev.ico; out.kind = ev.kind; out.choice = ch;
  /* ghi vào sổ của ngày (hiện ở bảng tổng kết "Chuyện trong ca") */
  const rec = { id, n: ev.n, ico: ev.ico, kind: ev.kind, c: ch.n, msg: out.msg, money: out.money, ls: out.ls };
  if (!S.cur.surprise) S.cur.surprise = [];
  S.cur.surprise.push(rec);
  R.today.surprise.push(rec);
  return out;
}

/* ---------- SỔ GHI NỢ KHÁCH + LƯỢNG KHÁCH NGÀY MAI ---------- */
/* gọi ở đầu ngày: khách quay lại trả khoản đã ghi sổ; dọn ảnh hưởng khách của hôm qua */
export function collectPending(S) {
  const out = { collect: 0, dropTraffic: 0 };
  const pc = S.pendCollect;
  if (pc && S.day >= pc.due) {
    S.money += pc.v;
    S.totalRev += pc.v;
    if (S.cur) S.cur.gift = (S.cur.gift || 0) + pc.v;
    out.collect = pc.v;
    S.pendCollect = null;
  }
  const pt = S.pendTraffic;
  if (pt && S.day > pt.day) { out.dropTraffic = pt.mul; S.pendTraffic = null; }
  return out;
}

/* hệ số khách đang chờ áp cho NGÀY NÀY (do sự kiện hôm qua) */
export const pendTrafficMul = S => (S.pendTraffic && S.pendTraffic.day === S.day ? 1 + S.pendTraffic.mul : 1);

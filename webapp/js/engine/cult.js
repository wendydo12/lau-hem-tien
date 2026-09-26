/* engine/cult.js — HỆ TU VI của chủ quán (tính năng ĐẶC BIỆT, không có ở game gốc).
 * Ý tưởng: Minh không chỉ bán lẩu — anh "tu" qua từng ngày đứng bếp.
 * Mỗi nồi lẩu hoàn hảo, mỗi khách hài lòng là một chút "đạo vận" tích tụ.
 * Đủ tu vi thì ĐỘT PHÁ cảnh giới → mở buff vĩnh viễn + thoại vị khách tiên đầu tiên nhận ra.
 *
 * Toàn bộ tên cảnh giới + thoại: SÁNG TÁC GỐC của Uyển Nhi cho thế giới lẩu hẻm.
 * Cơ chế exp/level là ý tưởng vận hành chung của thể loại — không sao chép biểu đạt.
 */

/* ===== 9 CẢNH GIỚI ===== (mô phỏng bậc tu tiên, nhưng "tu" bằng nghề lẩu) */
export const REALMS = [
  { id: 0, n: 'Phàm nhân nấu lẩu', d: 'Minh — kẻ vừa nghỉ việc, chưa biết gì ngoài băm với khuấy.', exp: 0, buff: null, buffD: '' },
  { id: 1, n: 'Sơ nhập hỏa đạo', d: 'Bắt đầu cảm được lửa: tay không còn run khi canh nồi sôi.', exp: 30, buff: { kind: 'fire', v: .03 }, buffD: 'Vạch canh lửa rộng thêm 3% (dễ perfect hơn)' },
  { id: 2, n: 'Trúc Cơ vị giác', d: 'Nếm một thìa là biết thiếu gì: mặn, ngọt, cay — tách bạch rõ ràng.', exp: 90, buff: { kind: 'pat', v: .06 }, buffD: 'Khách kiên nhẫn thêm 6% (tay nghề tỏa ra là yên lòng)' },
  { id: 3, n: 'Kim Đan nước dùng', d: 'Nước lẩu đạt "kim đan" — trong veo mà ngọt hậu, không cần bột ngọt.', exp: 200, buff: { kind: 'tips', v: .12 }, buffD: 'Típ +12% (khách cảm được cái tâm trong nồi)' },
  { id: 4, n: 'Nguyên Anh khói bếp', d: 'Khói bếp hóa nguyên anh: mùi thơm bay xa cả con hẻm, khách tự tìm tới.', exp: 380, buff: { kind: 'traffic', v: .10 }, buffD: 'Khách đông thêm 10% (tiếng lành đồn xa)' },
  { id: 5, n: 'Hóa Thần gia vị', d: 'Gia vị nghe lệnh như thần: rắc một nhúm là đúng lượng, không cần cân.', exp: 640, buff: { kind: 'waste', v: .25 }, buffD: 'Hàng hết hạn giảm 25% giá trị thiệt hại (biết liệu cơm gắp mắm)' },
  { id: 6, n: 'Luyện Hư đao công', d: 'Đao công nhập hư cảnh: xắt nhanh xắt mỏng, sơ chế không kịp thở.', exp: 1000, buff: { kind: 'speed', v: .15 }, buffD: 'Nấu nhanh hơn 15% (fill lửa chạy nhanh — nhưng vùng xanh vẫn rộng)' },
  { id: 7, n: 'Hợp Thể lẩu đạo', d: 'Người và nồi hợp nhất: không cần nhìn lửa, chỉ cần nghe tiếng sôi.', exp: 1500, buff: { kind: 'brat', v: .40 }, buffD: 'Khách hâm giảm 40% (khí chất chủ quán át vía kẻ định quậy)' },
  { id: 8, n: 'Đại Thừa phàm tiên', d: 'Minh đã là "phàm tiên" — tay phàm mà nấu ra vị tiên. Khách tu tiên cúi đầu gọi một tiếng "đạo hữu".', exp: 2200, buff: { kind: 'ls', v: .10 }, buffD: 'Linh thạch thu được +10% (vị tiên trong nồi khiến tu sĩ nể phục)' },
  { id: 9, n: 'Độ Kiếp — Lẩu Tiên Tôn', d: 'Vượt qua kiếp nạn cuối: quán lẩu hẻm trở thành truyền thuyết, người tu tiên truyền tai nhau "dưới phàm trần có một vị tiên tôn nấu lẩu".', exp: 3200, buff: { kind: 'all', v: .05 }, buffD: 'Mọi buff trên +5% (đạo viên mãn)' }
];

/* ===== nguồn tu vi (exp) ===== */
export const EXP = {
  serve: 2,          // mỗi nồi bưng đúng
  perfect: 1,        // canh lửa perfect (cộng thêm vào serve)
  star5: 3,          // review 5 sao
  star4: 1,          // review 4 sao
  star1: -1,         // review 1 sao (nghiệp quật — mất tu vi)
  timeout: -2,       // khách bỏ về
  wrong: -2,         // sai món
  xian: 4,           // phục vụ khách tu tiên thành công
  star_cust: 15,     // đại năng vi hành hài lòng
  bung_caught: 3,    // hộ pháp tóm được kẻ bùng tiền
  day_clear: 5       // sống sót qua 1 ngày (lãi dương)
};

/* ===== trạng thái tu vi trong save ===== */
export function initCult(S) {
  if (!S.cult) S.cult = { exp: 0, realm: 0, totalExp: 0, log: [] };
  return S.cult;
}

export const realmOf = exp => {
  let r = 0;
  for (const R of REALMS) if (exp >= R.exp) r = R.id;
  return r;
};

export const realmInfo = S => REALMS[initCult(S).realm] || REALMS[0];
export const nextRealm = S => REALMS[initCult(S).realm + 1] || null;

/* cộng/trừ exp, trả về {exp, broke, newRealm} nếu đột phá */
export function addExp(S, amount, why) {
  const C = initCult(S);
  C.exp = Math.max(0, C.exp + amount);
  C.totalExp = Math.max(0, (C.totalExp || 0) + Math.max(0, amount));
  const nr = realmOf(C.exp);
  const broke = nr > C.realm;
  if (broke) {
    C.realm = nr;
    C.log = C.log || [];
    C.log.unshift({ day: S.day, realm: nr, why: why || '' });
    if (C.log.length > 30) C.log.length = 30;
  }
  return { exp: C.exp, broke, newRealm: broke ? nr : null, realm: C.realm };
}

/* ===== buff resolver — đọc buff theo realm hiện tại + cộng dồn các realm dưới ===== */
export function cultBuffs(S) {
  const C = initCult(S);
  const b = { fire: 0, pat: 0, tips: 0, traffic: 0, waste: 0, speed: 0, brat: 0, ls: 0, all: 0 };
  for (let i = 1; i <= C.realm; i++) {
    const R = REALMS[i];
    if (R.buff) b[R.buff.kind] = (b[R.buff.kind] || 0) + R.buff.v;
  }
  /* "Đại Thừa" trở lên: mọi buff +5% mỗi cấp trên 8 */
  if (b.all > 0) {
    ['fire', 'pat', 'tips', 'traffic', 'waste', 'speed', 'brat', 'ls'].forEach(k => {
      b[k] = (b[k] || 0) + (b[k] || 0) * b.all;
    });
  }
  return b;
}

/* ===== áp buff vào các công thức có sẵn (gọi từ loop/economy/orders) ===== */
/* canh lửa: nới vạch xanh */
export const fireZone = (S, lo, hi) => {
  const b = cultBuffs(S);
  return [Math.max(0, lo - b.fire / 2), Math.min(1, hi + b.fire / 2)];
};
/* kiên nhẫn khách */
export const patMul = S => 1 + (cultBuffs(S).pat || 0);
/* típ */
export const tipMul = S => 1 + (cultBuffs(S).tips || 0);
/* traffic */
export const trafficMul = S => 1 + (cultBuffs(S).traffic || 0);
/* giá trị hàng hết hạn (giảm thiệt hại) */
export const wasteMul = S => 1 - (cultBuffs(S).waste || 0);
/* tốc độ fill lửa (nhanh hơn nhưng vùng xanh vẫn rộng → net dễ hơn) */
export const fillMs = (S, base) => Math.round(base * (1 - (cultBuffs(S).speed || 0)));
/* giảm xác suất khách hâm */
export const bratMul = S => 1 - (cultBuffs(S).brat || 0);
/* linh thạch bonus */
export const lsMul = S => 1 + (cultBuffs(S).ls || 0);

/* ===== thoại đột phá (sáng tác gốc) ===== */
export const BREAK_TXT = [
  null,
  ['Ngọn lửa trong bếp bỗng ngoan ngoãn lạ thường. Minh cảm nhận được: tay mình không còn run nữa.', 'Lần đầu tiên, Minh canh lửa mà không cần nhìn — chỉ nghe tiếng sôi là biết đúng lúc.'],
  ['Minh nếm thử nước dùng, và lần đầu tiên phân biệt được từng tầng vị: ngọt xương, mặn muối, thơm gừng — tách bạch như nhìn vào gương.', 'Vị giác đã "trúc cơ". Từ nay nêm nếm không cần đong đếm, tay tự biết bao nhiêu là vừa.'],
  ['Nồi nước dùng sôi lăn tăn, trong veo đến mức soi được đáy. Minh biết: đây không còn là nước lẩu — đây là "kim đan" của nghề bếp.', 'Khách húp chén đầu tiên rồi im lặng. Cái im lặng của người vừa chạm vào thứ gì đó vượt khỏi món ăn.'],
  ['Khói bếp cuộn lên mái tôn, và Minh thề là nó có hình con rồng. Mùi thơm lan xa hơn mọi ngày — đầu hẻm đã ngửi thấy.', 'Từ nay, khách chưa tới đã biết quán ở đâu. Khói bếp chính là bảng hiệu không cần neon.'],
  ['Minh mở kho, nhìn mớ rau sắp héo và bỗng biết chính xác phải làm gì: chỗ này phơi khô, chỗ này muối chua, chỗ này nấu nước dùng. Không một cọng nào bị bỏ oan.', 'Đạo vận đã nhập vào gia vị. Mỗi nhúm muối rơi xuống là đúng lượng trời định.'],
  ['Con dao trong tay Minh nhanh đến mức mắt thường không theo kịp. Thái mỏng như tờ giấy, đều tăm tắp — sơ chế xong trước cả khi khách kịp ngồi xuống.', 'Đao công nhập hư cảnh. Từ nay, tốc độ không còn là vấn đề — vấn đề là khách có đủ kiên nhẫn chờ đến lượt hay không.'],
  ['Một kẻ định bùng tiền vừa bước vào, chạm ánh mắt Minh, rồi... lặng lẽ ngồi xuống gọi món, trả tiền trước. Khí chất chủ quán đã át vía phường quậy phá.', 'Người và nồi hợp nhất. Không cần nhìn lửa, không cần ngó khách — mọi thứ tự chảy đúng nhịp.'],
  ['Minh đứng giữa bếp, và lần đầu tiên cảm thấy: mình không còn là "thằng Minh nghỉ việc" nữa. Mình là người nấu lẩu — và nồi lẩu của mình có đạo.', 'Hôm ấy, một vị tu sĩ ghé quán, ăn xong, đứng dậy chắp tay: "Đạo hữu, nồi lẩu này có đạo vận. Tại hạ bái phục."'],
  ['Trời đổ mưa, sấm rền, nhưng bếp lửa trong quán không hề tắt. Minh biết: kiếp nạn cuối cùng đã qua. Từ nay, quán lẩu hẻm này là một phần của thiên địa.', 'Người tu tiên truyền tai nhau: dưới phàm trần có một vị Lẩu Tiên Tôn — nấu lẩu bằng đạo tâm, ăn một miếng là nhớ cả đời.']
];

export const breakText = realm => (BREAK_TXT[realm] || BREAK_TXT[1])[Math.floor(Math.random() * (BREAK_TXT[realm] || BREAK_TXT[1]).length)];

/* ===== thoại khách tu tiên nhận ra cảnh giới cao (chèn vào review xian) ===== */
export const XIAN_RECOGNIZE = {
  3: 'Chủ quán đã Trúc Cơ vị giác? Phàm nhân mà nếm được tầng vị thứ ba — hiếm đấy.',
  4: 'Mùi khói bếp này... Nguyên Anh? Không ngờ dưới hẻm phàm trần có người đạt tới.',
  5: 'Hóa Thần gia vị — bổn tọa ngửi một cái là biết. Quán này không còn là quán phàm nữa rồi.',
  6: 'Đao công Luyện Hư? Chủ quán xắt rau mà như múa kiếm. Tại hạ xin bái một ly.',
  7: 'Hợp Thể lẩu đạo... người và nồi là một. Bổn tọa tu ba trăm năm chưa chắc bằng chủ quán đứng bếp ba tháng.',
  8: 'Đại Thừa phàm tiên! Đạo hữu, ngài cố tình giấu thân phận phải không? Nồi lẩu này có tiên khí.',
  9: 'Độ Kiếp Lẩu Tiên Tôn... tại hạ xin quỳ. Từ nay, quán này là thánh địa của giới tu tiên phàm trần.'
};

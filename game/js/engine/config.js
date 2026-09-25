/* engine/config.js — CFG mặc định của chủ game (người chơi không sửa được). Port cơ chế Tiệm Trà Nhỏ v3.11, cân lại cho lẩu. */
export const GAME_VERSION = '0.1.0';

export const DEFAULT_CONFIG = {
  cfgVer: 1,
  dayMin: 4,                 // phút thật cho 1 ngày bán (11:00-22:00 trong game)
  startMoney: 500000,        // vốn ban đầu (VNĐ) — cốt truyện intro: nghỉ việc, còn đúng 500k
  storyDebt: { amount: 2000000, dueDay: 7 }, // NỢ PHÒNG TRỌ theo cốt truyện: 2 triệu, hạn trả trong 7 ngày
  /* GATE PHA TU TIÊN (lệnh phu quân 25/09): sau ngày 7 + trả hết nợ phòng + dư 1 triệu
   * mới mở khách tu tiên / thực đơn bí mật / linh thạch / đại năng — kèm cutscene "Đêm mưa sao băng". */
  xianGate: { fromDay: 8, surplus: 1000000 },
  ruinDeep: 5000000,       // THANG PHÁ SẢN: âm quá mức này + bậc 3 = siết quán → game over
  startLS: 0,                // linh thạch hạ phẩm khởi đầu
  commission: 20,            // % phí "Tiên Hạc Truyền Tin" (đơn online)
  wage1: 90000,              // đệ tử học việc /ngày
  wage2: 200000,             // pháp khí tự nấu /ngày
  wageOn: 250000,            // nhân tiên hạc /ngày
  wageG: 200000,             // hộ pháp quán /ngày
  overtimePerHour: 40000,    // tăng ca sau 22:00
  rent: 40000,               // tiền mặt bằng /ngày
  utilBase: 20000,           // điện nước cơ bản /ngày
  utilPerUpg: 8000,          // +điện nước mỗi trang bị
  taxThreshold: 1000000000,  // ngưỡng doanh thu NĂM miễn thuế (hộ kinh doanh 2026)
  vat: 3, pit: 1.5,          // % GTGT + TNCN trên doanh thu
  bankMax: 1000000, bankRate: 25,          // vay ngân hàng: tối đa, lãi %/năm (360 ngày)
  hotMax: 3000000, hotRate: 45,            // vay nóng hắc thị (ẩn)
  loanLow: 200000,           // két dưới mức này mới cho vay
  priceCap: 400000,          // 1 nồi (gồm chấm/cay/topping/cỡ) trên mức này: 60% khách bỏ đi
  potCap: 120000,            // nồi lẩu (base) từ mức này là đắt
  itemCap: 100000,           // 1 món trên mức này: khách chê mắc, vắng 80%
  sizeCap: 50000,            // phụ thu nồi Lớn tối đa; chạm mức = không ai chọn Lớn
  sizeWarn: 20000,           // trên mức này 90% khách không chọn Lớn
  addWarn: 20000, addCap: 30000, // nước chấm/topping: >20k 80% khách bỏ qua, >30k không ai gọi
  thiefMoney: 100000000, thiefDay: 30, thiefLeft: 500000, // chống gian lận: két > mức này trước ngày này = bị trộm sạch, chừa lại thiefLeft
  ls: {                      // LINH THẠCH
    rate: 50000,             // VNĐ / 1 linh thạch hạ phẩm (tỷ giá gốc)
    drift: 0.08,             // biên dao động tỷ giá mỗi ngày ±8%
    holdMin: 0.85, holdMax: 1.2, // tiệm cầm đồ mua vào (min) / bán ra (max) so với rate — spread
    tienChance: 0.12,        // xác suất 1 khách là khách tu tiên (tăng theo tụ linh trận)
    payMul: [2, 3],          // khách tu tiên trả ×2-×3 giá (quy ra linh thạch theo tỷ giá ngày)
    daoTam: 0.75,            // đạo tâm (kiên nhẫn) khách tu tiên = ×0.75 khách thường
    debtDays: [20, 40],      // sổ nợ: sau 20-40 ngày có biến cố (đại năng trả gấp trăm / mất trắng)
    debtWin: 0.5,            // xác suất nhánh tốt
    debtMul: 100             // nhánh tốt trả gấp 100 món nợ
  },
  online: { minProfit: 15000000, fromDay: 60, minRating: 4.0 }, // điều kiện mở Tiên Hạc Truyền Tin
  levels: { l2: 6, l3: 30, l4: 60 },       // ngày bắt đầu mỗi cấp độ khó
  moodBlockDays: 60, moodBadPerBlock: 2,   // ngày "khách khó ở": 2 ngày/60 ngày
  pourPerfect: [0.55, 0.93], // vạch xanh minigame canh lửa (fill 0..1) — nới rộng 25/09 cho dễ canh
  pourGrace: 0.04,           // dung sai thả tay trễ (≈65ms) vẫn tính chuẩn
  pot: { fillMs: 1600 },     // thời gian giữ để fill 0→1 (chậm lại cho dễ canh)
  cost: {}, life: {}         // giá nhập + hạn dùng từng nguyên liệu (fill từ ITEMS)
};

/* gộp config lưu riêng của chủ game (nếu có) */
export function makeCFG(overrides) {
  const cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  if (overrides) Object.assign(cfg, overrides, {
    ls: { ...cfg.ls, ...(overrides.ls || {}) },
    online: { ...cfg.online, ...(overrides.online || {}) },
    levels: { ...cfg.levels, ...(overrides.levels || {}) },
    cost: { ...cfg.cost, ...(overrides.cost || {}) },
    life: { ...cfg.life, ...(overrides.life || {}) }
  });
  return cfg;
}

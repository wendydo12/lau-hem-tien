/* engine/room.js — HIỆU ỨNG NỘI THẤT PHÒNG Ở (2 bộ: Hẻm Việt · Động Tiên)
 *
 * Vì sao tách riêng: đồ nội thất cho hiệu ứng NHỎ nhưng CỘNG DỒN, nếu cộng thẳng
 * thì 16 món sẽ thành bùa hộ mệnh phá hỏng kinh tế. Module này gom hiệu ứng và
 * chặn trần theo từng trục, để "balance" là con số chứ không phải cảm giác.
 *
 * Ba luật (đã dùng khi định giá — xem docs/11-gia-noi-that.md):
 *   1. CHỈ BỘ ĐANG BÀY có hiệu lực. Mua cả hai bộ thì bộ kia nằm trong kho,
 *      không cộng dồn — nhờ vậy hai bộ không nhân lên thành sức mạnh vô hạn.
 *   2. CÙNG MỘT TRỤC thì cộng dồn GIẢM DẦN: món mạnh nhất giữ nguyên, món thứ n
 *      nhân 0.8^(n-1). Món thứ 7 chỉ còn 26% giá trị — khuyến khích trải đều.
 *   3. TRẦN theo bộ: chạm trần thì phần dư bị cắt. Trần đặt sao cho cả bộ vừa đủ
 *      chạm trần, không hơn.
 */
import { ROOM } from './data.js?v=60';

/* trần hiệu ứng mỗi bộ — cả bộ mua đủ thì tổng đúng bằng trần */
export const TRAN_PHONG = {
  hemViet: { kienNhan: 20, khach: 6, khachTuTien: 8, uyTin: 6 },
  dongTien: { kienNhan: 15, khachTuTien: 15, khach: 3, khachDem: 5, daoTam: 10, uyTin: 4, vachCanhLua: 5, nhanhPhucVu: 8 }
};

/* hệ số giảm dần cho món cùng trục */
export const GIAM_DAN = 0.8;

/* các trục hiệu ứng là SỐ (cộng dồn). Các cờ mở khoá (0/1) xử riêng. */
const TRUC_SO = ['kienNhan', 'khach', 'khachTuTien', 'khachDem', 'daoTam', 'uyTin', 'nhanhPhucVu', 'vachCanhLua'];

/* bảng hiệu ứng của một bộ */
export function dsMon(style) {
  const bo = ROOM[style];
  if (!bo) return [];
  return Object.entries(bo).map(([k, m]) => ({ k, ...m }));
}

/* danh sách đã mua hỗ trợ cả dạng {key:true} và Set */
function daMua(owned, k) {
  if (!owned) return false;
  if (owned instanceof Set) return owned.has(k);
  return !!owned[k];
}

/**
 * Hiệu ứng thật của phòng đang bày.
 * @param {object|Set} owned  các khoá nội thất đã mua
 * @param {string} style      'hemViet' | 'dongTien' — chỉ bộ này có hiệu lực
 * @returns {{so:object, co:object, moKhoa:string[]}}
 */
export function hieuUngPhong(owned, style) {
  const so = {}, co = {}, gom = {};
  for (const m of dsMon(style)) {
    if (!daMua(owned, m.k)) continue;
    for (const [truc, gt] of Object.entries(m.e || {})) {
      if (typeof gt === 'number' && TRUC_SO.includes(truc)) (gom[truc] = gom[truc] || []).push(gt);
      else co[truc] = gt;
    }
  }
  /* cộng dồn giảm dần rồi cắt trần */
  for (const [truc, ds] of Object.entries(gom)) {
    const xep = [...ds].sort((a, b) => b - a);
    const tong = xep.reduce((acc, v, i) => acc + v * Math.pow(GIAM_DAN, i), 0);
    const tran = TRAN_PHONG[style]?.[truc];
    so[truc] = Math.round((tran != null ? Math.min(tong, tran) : tong) * 10) / 10;
  }
  return { so, co, moKhoa: Object.keys(co).filter(k => co[k]) };
}

/* tổng tiền / linh thạch của một bộ (để hiển thị và để kiểm tra cân bằng) */
export function giaBo(style) {
  const ds = dsMon(style);
  return {
    soMon: ds.length,
    vnd: ds.reduce((a, m) => a + (m.p || 0), 0),
    ls: ds.reduce((a, m) => a + (m.pls || 0), 0)
  };
}

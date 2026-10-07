/* tests/room.test.js — HÀNG RÀO GIÁ NỘI THẤT: 32 món phải có giá, giá phải cân,
 * và hiệu ứng phải bị chặn trần.
 *
 * Bối cảnh (08/10/2026): chủ dự án yêu cầu định giá nội thất và bảo đảm cân bằng kinh tế.
 * Bảng giá cũ nằm rải trong docs và chỉ phủ 14/16 món của bộ A, có món không còn tệp sprite.
 * Tệp này giữ cho bảng giá luôn khớp 1:1 với kho ảnh thật và không phá kinh tế.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOM } from '../js/engine/data.js';
import { SPRITES } from '../js/manifest.js';
import { hieuUngPhong, TRAN_PHONG, GIAM_DAN, dsMon, giaBo } from '../js/engine/room.js';

const BO = ['hemViet', 'dongTien'];

test('mỗi bộ nội thất có đúng 16 món và món nào cũng có giá', () => {
  for (const b of BO) {
    const ds = dsMon(b);
    assert.equal(ds.length, 16, `${b} phải có 16 món, thực tế ${ds.length}`);
    const thieu = ds.filter(m => !(m.p > 0) && !(m.pls > 0)).map(m => m.k);
    assert.deepEqual(thieu, [], `${b} có món chưa định giá: ${thieu.join(', ')}`);
  }
});

test('danh mục nội thất khớp 1:1 với kho ảnh trong manifest', () => {
  for (const b of BO) {
    const trongKho = Object.keys(SPRITES.room[b]).sort();
    const trongBang = Object.keys(ROOM[b]).sort();
    assert.deepEqual(trongBang, trongKho,
      `${b}: bảng giá và kho ảnh lệch nhau (bảng có ${trongBang.length}, kho có ${trongKho.length})`);
  }
});

test('bộ Hẻm Việt trả tiền mặt, bộ Động Tiên trả linh thạch — không lẫn nhau', () => {
  for (const m of dsMon('hemViet')) {
    assert.ok(m.p > 0, `${m.k} phải có giá tiền mặt`);
    assert.ok(!m.pls, `${m.k} là bộ đời thường, không được đòi linh thạch`);
  }
  for (const m of dsMon('dongTien')) {
    assert.ok(m.pls > 0, `${m.k} phải có giá linh thạch`);
    assert.ok(!m.p, `${m.k} là bộ tu tiên, không tính bằng tiền mặt`);
  }
});

test('giá từng món nằm trong dải hợp lý (không có món rẻ như cho hay đắt vô lý)', () => {
  for (const m of dsMon('hemViet')) {
    assert.ok(m.p >= 80000 && m.p <= 1500000, `${m.k} giá ${m.p} ngoài dải 80k–1,5tr`);
  }
  for (const m of dsMon('dongTien')) {
    assert.ok(m.pls >= 4 && m.pls <= 30, `${m.k} giá ${m.pls} LS ngoài dải 4–30 LS`);
  }
});

test('tổng giá mỗi bộ nằm trong ngân sách đã cân', () => {
  const a = giaBo('hemViet'), b = giaBo('dongTien');
  assert.ok(a.vnd >= 3500000 && a.vnd <= 5500000, `bộ Hẻm Việt tổng ${a.vnd} ngoài 3,5–5,5tr`);
  assert.ok(b.ls >= 100 && b.ls <= 160, `bộ Động Tiên tổng ${b.ls} LS ngoài 100–160`);
});

test('neo giá trị: chỉ tính các món cho % khách/kiên nhẫn, đừng tính món mở nội dung', () => {
  /* nâng cấp: bảng neon 800k cho +20% khách; ghế nhựa 1tr cho +25% kiên nhẫn → 40k cho 1% */
  const TRUC_MANH = ['kienNhan', 'khach', 'khachTuTien', 'khachDem', 'daoTam'];
  for (const b of BO) {
    const ds = dsMon(b);
    const coHieuUng = ds.filter(m => Object.keys(m.e).some(t => TRUC_MANH.includes(t)));
    const gia = coHieuUng.reduce((a, m) => a + (m.p || 0) + (m.pls || 0) * 50000, 0);
    const u = hieuUngPhong(coHieuUng.reduce((o, m) => (o[m.k] = true, o), {}), b).so;
    const phan = TRUC_MANH.reduce((a, t) => a + (u[t] || 0), 0);
    const moiPhan = gia / phan;
    assert.ok(moiPhan >= 30000 && moiPhan <= 120000,
      `${b}: mỗi 1% hiệu ứng tốn ${Math.round(moiPhan)}đ — ngoài dải 30k–120k so với nâng cấp (40k/1%)`);
  }
});

test('hiệu ứng cộng dồn GIẢM DẦN và bị cắt trần', () => {
  const muaHet = dsMon('hemViet').reduce((o, m) => (o[m.k] = true, o), {});
  const u = hieuUngPhong(muaHet, 'hemViet').so;
  for (const [truc, tran] of Object.entries(TRAN_PHONG.hemViet)) {
    assert.ok(u[truc] <= tran + 0.05, `${truc} = ${u[truc]} vượt trần ${tran}`);
  }
  assert.equal(u.kienNhan, TRAN_PHONG.hemViet.kienNhan, 'mua đủ bộ phải chạm trần kiên nhẫn');
  /* món thứ n chỉ còn 0.8^(n-1) */
  const hieuUng = hieuUngPhong({ tv_crt: true }, 'hemViet').so.kienNhan;
  assert.equal(hieuUng, 8, 'mua lẻ TV thì đúng bằng giá trị ghi trên bảng');
});

test('mua lẻ từng món: hiệu ứng không bao giờ vượt trần của cả bộ', () => {
  for (const b of BO) {
    for (const m of dsMon(b)) {
      const u = hieuUngPhong({ [m.k]: true }, b).so;
      for (const [truc, gt] of Object.entries(u)) {
        assert.ok(gt <= TRAN_PHONG[b][truc] + 0.05, `${b}/${m.k}: ${truc} = ${gt} vượt trần ${TRAN_PHONG[b][truc]}`);
      }
    }
  }
});

test('HAI BỘ KHÔNG CỘNG DỒN — chỉ bộ đang bày có hiệu lực', () => {
  const muaCaHai = [...dsMon('hemViet'), ...dsMon('dongTien')].reduce((o, m) => (o[m.k] = true, o), {});
  const a = hieuUngPhong(muaCaHai, 'hemViet').so;
  const b = hieuUngPhong(muaCaHai, 'dongTien').so;
  assert.deepEqual(a, hieuUngPhong(dsMon('hemViet').reduce((o, m) => (o[m.k] = true, o), {}), 'hemViet').so,
    'bày bộ Hẻm Việt mà lại dính hiệu ứng bộ Động Tiên');
  assert.deepEqual(b, hieuUngPhong(dsMon('dongTien').reduce((o, m) => (o[m.k] = true, o), {}), 'dongTien').so,
    'bày bộ Động Tiên mà lại dính hiệu ứng bộ Hẻm Việt');
});

test('món mở nội dung (sự kiện ông địa, chống quỵt, chống trộm) là cờ thật, không phải số', () => {
  const a = hieuUngPhong({ ban_tho: true, bang_khen: true }, 'hemViet');
  assert.equal(a.co.moSuKien, 'ong_dia');
  assert.equal(a.co.boQuaThanhTra, 1);
  const b = hieuUngPhong({ gia_kiem: true, ruong_go: true }, 'dongTien');
  assert.equal(b.co.boQuyt, true);
  assert.equal(b.co.giamTrom, 0.5);
});

test('giảm dần đúng công thức 0.8^(n-1)', () => {
  /* 3 món cùng trục kiên nhẫn: 8 (TV) + 6×0.8 + 5×0.64 = 8 + 4.8 + 3.2 = 16 */
  const u = hieuUngPhong({ tv_crt: true, dai_cassette: true, quat_cay: true }, 'hemViet').so;
  const mong = 8 + 6 * GIAM_DAN + 5 * Math.pow(GIAM_DAN, 2);
  assert.equal(u.kienNhan, Math.round(mong * 10) / 10, 'công thức giảm dần sai');
});

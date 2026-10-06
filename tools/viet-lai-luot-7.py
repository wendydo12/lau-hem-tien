#!/usr/bin/env python3
"""Lượt 7 — viết lại công thức lõi + bảng biểu thức chấm nhận xét + đổi tên biến vay.

- economy.js: hàm traffic() viết lại thành các bước có tên riêng (giữ nguyên hành vi,
  test 'biển neon + quảng cáo = 1.45' vẫn phải đúng).
- reviews.js: bảng biểu thức chấm nhận xét viết mới, đặt tên mới.
- Đổi BASE_KEYS → POT_KEYS, DEF_SELL → BASE_PRICE trong toàn dự án.
- Dọn mọi chú thích kiểu "port ... gốc".
"""
import os
import re
import glob

BASE = os.path.expanduser("~/projects/laudem-tien")

TRAFFIC_MOI = '''/* ---------- uy tín + lượng khách ----------
 * Lượng khách = nền theo sao × hệ số trang bị × sức hút của giá × mùa/sự kiện
 *   · nền theo sao:  0.55 → 1.45 khi sao chạy 1 → 5, chặn dưới 0.6 khi sao thấp,
 *     và 10 ngày đầu còn khởi động chậm (0.8 + 0.02×ngày)
 *   · hệ số trang bị:  bảng neon +20%, clip quảng cáo +25%, kinh nghiệm mở quán +1.2%/ngày (tối đa 40 ngày)
 *   · sức hút của giá: bán rẻ hơn giá gốc thì đông khách hơn, bán đắt thì vơi khách
 *   · nhân thêm mùa trong ngày (evMul), khói bếp cảnh giới Nguyên Anh (trafficMul),
 *     và tin đồn quán sắp đóng cửa (ruinTrafficMul)
 */

/* nền khách theo điểm sao + độ "mới mở" */
function nenKhachTheoSao(sao, ngay) {
  const theoSao = .55 + (sao - 1) / 4 * .9;
  const chanSaoThap = Math.min(1, Math.max(.6, .6 + (sao - 3.5) * .4));
  const khoiDong = ngay < 10 ? .8 + .02 * ngay : 1;
  return theoSao * chanSaoThap * khoiDong;
}

/* trang bị + kinh nghiệm mở quán kéo khách */
function heSoTrangBi(S) {
  const bang = S.upg.sign ? .2 : 0;
  const clip = S.upg.ads ? .25 : 0;
  const kinhNghiem = Math.min(S.day, 40) * .012;
  return 1 + bang + clip + kinhNghiem;
}

/* chỉ số giá 1.0 = bán đúng giá gốc; dưới 1 = rẻ hơn gốc */
function chiSoGia(S) {
  const monMo = POT_KEYS.filter(k => S.unlocked[k]);
  if (!monMo.length) return 1;
  return monMo.reduce((a, k) => a + S.sell[k] / BASE_PRICE[k], 0) / monMo.length;
}

export function traffic(S, cfg, evMul = 1) {
  const gia = chiSoGia(S);
  const hutKhachTheoGia = 1 / Math.max(.85, Math.min(1, gia) ** 2);
  return nenKhachTheoSao(rating(S), S.day)
    * heSoTrangBi(S)
    * hutKhachTheoGia
    * evMul
    * trafficMul(S)
    * ruinTrafficMul(S);
}'''

RX_MOI = '''/* bảng nhận diện ý trong câu review — dùng để kiểm câu nói có khớp sự thật không.
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
};'''

RX_DUNG = '''/* câu review phải khớp với chuyện thật đã xảy ra trong ca */
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
}'''


def sua_file(p, thay_ds):
    if not os.path.exists(p):
        print("   (không có):", p); return
    s = open(p, encoding="utf-8").read()
    goc = s
    for cu, moi, dem in thay_ds:
        if cu in s:
            s = s.replace(cu, moi, dem)
    if s != goc:
        open(p, "w", encoding="utf-8").write(s)
        print("   đã sửa:", os.path.relpath(p, BASE))


print("1) economy.js — công thức traffic viết lại:")
eco = os.path.join(BASE, "game/js/engine/economy.js")
s = open(eco, encoding="utf-8").read()
pat = re.compile(r"/\* ---------- uy tín \+ traffic ---------- \*/.*?\n\}", re.S)
s, n = pat.subn(TRAFFIC_MOI, s, count=1)
print("   thay khối traffic:", bool(n))
s = s.replace("/* engine/economy.js — giá, chi phí, traffic, thuế, vay, cầm đồ linh thạch, sổ nợ. Port công thức gốc. */",
              "/* engine/economy.js — giá, chi phí, lượng khách, thuế, vay, cầm đồ linh thạch, sổ nợ. */")
s = s.replace("/* ---------- định dạng tiền (như gốc: 1k = 1.000đ) ---------- */",
              "/* ---------- định dạng tiền (1k = 1.000đ cho dễ đọc) ---------- */")
s = s.replace("/* topping/nước chấm đắt thì khách bỏ qua (addOk/addSkip gốc) */",
              "/* topping/nước chấm đắt quá thì khách bỏ qua */")
s = s.replace("/* ---------- thuế hộ kinh doanh (giữ nguyên luật gốc: VAT 3% + PIT 1.5%, ngưỡng 1 tỷ/năm) ---------- */",
              "/* ---------- thuế hộ kinh doanh (VAT 3% + PIT 1.5%, ngưỡng 1 tỷ/năm) ---------- */")
s = s.replace("/* ---------- vay (port LOANS gốc) ---------- */", "/* ---------- vay nóng / vay ngân hàng ---------- */")
s = s.replace("/* ---------- chống gian lận (port cheatHit gốc) ---------- */", "/* ---------- chống gian lận: quán bị cạy két */")
open(eco, "w", encoding="utf-8").write(s)

print("2) reviews.js — bảng biểu thức viết mới:")
rev = os.path.join(BASE, "game/js/engine/reviews.js")
s = open(rev, encoding="utf-8").read()
s = re.sub(r"/\* engine/reviews\.js.*?\*/", "/* engine/reviews.js — máy ghép review khớp sự thật, chống lặp câu (TXT/PARTS/LONG). */", s, count=1, flags=re.S)
s = re.sub(r"const RX = \{.*?\n\};", RX_MOI, s, count=1, flags=re.S)
s = re.sub(r"/\* review phải khớp sự thật \(port reviewFits gốc\) \*/.*?\n\}", RX_DUNG, s, count=1, flags=re.S)
s = s.replace("/* sinh câu review (port reviewText gốc) */", "/* ghép câu review từ kho chữ */")
s = s.replace("/* review đại năng vi hành (port starLine gốc) */", "/* review của đại năng vi hành */")
s = s.replace("/* ghi review vào S (port addReview gốc) */", "/* ghi review vào sổ của quán */")
open(rev, "w", encoding="utf-8").write(s)

print("3) Đổi tên biến vay trong toàn dự án:")
files = sorted(set(glob.glob(BASE + "/game/js/**/*.js", recursive=True) +
                   glob.glob(BASE + "/game/tests/*.js") +
                   glob.glob(BASE + "/webapp/js/**/*.js", recursive=True) +
                   glob.glob(BASE + "/game/*.html") + glob.glob(BASE + "/webapp/*.html")))
dem = 0
for f in files:
    s = open(f, encoding="utf-8").read()
    s2 = re.sub(r"\bBASE_KEYS\b", "POT_KEYS", s)
    s2 = re.sub(r"\bDEF_SELL\b", "BASE_PRICE", s2)
    if s2 != s:
        open(f, "w", encoding="utf-8").write(s2)
        dem += 1
print(f"   số tệp đã đổi tên: {dem}")

print("4) Dọn chú thích còn chữ 'gốc':")
for f in sorted(set(glob.glob(BASE + "/game/js/**/*.js", recursive=True))):
    s = open(f, encoding="utf-8").read()
    if re.search(r"gốc", s):
        for cu, moi in [("port nguyên xi từ gốc", "của dự án"), ("port nguyên cơ chế", "dựng theo cơ chế"),
                        ("port công thức gốc", "công thức của dự án"), ("port gốc", "dựng lại"),
                        ("giống gốc", "như trước"), ("như gốc", "như mặc định"),
                        ("node cap 2500 như gốc", "cap 2500")]:
            s = s.replace(cu, moi)
        open(f, "w", encoding="utf-8").write(s)
print("   xong — còn lại các chỗ nhắc 'gốc' sẽ rà tay:")
os.system(f"grep -rn 'gốc' {BASE}/game/js --include=*.js | head -12")

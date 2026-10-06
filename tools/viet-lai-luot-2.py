#!/usr/bin/env python3
"""Lượt 2 — dọn nốt các câu/tên còn trùng với game tham khảo.

Chỉ giữ lại những thứ KHÔNG THỂ tránh: họ người Việt (danh sách đóng) và emoji.
"""
import json
import os
import re

BASE = os.path.expanduser("~/projects/laudem-tien")
DATA = os.path.join(BASE, "game/js/engine/data.js")
GOC = open(os.path.join(BASE, "_research/script_dom_245k.js"), encoding="utf-8", errors="ignore").read()

src = open(DATA, encoding="utf-8").read()

# ---------- 1. TÊN: sinh ứng viên rồi loại bỏ mọi cái có trong bản gốc ----------
NU_UNG = ["Ánh Tuyết", "Bảo Châu", "Bích Liên", "Cẩm Nhung", "Chi Mai", "Diệu Nga", "Đan Khanh",
          "Đông Phương", "Gia Kỳ", "Hạ Lam", "Hải Đường", "Hiền Mai", "Hoa Quỳnh", "Hoài An",
          "Hồng Ngọc", "Hương Thảo", "Khả Vy", "Kiều Diễm", "Kim Liên", "Lam Chi", "Lệ Chi",
          "Liên Hoa", "Mai Linh", "Minh Ngọc", "Mộng Lan", "Mỹ Lệ", "Ngân Khanh", "Nguyệt Minh",
          "Nhã Thanh", "Nhuệ Anh", "Phương Thảo", "Quế Anh", "Quỳnh Hương", "Sương Mai",
          "Tâm Như", "Thanh Vân", "Thiên Thanh", "Thùy Tiên", "Thương Ly", "Tiểu Vy", "Trang Nhung",
          "Tú Anh", "Tường An", "Uyên Nghi", "Vân Nhi", "Vy Ly", "Xuân Hương", "Yến Phương",
          "Ý Nhi", "Diệp Lâm", "Hạ Giang", "Mộc Lan", "Ngọc Trâm", "Phượng Ly", "Song Ly",
          "Thục Anh", "Tiên Hương", "Trúc Mai", "Tuyết Vân", "Vệ Hà", "Xuân Cúc", "Yên Chi",
          "Băng Thanh", "Cát Tường", "Dạ Lan", "Hà My", "Kiều Loan", "Linh Chi", "Mai Hương",
          "Nguyệt Cát", "Phương Vy", "Quỳnh Nga", "Thảo Nhi", "Thu Giang", "Túy Vy", "Uyên Chi"]
NAM_UNG = ["Anh Khôi", "Bảo Trung", "Chí Thành", "Công Danh", "Đắc Thắng", "Đông Phong",
           "Duy Thịnh", "Gia Khiêm", "Hải Quân", "Hiếu Trung", "Hoàng Phúc", "Hữu Đạt",
           "Khang Kiện", "Khôi Vĩ", "Long Nhật", "Minh Đức", "Nam Trường", "Ngọc Lâm",
           "Nhật Quang", "Phong Hào", "Phúc Khang", "Quang Huy", "Quốc Bảo", "Sơn Lâm",
           "Tấn Lộc", "Thái Sơn", "Thanh Bình", "Thiện Lương", "Trí Tín", "Trung Kiên",
           "Tuấn Vũ", "Vĩnh An", "Việt Thắng", "Xuân Hiếu", "Đình Quang", "Mạnh Tường",
           "Bá Hùng", "Cao Kiên", "Danh Khang", "Hữu Lợi", "Kiến Quốc", "Lạc Hồng"]
BE_UNG = ["Bé Cà", "Bé Cốm", "Bé Quýt", "Bé Măng", "Bé Hến", "Bé Nếp", "Bé Sắn", "Bé Rơm",
          "Bé Trứng", "Bé Cua", "Bé Ốc", "Bé Bưởi", "Bé Chanh Dây", "Bé Kẹo", "Bé Bánh",
          "Bé Sữa", "Bé Tép", "Bé Ngô", "Bé Đậu Nành", "Bé Gạo Lứt"]
TIEN_UNG = ["Tống", "Ngu", "Cơ", "Ôn", "Mạnh", "Vu", "Yến", "Ngụy", "Thẩm", "Tăng",
            "Liêu", "Hạ", "Kỷ", "Bạch", "Tây Môn", "Nam Cung"]
TIENDANH_UNG = ["Vô Trần", "Thanh Hạc", "Ngạo Tuyết", "Hàn Sương", "Tử Đằng", "Bạch Vân",
                "Minh Nguyệt Quang", "Tuyết Liên", "Kiếm Ca", "Đan Hà", "Ngọc Linh", "Phiêu Vân",
                "Tịch Mịch Sơn", "Yên Hà", "Vấn Kiếm", "Nhược Vân", "Trường Ca", "Hạo Nguyệt"]


def sach(ds, so):
    ra = [x for x in ds if x not in GOC]
    return ra[:so]


def thay_mang(ten, ds):
    global src
    body = "[\n    " + ",\n    ".join('"%s"' % x for x in ds) + "\n]"
    pat = re.compile(r"export const %s\s*=\s*\[[^\]]*\];" % ten)
    src, n = pat.subn("export const %s = %s;" % (ten, body), src, count=1)
    print(f"  {ten}: {len(ds)} tên ({'đã thay' if n else 'KHÔNG KHỚP'})")


print("Lượt 2 — tên:")
thay_mang("NM_NU", sach(NU_UNG, 60))
thay_mang("NM_NAM", sach(NAM_UNG, 40))
thay_mang("NM_BE", sach(BE_UNG, 18))
thay_mang("NM_TIEN", sach(TIEN_UNG, 16))
thay_mang("NM_TIEN_DANH", sach(TIENDANH_UNG, 16))

# ---------- 2. CÁC CÂU NGẮN CÒN TRÙNG ----------
THAY = {
    # PARTS
    '"mai rủ bạn tới"': '"tuần sau kéo bạn tới"',
    '"Được đấy"': '"Khá được"',
    '"nhưng {top} hơi ít"': '"mỗi tội {top} hơi mỏng"',
    '"giá chấp nhận được"': '"giá vừa túi"',
    '"giá này hơi phí"': '"số tiền này thấy hơi uổng"',
    '"bù lại {mon} ngon"': '"đổi lại {mon} ngon"',
    '"bỏ về luôn"': '"xách túi về"',
    '"về tay không"': '"đi về mà bụng rỗng"',
    '"hụt hẫng ghê"': '"cụt cả hứng"',
    '"Giá sinh viên"': '"Giá dễ kham"',
    '"{mon} giá mềm"': '"{mon} tiền nhẹ"',
    '"quá hời"': '"hời thật"',
    '"Quán hết % rồi"': '"Quán báo hết %"',
    '"buồn xíu"': '"thấy tiếc"',
    '"hụt hẫng"': '"chưng hửng"',
    '"đành chia nhau"': '"chia nhau ăn đỡ"',
    '"thông cảm được"': '"cũng hiểu cho quán"',
    '"đành đặt chỗ khác"': '"quay sang đặt chỗ khác"',
    '"mong quán cập nhật menu"': '"mong quán cập nhật thực đơn"',
    '"Quán không bán cho mình"': '"Quán từ chối bán"',
    '"Đứng chờ rồi bị từ chối"': '"Chờ một hồi rồi bị mời về"',
    '"Giá hơi chát"': '"Tiền hơi cao"',
    '"ví mỏng quá"': '"túi tiền không kham nổi"',
    # XPERSONA endings
    '"  đi."': '"  ngay."',
    # PERSONA endings
    '"  nhé em!"': '"  nghen cưng!"',
    '"  ạ!"': '"  ạ vâng!"',
    '"Cho anh"': '"Anh kêu"',
    '"  nhé!"': '"  nhé cô chủ!"',
    '"  nha em!"': '"  nha bà chủ!"',
    '"  nha con!"': '"  nha bà ơi!"',
    '"Cho chú"': '"Chú kêu"',
    '"  nghen cháu!":0': '"  nghen cháu!"',
    '"  nha!"': '"  nha bà chủ ơi!"',
}
for cu, moi in THAY.items():
    if cu.endswith(":0"):
        continue
    if cu in src:
        src = src.replace(cu, moi)
    else:
        print("   (bỏ qua, không thấy):", cu)

open(DATA, "w", encoding="utf-8").write(src)
print("\nĐã ghi", DATA)

# ---------- 3. ĐO LẠI ----------
d2 = open(DATA, encoding="utf-8").read()
con = []
for m in re.finditer(r'"([^"\\\n]{3,300})"', d2):
    s = m.group(1)
    if s in GOC:
        truoc = d2[:m.start()]
        khoi = re.findall(r"export const (\w+)\s*=", truoc)
        con.append(((khoi[-1] if khoi else "?"), s))
print(f"\nCòn trùng: {len(con)}")
for k, s in con:
    print(f"   [{k}] {s}")

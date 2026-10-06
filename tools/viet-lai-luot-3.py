#!/usr/bin/env python3
"""Lượt 3 — sửa dấu ; bị thiếu ở 6 mảng tên, thay tên sạch, thay nốt câu trùng."""
import os
import re

BASE = os.path.expanduser("~/projects/laudem-tien")
DATA = os.path.join(BASE, "game/js/engine/data.js")
GOC = open(os.path.join(BASE, "_research/script_dom_245k.js"), encoding="utf-8", errors="ignore").read()
src = open(DATA, encoding="utf-8").read()

MANG_TEN = ["NM_NU", "NM_NAM", "NM_BE", "NM_TIEN", "NM_TIEN_DANH", "NM_HO"]

UNG = {
    "NM_NU": ["Ánh Tuyết", "Bảo Châu", "Bích Liên", "Cẩm Nhung", "Chi Mai", "Diệu Nga", "Đan Khanh",
              "Gia Kỳ", "Hạ Lam", "Hải Đường", "Hiền Mai", "Hoa Quỳnh", "Hoài An", "Hồng Ngọc",
              "Hương Thảo", "Khả Vy", "Kiều Diễm", "Kim Liên", "Lam Chi", "Lệ Chi", "Liên Hoa",
              "Mai Linh", "Minh Ngọc", "Mộng Lan", "Mỹ Lệ", "Ngân Khanh", "Nguyệt Minh", "Nhã Thanh",
              "Nhuệ Anh", "Phương Thảo", "Quế Anh", "Quỳnh Hương", "Sương Mai", "Tâm Như",
              "Thanh Vân", "Thiên Thanh", "Thùy Tiên", "Thương Ly", "Tiểu Vy", "Trang Nhung",
              "Tú Anh", "Tường An", "Uyên Nghi", "Vân Nhi", "Vy Ly", "Xuân Hương", "Yến Phương",
              "Ý Nhi", "Diệp Lâm", "Hạ Giang", "Mộc Lan", "Ngọc Trâm", "Phượng Ly", "Song Ly",
              "Thục Anh", "Tiên Hương", "Trúc Mai", "Tuyết Vân", "Vệ Hà", "Xuân Cúc", "Yên Chi",
              "Băng Thanh", "Cát Tường", "Dạ Lan", "Kiều Loan", "Linh Chi", "Mai Hương",
              "Nguyệt Cát", "Phương Vy", "Quỳnh Nga", "Thảo Nhi", "Thu Giang", "Túy Vy", "Uyên Chi"],
    "NM_NAM": ["Anh Khôi", "Bảo Trung", "Chí Thành", "Công Danh", "Đắc Thắng", "Đông Phong",
               "Duy Thịnh", "Gia Khiêm", "Hải Quân", "Hiếu Trung", "Hoàng Phúc", "Hữu Đạt",
               "Khang Kiện", "Khôi Vĩ", "Long Nhật", "Minh Đức", "Nam Trường", "Ngọc Lâm",
               "Nhật Quang", "Phong Hào", "Phúc Khang", "Quang Huy", "Quốc Bảo", "Sơn Lâm",
               "Tấn Lộc", "Thái Sơn", "Thanh Bình", "Thiện Lương", "Trí Tín", "Trung Kiên",
               "Tuấn Vũ", "Vĩnh An", "Việt Thắng", "Xuân Hiếu", "Đình Quang", "Mạnh Tường",
               "Bá Hùng", "Cao Kiên", "Danh Khang", "Hữu Lợi", "Kiến Quốc", "Lạc Hồng"],
    "NM_BE": ["Bé Cà", "Bé Cốm", "Bé Quýt", "Bé Măng", "Bé Hến", "Bé Nếp", "Bé Sắn", "Bé Rơm",
              "Bé Trứng", "Bé Cua", "Bé Ốc", "Bé Bưởi", "Bé Chanh Dây", "Bé Kẹo", "Bé Bánh",
              "Bé Sữa", "Bé Tép", "Bé Ngô", "Bé Đậu Nành", "Bé Gạo Lứt"],
    "NM_TIEN": ["Tống", "Ngu", "Cơ", "Ôn", "Mạnh", "Vu", "Ngụy", "Thẩm", "Tăng", "Liêu", "Hạ",
                "Kỷ", "Tây Môn", "Bạch"],
    "NM_TIEN_DANH": ["Vô Trần", "Thanh Hạc", "Ngạo Tuyết", "Hàn Sương", "Tử Đằng", "Bạch Vân",
                     "Tuyết Liên", "Kiếm Ca", "Đan Hà", "Ngọc Linh", "Phiêu Vân", "Tịch Mịch Sơn",
                     "Yên Hà", "Vấn Kiếm", "Nhược Vân", "Trường Ca", "Hạo Nguyệt"],
    "NM_HO": None,   # giữ nguyên — họ người Việt là danh sách đóng
}

print("Sửa và thay mảng tên:")
for ten in MANG_TEN:
    pat = re.compile(r"export const %s\s*=\s*\[([^\]]*)\]\s*;?" % ten, re.S)
    m = pat.search(src)
    if not m:
        print(f"  {ten}: KHÔNG KHỚP"); continue
    if UNG[ten] is None:
        src = src[:m.start()] + f"export const {ten} = [{m.group(1)}];" + src[m.end():]
        print(f"  {ten}: giữ nguyên (họ Việt Nam), thêm lại dấu ;")
        continue
    ds = [x for x in UNG[ten] if x not in GOC][: (60 if ten == "NM_NU" else 40 if ten == "NM_NAM" else 18)]
    body = "[\n    " + ",\n    ".join('"%s"' % x for x in ds) + "\n]"
    src = src[:m.start()] + f"export const {ten} = {body};" + src[m.end():]
    print(f"  {ten}: {len(ds)} tên mới, đã có dấu ;")

THAY = {
    '"mai rủ bạn tới"': '"tuần sau kéo bạn tới"',
    '"Được đấy"': '"Khá được"',
    '"nhưng {top} hơi ít"': '"mỗi tội {top} hơi mỏng"',
    '"giá chấp nhận được"': '"giá vừa túi"',
    '"giá này hơi phí"': '"số tiền này hơi uổng"',
    '"bù lại {mon} ngon"': '"đổi lại {mon} ngon"',
    '"bỏ về luôn"': '"xách túi về"',
    '"về tay không"': '"đi về bụng rỗng"',
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
    '"  đi."': '"  ngay."',
    '"  nhé em!"': '"  nghen cưng!"',
    '"  ạ!"': '"  ạ vâng!"',
    '"Cho anh"': '"Anh kêu"',
    '"  nhé!"': '"  nhé cô chủ!"',
    '"  nha em!"': '"  nha bà chủ!"',
    '"  nha con!"': '"  nha bà ơi!"',
    '"Cho chú"': '"Chú kêu"',
    '"  nha!"': '"  nha bà chủ ơi!"',
}
print("\nThay câu ngắn:")
for cu, moi in THAY.items():
    if cu in src:
        src = src.replace(cu, moi)
    else:
        print("   (không thấy):", cu)

open(DATA, "w", encoding="utf-8").write(src)

d2 = open(DATA, encoding="utf-8").read()
con = []
for m in re.finditer(r'"([^"\\\n]{3,300})"', d2):
    if m.group(1) in GOC:
        khoi = re.findall(r"export const (\w+)\s*=", d2[:m.start()])
        con.append(((khoi[-1] if khoi else "?"), m.group(1)))
print(f"\nCòn trùng: {len(con)}")
for k, s in con:
    print(f"   [{k}] {s}")

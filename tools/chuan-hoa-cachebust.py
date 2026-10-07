#!/usr/bin/env python3
"""Chuẩn hoá cache-bust: gắn ?v=HIỆN_TẠI cho MỌI import .js tương đối còn thiếu phiên bản.

LỖI GỐC (08/10): các mô-đun trong game/js/engine import lẫn nhau bằng tên TRẦN
  import { lChance } from './economy.js';        <-- KHÔNG có ?v=
Trình duyệt cache economy.js ở URL không phiên bản → VĨNH VIỄN không làm mới.
main.js?v=52 có đổi bao nhiêu lần cũng vô ích: economy.js/data.js/stock.js… vẫn là bản cache cũ.
Đây chính là lý do chủ dự án "vẫn ko thấy khách order nồi lớn" dù lChance đã sửa trong tệp.

Cách sửa: gắn ?v=<phiên bản hiện tại> vào mọi import .js tương đối chưa có, để từ nay
tools/bump-version.py đổi MỘT chuỗi ?v=NN là làm mới toàn cây.
"""
import pathlib, re, sys

ROOT = pathlib.Path.home() / "projects/laudem-tien"
# phiên bản hiện tại đang dùng trong index.html
idx = (ROOT / "game/index.html").read_text()
m = re.search(r"\?v=(\d+)", idx)
VER = m.group(1) if m else sys.exit("không tìm thấy ?v= trong game/index.html")
print("phiên bản hiện tại:", VER)

# khớp: from '...js'  HOẶC  import('...js')  — đường dẫn tương đối, CHƯA có ?v=
pat = re.compile(r"""(from\s+|import\(\s*)(['"])(\.{1,2}/[^'"]*?\.js)(\2)""")

def thay(mo):
    dau, nhay, duong, nhay2 = mo.group(1), mo.group(2), mo.group(3), mo.group(4)
    if "?v=" in duong:
        return mo.group(0)               # đã có phiên bản
    return f"{dau}{nhay}{duong}?v={VER}{nhay2}"

tong = 0
for p in sorted((ROOT / "game/js").rglob("*.js")):
    s = p.read_text()
    s2, n = pat.subn(thay, s)
    if s2 != s:
        p.write_text(s2)
        them = s2.count(f"?v={VER}") - s.count(f"?v={VER}")
        print(f"  {p.relative_to(ROOT)}: gắn ?v={VER} cho {them} import trần")
        tong += them
print("tổng số import được chuẩn hoá:", tong)

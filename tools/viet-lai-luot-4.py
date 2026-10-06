#!/usr/bin/env python3
"""Lượt 4 — dọn nốt đuôi câu giọng gọi món + vài câu còn sót."""
import os
import re

BASE = os.path.expanduser("~/projects/laudem-tien")
DATA = os.path.join(BASE, "game/js/engine/data.js")
GOC = open(os.path.join(BASE, "_research/script_dom_245k.js"), encoding="utf-8", errors="ignore").read()
src = open(DATA, encoding="utf-8").read()

PERSONA = '''export const PERSONA = [
  {o: ["Chị lấy", "Bà chủ ơi cho chị", "Chị đặt"], e: [" nha cưng!", " giùm chị!", " nhé, chị cảm ơn trước!"]},
  {o: ["Em lấy", "Cho em một", "Chị ơi em gọi"], e: [" ạ, em gọi liền!", " nha chị!", " với ạ!"]},
  {o: ["Anh gọi", "Anh kêu", "Cô chủ cho anh"], e: [" nhé, anh ngồi bàn ngoài!", " nha em!", " giùm cái!"]},
  {o: ["Bà kêu", "Cháu cho bà", "Bà muốn"], e: [" nghen con!", " nhé cháu!", " nha, bà ngồi chờ đây!"]},
  {o: ["Con gọi", "Cho con", "Cô ơi con lấy"], e: [" ạ, con cảm ơn trước!", " nha cô!", " với ạ!"]},
  {o: ["Chú gọi", "Chú kêu", "Cháu cho chú"], e: [" nhé, chú ngồi ngoài hẻm!", " nghen cháu!", " nha, thêm chén nữa!"]},
  {o: ["Shipper lấy đơn", "Cho anh đơn", "Anh lấy gấp"], e: [" nha em, gấp lắm!", " liền giùm anh!", " nhé, khách đang chờ!"]}
];'''

XPERSONA = '''export const XPERSONA = [
  {o: ["Chưởng quầy, bản tọa muốn", "Đạo hữu, mang cho ta", "Bổn tọa gọi"], e: [" ngay.", " một phần.", " nhé, ta chờ ở trà đình."]},
  {o: ["Tại hạ xin", "Phiền đạo hữu bưng", "Cho tại hạ"], e: [" ngay.", " một phần.", " nhé, đa tạ."]},
  {o: ["Ngửi mùi mà tới, bổn tiên muốn", "Cho ta nồi", "Nghe đồn ngon, cho ta"], e: [" ngay.", " nào.", " đi, ta ngồi đây."]}
];'''

src = re.sub(r"export const PERSONA\s*=\s*\[.*?\n\];", PERSONA, src, count=1, flags=re.S)
src = re.sub(r"export const XPERSONA\s*=\s*\[.*?\n\];", XPERSONA, src, count=1, flags=re.S)
src = src.replace('"Quán báo hết %"', '"Tới nơi thì quán báo hết %"')
src = src.replace('/* món "chậm" (sơ chế lâu) → đơn chứa chúng được khách chờ lâu hơn một chút */',
                  '/* món nấu lâu (sơ chế kỹ) → đơn chứa chúng được khách chờ lâu hơn một chút */')

open(DATA, "w", encoding="utf-8").write(src)

d2 = open(DATA, encoding="utf-8").read()
con = []
for m in re.finditer(r'"([^"\\\n]{3,300})"', d2):
    if m.group(1) in GOC:
        khoi = re.findall(r"export const (\w+)\s*=", d2[:m.start()])
        con.append(((khoi[-1] if khoi else "?"), m.group(1)))
print(f"Còn trùng: {len(con)}")
for k, s in con:
    print(f"   [{k}] {s}")

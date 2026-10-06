#!/usr/bin/env python3
"""Lượt 5 — bể review tiên hiệp: mọi câu đều mang từ khóa tiên hiệp (test đòi), + dọn 2 đuôi câu."""
import os
import re

BASE = os.path.expanduser("~/projects/laudem-tien")
DATA = os.path.join(BASE, "game/js/engine/data.js")
GOC = open(os.path.join(BASE, "_research/script_dom_245k.js"), encoding="utf-8", errors="ignore").read()
src = open(DATA, encoding="utf-8").read()

XGREAT = '''  xgreat: [
    "Linh khí trong nồi {mon} ngưng mà không tán, bổn tọa phải hỏi thăm bí quyết",
    "Tu luyện ngàn năm, lần đầu nếm được thứ này ở cõi phàm",
    "Một ngụm vào, linh khí chạy khoan khoái khắp kinh mạch",
    "Hỏa hậu trong nồi có đạo vận, kẻ phàm nhân này không tầm thường",
    "Linh khí trong nguyên liệu còn tươi, chẳng phải hàng tồn lâu trong túi trữ vật",
    "Sư muội bổn tọa vốn kén ăn, vậy mà gật đầu hai lượt",
    "Bổn tọa ghi tên quán này vào ngọc giản riêng",
    "Mùi hương lọt cả kết giới, bổn tọa phải tới xem cho rõ",
    "Chỉ một nồi mà linh đài sáng ra vài phần, đáng để tu luyện tiếp"
  ],
  xbad: [
    "Bổn tọa chờ tới mức chân hỏa muốn trào ra ngoài",
    "Phàm nhân nấu chậm còn thông cảm được, nấu sai thì quá đáng",
    "Linh khí tán sạch, chỉ còn nước lã",
    "Tu luyện ba trăm năm, suýt đạo tâm bất ổn vì một nồi quá mặn",
    "Bổn tọa đợi tới khi linh thạch trong túi nguội ngắt",
    "Hừ, bổn tọa nhớ mặt quán này"
  ]
};'''

src = re.sub(r"\n  xgreat: \[.*?\n  \]\n\};", "\n" + XGREAT, src, count=1, flags=re.S)
src = src.replace('" nha em!"', '" nha em, ghi đơn ngay!"')
src = src.replace('" nghen cháu!"', '" nghen cháu, bà chờ được!"')

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

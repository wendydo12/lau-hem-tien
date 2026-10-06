#!/usr/bin/env python3
"""Lượt 6 — thay gọn 2 bể review tiên hiệp (mọi câu đều có từ khóa tiên hiệp)."""
import os
import re

BASE = os.path.expanduser("~/projects/laudem-tien")
DATA = os.path.join(BASE, "game/js/engine/data.js")
src = open(DATA, encoding="utf-8").read()

MOI = '''xgreat: [
      "Linh khí trong nồi {mon} ngưng mà không tán, bổn tọa phải hỏi thăm bí quyết",
      "Tu luyện ngàn năm, lần đầu nếm được thứ này ở cõi phàm",
      "Một ngụm vào, linh khí chạy khoan khoái khắp kinh mạch",
      "Hỏa hậu trong nồi có đạo vận, kẻ phàm nhân này không tầm thường",
      "Linh khí trong nguyên liệu còn tươi, chẳng phải hàng tồn trong túi trữ vật",
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
    ]'''

pat = re.compile(r"xgreat: \[.*?\],\s*\n\s*xbad: \[.*?\]", re.S)
src2, n = pat.subn(MOI, src, count=1)
print("khớp:", bool(n))
open(DATA, "w", encoding="utf-8").write(src2)
print(re.search(r"xgreat: \[.*?\n  \]", open(DATA, encoding="utf-8").read(), re.S).group(0)[:220])

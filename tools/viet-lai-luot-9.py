#!/usr/bin/env python3
"""Lượt 9 — đổi nốt vài nhãn/câu ngắn còn trùng (giữ nghĩa, đổi chữ)."""
import os
import re
import glob
import subprocess

B = os.path.expanduser("~/projects/laudem-tien")

THAY = [
    ('[Tự động dịch]', '[Thiên đình dịch]'),
    ('"Vay ngân hàng"', '"Vay vốn ngân hàng"'),
    ('Nấu & nhập', 'Nấu và nhập hàng'),
    ('"Dùng trong ngày"', '"Hạn dùng một ngày"'),
    ('"Không hết hạn"', '"Hạn dùng vô thời hạn"'),
    ('"Cuối tuần"', '"Ngày cuối tuần"'),
    ('"Buồn ghê"', '"Buồn thật"'),
    ('"Tuyệt quá"', '"Quá tuyệt"'),
    ('"Gửi phản hồi"', '"Gửi trả lời"'),
    ('"Phản hồi của quán"', '"Quán đáp lại"'),
    ('"Chơi tiếp"', '"Đi tiếp"'),
    ('"Đổi tên quán"', '"Sửa tên quán"'),
    ('"khách khó ở"', '"khách chua tính"'),
    ('"khách bỏ về"', '"khách rời quán"'),
]

dem = 0
for f in sorted(set(glob.glob(B + "/game/js/**/*.js", recursive=True) + glob.glob(B + "/game/*.html"))):
    s = open(f, encoding="utf-8").read()
    s2 = s
    for cu, moi in THAY:
        s2 = s2.replace(cu, moi)
    if s2 != s:
        open(f, "w", encoding="utf-8").write(s2)
        dem += 1
print("tệp đã đổi nhãn:", dem)

# test có nhắc tới nhãn nào vừa đổi?
for cu, _ in THAY:
    r = subprocess.run(["grep", "-rn", cu.strip('"'), B + "/game/tests"], capture_output=True, text=True)
    if r.stdout.strip():
        print("  ⚠ test nhắc:", cu, "→", r.stdout.strip()[:120])
print("xong")

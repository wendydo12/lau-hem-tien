#!/usr/bin/env python3
"""Sửa hậu quả (lượt 2): khôi phục mọi cặp ngoặc rỗng bị xoá, dựa trên so khớp KÝ TỰ với git HEAD.

Nguyên tắc: chỗ nào bản HEAD có "()" (hoặc "(  )") mà bản hiện tại mất đúng cặp đó,
thì chèn lại — các thay đổi khác (đổi tên, viết lại chữ) giữ nguyên.
"""
import difflib
import os
import re
import subprocess

BASE = os.path.expanduser("~/projects/laudem-tien")
os.chdir(BASE)

ds = [l.split()[-1] for l in subprocess.run(["git", "status", "--short"], capture_output=True, text=True).stdout.splitlines()
      if l.endswith(".js")]
print("tệp .js:", len(ds))

RX_RONG = re.compile(r"^\(\s*\)$")
tong = 0
for f in ds:
    h = subprocess.run(["git", "show", f"HEAD:{f}"], capture_output=True, text=True)
    if h.returncode != 0:
        continue
    a = h.stdout                       # bản HEAD
    b = open(f, encoding="utf-8").read()  # bản hiện tại
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    ra = []
    i = j = 0
    chen = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "delete" and RX_RONG.match(a[i1:i2]):
            # cặp ngoặc rỗng bị xoá oan → chèn lại
            ra.append(b[j:j1])
            ra.append(a[i1:i2])
            j = j1
            chen += 1
        # các opcode khác: giữ nguyên phần của bản hiện tại ở lần ghi cuối
    ra.append(b[j:])
    out = "".join(ra)
    # dựng lại đúng thứ tự: cách trên chỉ chèn được khi opcode delete nằm rời rạc
    if chen and out != b:
        # kiểm tra lại lần nữa bằng vòng lặp chuẩn (an toàn hơn)
        ra2, i, j, chen2 = [], 0, 0, 0
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                ra2.append(b[j1:j2]); continue
            if tag == "delete" and RX_RONG.match(a[i1:i2]):
                ra2.append(a[i1:i2]); chen2 += 1; continue
            if tag == "replace" and RX_RONG.search(a[i1:i2]) and b[j1:j2] == re.sub(r"\(\s*\)", "", a[i1:i2]):
                ra2.append(a[i1:i2]); chen2 += 1; continue
            ra2.append(b[j1:j2])
        out = "".join(ra2)
        chen = chen2
    if chen:
        open(f, "w", encoding="utf-8").write(out)
        tong += chen
        print(f"  {f}: chèn lại {chen} cặp ngoặc")
print("tổng:", tong)

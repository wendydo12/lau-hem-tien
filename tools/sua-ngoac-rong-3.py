#!/usr/bin/env python3
"""Khôi phục các cặp ngoặc rỗng "()" bị xoá oan (so ký tự với git HEAD)."""
import difflib
import os
import re
import subprocess

BASE = os.path.expanduser("~/projects/laudem-tien")
os.chdir(BASE)
RX = re.compile(r"\(\s*\)")

ds = [l.split()[-1] for l in subprocess.run(["git", "status", "--short"], capture_output=True, text=True).stdout.splitlines()
      if l.endswith(".js")]

tong = 0
for f in ds:
    h = subprocess.run(["git", "show", f"HEAD:{f}"], capture_output=True, text=True)
    if h.returncode != 0:
        continue
    a = h.stdout
    b = open(f, encoding="utf-8").read()
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    ra, chen = [], 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            ra.append(b[j1:j2])
        elif tag == "insert":
            ra.append(b[j1:j2])
        elif tag == "delete":
            if RX.fullmatch(a[i1:i2].strip()) or RX.fullmatch(a[i1:i2]):
                ra.append(a[i1:i2]); chen += 1
            # nếu là nội dung khác bị xoá có chủ đích → bỏ luôn
        else:  # replace
            if b[j1:j2] == RX.sub("", a[i1:i2]):
                ra.append(a[i1:i2]); chen += 1
            else:
                ra.append(b[j1:j2])
    out = "".join(ra)
    if chen and out != b:
        open(f, "w", encoding="utf-8").write(out)
        tong += chen
        print(f"  {f}: +{chen} cặp ngoặc")
print("tổng:", tong)

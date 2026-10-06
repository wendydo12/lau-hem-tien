#!/usr/bin/env python3
"""Sửa hậu quả: lượt 8 lỡ xoá mọi cặp ngoặc rỗng "()" trong 18 tệp.

Cách sửa: so từng dòng với bản trong git HEAD; dòng nào chỉ khác đúng ở chỗ mất "()"
thì trả lại nguyên dòng cũ.
"""
import difflib
import os
import re
import subprocess

BASE = os.path.expanduser("~/projects/laudem-tien")
os.chdir(BASE)

files = subprocess.run(["git", "status", "--short"], capture_output=True, text=True).stdout
ds = [l.split()[-1] for l in files.splitlines() if l.endswith(".js")]
print("tệp .js đã đổi:", len(ds))

phuc_hoi = 0
for f in ds:
    head = subprocess.run(["git", "show", f"HEAD:{f}"], capture_output=True, text=True)
    if head.returncode != 0:
        continue
    old = head.stdout.splitlines(keepends=True)
    new = open(f, encoding="utf-8").read().splitlines(keepends=True)
    sm = difflib.SequenceMatcher(None, old, new, autojunk=False)
    ra = list(new)
    sua = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag != "replace":
            continue
        blk_old, blk_new = old[i1:i2], new[j1:j2]
        if len(blk_old) != len(blk_new):
            continue
        if all(re.sub(r"\(\s*\)", "", a) == b for a, b in zip(blk_old, blk_new)):
            ra[j1:j2] = blk_old
            sua += len(blk_old)
    if sua:
        open(f, "w", encoding="utf-8").write("".join(ra))
        phuc_hoi += sua
        print(f"  {f}: trả lại {sua} dòng")
print("tổng dòng phục hồi:", phuc_hoi)

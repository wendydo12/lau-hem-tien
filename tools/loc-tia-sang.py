#!/usr/bin/env python3
"""Bo cac cum pixel lam tam (tia sang) quanh sprite rau, giu lai bo rau chinh.
Khong dung scipy - tu dem cum bang BFS."""
import os, sys
from collections import deque
import numpy as np
from PIL import Image

d = os.path.expanduser("~/projects/laudem-tien/_meowa/in-20261007-upg")
src = sys.argv[1] if len(sys.argv) > 1 else f"{d}/rau_7.png"
dst = sys.argv[2] if len(sys.argv) > 2 else "/tmp/cai-ngot-sach.png"
im = Image.open(src).convert("RGBA")
a = np.array(im)
h, w = a.shape[:2]
mask = a[..., 3] > 0

lab = np.zeros((h, w), dtype=int)
cur = 0
for y in range(h):
    for x in range(w):
        if mask[y, x] and lab[y, x] == 0:
            cur += 1
            q = deque([(y, x)])
            lab[y, x] = cur
            while q:
                cy, cx = q.popleft()
                for ny, nx in ((cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)):
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and lab[ny, nx] == 0:
                        lab[ny, nx] = cur
                        q.append((ny, nx))
sizes = {c: int((lab == c).sum()) for c in range(1, cur + 1)}
order = sorted(sizes, key=sizes.get, reverse=True)
print("cum:", cur, "kich thuoc:", [sizes[c] for c in order[:12]])

main = order[0]
# vung than chinh no ra 2px
body = lab == main
for _ in range(2):
    body = body | np.roll(body, 1, 0) | np.roll(body, -1, 0) | np.roll(body, 1, 1) | np.roll(body, -1, 1)
keep = lab == main
for c in order[1:]:
    if sizes[c] >= 12 and (lab == c)[body].any():
        keep |= lab == c
out = a.copy()
out[~keep] = 0
Image.fromarray(out).save(dst)
zy = Image.fromarray(out).resize((w * 8, h * 8), Image.NEAREST)
zy.convert("RGB").save("/tmp/cai-ngot-sach-zoom.png")
print("giu", int(keep.sum()), "/", int(mask.sum()), "pixel ->", dst)

#!/usr/bin/env python3
"""Quét toàn kho ảnh: tìm tệp RỖNG / gần như rỗng (ảnh tồn tại nhưng không có hình).
Vì hàng rào cũ chỉ kiểm 'tệp có tồn tại', ảnh vẽ hỏng mà vẫn có tệp sẽ lọt."""
import os, glob
from PIL import Image
import numpy as np

ROOT = os.path.expanduser("~/projects/laudem-tien/assets")
rows = []
for p in sorted(glob.glob(ROOT + "/**/*.png", recursive=True)):
    rel = os.path.relpath(p, ROOT)
    if rel.startswith("icon/"):
        continue
    im = Image.open(p).convert("RGBA")
    a = np.array(im)[..., 3]
    cov = float((a > 8).mean())
    ys, xs = np.where(a > 8)
    bbox = (xs.max() - xs.min() + 1, ys.max() - ys.min() + 1) if len(xs) else (0, 0)
    rows.append((rel, im.size, round(cov * 100, 2), bbox, os.path.getsize(p)))

rong = [r for r in rows if r[2] < 1.0]
print(f"tổng {len(rows)} tệp ảnh (không tính icon/)")
print(f"nghi RỖNG (dưới 1% có hình): {len(rong)}")
for rel, size, cov, bbox, b in rong:
    print(f"   {rel:44s} {size} phủ {cov}%  bbox {bbox}  {b} byte")
nho = [r for r in rows if 1.0 <= r[2] < 3.0]
print(f"nghi quá nhỏ (1–3%): {len(nho)}")
for rel, size, cov, bbox, b in nho[:10]:
    print(f"   {rel:44s} {size} phủ {cov}%  bbox {bbox}")

#!/usr/bin/env python3
"""Soi kỹ 2 tệp bị nghi 'ô trống': độ phủ, màu trung bình, và xuất ảnh phóng to
trên nền SÁNG để nhìn rõ (kho ảnh nền tối nên đồ màu tối có thể chìm)."""
import os
from PIL import Image, ImageDraw
import numpy as np

A = os.path.expanduser("~/projects/laudem-tien/assets/do-vat")
names = ["hv_bang_khen.png", "hv_am_tich.png", "hv_phich_nuoc.png", "hv_chieu_coi.png"]
outs = []
for n in names:
    p = os.path.join(A, n)
    im = Image.open(p).convert("RGBA")
    a = np.array(im)
    vis = a[..., 3] > 8
    ys, xs = np.where(vis)
    rgb = a[vis][:, :3]
    lum = float(rgb.mean()) if len(rgb) else 0
    print(f"{n:22s} {im.size} phủ {vis.mean()*100:5.2f}%  bbox x{xs.min()}-{xs.max()} y{ys.min()}-{ys.max()}  sáng TB {lum:6.1f}")

# ghép 4 ô phóng to 6x trên nền sáng để mắt người/vision nhìn rõ
UP = 6
tiles = []
for n in names:
    im = Image.open(os.path.join(A, n)).convert("RGBA")
    bg = Image.new("RGBA", im.size, (243, 229, 194, 255))   # nền kem như sàn gỗ
    bg.alpha_composite(im)
    tiles.append(bg.resize((im.width * UP, im.height * UP), Image.NEAREST))
W = sum(t.width for t in tiles) + 30 * (len(tiles) + 1)
H = max(t.height for t in tiles) + 60
sheet = Image.new("RGB", (W, H), (255, 255, 255))
dr = ImageDraw.Draw(sheet)
x = 30
for t, n in zip(tiles, names):
    sheet.paste(t.convert("RGB"), (x, 40))
    dr.text((x, 14), n, fill=(0, 0, 0))
    x += t.width + 30
sheet.save("/tmp/noi-that-nghi-trong.png")
print("-> /tmp/noi-that-nghi-trong.png")

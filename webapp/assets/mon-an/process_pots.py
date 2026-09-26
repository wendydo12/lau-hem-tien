#!/usr/bin/env python3
# Xu ly sprite meowa raw: nen trang -> trong suot (flood fill bien), scale 64x64 NEAREST
from PIL import Image
from scipy import ndimage
import numpy as np
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
for src, dst in (('pot_08_raw.png', 'pot_08.png'), ('pot_09_raw.png', 'pot_09.png')):
    im = Image.open(src).convert('RGBA')
    a = np.array(im)
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    bg_mask = (mx > 228) & (mx - mn < 26)
    labeled, n = ndimage.label(bg_mask)
    border_labels = set(labeled[0, :]) | set(labeled[-1, :]) | set(labeled[:, 0]) | set(labeled[:, -1])
    border_labels.discard(0)
    outer = np.isin(labeled, list(border_labels))
    a[outer, 3] = 0
    out = Image.fromarray(a)
    bbox = out.getbbox()
    out = out.crop(bbox)
    w, h = out.size
    side = max(w, h)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - w) // 2, (side - h) // 2))
    canvas = canvas.resize((64, 64), Image.NEAREST)
    canvas.save(dst)
    arr = np.array(canvas)
    print(dst, canvas.size, 'alpha_min:', arr[..., 3].min(), 'transparent_ratio:', round((arr[..., 3] == 0).mean(), 3))
print('DONE')

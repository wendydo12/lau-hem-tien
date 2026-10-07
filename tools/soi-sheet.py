#!/usr/bin/env python3
"""Ghép sheet 8 ô thành lưới có SỐ THỨ TỰ để soi bằng vision."""
import sys, os
from PIL import Image, ImageDraw

d = os.path.expanduser("~/projects/laudem-tien/_meowa/in-20261007-bapchuoi")
tag = sys.argv[1] if len(sys.argv) > 1 else "rau"
cells = [Image.open(f"{d}/{tag}_{str(i).zfill(2)}.png").convert("RGBA") for i in range(8)]
UP, GAP, PAD = 5, 24, 34
w = max(c.width for c in cells) * UP
h = max(c.height for c in cells) * UP
W = PAD + 4 * (w + GAP)
H = PAD + 2 * (h + GAP)
sheet = Image.new("RGBA", (W, H), (255, 255, 255, 255))
dr = ImageDraw.Draw(sheet)
for i, c in enumerate(cells):
    row, col = divmod(i, 4)
    x = PAD + col * (w + GAP)
    y = PAD + row * (h + GAP)
    big = c.resize((c.width * UP, c.height * UP), Image.NEAREST)
    sheet.alpha_composite(big, (x, y))
    dr.rectangle([x - 3, y - 3, x + big.width + 3, y + big.height + 3], outline=(150, 150, 150, 255), width=2)
    dr.rectangle([x - 3, y - 29, x + 40, y - 3], fill=(20, 20, 20, 255))
    dr.text((x + 4, y - 27), str(i), fill=(255, 255, 80, 255))
out = f"/tmp/qa-{tag}.png"
sheet.convert("RGB").save(out)
print(out, sheet.size)

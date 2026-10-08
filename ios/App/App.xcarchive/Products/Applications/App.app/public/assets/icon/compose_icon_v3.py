#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
App icon "Lẩu Hẻm Tiên" v3 — pixel art 64x64 -> 1024 (NEAREST).
Fix theo QA v2 (đọc gãy ở 32px):
  - Halo ấm bậc thang sau nồi -> tách silhouette khỏi nền tối (không còn chìm).
  - Nồi to hơn, chiếm ~62% bề ngang, band tương phản thân nồi mạnh.
  - Lồng đèn chunky có outline 1px -> không còn là "pixel lỗi" ở cỡ nhỏ.
  - Khói giảm còn 3 chòm 2px, topping 4 chấm to 2x2.
  - Glow thuần pixel (bậc thang vòng), bỏ gradient gauss mềm.
Giữ nguyên DNA: nồi cù lao donut ống khói giữa, bếp than hồng, đèn lồng
đỏ-vàng hai góc, nền hẻm đêm nâu ấm, outline sẫm ấm.
"""
import math, os
from PIL import Image, ImageDraw

W = H = 64
img = Image.new("RGBA", (W, H))
px = img.load()
d = ImageDraw.Draw(img)

def C(r, g, b, a=255): return (r, g, b, a)
def blend(x, y, col, a):
    a = max(0.0, min(1.0, a / 255.0))
    if not (0 <= x < W and 0 <= y < H): return
    r0, g0, b0, _ = px[x, y]
    r, g, b = col[:3]
    px[x, y] = (int(r0*(1-a)+r*a), int(g0*(1-a)+g*a), int(b0*(1-a)+b*a), 255)

OUT = (24, 11, 7, 255)             # outline sẫm ấm
COP_BASE = (190, 104, 48); COP_DARK = (138, 64, 24); COP_LIGHT = (224, 146, 80)
COP_SPEC = (244, 190, 126); COP_RIM = (232, 158, 92)
SOUP = (158, 42, 30); SOUP_D = (116, 28, 20)
STOVE = (62, 32, 19); STOVE_D = (40, 20, 12); EMBER = (255, 110, 40); EMBER_Y = (255, 205, 95)
SMOKE_HI = (242, 234, 224); SMOKE_MID = (214, 200, 188)

# ---------- 1) nền đêm hẻm (gradient dọc ấm) ----------
top = (34, 16, 12); bot = (60, 29, 20)
for y in range(H):
    t = y / (H - 1)
    for x in range(W):
        px[x, y] = (int(top[0]+(bot[0]-top[0])*t), int(top[1]+(bot[1]-top[1])*t),
                    int(top[2]+(bot[2]-top[2])*t), 255)
# vignette nhẹ (bậc 4 nấc, giữ chất pixel)
for y in range(H):
    for x in range(W):
        dx = (x-31.5)/31.5; dy = (y-31.5)/31.5
        v = math.sqrt(dx*dx + dy*dy)
        if v > 0.75:
            k = min(1.0, (v-0.75)/0.7) * 0.42
            k = round(k*4)/4.0
            r, g, b, _ = px[x, y]; px[x, y] = (int(r*(1-k)), int(g*(1-k)), int(b*(1-k)), 255)

# ---------- 2) halo ấm BẬC THANG sau nồi (tách silhouette) ----------
HALO = (255, 138, 58)
cx, cy = 32, 36
for y in range(H):
    for x in range(W):
        r = math.sqrt(((x-cx)/23.0)**2 + ((y-cy)/20.0)**2)
        if r < 0.55:   blend(x, y, HALO, 92)
        elif r < 0.78: blend(x, y, HALO, 58)
        elif r < 0.95: blend(x, y, HALO, 32)
        elif r < 1.10: blend(x, y, HALO, 14)

# ---------- 3) dây + 2 lồng đèn chunky có outline ----------
def lantern(ccx, ccy, body, hi):
    # quầng 2 nấc
    for y in range(ccy-6, ccy+7):
        for x in range(ccx-6, ccx+7):
            rr = math.sqrt((x-ccx)**2 + (y-ccy)**2)
            if rr < 3.2: blend(x, y, hi, 70)
            elif rr < 5.2: blend(x, y, hi, 30)
    # dây treo
    d.line((ccx, ccy-6, ccx, ccy-5), fill=OUT, width=1)
    # mũ + thân 7x8 có outline -> đọc được ở 32px
    d.rectangle((ccx-3, ccy-5, ccx+3, ccy-4), fill=OUT)
    d.rounded_rectangle((ccx-4, ccy-4, ccx+4, ccy+4), radius=3, fill=body+(255,), outline=OUT)
    # nan đèn + ruột sáng
    d.line((ccx, ccy-3, ccx, ccy+3), fill=OUT, width=1)
    px[ccx-2, ccy-1] = hi+(255,); px[ccx-2, ccy] = hi+(255,)
    px[ccx+2, ccy-1] = (255, 240, 190, 255)
    # tua đáy
    d.rectangle((ccx-1, ccy+5, ccx+1, ccy+6), fill=OUT)
    px[ccx, ccy+5] = (230, 180, 90, 255)

for yy in range(0, 6):   # dây võng hai góc
    xw = 3 + int(yy*1.1)
    if xw < W: blend(xw, yy, (96, 64, 46), 170)
    xw2 = 60 - int(yy*1.1)
    if 0 <= xw2: blend(xw2, yy, (96, 64, 46), 170)
lantern(9, 11, (206, 58, 40), (255, 96, 62))     # đỏ trái
lantern(55, 11, (228, 142, 42), (255, 178, 66))  # vàng phải

# ---------- 4) khói ống khói: 3 chòm chunky ----------
for (sx, sy, col) in [(31, 15, SMOKE_HI), (33, 11, SMOKE_HI), (30, 7, SMOKE_MID)]:
    d.rectangle((sx, sy, sx+2, sy+1), fill=col+(255,))
# 2 wispy hơi nước hai bên mặt lẩu
for (wx) in (19, 45):
    px[wx, 25] = SMOKE_MID+(255,); px[wx+1, 23] = SMOKE_MID+(255,); px[wx, 21] = SMOKE_HI+(255,)

# ---------- 5) nồi cù lao ----------
# thân nồi (to hơn v2): miệng y=30, đáy y=51
body_rows = []
for y in range(31, 52):
    t = (y-31)/20.0
    inset = int(round(t*4))          # thuôn dần xuống đáy
    x0, x1 = 12+inset, 51-inset
    body_rows.append((y, x0, x1))
    for x in range(x0, x1+1):
        if x == x0 or x == x1 or y == 51:
            px[x, y] = OUT
        else:
            # band sáng trái / tối phải (nguồn sáng đèn lồng)
            u = (x-x0)/max(1, (x1-x0))
            if u < 0.30: col = COP_LIGHT
            elif u < 0.62: col = COP_BASE
            else: col = COP_DARK
            px[x, y] = col+(255,)
# dải trang trí khắc quanh thân (2 hàng chấm đồng sáng — họa tiết trống đồng tối giản)
for (y, x0, x1) in body_rows:
    if y in (38, 39):
        for x in range(x0+2, x1-1, 3):
            blend(x, y, COP_SPEC, 200)
# rim-light ấm hắt từ bếp than lên đáy nồi
for (y, x0, x1) in body_rows:
    if y == 50:
        for x in range(x0+1, x1):
            blend(x, y, COP_RIM, 190)
# highlight cạnh trái
for (y, x0, x1) in body_rows:
    if 33 <= y <= 48:
        blend(x0+1, y, COP_SPEC, 120)

# quai nồi hai bên (dính thân, dày 2px, có outline)
for side in (-1, 1):
    bx = 32 + side*20
    for i, yy in enumerate(range(35, 43)):
        xx = bx + side*int(round(2.4*math.sin(i/7.0*math.pi)))
        for k in (0, 1):
            xq = xx + side*k
            if 0 <= xq < W:
                px[xq, yy] = OUT if (i in (0, 7) or k == 1) else COP_LIGHT+(255,)

# vành miệng nồi (donut) — loe rộng
d.rounded_rectangle((10, 27, 53, 33), radius=3, fill=COP_BASE+(255,), outline=OUT)
for x in range(12, 52):
    blend(x, 28, COP_SPEC, 210)     # mép vành bắt sáng
    blend(x, 32, COP_DARK, 160)
# lòng nồi: mặt nước lẩu
d.rounded_rectangle((15, 29, 48, 32), radius=2, fill=SOUP+(255,))
for x in range(16, 48):
    blend(x, 32, SOUP_D, 200)
# topping 4 chấm 2x2 (to, đọc được ở cỡ nhỏ) — chừa giữa cho ống khói
TOPS = [((18, 29), (96, 176, 84)), ((23, 30), (242, 236, 220)),
        ((40, 29), (240, 202, 92)), ((44, 30), (236, 150, 150))]
for (tx, ty), col in TOPS:
    d.rectangle((tx, ty, tx+1, ty+1), fill=col+(255,))

# ống khói cù lao giữa nồi (miệng loe + than hồng)
d.rectangle((28, 18, 35, 30), fill=COP_BASE+(255,), outline=OUT)
for y in range(19, 30):
    blend(29, y, COP_LIGHT, 220); blend(30, y, COP_SPEC, 90)
    blend(34, y, COP_DARK, 180)
d.rounded_rectangle((26, 15, 37, 19), radius=2, fill=COP_LIGHT+(255,), outline=OUT)  # mâm miệng loe
for x in (28, 30, 32, 34):   # than hồng trong miệng ống
    px[x, 17] = EMBER+(255,); px[x, 18] = EMBER_Y+(255,)
px[29, 17] = EMBER_Y+(255,); px[33, 17] = EMBER_Y+(255,)

# ---------- 6) bếp than ----------
d.rounded_rectangle((14, 52, 49, 61), radius=2, fill=STOVE+(255,), outline=STOVE_D+(255,))
for x in range(16, 48):
    blend(x, 53, (126, 70, 38), 100)   # mặt bếp hắt sáng
for ex in (20, 31, 42):                # 3 cụm than hồng chunky
    d.rectangle((ex, 55, ex+2, 57), fill=EMBER+(255,))
    px[ex+1, 56] = EMBER_Y+(255,); px[ex, 56] = EMBER_Y+(255,)
    blend(ex+1, 54, EMBER, 90)         # ánh hắt lên khe
d.rectangle((18, 59, 45, 59), fill=STOVE_D+(255,))  # khe gió đáy

# ---------- 7) xuất file ----------
HERE = os.path.dirname(os.path.abspath(__file__))
master = img.resize((1024, 1024), Image.NEAREST)
out_path = os.path.join(HERE, "app_icon_1024.png")
if os.path.exists(out_path):
    os.replace(out_path, os.path.join(HERE, "app_icon_1024_v2.png"))
master.save(out_path)
img.resize((256, 256), Image.NEAREST).save(os.path.join(HERE, "app_icon_256.png"))
img.resize((180, 180), Image.NEAREST).save(os.path.join(HERE, "app_icon_180.png"))
img.resize((32, 32), Image.NEAREST).save(os.path.join(HERE, "app_icon_32.png"))

# contact sheet: master 512 + size ladder
m512 = img.resize((512, 512), Image.NEAREST)
sheet = Image.new("RGB", (512+180+40, 512), (18, 10, 7))
sheet.paste(m512, (0, 0))
dd = ImageDraw.Draw(sheet)
yy = 30
for sz in (180, 96, 64, 32):
    th = img.resize((sz, sz), Image.NEAREST)
    sheet.paste(th, (512+30, yy))
    dd.text((512+30, yy+sz+4), f"{sz}px", fill=(160, 140, 120))
    yy += sz + 28
sheet.save(os.path.join(HERE, "app_icon_contactsheet.png"))
print("OK v3:", out_path)

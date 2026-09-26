#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
App icon "Lẩu Hẻm Tiên" v4 — fix trọn 12 mục QA v3:
  * Master 64: zigzag -> đường highlight liền 1px; khói 1 cột 2px đối xứng
    (bỏ 2 vệt chéo bên hông); quai dày 3px có khe sáng; halo dither bậc
    thang có chủ đích; mép bếp sáng thêm 1 tông; than trong ống gọn 2+2.
  * Bậc 32px: REDRAW NATIVE trên lưới 32x32 (không scale) — bỏ dây đèn,
    lồng đèn nén cụm 3x4 có glow 1px, 1 cột khói nối liền, topping gộp,
    lửa gộp 1 thanh ấm, halo mạnh + rim-light ấm quanh silhouette,
    outline nâu ấm đậm (#3d1e10) thay đen thuần.
  * Ladder chỉ dùng tỷ lệ NGUYÊN: 32 native, 64 native, 128=2x, 256=4x,
    1024=16x (NEAREST) — hết rơi pixel.
"""
import math, os
from PIL import Image, ImageDraw

OUT = (24, 11, 7, 255)
OUT_W = (61, 30, 16, 255)          # outline nâu ấm đậm cho bậc nhỏ
COP_BASE = (190, 104, 48); COP_DARK = (138, 64, 24); COP_LIGHT = (224, 146, 80)
COP_SPEC = (244, 190, 126); COP_RIM = (232, 158, 92)
SOUP = (158, 42, 30); SOUP_D = (116, 28, 20)
STOVE = (62, 32, 19); STOVE_D = (40, 20, 12); STOVE_TOP = (104, 58, 32)
EMBER = (255, 110, 40); EMBER_Y = (255, 205, 95)
SMOKE_HI = (242, 234, 224); SMOKE_MID = (214, 200, 188)
HALO = (255, 138, 58)
HERE = os.path.dirname(os.path.abspath(__file__))

def night_bg(W, H, top, bot):
    img = Image.new("RGBA", (W, H)); px = img.load()
    for y in range(H):
        t = y/(H-1)
        for x in range(W):
            px[x, y] = (int(top[0]+(bot[0]-top[0])*t), int(top[1]+(bot[1]-top[1])*t),
                        int(top[2]+(bot[2]-top[2])*t), 255)
    return img, px

def halo_dither(px, W, H, cx, cy, rx, ry, col, bands):
    """bands: list (r_max, alpha) từ trong ra ngoài; mép ngoài dither caro."""
    for y in range(H):
        for x in range(W):
            r = math.sqrt(((x-cx)/rx)**2 + ((y-cy)/ry)**2)
            for i, (rmax, a) in enumerate(bands):
                if r < rmax:
                    if i == len(bands)-1 and (x+y) % 2 == 0:
                        continue                      # dither mép ngoài cùng
                    r0, g0, b0, _ = px[x, y]; aa = a/255.0
                    px[x, y] = (int(r0*(1-aa)+col[0]*aa), int(g0*(1-aa)+col[1]*aa),
                                int(b0*(1-aa)+col[2]*aa), 255)
                    break

def vignette(px, W, H, strength=0.42):
    for y in range(H):
        for x in range(W):
            dx = (x-(W-1)/2)/((W-1)/2); dy = (y-(H-1)/2)/((H-1)/2)
            v = math.sqrt(dx*dx+dy*dy)
            if v > 0.75:
                k = min(1.0, (v-0.75)/0.7)*strength
                k = round(k*4)/4.0
                r, g, b, _ = px[x, y]; px[x, y] = (int(r*(1-k)), int(g*(1-k)), int(b*(1-k)), 255)

def lantern_big(d, px, ccx, ccy, body, hi, W, H):
    def bl(x, y, col, a):
        if not (0 <= x < W and 0 <= y < H): return
        aa = a/255.0; r0, g0, b0, _ = px[x, y]
        px[x, y] = (int(r0*(1-aa)+col[0]*aa), int(g0*(1-aa)+col[1]*aa), int(b0*(1-aa)+col[2]*aa), 255)
    for y in range(ccy-6, ccy+7):
        for x in range(ccx-6, ccx+7):
            rr = math.sqrt((x-ccx)**2 + (y-ccy)**2)
            if rr < 3.2: bl(x, y, hi, 74)
            elif rr < 5.2 and (x+y) % 2 == 0: bl(x, y, hi, 30)   # dither quầng
    d.line((ccx, ccy-6, ccx, ccy-5), fill=OUT, width=1)
    d.rectangle((ccx-3, ccy-5, ccx+3, ccy-4), fill=OUT)
    d.rounded_rectangle((ccx-4, ccy-4, ccx+4, ccy+4), radius=3, fill=body+(255,), outline=OUT)
    d.line((ccx, ccy-3, ccx, ccy+3), fill=OUT, width=1)
    px[ccx-2, ccy-1] = hi+(255,); px[ccx-2, ccy] = hi+(255,)
    px[ccx+2, ccy-1] = (255, 240, 190, 255)
    d.rectangle((ccx-1, ccy+5, ccx+1, ccy+6), fill=OUT)
    px[ccx, ccy+5] = (230, 180, 90, 255)

# ============================================================ MASTER 64
def build_master():
    W = H = 64
    img, px = night_bg(W, H, (34, 16, 12), (60, 29, 20))
    d = ImageDraw.Draw(img)
    vignette(px, W, H)
    halo_dither(px, W, H, 32, 36, 23, 20, HALO,
                [(0.55, 96), (0.78, 60), (0.95, 32), (1.12, 14)])

    for yy in range(0, 6):
        xw = 3 + int(yy*1.1); xw2 = 60 - int(yy*1.1)
        for xx in (xw, xw2):
            if 0 <= xx < W:
                r0, g0, b0, _ = px[xx, yy]
                px[xx, yy] = (int(r0*0.4+96*0.6), int(g0*0.4+64*0.6), int(b0*0.4+46*0.6), 255)
    lantern_big(d, px, 9, 11, (206, 58, 40), (255, 96, 62), W, H)
    lantern_big(d, px, 55, 11, (228, 142, 42), (255, 178, 66), W, H)

    # khói: 1 cột 2px đối xứng, nối gần liền
    for (sy, col) in [(15, SMOKE_HI), (12, SMOKE_HI), (9, SMOKE_MID), (6, SMOKE_MID)]:
        d.rectangle((31, sy, 32, sy+1), fill=col+(255,))

    # thân nồi cù lao
    body_rows = []
    for y in range(31, 52):
        t = (y-31)/20.0
        inset = int(round(t*4))
        x0, x1 = 12+inset, 51-inset
        body_rows.append((y, x0, x1))
        for x in range(x0, x1+1):
            if x == x0 or x == x1 or y == 51: px[x, y] = OUT
            else:
                u = (x-x0)/max(1, (x1-x0))
                px[x, y] = (COP_LIGHT if u < 0.30 else COP_BASE if u < 0.62 else COP_DARK)+(255,)
    # highlight LIỀN 1px (thay zigzag chấm)
    for (y, x0, x1) in body_rows:
        if y == 38:
            for x in range(x0+2, x1-1): px[x, y] = COP_SPEC+(255,)
        if y == 39:
            for x in range(x0+2, x1-1):
                r0, g0, b0, _ = px[x, y]
                px[x, y] = (int(r0*0.6+COP_SPEC[0]*0.4), int(g0*0.6+COP_SPEC[1]*0.4), int(b0*0.6+COP_SPEC[2]*0.4), 255)
    for (y, x0, x1) in body_rows:
        if y == 50:
            for x in range(x0+1, x1):
                r0, g0, b0, _ = px[x, y]
                px[x, y] = (min(255, int(r0*0.35+COP_RIM[0]*0.65)), min(255, int(g0*0.35+COP_RIM[1]*0.65)), min(255, int(b0*0.35+COP_RIM[2]*0.65)), 255)
        if 33 <= y <= 48:
            r0, g0, b0, _ = px[x0+1, y]
            px[x0+1, y] = (min(255, int(r0*0.55+COP_SPEC[0]*0.45)), min(255, int(g0*0.55+COP_SPEC[1]*0.45)), min(255, int(b0*0.55+COP_SPEC[2]*0.45)), 255)

    # quai dày 3px: sáng - đồng - outline (có khe sáng tách khỏi thân)
    for side in (-1, 1):
        bx = 32 + side*20
        for i, yy in enumerate(range(35, 43)):
            xx = bx + side*int(round(2.4*math.sin(i/7.0*math.pi)))
            for k, col in ((0, COP_SPEC), (1, COP_BASE), (2, OUT[:3])):
                xq = xx + side*k
                if 0 <= xq < W: px[xq, yy] = col+(255,)

    # vành miệng + lòng lẩu
    d.rounded_rectangle((10, 27, 53, 33), radius=3, fill=COP_BASE+(255,), outline=OUT)
    for x in range(12, 52):
        px[x, 28] = COP_SPEC+(255,)
        r0, g0, b0, _ = px[x, 32]
        px[x, 32] = (int(r0*0.45+COP_DARK[0]*0.55), int(g0*0.45+COP_DARK[1]*0.55), int(b0*0.45+COP_DARK[2]*0.55), 255)
    d.rounded_rectangle((15, 29, 48, 32), radius=2, fill=SOUP+(255,))
    for x in range(16, 48):
        r0, g0, b0, _ = px[x, 32]
        px[x, 32] = (int(r0*0.35+SOUP_D[0]*0.65), int(g0*0.35+SOUP_D[1]*0.65), int(b0*0.35+SOUP_D[2]*0.65), 255)
    for (tx, ty), col in [((18, 29), (96, 176, 84)), ((23, 30), (242, 236, 220)),
                          ((40, 29), (240, 202, 92)), ((44, 30), (236, 150, 150))]:
        d.rectangle((tx, ty, tx+1, ty+1), fill=col+(255,))

    # ống khói + mâm loe + than gọn 2+2
    d.rectangle((28, 18, 35, 30), fill=COP_BASE+(255,), outline=OUT)
    for y in range(19, 30):
        px[29, y] = COP_LIGHT+(255,)
        r0, g0, b0, _ = px[30, y]
        px[30, y] = (int(r0*0.6+COP_SPEC[0]*0.4), int(g0*0.6+COP_SPEC[1]*0.4), int(b0*0.6+COP_SPEC[2]*0.4), 255)
        r0, g0, b0, _ = px[34, y]
        px[34, y] = (int(r0*0.35+COP_DARK[0]*0.65), int(g0*0.35+COP_DARK[1]*0.65), int(b0*0.35+COP_DARK[2]*0.65), 255)
    d.rounded_rectangle((26, 15, 37, 19), radius=2, fill=COP_LIGHT+(255,), outline=OUT)
    for x in (28, 34): px[x, 17] = EMBER+(255,)
    for x in (29, 33): px[x, 17] = EMBER_Y+(255,)
    px[30, 17] = EMBER+(255,); px[32, 17] = EMBER+(255,)

    # bếp than: mép trên sáng hơn 1 tông
    d.rounded_rectangle((14, 52, 49, 61), radius=2, fill=STOVE+(255,), outline=STOVE_D+(255,))
    for x in range(16, 48):
        px[x, 53] = STOVE_TOP+(255,)
        r0, g0, b0, _ = px[x, 54]
        px[x, 54] = (int(r0*0.5+STOVE_TOP[0]*0.5), int(g0*0.5+STOVE_TOP[1]*0.5), int(b0*0.5+STOVE_TOP[2]*0.5), 255)
    for ex in (20, 31, 42):
        d.rectangle((ex, 55, ex+2, 57), fill=EMBER+(255,))
        px[ex+1, 56] = EMBER_Y+(255,); px[ex, 56] = EMBER_Y+(255,)
        r0, g0, b0, _ = px[ex+1, 54]
        px[ex+1, 54] = (min(255, r0+60), min(255, g0+24), b0, 255)
    d.rectangle((18, 59, 45, 59), fill=STOVE_D+(255,))
    return img

# ============================================================ NATIVE 32
def build_32():
    W = H = 32
    img, px = night_bg(W, H, (38, 18, 13), (64, 31, 21))
    d = ImageDraw.Draw(img)
    vignette(px, W, H, 0.34)
    halo_dither(px, W, H, 16, 18, 12, 11, HALO,
                [(0.58, 120), (0.80, 74), (0.98, 38), (1.15, 16)])

    # lồng đèn nén: cụm 3x4 không dây, glow 1px, đối xứng
    def lant32(ccx, body, hi):
        for y in range(3, 9):
            for x in range(ccx-2, ccx+3):
                rr = math.sqrt((x-ccx)**2 + (y-5.5)**2)
                if rr < 2.6:
                    r0, g0, b0, _ = px[x, y]; aa = 70/255.0
                    px[x, y] = (int(r0*(1-aa)+hi[0]*aa), int(g0*(1-aa)+hi[1]*aa), int(b0*(1-aa)+hi[2]*aa), 255)
        d.rectangle((ccx-1, 3, ccx+1, 6), fill=body+(255,), outline=OUT_W)
        px[ccx, 4] = hi+(255,)

    lant32(4, (212, 62, 44), (255, 110, 76))
    lant32(27, (232, 148, 46), (255, 186, 84))

    # khói 1 cột 2px liền
    d.rectangle((15, 3, 16, 4), fill=SMOKE_HI+(255,))
    d.rectangle((15, 5, 16, 6), fill=SMOKE_MID+(255,))

    # ống khói: mũ loe hơn thân >=1px mỗi bên
    d.rectangle((14, 8, 17, 15), fill=COP_BASE+(255,), outline=OUT_W)
    px[14, 9] = COP_LIGHT+(255,); px[14, 10] = COP_LIGHT+(255,)
    d.rectangle((13, 7, 18, 8), fill=COP_LIGHT+(255,), outline=OUT_W)
    px[15, 7] = EMBER+(255,)                    # 1 than cam giữa

    # vành miệng + lòng lẩu + topping gộp 2 khối
    d.rectangle((5, 15, 26, 17), fill=COP_BASE+(255,), outline=OUT_W)
    for x in range(6, 26): px[x, 15] = COP_SPEC+(255,)
    d.rectangle((7, 16, 24, 16), fill=SOUP+(255,))
    d.rectangle((9, 16, 10, 16), fill=(96, 176, 84, 255))    # xanh
    d.rectangle((21, 16, 22, 16), fill=(242, 236, 220, 255)) # trắng

    # thân nồi to + band sáng trái, rim ấm quanh silhouette
    rows = []
    for y in range(18, 26):
        t = (y-18)/7.0
        inset = int(round(t*2))
        x0, x1 = 7+inset, 24-inset
        rows.append((y, x0, x1))
        for x in range(x0, x1+1):
            u = (x-x0)/max(1, (x1-x0))
            if x == x0 or x == x1 or y == 25: px[x, y] = OUT_W
            else: px[x, y] = (COP_LIGHT if u < 0.34 else COP_BASE if u < 0.66 else COP_DARK)+(255,)
    # highlight liền 1px
    for (y, x0, x1) in rows:
        if y == 21:
            for x in range(x0+1, x1): px[x, y] = COP_SPEC+(255,)
    # rim-light ấm đáy nồi
    for (y, x0, x1) in rows:
        if y == 24:
            for x in range(x0+1, x1):
                r0, g0, b0, _ = px[x, y]
                if (r0, g0, b0) != OUT_W[:3]:
                    px[x, y] = (min(255, r0+40), min(255, g0+20), b0, 255)

    # bếp: mép trên sáng, lửa = 1 thanh ấm 3px giữa
    d.rectangle((7, 26, 24, 30), fill=STOVE+(255,), outline=OUT_W)
    for x in range(8, 24): px[x, 26] = STOVE_TOP+(255,)
    d.rectangle((13, 27, 18, 28), fill=EMBER+(255,))
    px[15, 27] = EMBER_Y+(255,); px[16, 27] = EMBER_Y+(255,)
    px[15, 28] = EMBER_Y+(255,)
    return img

# ============================================================ XUẤT FILE
master = build_master()
native32 = build_32()

master.resize((1024, 1024), Image.NEAREST).save(os.path.join(HERE, "app_icon_1024.png"))
master.resize((256, 256), Image.NEAREST).save(os.path.join(HERE, "app_icon_256.png"))
master.resize((128, 128), Image.NEAREST).save(os.path.join(HERE, "app_icon_128.png"))
master.save(os.path.join(HERE, "app_icon_64.png"))
native32.save(os.path.join(HERE, "app_icon_32.png"))
for old in ("app_icon_180.png",):
    p = os.path.join(HERE, old)
    if os.path.exists(p): os.remove(p)   # bỏ size lẻ gây rơi pixel

# contact sheet: master 512 + ladder 32(native)/64/128/256
m512 = master.resize((512, 512), Image.NEAREST)
sheet = Image.new("RGB", (512+300+40, 512), (18, 10, 7))
sheet.paste(m512, (0, 0))
dd = ImageDraw.Draw(sheet)
yy = 40
for label, im in (("32 native", native32), ("64 native", master),
                  ("128 (2x)", master.resize((128, 128), Image.NEAREST)),
                  ("256 (4x)", master.resize((256, 256), Image.NEAREST))):
    sheet.paste(im.convert("RGB"), (512+40, yy))
    dd.text((512+40, yy+im.size[1]+6), label, fill=(170, 148, 126))
    yy += im.size[1] + 34
sheet.save(os.path.join(HERE, "app_icon_contactsheet.png"))
print("OK v4")

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Contact sheet + bản simplified cho size nhỏ.
Bài học từ reference icon-qa-stop-rule: 16px là cỡ rơi dưới ngưỡng legibility
cho sprite nhiều chi tiết → phải có BẢN RIÊNG, không downscale đều.
Bản 16px: bỏ khói + bóng, giữ thân nồi + vành kem dày + nước lẩu + 2 chấm topping.
"""
from PIL import Image, ImageDraw

master = Image.open('/tmp/lau-icon/lau-pixel-icon-1024.png').convert('RGBA')
BG_RED = (0xFF, 0x5A, 0x47, 255)


def simplified(size):
    """Vẽ lại icon tối giản trên grid logic nhỏ — chỉ giữ shape đọc được."""
    g = 16                      # grid logic 16x16
    im = Image.new('RGBA', (g, g), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    TÂN = (0xCC, 0x97, 0x68)    # thân nồi be
    TÂN_TỐI = (0x8E, 0x5F, 0x3D)
    VÀNH = (0xFD, 0xF4, 0xD9)   # kem
    NƯỚC = (0xB0, 0x3C, 0x24)   # đỏ nâu nước lẩu
    OUT = (0x29, 0x1E, 0x17)    # outline ấm
    XANH = (0x7F, 0xA8, 0x60)
    VÀNG = (0xE8, 0xC5, 0x47)

    # thân nồi (hình thang ngược) + outline
    d.rectangle([4, 6, 11, 12], fill=OUT)
    d.rectangle([5, 7, 10, 11], fill=TÂN)
    d.rectangle([9, 7, 10, 11], fill=TÂN_TỐI)
    # vành kem dày (2px — đọc được ở 16)
    d.rectangle([3, 5, 12, 6], fill=OUT)
    d.rectangle([4, 6, 11, 6], fill=VÀNH)
    # nước lẩu
    d.rectangle([5, 7, 10, 8], fill=NƯỚC)
    # 2 chấm topping mập
    d.point((6, 8), fill=XANH)
    d.point((9, 8), fill=VÀNG)
    # 2 quai núm
    d.rectangle([2, 8, 3, 9], fill=OUT)
    d.rectangle([12, 8, 13, 9], fill=OUT)

    out = Image.new('RGBA', (size, size), BG_RED)
    big = im.resize((int(size * 0.82), int(size * 0.82)), Image.NEAREST)
    ox = (size - big.size[0]) // 2
    oy = (size - big.size[1]) // 2
    out.alpha_composite(big, (ox, oy))
    return out


# --- xuất các cỡ ---
for s in [180, 96, 64, 32, 16]:
    if s <= 32:
        ic = simplified(s)          # bản vẽ lại riêng
    else:
        ic = master.resize((s, s), Image.LANCZOS)
    ic.convert('RGB').save(f'/tmp/lau-icon/lau-icon-{s}.png')
print('đã xuất 180/96/64 (downscale) + 32/16 (simplified vẽ lại)')

# --- contact sheet ---
sizes = [180, 96, 64, 32, 16]
W = 400 + sum(s + 30 for s in sizes) + 40
H = 480
sheet = Image.new('RGB', (W, H), (24, 26, 32))
m = master.resize((400, 400), Image.LANCZOS)
sheet.paste(m.convert('RGB'), (20, 30), m)
x = 440
for s in sizes:
    ic = Image.open(f'/tmp/lau-icon/lau-icon-{s}.png')
    sheet.paste(ic, (x, 30 + (400 - s) // 2))
    # nhãn cỡ
    d = ImageDraw.Draw(sheet)
    d.text((x, 30 + 400 // 2 + 210), f'{s}px', fill=(200, 200, 210))
    x += s + 30
sheet.save('/tmp/lau-icon/lau-icon-contact-sheet.png')
print('contact sheet:', sheet.size)

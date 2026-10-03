#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cắt sprite nồi lẩu → nền đỏ cam hồng, bản app icon đúng chuẩn.
Sửa theo pixel-scan đã verify:
 1) CROP sọc đen artifact mép trái (x=0..9 tối 100%) — đã xác nhận thật.
 2) Flood-fill nền theo KHOẢNG CÁCH MÀU tới #232633 (tol 18) — giữ được
    khói xám #8D939C, bóng đổ, và outline nồi ấm #291E17 (dist 29.7 > 18).
 3) Detect grid logic (run-length mode) → downscale NEAREST về grid → upscale
    NEAREST lên 1024: pixel sắc, không aliasing.
"""
from PIL import Image
import numpy as np
from collections import deque, Counter

SRC = '/tmp/lau_icon_ref_rgb.png'
BG = np.array([0x23, 0x26, 0x33], dtype=int)   # nền #232633 (58.1% ảnh)
TOL = 18                                       # dist tới BG; outline nồi dist 29.7 → an toàn
STRIPE_W = 10                                  # sọc artifact x=0..9

img = Image.open(SRC).convert('RGB')
a = np.array(img).astype(int)

# --- 1) crop sọc artifact ---
a = a[:, STRIPE_W:, :]
h, w, _ = a.shape
print(f'sau crop sọc: {w}x{h}')

# --- 2) flood fill nền từ biên ---
dist = np.sqrt(((a - BG) ** 2).sum(axis=2))
is_bg_color = dist <= TOL
mask = np.zeros((h, w), dtype=bool)
q = deque()
for x in range(w):
    for y in (0, h - 1):
        if is_bg_color[y, x] and not mask[y, x]:
            mask[y, x] = True; q.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if is_bg_color[y, x] and not mask[y, x]:
            mask[y, x] = True; q.append((x, y))
while q:
    x, y = q.popleft()
    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
        nx, ny = x+dx, y+dy
        if 0 <= nx < w and 0 <= ny < h and not mask[ny,nx] and is_bg_color[ny,nx]:
            mask[ny,nx] = True; q.append((nx,ny))

kept = (~mask).sum()
print(f'nền đã gỡ: {mask.sum()}px ({mask.sum()*100//(w*h)}%) | sprite giữ: {kept}px')

# --- dựng RGBA ---
rgba = np.dstack([a.astype(np.uint8), np.where(mask, 0, 255).astype(np.uint8)])
sprite = Image.fromarray(rgba, 'RGBA')

# --- 3) trim + detect grid logic ---
bbox = sprite.getbbox()
sprite = sprite.crop(bbox)
sw, sh = sprite.size
print(f'sprite trim: {sw}x{sh}')

# run-length mode theo hàng ngang vùng đặc (alpha=255) để suy ra ô pixel
arr = np.array(sprite)
alpha = arr[:, :, 3]
runs = []
for y in range(0, sh, 3):
    row = alpha[y]
    x = 0
    while x < sw:
        if row[x] == 255:
            x0 = x
            while x < sw and row[x] == 255:
                x += 1
            runs.append(x - x0)
        else:
            x += 1
if runs:
    cell = Counter(runs).most_common(1)[0][0]
    print(f'ô pixel logic (run-length mode): {cell}px → grid ~{sw//cell}x{sh//cell}')
else:
    cell = 4
    print('không đo được run-length, dùng mặc định cell=4')

# downscale về grid logic NEAREST, rồi upscale lại — khử anti-alias thừa
if cell > 1:
    gw, gh = max(1, sw // cell), max(1, sh // cell)
    logic = sprite.resize((gw, gh), Image.NEAREST)
    print(f'grid logic: {gw}x{gh}')
else:
    logic = sprite

# --- 4) đặt lên nền đỏ cam hồng #FF5A47 ---
S = 1024
BG_RED = (0xFF, 0x5A, 0x47)
canvas = Image.new('RGBA', (S, S), BG_RED + (255,))

# upscale logic lên ~78% canvas bằng NEAREST (sắc pixel)
target = int(S * 0.78)
lw, lh = logic.size
scale = target / max(lw, lh)
nw, nh = round(lw * scale), round(lh * scale)
big = logic.resize((nw, nh), Image.NEAREST)

ox = (S - nw) // 2
oy = (S - nh) // 2 - int(S * 0.015)   # nhích lên nhẹ vì bóng đổ ở đáy
canvas.alpha_composite(big, (ox, oy))

canvas.save('/tmp/lau-icon/lau-pixel-icon-1024.png')
# bản iOS RGB không alpha
ios = Image.new('RGB', (S, S), BG_RED)
ios.paste(canvas, (0, 0), canvas)
ios.save('/tmp/lau-icon/AppIcon-iOS-1024-pixel.png')
print('đã ghi: lau-pixel-icon-1024.png + AppIcon-iOS-1024-pixel.png')

# QA màu
cc = Counter(canvas.convert('RGB').getdata())
print(f'tổng màu ảnh cuối: {len(cc)}')
print('top 5:', [(f'#{r:02X}{g:02X}{b:02X}', f'{n*100//(S*S)}%') for (r,g,b),n in cc.most_common(5)])

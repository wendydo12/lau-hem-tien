#!/usr/bin/env python3
"""Composite 6 cảnh intro movie — Lẩu Hẻm Tiên (v2 — sửa theo QA:
bóng tiếp xúc dính chân, grade màu cutout theo ánh sáng cảnh,
nền cảnh 3+5 chi tiết + motivated light, dọn viền alpha sót)."""
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np, os, random

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 768, 1024
S = 6

def lerp(a, b, t):
    return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))

def clean_alpha(im, erode=1):
    """dọn viền alpha sót (vệt xanh QA thấy ở cảnh 2): erode alpha 1px rồi làm mềm lại"""
    a = np.array(im)
    alpha = a[:,:,3]
    for _ in range(erode):
        pad = np.pad(alpha, 1, mode='constant')
        mn = np.minimum.reduce([pad[:-2,1:-1], pad[2:,1:-1], pad[1:-1,:-2], pad[1:-1,2:], pad[1:-1,1:-1]])
        alpha = mn.astype(np.uint8)
    a[:,:,3] = alpha
    return Image.fromarray(a)

def grade(im, tint, amount=0.28, sat=1.0, bright=1.0):
    """grade màu cutout theo ánh sáng cảnh: tint=(r,g,b) 0-255, amount mức trộn.
    BUGFIX 25/09: tint phải chia 255 về hệ số 0-1 + clip — nếu không giá trị tràn
    vòng uint8 thành nhiễu cầu vồng đúng theo silhouette."""
    im = im.convert("RGBA")
    arr = np.array(im).astype(np.float32)
    m = arr[:,:,3:4] > 0
    for i in range(3):
        k = tint[i] / 255.0
        mixed = arr[:,:,i] * ((1-amount) + amount*k)
        arr[:,:,i] = np.where(m[:,:,0], np.clip(mixed, 0, 255), arr[:,:,i])
    out = Image.fromarray(arr.astype(np.uint8))
    out = ImageEnhance.Color(out).enhance(sat)
    out = ImageEnhance.Brightness(out).enhance(bright)
    return out

def paste_cutout(bg, cut_path, anchor_bottom=0.92, max_h_ratio=0.82, dx=0,
                 tint=(255,255,255), amount=0.0, sat=1.0, bright=1.0, erode=0):
    cut = Image.open(cut_path).convert("RGBA")
    bb = cut.getbbox()
    if bb: cut = cut.crop(bb)
    if erode: cut = clean_alpha(cut, erode)
    if amount > 0 or sat != 1.0 or bright != 1.0:
        cut = grade(cut, tint, amount, sat, bright)
    th = int(H*max_h_ratio)
    r = th/cut.height
    nw = int(cut.width*r)
    cut = cut.resize((nw, th), Image.NEAREST)
    x = (W-nw)//2 + dx
    y = int(H*anchor_bottom) - th
    # bóng tiếp xúc: tìm hàng thấp nhất có pixel opaque → đặt ellipse DÍNH vào đó
    a = np.array(cut)[:,:,3]
    rows = np.where(a.max(axis=1) > 40)[0]
    if len(rows):
        foot = rows[-1]
        cols = np.where(a[foot] > 40)[0]
        x0, x1 = cols.min(), cols.max()
        sh = Image.new("RGBA", (nw, th), (0,0,0,0))
        sd = ImageDraw.Draw(sh)
        cx = (x0+x1)//2; half = max(8, (x1-x0)//2)
        sd.ellipse([cx-half-6, foot-8, cx+half+6, foot+7], fill=(0,0,0,130))
        sh = sh.filter(ImageFilter.GaussianBlur(2.2))
        bg.paste(sh, (x, y), sh)
    bg.paste(cut, (x, y), cut)
    return bg

# ---------- nền ----------
def bg_office(seed=7, night=False, rain_window=False):
    gw, gh = W//S, H//S
    im = Image.new("RGB", (gw, gh)); d = ImageDraw.Draw(im)
    rnd = random.Random(seed)
    if night:
        wall_top, wall_bot, floor = (26,28,42), (20,21,33), (17,17,25)
    else:
        wall_top, wall_bot, floor = (222,214,196), (205,196,176), (168,150,126)
    horizon = int(gh*0.74)
    for y in range(gh):
        c = lerp(wall_top, wall_bot, min(y/horizon,1)) if y < horizon else lerp(floor, (floor[0]-16,floor[1]-16,floor[2]-12), (y-horizon)/(gh-horizon))
        d.line([(0,y),(gw,y)], fill=c)
    if not night:
        # gạch sàn có mạch
        for y in range(horizon, gh, 5):
            d.line([(0,y),(gw,y)], fill=(146,128,106))
            for x in range(0, gw, 10):
                d.point((x + (5 if (y//5)%2 else 0), y), fill=(152,134,112))
        # chân tường
        d.rectangle([0, horizon-2, gw, horizon], fill=(150,132,110))
    else:
        for y in range(horizon, gh, 7):
            d.line([(0,y),(gw,y)], fill=(13,13,20))
    # cửa sổ
    wx, wy, ww, wh = gw-44, 12, 36, 38
    d.rectangle([wx-1,wy-1,wx+ww,wy+wh], outline=(70,58,46) if not night else (44,38,56), width=2)
    sky = (126,158,196) if not night else (16,20,42)
    for y in range(wy+1, wy+wh-1):
        d.line([(wx+1,y),(wx+ww-2,y)], fill=sky)
    if rain_window:
        for i in range(70):
            x0 = rnd.randint(wx+2, wx+ww-5); y0 = rnd.randint(wy+2, wy+wh-9)
            for k in range(rnd.randint(3,6)):
                if x0+k < wx+ww-3 and y0+k < wy+wh-3: d.point((x0+k, y0+k), fill=(140,160,205))
        for i in range(16):
            x0 = rnd.randint(wx+3, wx+ww-5); y0 = rnd.randint(wy+wh-13, wy+wh-4)
            d.point((x0,y0), fill=rnd.choice([(240,200,110),(255,230,160),(190,215,255)]))
    elif not night:
        for i in range(5):
            x0=rnd.randint(wx+3,wx+ww-6); y0=rnd.randint(wy+3,wy+10)
            for k in range(6): d.point((x0+k,y0), fill=(240,244,250))
    # đèn trần sáng (ngày) / đèn bàn ấm (đêm)
    if not night:
        d.rectangle([gw//2-14, 0, gw//2+14, 3], fill=(245,245,235))
    else:
        cx, cy = 40, gh-60
        for r in range(12, 0, -2):
            d.ellipse([cx-r, cy-r//3, cx+r, cy+r//3], fill=lerp((60,45,25),(30,25,40), r/12))
    return im.resize((W,H), Image.NEAREST)

def bg_street_day(seed=13):
    gw, gh = W//S, H//S
    im = Image.new("RGB",(gw,gh)); d = ImageDraw.Draw(im)
    rnd = random.Random(seed)
    sky_top, sky_bot = (122,176,235), (196,220,242)
    horizon = int(gh*0.60)
    for y in range(horizon):
        d.line([(0,y),(gw,y)], fill=lerp(sky_top, sky_bot, y/horizon))
    for i in range(7):
        cx=rnd.randint(8,gw-8); cy=rnd.randint(5,horizon//3)
        for k in range(rnd.randint(10,18)): d.point((cx+rnd.randint(-5,5), cy+rnd.randint(-1,1)), fill=(248,250,252))
    # dãy phố VN: nhà ống hẹp nhiều màu, mái tôn, biển hiệu không chữ
    x = 0
    bcol = [(196,180,150),(172,150,132),(156,168,140),(186,164,142),(168,148,148),(190,178,156)]
    while x < gw:
        w_ = rnd.randint(9,15); h_ = rnd.randint(horizon//2+6, horizon)
        c = bcol[rnd.randint(0,5)]
        d.rectangle([x, horizon-h_, x+w_, horizon], fill=c)
        # mái
        d.rectangle([x-1, horizon-h_-1, x+w_+1, horizon-h_+1], fill=(120,96,84))
        # cửa sổ + ban công
        for wy in range(horizon-h_+4, horizon-3, 6):
            for wx in range(x+2, x+w_-1, 4):
                d.point((wx,wy), fill=(92,110,128))
                d.point((wx+1,wy), fill=(110,128,144))
        # biển hiệu màu (không chữ)
        if rnd.random() < 0.6:
            d.rectangle([x+1, horizon-h_+2, x+w_-1, horizon-h_+4], fill=rnd.choice([(200,80,60),(60,120,180),(220,170,60),(80,150,90)]))
        x += w_ + 1
    # vỉa hè có texture + hướng nắng
    for y in range(horizon, gh):
        base = lerp((172,164,152),(148,140,130),(y-horizon)/(gh-horizon))
        d.line([(0,y),(gw,y)], fill=base)
    for y in range(horizon, gh, 6):
        d.line([(0,y),(gw,y)], fill=(138,130,120))
        for xx in range(0, gw, 9):
            d.point((xx+(3 if (y//6)%2 else 0), y), fill=(158,150,140))
    # vệt nắng chéo (motivated light hướng trái-phải)
    for i in range(90):
        x0=rnd.randint(gw//3, gw); y0=rnd.randint(horizon+2, gh-2)
        d.point((x0,y0), fill=(196,188,170))
    # xe máy đậu + cây (chi tiết VN)
    d.rectangle([gw-30, horizon-8, gw-22, horizon-2], fill=(70,74,90)); d.rectangle([gw-31, horizon-3, gw-29, horizon], fill=(40,40,46)); d.rectangle([gw-23, horizon-3, gw-21, horizon], fill=(40,40,46))
    tx = 8
    d.rectangle([tx, horizon-24, tx+2, horizon], fill=(96,78,58))
    for k in range(26): d.point((tx-3+rnd.randint(0,8), horizon-30+rnd.randint(0,8)), fill=(74,124,66))
    im = im.resize((W,H), Image.NEAREST)
    return im

def bg_alley_lantern(seed=23):
    gw, gh = W//S, H//S
    im = Image.new("RGB",(gw,gh)); d = ImageDraw.Draw(im)
    rnd = random.Random(seed)
    horizon = int(gh*0.66)
    # trời hẻm hẹp — chỉ dải nhỏ trên cao
    for y in range(horizon//3):
        d.line([(0,y),(gw,y)], fill=lerp((12,14,38),(26,24,52), y/max(1,horizon//3)))
    for i in range(18):
        d.point((rnd.randint(gw//3,gw*2//3), rnd.randint(0,horizon//4)), fill=(200,205,240))
    # TƯỜNG HẸM 2 BÊN (đóng khung, không hở skyline)
    for side in (0,1):
        for i in range(4):
            if side==0: bx = i*11
            else: bx = gw - (i+1)*11
            w_ = 11; h_ = rnd.randint(horizon-16, horizon+4)
            c = (44,38,60) if side==0 else (38,33,54)
            d.rectangle([bx, horizon-h_, bx+w_, gh], fill=c)
            # gạch
            for by in range(horizon-h_, gh, 5):
                d.line([(bx,by),(bx+w_,by)], fill=lerp(c,(c[0]-8,c[1]-8,c[2]-6),0.5))
            # cửa sổ sáng
            for wy in range(horizon-h_+4, horizon, 8):
                for wx in range(bx+2, bx+w_-1, 4):
                    if rnd.random()<0.45:
                        d.point((wx,wy), fill=(240,196,110)); d.point((wx,wy+1), fill=(200,160,90))
    # đường dây điện vắt ngang + đèn lồng treo DỌC hẻm (nguồn sáng motivated)
    for yy in (14, 22):
        for x in range(gw):
            d.point((x, yy + int(3*abs(x-gw//2)/gw)), fill=(30,28,38))
    lanterns = [(24,20),(56,17),(88,21),(108,18)]
    for lx, ly in lanterns:
        d.line([(lx,12),(lx,ly-3)], fill=(40,36,44))
        d.ellipse([lx-3, ly-3, lx+3, ly+5], fill=(225,105,45))
        d.ellipse([lx-2, ly-1, lx+2, ly+3], fill=(255,175,90))
    # mặt đường ướt phản chiếu đèn lồng
    for y in range(horizon, gh):
        base = lerp((30,28,40),(22,21,30),(y-horizon)/(gh-horizon))
        d.line([(0,y),(gw,y)], fill=base)
    for lx, ly in lanterns:
        rx = lx*W//gw//S
        for k in range(26):
            y0 = horizon+2+k*2
            if y0 < gh:
                for w0 in range(-2,3):
                    d.point((rx+w0+rnd.randint(-1,1), y0), fill=(110,74,44) if k%2 else (86,58,36))
    # quầng sáng ấm tổng thể ở giữa (nơi xe lẩu sẽ đứng)
    im = im.resize((W,H), Image.LANCZOS)  # glow cần mượt ở bước blend, resize lại nearest sau
    im = im.resize((W//S, H//S), Image.NEAREST).resize((W,H), Image.NEAREST)
    glow = Image.new("RGB",(W,H),(0,0,0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W//2-220, H//2-140, W//2+220, H//2+260], fill=(74,48,22))
    glow = glow.filter(ImageFilter.GaussianBlur(40))
    im = Image.blend(im, Image.blend(im, glow, 0.5), 0.6)
    return im

def add_letterbox(im):
    d = ImageDraw.Draw(im)
    d.rectangle([0,0,W,26], fill=(8,6,12))
    d.rectangle([0,H-26,W,H], fill=(8,6,12))
    return im

def cover(im_path, bg_col=(16,14,22)):
    im = Image.open(im_path).convert("RGBA")
    r = max(W/im.width, H/im.height)
    imr = im.resize((int(im.width*r), int(im.height*r)), Image.LANCZOS)
    bg = Image.new("RGB",(W,H),bg_col)
    bg.paste(imr, ((W-imr.width)//2, (H-imr.height)//2), imr)
    return bg

BEST = {
    "s1": "s1_vanphong.png",
    "s2": "s2_stress_old.png",
    "s3": "s3_nghi_viec_old.png",
    "s4": "s4_phong_tro.png",
    "s5": "s5_dem_tien_old2.png",
    "s6": "s6_mo_quan.png",
}
P = lambda f: os.path.join(HERE, f)

def build():
    os.makedirs(P("final"), exist_ok=True)
    # 1 — văn phòng ngày: ánh sáng trung tính hơi ấm
    bg = bg_office(seed=7, night=False)
    bg = paste_cutout(bg, P(BEST["s1"]), anchor_bottom=0.90, max_h_ratio=0.76,
                      tint=(255,244,224), amount=0.22, sat=0.92, bright=1.04, erode=1)
    add_letterbox(bg).save(P("final/final_01.png"))

    # 2 — stress đêm mưa: grade LẠNH, dọn vệt mask xanh (erode 2)
    bg = bg_office(seed=19, night=True, rain_window=True)
    bg = paste_cutout(bg, P(BEST["s2"]), anchor_bottom=0.92, max_h_ratio=0.64,
                      tint=(150,170,230), amount=0.38, sat=0.75, bright=0.78, erode=2)
    add_letterbox(bg).save(P("final/final_02.png"))

    # 3 — phố ngày: nền chi tiết + grade NẮNG ẤM hướng phải, bóng dính đế giày
    bg = bg_street_day(seed=13)
    bg = paste_cutout(bg, P(BEST["s3"]), anchor_bottom=0.90, max_h_ratio=0.74, dx=-40,
                      tint=(255,236,200), amount=0.30, sat=1.0, bright=1.06, erode=1)
    add_letterbox(bg).save(P("final/final_03.png"))

    # 4 — phòng trọ (meowa đủ nền): cover + letterbox
    bg = cover(P(BEST["s4"]), (16,14,22))
    add_letterbox(bg).save(P("final/final_04.png"))

    # 5 — hẻm đêm đèn lồng: nền ĐÓNG (tường 2 bên) + đèn lồng = nguồn sáng;
    # grade cutout ẤM theo đèn, erode dọn ghế treo
    bg = bg_alley_lantern(seed=23)
    bg = paste_cutout(bg, P(BEST["s5"]), anchor_bottom=0.90, max_h_ratio=0.68, dx=16,
                      tint=(255,190,120), amount=0.34, sat=0.92, bright=0.92, erode=1)
    add_letterbox(bg).save(P("final/final_05.png"))

    # 6 — mở quán (meowa 92%): cover + letterbox
    bg = cover(P(BEST["s6"]), (12,10,20))
    add_letterbox(bg).save(P("final/final_06.png"))
    print("built:", sorted(os.listdir(P("final"))))

if __name__ == "__main__":
    build()

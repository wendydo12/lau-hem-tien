#!/usr/bin/env python3
"""compose_v2.py — 6 nền intro ĐỒNG BỘ (meowa fragments + nền đặc PIL).

Bài học v1+v2 (25/09): template meowa perfect-pixel LUÔN cắt nền nội thất thành
mảnh nổi trong suốt (kể cả remove_bg_method=none) → cảnh đêm mưa "trôi nổi AI".
Giải pháp: nền đặc (tường/sàn/cửa sổ/mưa) vẽ PIL đúng phối cảnh + ánh sáng,
dán fragment meowa (bàn/ghế/monitor/props) đã được grade màu theo ánh sáng cảnh,
bóng tiếp xúc ellipse. Cảnh ngoài trời (3/5/6) meowa ra đặc → chỉ fill phần
trong suốt còn lại bằng nền trời/đường vẽ PIL cho liền mạch.

Output: final_01..06.png (768x1024, letterbox) — nhân vật NGƯỜI CHƠI do game
ghép lúc chạy (intro.js composeScene), nên 3 cảnh 1/2/4 KHÔNG đốt người vào ảnh.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np, os, random

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 768, 1024
P = lambda *p: os.path.join(HERE, *p)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * max(0, min(1, t))) for i in range(3))

def clean_alpha(im, erode=1):
    a = np.array(im.convert("RGBA"))
    alpha = a[:, :, 3]
    for _ in range(erode):
        pad = np.pad(alpha, 1, mode='constant')
        mn = np.minimum.reduce([pad[:-2, 1:-1], pad[2:, 1:-1], pad[1:-1, :-2], pad[1:-1, 2:], pad[1:-1, 1:-1]])
        alpha = mn.astype(np.uint8)
    a[:, :, 3] = alpha
    return Image.fromarray(a)

def grade(im, tint, amount=0.28, sat=1.0, bright=1.0):
    im = im.convert("RGBA")
    arr = np.array(im).astype(np.float32)
    m = arr[:, :, 3:4] > 0
    for i in range(3):
        k = tint[i] / 255.0
        mixed = arr[:, :, i] * ((1 - amount) + amount * k)
        arr[:, :, i] = np.where(m[:, :, 0], np.clip(mixed, 0, 255), arr[:, :, i])
    out = Image.fromarray(arr.astype(np.uint8))
    out = ImageEnhance.Color(out).enhance(sat)
    out = ImageEnhance.Brightness(out).enhance(bright)
    return out

def clean_islands(im, min_cluster=60, keep_largest_only=False):
    """xóa mảnh vụn rời rạc (connected components nhỏ);
    keep_largest_only=True → chỉ giữ component LỚN NHẤT (chống mảnh giấy/cánh tay rơi rớt)"""
    from collections import deque
    im = im.convert("RGBA")
    a = np.array(im)
    al = a[:, :, 3]
    seen = np.zeros_like(al, dtype=bool)
    H_, W_ = al.shape
    comps = []
    for sy in range(H_):
        for sx in range(W_):
            if al[sy, sx] <= 40 or seen[sy, sx]:
                continue
            q = deque([(sy, sx)]); seen[sy, sx] = True; comp = []
            while q:
                y, x = q.popleft(); comp.append((y, x))
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny, nx = y+dy, x+dx
                    if 0 <= ny < H_ and 0 <= nx < W_ and not seen[ny, nx] and al[ny, nx] > 40:
                        seen[ny, nx] = True; q.append((ny, nx))
            comps.append(comp)
    if not comps: return im
    keep = None
    kset = set()
    if keep_largest_only:
        keep = max(comps, key=len)
        kset = set(keep)
    for comp in comps:
        if (len(comp) < min_cluster) or (keep is not None and comp[0] not in kset):
            for (y, x) in comp:
                al[y, x] = 0
    a[:, :, 3] = al
    return Image.fromarray(a)

def crop_content(im, pad=2, min_cluster=60, largest_only=False):
    """crop theo bbox content sau khi dọn mảnh vụn"""
    im = clean_islands(im, min_cluster, largest_only)
    al = np.array(im)[:, :, 3]
    ys, xs = np.where(al > 40)
    if not len(ys): return im
    x0, x1, y0, y1 = max(0, xs.min()-pad), min(im.width, xs.max()+pad), max(0, ys.min()-pad), min(im.height, ys.max()+pad)
    return im.crop((x0, y0, x1, y1))

def paste_on(bg, frag, cx_frac, feet_y_frac, h_ratio, tint=(255,255,255), amount=0.0,
             sat=1.0, bright=1.0, erode=1, shadow=True):
    """dán fragment theo tâm ngang + đường chân + chiều cao mong muốn (tỉ lệ khung)"""
    frag = crop_content(frag)
    if erode: frag = clean_alpha(frag, erode)
    if amount > 0 or sat != 1.0 or bright != 1.0:
        frag = grade(frag, tint, amount, sat, bright)
    th = int(H * h_ratio)
    r = th / frag.height
    nw = int(frag.width * r)
    frag = frag.resize((nw, th), Image.NEAREST)
    x = int(W * cx_frac) - nw // 2
    y = int(H * feet_y_frac) - th
    if shadow:
        a = np.array(frag)[:, :, 3]
        rows = np.where(a.max(axis=1) > 40)[0]
        if len(rows):
            foot = rows[-1]
            cols = np.where(a[foot] > 40)[0]
            sh = Image.new("RGBA", (nw, th), (0, 0, 0, 0))
            sd = ImageDraw.Draw(sh)
            cxs = (cols.min() + cols.max()) // 2
            half = max(10, (cols.max() - cols.min()) // 2)
            sd.ellipse([cxs-half-8, foot-10, cxs+half+8, foot+8], fill=(0, 0, 0, 120))
            sh = sh.filter(ImageFilter.GaussianBlur(3))
            bg.paste(sh, (x, y), sh)
    bg.paste(frag, (x, y), frag)
    return bg

def letterbox(im):
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 26], fill=(8, 6, 12))
    d.rectangle([0, H-26, W, H], fill=(8, 6, 12))
    return im

def vignette(im, strength=0.25):
    v = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(v)
    d.ellipse([-W*0.25, -H*0.15, W*1.25, H*1.15], fill=255)
    v = v.filter(ImageFilter.GaussianBlur(120))
    black = Image.new("RGB", (W, H), (0, 0, 0))
    return Image.composite(im, black, v.point(lambda p: int(255 - (255-p)*strength)))

# ================= NỀN PIL =================
def bg_office_day():
    """văn phòng ngày: tường kem, trần đèn huỳnh quang, cửa sổ phải, vách cubicle, thảm xám"""
    im = Image.new("RGB", (W, H), (210, 202, 184)); d = ImageDraw.Draw(im)
    rnd = random.Random(11)
    horizon = int(H * 0.72)   # đường chân tường
    # tường gradient nhẹ
    for y in range(horizon):
        d.line([(0, y), (W, y)], fill=lerp((224, 217, 200), (204, 196, 178), y/horizon))
    # trần + đèn huỳnh quang
    d.rectangle([0, 0, W, 54], fill=(235, 233, 226))
    d.line([(0, 54), (W, 54)], fill=(170, 164, 150), width=3)
    for lx in (120, 400, 640):
        d.rectangle([lx, 8, lx+140, 34], fill=(250, 250, 242))
        d.rectangle([lx+6, 14, lx+134, 28], fill=(255, 255, 250))
    # chân tường + thảm
    d.rectangle([0, horizon-8, W, horizon], fill=(150, 136, 116))
    for y in range(horizon, H):
        d.line([(0, y), (W, y)], fill=lerp((158, 152, 146), (132, 126, 122), (y-horizon)/(H-horizon)))
    for i in range(2400):  # sợi thảm
        x, y = rnd.randint(0, W), rnd.randint(horizon, H)
        d.point((x, y), fill=(146, 140, 134) if rnd.random() < .5 else (166, 160, 152))
    # cửa sổ lớn bên phải: trời trưa + skyline + cọ
    wx, wy, ww, wh = 470, 90, 250, 300
    d.rectangle([wx-8, wy-8, wx+ww+8, wy+wh+8], fill=(120, 112, 100))
    for y in range(wy, wy+wh):
        d.line([(wx, y), (wx+ww, y)], fill=lerp((136, 178, 220), (190, 214, 236), (y-wy)/wh))
    for b in range(6):  # tòa xa
        bx = wx + 10 + b*40 + rnd.randint(-6, 6); bw = rnd.randint(22, 34); bh = rnd.randint(60, 160)
        d.rectangle([bx, wy+wh-bh, bx+bw, wy+wh], fill=(150, 160, 174))
        for yy in range(wy+wh-bh+6, wy+wh-4, 10):
            for xx in range(bx+4, bx+bw-4, 8):
                d.rectangle([xx, yy, xx+3, yy+4], fill=(176, 188, 200))
    d.line([(wx+ww//2, wy), (wx+ww//2, wy+wh)], fill=(120, 112, 100), width=6)
    # mây
    for c in range(4):
        cx, cy = wx+rnd.randint(20, ww-40), wy+rnd.randint(10, 70)
        for k in range(14): d.ellipse([cx-18+rnd.randint(-6, 6), cy-6+rnd.randint(-3, 3), cx+18+rnd.randint(-6, 6), cy+8], fill=(246, 248, 250))
    # vách cubicle giữa-trái
    for cx in (60, 250):
        d.rectangle([cx, horizon-200, cx+170, horizon], fill=(168, 164, 158))
        d.rectangle([cx, horizon-200, cx+170, horizon-190], fill=(140, 136, 130))
        d.rectangle([cx+6, horizon-196, cx+164, horizon-120], fill=(178, 174, 166))
    return im

def bg_office_night():
    """văn phòng đêm mưa: tường xanh thẫm NHÌN RÕ, cửa sổ trái mưa xéo + đèn thành phố, monitor hắt xanh"""
    im = Image.new("RGB", (W, H), (40, 46, 68)); d = ImageDraw.Draw(im)
    rnd = random.Random(29)
    horizon = int(H * 0.72)
    for y in range(horizon):
        d.line([(0, y), (W, y)], fill=lerp((48, 54, 80), (34, 39, 60), y/horizon))
    d.rectangle([0, 0, W, 54], fill=(26, 30, 46))
    d.rectangle([0, horizon-10, W, horizon], fill=(22, 25, 38))
    for y in range(horizon, H):
        d.line([(0, y), (W, y)], fill=lerp((30, 34, 52), (18, 20, 32), (y-horizon)/(H-horizon)))
    for i in range(900):  # vân thảm đêm
        x, y = rnd.randint(0, W), rnd.randint(horizon, H)
        d.point((x, y), fill=(38, 42, 62))
    # cửa sổ lớn bên TRÁI: đêm mưa
    wx, wy, ww, wh = 46, 84, 300, 360
    d.rectangle([wx-10, wy-10, wx+ww+10, wy+wh+10], fill=(56, 58, 76))
    for y in range(wy, wy+wh):
        d.line([(wx, y), (wx+ww, y)], fill=lerp((14, 20, 40), (22, 28, 50), (y-wy)/wh))
    # đèn thành phố mờ qua mưa
    for i in range(70):
        x, y = wx+rnd.randint(6, ww-6), wy+rnd.randint(wh//2, wh-8)
        col = rnd.choice([(240, 200, 110), (255, 170, 90), (150, 190, 255), (255, 230, 160)])
        for k in range(rnd.randint(2, 4)):
            d.point((x+rnd.randint(-1, 1), y+k), fill=col)
    for b in range(5):  # bóng tòa nhà
        bx = wx+8+b*60; bw = rnd.randint(30, 50); bh = rnd.randint(90, 200)
        d.rectangle([bx, wy+wh-bh, bx+bw, wy+wh], fill=(10, 13, 26))
    # mưa xéo trên kính
    for i in range(140):
        x0, y0 = wx+rnd.randint(4, ww-14), wy+rnd.randint(4, wh-14)
        for k in range(rnd.randint(4, 9)):
            if x0+k < wx+ww-4 and y0+k < wy+wh-4:
                d.point((x0+k, y0+k), fill=(120, 140, 190))
    d.line([(wx+ww//2, wy), (wx+ww//2, wy+wh)], fill=(56, 58, 76), width=8)
    # quầng monitor xanh giữa-phải (nguồn sáng chính của cảnh) + vệt sáng trên sàn
    glow = Image.new("RGB", (W, H), (0, 0, 0)); gd = ImageDraw.Draw(glow)
    gd.ellipse([W//2-260, H-620, W//2+340, H-180], fill=(46, 66, 120))
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    im = Image.blend(im, Image.blend(im, glow, 0.8), 0.85)
    d = ImageDraw.Draw(im)
    floor_pool = Image.new("RGB", (W, H), (0, 0, 0)); fd = ImageDraw.Draw(floor_pool)
    fd.ellipse([W//2-200, horizon+40, W//2+320, H+60], fill=(36, 50, 88))
    floor_pool = floor_pool.filter(ImageFilter.GaussianBlur(50))
    im = Image.composite(Image.blend(im, floor_pool, 0.5), im, floor_pool.convert("L"))
    d = ImageDraw.Draw(im)
    # vách cubicle đêm — có cạnh sáng rõ
    for cx in (430, 620):
        d.rectangle([cx, horizon-210, cx+150, horizon], fill=(42, 47, 70))
        d.rectangle([cx, horizon-210, cx+150, horizon-202], fill=(58, 64, 92))
        d.rectangle([cx+8, horizon-196, cx+142, horizon-140], fill=(36, 41, 62))
    return im

def bg_alley_plain():
    """hẻm đêm ĐƠN GIẢN (tường 2 bên + trời + đường ướt) làm nền cho cảnh 6 —
    quán meowa sẽ dán lên giữa; ánh đèn vàng hắt từ quán do vignette+warm pool xử lý"""
    im = Image.new("RGB", (W, H), (16, 15, 26)); d = ImageDraw.Draw(im)
    rnd = random.Random(77)
    horizon = int(H * 0.62)
    # trời hẻm hẹp
    for y in range(horizon // 3):
        d.line([(0, y), (W, y)], fill=lerp((10, 12, 30), (22, 20, 44), y / max(1, horizon // 3)))
    for i in range(16):
        d.point((rnd.randint(W//3, W*2//3), rnd.randint(0, horizon//4)), fill=(190, 195, 230))
    # tường hẻm 2 bên đóng khung
    for side in (0, 1):
        for i in range(3):
            bx = i * 90 if side == 0 else W - (i + 1) * 90
            w_ = 90; h_ = rnd.randint(horizon - 140, horizon + 30)
            c = (40, 35, 56) if side == 0 else (34, 30, 50)
            d.rectangle([bx, horizon - h_, bx + w_, H], fill=c)
            for by in range(horizon - h_, H, 14):
                d.line([(bx, by), (bx + w_, by)], fill=lerp(c, (c[0]-8, c[1]-8, c[2]-6), 0.5))
            for wy in range(horizon - h_ + 30, horizon, 70):
                for wx in range(bx + 14, bx + w_ - 20, 46):
                    if rnd.random() < 0.5:
                        d.rectangle([wx, wy, wx+26, wy+36], fill=(240, 196, 110))
                        d.rectangle([wx, wy, wx+26, wy+36], outline=(30, 26, 40), width=3)
    # dây điện vắt ngang
    for yy in (120, 190):
        for x in range(W):
            d.point((x, yy + int(26 * abs(x - W//2) / W)), fill=(26, 24, 34))
    # đường ướt + quầng sáng ấm giữa (chỗ quán đứng)
    for y in range(horizon, H):
        d.line([(0, y), (W, y)], fill=lerp((28, 26, 38), (20, 19, 28), (y - horizon) / (H - horizon)))
    glow = Image.new("RGB", (W, H), (0, 0, 0)); gd = ImageDraw.Draw(glow)
    gd.ellipse([W//2 - 300, horizon - 200, W//2 + 300, H], fill=(86, 58, 26))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    im = Image.blend(im, Image.blend(im, glow, 0.55), 0.7)
    return im

def bg_room_night():
    """phòng trọ đêm: tường ố, bóng đèn tròn treo, sàn gạch tàu, ổ cắm, vết ẩm"""
    im = Image.new("RGB", (W, H), (58, 46, 36)); d = ImageDraw.Draw(im)
    rnd = random.Random(47)
    horizon = int(H * 0.66)
    for y in range(horizon):
        d.line([(0, y), (W, y)], fill=lerp((84, 70, 54), (62, 50, 40), y/horizon))
    # vết ố tường
    for i in range(26):
        cx, cy = rnd.randint(0, W), rnd.randint(20, horizon)
        for k in range(rnd.randint(30, 90)):
            d.point((cx+rnd.randint(-14, 14), cy+rnd.randint(-10, 10)), fill=(72, 58, 44))
    # gạch sàn
    for y in range(horizon, H):
        d.line([(0, y), (W, y)], fill=lerp((120, 76, 58), (86, 54, 42), (y-horizon)/(H-horizon)))
    for y in range(horizon, H, 46):
        d.line([(0, y), (W, y)], fill=(70, 46, 34), width=2)
        off = ((y - horizon)//46) % 2 * 58
        for x in range(off, W, 116):
            d.line([(x, y), (x, min(y+46, H))], fill=(70, 46, 34), width=2)
    # chân tường
    d.rectangle([0, horizon-10, W, horizon], fill=(48, 38, 30))
    # bóng đèn tròn + dây + quầng sáng ấm
    d.line([(W//2, 0), (W//2, 96)], fill=(30, 26, 22), width=3)
    d.ellipse([W//2-14, 96, W//2+14, 130], fill=(255, 214, 130))
    d.ellipse([W//2-8, 102, W//2+8, 122], fill=(255, 240, 190))
    glow = Image.new("RGB", (W, H), (0, 0, 0)); gd = ImageDraw.Draw(glow)
    gd.ellipse([W//2-320, -140, W//2+320, 620], fill=(96, 66, 28))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    im = Image.blend(im, Image.blend(im, glow, 0.55), 0.75)
    d = ImageDraw.Draw(im)
    # poster dán tường (blank, hơi quăn góc)
    d.rectangle([90, 150, 210, 300], fill=(222, 210, 180))
    d.rectangle([90, 150, 210, 300], outline=(180, 166, 136), width=3)
    d.rectangle([560, 170, 680, 290], fill=(206, 196, 170))
    d.rectangle([560, 170, 680, 290], outline=(170, 156, 128), width=3)
    # ổ điện + công tắc
    d.rectangle([300, 300, 322, 330], fill=(224, 218, 204)); d.rectangle([306, 308, 316, 318], fill=(90, 86, 78))
    return im

def fill_outdoor(f, sky_top, sky_bot, ground):
    """cảnh ngoài trời meowa (3/5/6): fill phần trong suốt bằng trời/đường đặc"""
    im = Image.open(P(f)).convert("RGBA")
    a = np.array(im)
    base = Image.new("RGB", im.size, ground)
    d = ImageDraw.Draw(base)
    # trời phía trên content, đất phía dưới
    ys = np.where(a[:, :, 3] > 40)[0]
    if len(ys):
        mid = (ys.min() + ys.max()) // 2
        for y in range(im.height):
            col = lerp(sky_top, sky_bot, y/mid) if y < mid else lerp(sky_bot, ground, min(1, (y-mid)/max(1, im.height-mid)))
            d.line([(0, y), (im.width, y)], fill=col)
    out = base.convert("RGBA")
    out.alpha_composite(im)
    return out.convert("RGB")

def cover_to_canvas(im, bg_col=(10, 8, 14)):
    r = max(W/im.width, H/im.height)
    imr = im.resize((int(im.width*r), int(im.height*r)), Image.LANCZOS)
    bg = Image.new("RGB", (W, H), bg_col)
    bg.paste(imr, ((W-imr.width)//2, (H-imr.height)//2))
    return bg

def crop_cover(path, bg_col=(14, 12, 22)):
    """ảnh meowa ngoài trời: crop đúng bbox content ĐẶC (bỏ margin trong suốt),
    fill phần trong suốt còn sót bằng nền trời/đất, upscale sắc, cover full khung."""
    im = Image.open(path).convert("RGBA")
    a = np.array(im); al = a[:, :, 3]
    ys, xs = np.where(al > 40)
    im = im.crop((xs.min(), ys.min(), xs.max()+1, ys.max()+1))   # crop content
    filled = fill_outdoor_from_img(im)                             # fill trong suốt còn lại
    filled = upscale_sharp(filled)                                 # NEAREST giữ pixel
    return cover_to_canvas(filled, bg_col)

def fill_outdoor_from_img(im):
    """fill phần alpha==0 của ảnh đã crop bằng gradient trời→đất đặc"""
    im = im.convert("RGBA")
    a = np.array(im); al = a[:, :, 3]
    ys = np.where((al > 40).any(axis=1))[0]
    mid = (ys.min() + ys.max()) // 2 if len(ys) else im.height // 2
    base = Image.new("RGB", im.size, (20, 22, 34))
    d = ImageDraw.Draw(base)
    for y in range(im.height):
        col = lerp((12, 14, 34), (22, 24, 44), y/mid) if y < mid else lerp((22, 24, 44), (30, 28, 40), min(1, (y-mid)/max(1, im.height-mid)))
        d.line([(0, y), (im.width, y)], fill=col)
    out = base.convert("RGBA")
    out.alpha_composite(im)
    return out.convert("RGB")

def upscale_sharp(im, target_w=W):
    r = target_w / im.width
    return im.resize((int(im.width*r), int(im.height*r)), Image.NEAREST)

def build():
    os.makedirs(P("v2"), exist_ok=True)
    FR = P("v2")   # fragments meowa gốc nằm trong v2/ (bgX_*.png tải về)

    # ---- CẢNH 1: văn phòng ngày + boss (dán boss+cây đã dọn mảnh vụn, giữ cluster lớn) ----
    bg = bg_office_day()
    frag = clean_islands(Image.open(P(FR, "bg1_office_day.png")), min_cluster=25, keep_largest_only=False)
    # chỉ giữ 2 cluster to nhất (boss+bàn, cây) — vứt mảnh giấy/tay rơi
    a = np.array(frag); al = a[:, :, 3]
    from collections import deque
    seen = np.zeros_like(al, bool); comps = []
    H_, W_ = al.shape
    for sy in range(H_):
        for sx in range(W_):
            if al[sy, sx] <= 40 or seen[sy, sx]: continue
            q = deque([(sy, sx)]); seen[sy, sx] = True; c = []
            while q:
                y, x = q.popleft(); c.append((y, x))
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny, nx = y+dy, x+dx
                    if 0 <= ny < H_ and 0 <= nx < W_ and not seen[ny, nx] and al[ny, nx] > 40:
                        seen[ny, nx] = True; q.append((ny, nx))
            comps.append(c)
    comps.sort(key=len, reverse=True)
    keep = comps[:2]   # boss+desk cluster và cây
    wipe = al.copy()
    for c in comps[2:]:
        for (y, x) in c: wipe[y, x] = 0
    for c in keep:
        pass
    a[:, :, 3] = wipe
    frag = Image.fromarray(a)
    paste_on(bg, frag, cx_frac=0.58, feet_y_frac=0.965, h_ratio=0.56,
             tint=(255, 244, 224), amount=0.18, sat=0.95, bright=1.03, erode=1)
    bg = vignette(bg, 0.18)
    letterbox(bg).save(P("v2", "final_01.png"))

    # ---- CẢNH 2: đêm mưa — nền ĐẶC có tường+sàn (không dán bàn meowa:
    # pose "desk" của nhân vật người chơi đã kèm bàn, ghép lúc chạy tránh trùng) ----
    bg = bg_office_night()
    bg = vignette(bg, 0.3)
    letterbox(bg).save(P("v2", "final_02.png"))

    # ---- CẢNH 3: phố Bitexco (meowa đặc → cover) ----
    bg3 = fill_outdoor(P(FR, "bg3_bitexco_street.png"), (122, 176, 235), (196, 216, 238), (150, 146, 140))
    bg3 = upscale_sharp(bg3)
    bg3 = cover_to_canvas(bg3, (150, 160, 170))
    bg3 = vignette(bg3, 0.14)
    letterbox(bg3).save(P("v2", "final_03.png"))

    # ---- CẢNH 4: phòng trọ đêm — nền đặc + props meowa (grade ấm) ----
    bg = bg_room_night()
    frag = clean_islands(Image.open(P(FR, "bg4_tro_dem.png")), min_cluster=40)
    paste_on(bg, frag, cx_frac=0.5, feet_y_frac=1.0, h_ratio=0.5,
             tint=(255, 200, 130), amount=0.30, sat=0.92, bright=0.94, erode=1, shadow=False)
    bg = vignette(bg, 0.3)
    letterbox(bg).save(P("v2", "final_04.png"))

    # ---- CẢNH 5: hẻm đêm xe lẩu — crop đúng bbox content rồi cover full-bleed
    # (tránh viền đen do margin trong suốt của ảnh meowa) ----
    bg5 = crop_cover(P(FR, "bg5_hem_dem_xe_lau.png"), (14, 12, 22))
    bg5 = vignette(bg5, 0.2)
    letterbox(bg5).save(P("v2", "final_05.png"))

    # ---- CẢNH 6: quán sáng đèn — meowa + NỀN HẺM ĐÊM PIL (tường+sường+đường) phía sau,
    # để quán không trôi trên void đen; ánh sáng vàng hắt ra từ quán ----
    frag6 = clean_islands(Image.open(P(FR, "bg6_quan_sang_den.png")), min_cluster=80)
    bg6 = bg_alley_plain()
    paste_on(bg6, frag6, cx_frac=0.5, feet_y_frac=1.0, h_ratio=0.92,
             tint=(255, 200, 130), amount=0.16, sat=0.98, bright=1.02, erode=1, shadow=False)
    bg6 = vignette(bg6, 0.2)
    letterbox(bg6).save(P("v2", "final_06.png"))
    print("built:", sorted(os.listdir(P("v2"))))

if __name__ == "__main__":
    build()

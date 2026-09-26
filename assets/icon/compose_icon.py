#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
App icon "Lẩu Hẻm Tiên" v2 — pixel art 64x64 -> 1024 (NEAREST).
Fix theo QA v1: quai dính thân, khói ấm bám nguồn, bỏ đế đen -> bếp than
nâu ấm, nền hẻm đêm có glow + lồng đèn, outline 1px, nồi cù lao dáng
donut (vành loe rộng, lòng nông), than hồng trong ống (đúng nguyên lý
cù lao — không lửa dưới đáy), rim-light ấm hắt lên đáy nồi.
"""
import math, os
from PIL import Image, ImageDraw

W = H = 64
img = Image.new("RGBA", (W, H))
px = img.load()
d = ImageDraw.Draw(img)

def C(r,g,b,a=255): return (r,g,b,a)
def blend(x,y,col,a):
    a = max(0.0, min(1.0, a/255.0))
    if not (0 <= x < W and 0 <= y < H): return
    r0,g0,b0,_ = px[x,y]
    r,g,b = col[:3]
    px[x,y] = (int(r0*(1-a)+r*a), int(g0*(1-a)+g*a), int(b0*(1-a)+b*a), 255)

OUT = (24,11,7,255)            # outline sẫm ấm (không đen thuần)
COP_BASE=(184,99,46); COP_DARK=(140,67,24); COP_LIGHT=(217,138,74)
COP_SPEC=(238,178,116); COP_RIM=(226,150,86)
STOVE=(58,30,18); STOVE_D=(40,20,12); EMBER=(255,110,40); EMBER_Y=(255,200,90)
SMOKE_HI=(240,232,222); SMOKE_MID=(214,200,188); SMOKE_LO=(186,170,158)

# ---------- 1) nền đêm hẻm + glow ấm ----------
top=(26,14,12); bot=(48,23,17)
for y in range(H):
    t=y/(H-1)
    for x in range(W):
        px[x,y]=(int(top[0]+(bot[0]-top[0])*t), int(top[1]+(bot[1]-top[1])*t),
                 int(top[2]+(bot[2]-top[2])*t), 255)
# vignette
for y in range(H):
    for x in range(W):
        dx=(x-31.5)/31.5; dy=(y-31.5)/31.5
        v=math.sqrt(dx*dx+dy*dy)
        if v>0.72:
            k=min(1.0,(v-0.72)/0.8)*0.40
            r,g,b,_=px[x,y]; px[x,y]=(int(r*(1-k)),int(g*(1-k)),int(b*(1-k)),255)
# glow hổ phách sau nồi
for y in range(H):
    for x in range(W):
        dx=(x-32)/17.0; dy=(y-40)/14.0
        g=math.exp(-(dx*dx+dy*dy))
        if g>0.02: blend(x,y,(255,128,52), g*88)

# ---------- 2) dây đèn lồng góc trên ----------
def lantern(cx, cy, body, dark):
    d.line((cx-3,cy-4,cx+3,cy-4), fill=dark, width=1)       # mũ
    d.ellipse((cx-3,cy-3,cx+3,cy+3), fill=body, outline=dark)
    px[cx,cy-1]=(255,224,150,255); px[cx,cy]=(255,240,190,255)  # ruột sáng
    d.line((cx,cy+4,cx,cy+5), fill=dark, width=1)           # tua
for y in range(0,7):   # dây võng
    xw = 4+int(y*0.9)
    if xw < W: blend(xw,y,(90,60,44),160)
    xw2 = 59-int(y*0.9)
    if 0 <= xw2: blend(xw2,y,(90,60,44),160)
lantern(8, 9, (200,60,40,255), OUT)     # lồng đèn đỏ trái
lantern(55, 9, (226,140,40,255), OUT)   # lồng đèn vàng phải
# glow quanh đèn
for (lx,ly,lc) in [(8,9,(255,90,60)),(55,9,(255,170,60))]:
    for y in range(ly-6,ly+7):
        for x in range(lx-6,lx+7):
            g=math.exp(-(((x-lx)/5.0)**2+((y-ly)/5.0)**2))
            if g>0.05: blend(x,y,lc,g*70)

# ---------- 3) bếp than (thay đế đen) ----------
d.rounded_rectangle((14,53,50,61), radius=2, fill=STOVE+(255,), outline=STOVE_D+(255,))
for x in range(16,49):   # mặt bếp sáng nhẹ
    blend(x,53,(120,66,36),90)
# khe gió + than hồng
for kx in (19, 24, 29, 34, 39, 44):
    for y in (56,57):
        px[kx,y]=(30,14,8,255); px[kx+1,y]=(30,14,8,255)
    px[kx,56]=EMBER; px[kx+1,57]=EMBER_Y
# glow than hắt xuống đất
for y in range(54,64):
    for x in range(16,49):
        g=math.exp(-(((x-32)/16.0)**2+((y-58)/4.0)**2))
        if g>0.05: blend(x,y,(255,120,44), g*48)

# ---------- 4) thân nồi cù lao (dáng donut: vành loe, lòng nông) ----------
# thân: y 33..52, hông phình nhẹ
for y in range(33,53):
    k=y-33
    bulge = int(2.6*math.sin(math.pi*min(1.0,k/16.0)))  # phình giữa
    x0=13-bulge//2; x1=51+bulge//2
    if y>=50:
        e=y-49; x0+=e; x1-=e
    for x in range(x0,x1+1):
        c=COP_BASE
        if x>=x1-6: c=COP_DARK
        elif x<=x0+4: c=COP_LIGHT
        elif x==x0+1 or x==x0+2: c=COP_SPEC
        # rim-light lửa hắt đáy nồi (2 hàng cuối)
        if y>=51: c=(min(255,c[0]+34), min(255,c[1]+16), c[2])
        px[x,y]=c+(255,)
# outline quanh thân
for y in range(33,53):
    k=y-33
    bulge = int(2.6*math.sin(math.pi*min(1.0,k/16.0)))
    x0=13-bulge//2; x1=51+bulge//2
    if y>=50:
        e=y-49; x0+=e; x1-=e
    for (ox,oy) in [(x0-1,y),(x1+1,y)]:
        if 0<=ox<W: px[ox,oy]=OUT
for x in range(15,50): px[x,52]=OUT
for x in range(16,49):   # rim-light mép trên bếp — vẽ SAU outline nồi
    blend(x,53,(206,116,52),150)

# ---------- 5) quai nồi DÍNH thân ----------
def body_x0(y):
    k=y-33
    bulge=int(2.6*math.sin(math.pi*min(1.0,k/16.0)))
    x0=13-bulge//2; x1=51+bulge//2
    if y>=50:
        e=y-49; x0+=e; x1-=e
    return x0,x1
for side in (-1,1):
    cx = 32 + side*20
    for a in range(-58,59,1):   # vòng cung hở về phía thân
        t=math.radians(a)
        x=int(cx+side*4.6*math.cos(t)); y=int(41+5.2*math.sin(t))
        if 0<=x<W and 0<=y<H: px[x,y]=COP_DARK+(255,)
        x2=int(cx+side*3.4*math.cos(t)); y2=int(41+4.0*math.sin(t))
        if 0<=x2<W and 0<=y2<H: px[x2,y2]=COP_LIGHT+(255,)
    # điểm nối thân (đinh tán đồng)
    for yy in (37,38,44,45):
        px[cx-side*2,yy]=COP_SPEC+(255,)
    # thanh nối quai ↔ thân: ghi đè outline, đảm bảo dính tuyệt đối
    for yy in range(37,48):
        bx0,bx1 = body_x0(yy)
        jx = bx0-1 if side==-1 else bx1+1
        if 0<=jx<W:
            px[jx,yy] = COP_DARK+(255,)
            jx2 = bx0-2 if side==-1 else bx1+2
            if 0<=jx2<W and px[jx2,yy]==OUT: px[jx2,yy]=COP_LIGHT+(255,)

# ---------- 6) vành miệng loe rộng + mặt lẩu ----------
d.ellipse((8,24,56,38), fill=COP_RIM+(255,), outline=OUT)     # vành loe
d.ellipse((10,26,54,38), fill=COP_SPEC+(255,))                # gờ sáng
d.ellipse((11,27,53,37), fill=COP_BASE+(255,))
d.ellipse((13,27,51,36), fill=(176,68,28,255))                # nước lẩu đỏ đậm
d.ellipse((13,31,51,36), fill=(146,52,12,255))
for x in range(17,40): blend(x,25,(246,196,132),170)          # highlight vành
# topping cluster 2x2 (đọc được ở size nhỏ)
def cluster(gx,gy,col,hi):
    for (dx,dy) in ((0,0),(1,0),(0,1),(1,1)):
        px[gx+dx,gy+dy]=col+(255,)
    px[gx,gy]=hi+(255,)
cluster(18,29,(96,152,62),(138,190,96))    # hành lá
cluster(40,28,(96,152,62),(138,190,96))    # hành lá
cluster(30,32,(204,54,38),(236,96,66))     # ớt
cluster(46,31,(226,164,52),(248,206,110))  # ngô/vàng
cluster(23,33,(240,150,90),(252,190,140))  # tôm
cluster(33,33,(238,228,204),(252,246,230)) # nấm/đậu hũ — dời khỏi chân ống khói

# ---------- 7) ống than cù lao ----------
for y in range(13,30):
    for x in range(28,37):
        c=COP_BASE
        if x<=29: c=COP_LIGHT
        elif x>=35: c=COP_DARK
        px[x,y]=c+(255,)
for y in (13,29):   # outline ống
    for x in range(27,38):
        if 0<=x<W: 
            if y==13: pass
            px[x,30] if False else None
for x in range(28,37): px[27,x] if False else None
# outline dọc ống
for y in range(13,31):
    px[27,y]=OUT; px[37,y]=OUT
# miệng ống loe
for y in (10,11,12):
    for x in range(25,40):
        px[x,y]=(COP_SPEC if y==12 else COP_LIGHT)+(255,)
for x in range(25,40):
    if x==25 or x==39: px[x,10]=OUT; px[x,11]=OUT; px[x,12]=OUT
px[24,11]=OUT; px[24,12]=OUT; px[40,11]=OUT; px[40,12]=OUT
for x in range(26,39): px[x,9]=OUT
# lòng ống + than hồng rực
for x in range(27,38):
    px[x,11]=(58,26,16,255); px[x,12]=(74,34,18,255)
for (ex,ey,ec) in [(28,11,EMBER),(30,12,EMBER_Y),(32,11,(255,236,150)),(34,12,EMBER),
                   (36,11,EMBER_Y),(29,12,(255,150,60)),(33,12,(255,170,70)),(37,12,(255,140,50))]:
    px[ex,ey]=ec+(255,)
# glow than miệng ống
for y in range(4,16):
    for x in range(22,43):
        g=math.exp(-(((x-32)/8.0)**2+((y-10)/5.0)**2))
        if g>0.04: blend(x,y,(255,140,60), g*55)

# ---------- 8) khói ấm bám nguồn ----------
def steam(sx,sy,h,amp,phase,peak,warm=True):
    for i in range(h):
        y=sy-i
        if y<0: break
        x=int(sx+amp*math.sin(i*0.55+phase))
        frac=i/max(1,h-1)
        col = SMOKE_HI if frac<0.4 else (SMOKE_MID if frac<0.75 else SMOKE_LO)
        a=peak*(1-frac*0.85)
        for k in (0,1):
            if 0<=x+k<W: blend(x+k,y,col,a)
steam(31,8,8,1.5,0.4,peak=215)          # khói chính từ ống than
steam(33,8,7,1.5,0.4+math.pi,peak=140)   # dải phụ đan xen
steam(20,26,5,1.1,2.2,peak=170)          # hơi mặt lẩu trái (bám vành)
steam(44,26,5,1.1,4.4,peak=170)          # hơi mặt lẩu phải — đối xứng nhịp

# ---------- 9) scale + contact sheet ----------
out=os.path.dirname(os.path.abspath(__file__))
big=img.resize((1024,1024), Image.NEAREST)
big.save(f"{out}/app_icon_1024.png")

sheet=Image.new("RGBA",(1024+520,1024+120),(28,20,18,255))
sheet.paste(big,(40,60))
xoff=40+1024+40
dd=ImageDraw.Draw(sheet)
for s in (180,96,64,32,16):
    sm=img.resize((s,s), Image.NEAREST)
    sheet.paste(sm,(xoff,60+(180-s)//2))
    dd.text((xoff,60+188), f"{s}px", fill=(230,200,160))
    xoff+=max(s,64)+26
sheet.save(f"{out}/app_icon_contactsheet.png")
print("ICON_V2_OK")

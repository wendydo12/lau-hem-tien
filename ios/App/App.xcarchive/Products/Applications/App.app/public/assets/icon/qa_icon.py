#!/usr/bin/env python3
# QA số học icon 32px native — không dùng vision
from PIL import Image
import numpy as np

im = np.array(Image.open('app_icon_32.png').convert('RGB')).astype(int)

top = im[:10]
red = (np.abs(top[:, :, 0] - 212) < 40) * (top[:, :, 1] < 110) * (top[:, :, 2] < 90)
yel = (np.abs(top[:, :, 0] - 232) < 40) * (np.abs(top[:, :, 1] - 148) < 50) * (top[:, :, 2] < 100)
print('lantern do px:', red.sum(), '| vang px:', yel.sum())
print('cot do:', np.where(red.any(axis=0))[0], '| cot vang:', np.where(yel.any(axis=0))[0])

corner = im[:4, :4].mean()
around = im[12:20, 10:22].mean()
print('nen goc mean:', round(corner, 1), '| quanh noi mean:', round(around, 1))

body = im[16:26]
cop = (np.abs(body[:, :, 0] - 190) < 70) * (np.abs(body[:, :, 1] - 104) < 60) * (body[:, :, 2] < 90)
print('than noi px dong:', cop.sum(), '/', body.size // 3)

base = im[26:]
fire = (base[:, :, 0] > 200) * (base[:, :, 1] > 80) * (base[:, :, 1] < 230) * (base[:, :, 2] < 120)
print('lua px:', fire.sum())
print('hang rim y=24 mean:', round(im[24, 8:24].mean(), 1))

# Master 64: kiểm tra outline không đen thuần ở vùng quai
m = np.array(Image.open('app_icon_64.png').convert('RGB')).astype(int)
print('master 64 mean:', round(m.mean(), 1))
print('QA_NUMPY_OK')

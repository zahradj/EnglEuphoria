"""Make true-alpha PNGs from the generated avatars (plain white background -> transparent).

Safe for white shirts / eye-whites: the busts end in a rounded cut at the bottom where a white tee would
otherwise touch the white background, so we first mark everything BELOW the figure's lower boundary as
background, then flood from the corners. Interior whites (not connected to the corners) stay opaque.
"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
FINAL = os.path.join(OUT, 'final')
os.makedirs(FINAL, exist_ok=True)

KEY = (255, 0, 255)


def lower_boundary(nonwhite, window=140):
    h, w = nonwhite.shape
    ymax = np.where(nonwhite.any(axis=0), h - 1 - np.argmax(nonwhite[::-1, :], axis=0), -1).astype(int)
    # Bridge columns where the bottom of the figure is white (e.g. a white tee): running max over a window.
    out = ymax.copy()
    half = window // 2
    for x in range(w):
        lo, hi = max(0, x - half), min(w, x + half + 1)
        out[x] = ymax[lo:hi].max()
    return out


def cutout(name, arc=False, size=512, clear_enclosed_above=None):
    im = Image.open(os.path.join(OUT, f'{name}.png')).convert('RGB')
    a = np.array(im).astype(int)
    h, w, _ = a.shape
    nonwhite = a.min(axis=2) < 235
    yb = lower_boundary(nonwhite)
    if arc:  # match the other busts' rounded bottom cut
        k = 70.0 / (342.0 ** 2)
        xs = np.arange(w)
        yb = np.minimum(yb, (920 - k * (xs - w / 2) ** 2).astype(int))
    ys = np.arange(h)[:, None]
    below = (ys > yb[None, :]) & (ys > h * 0.5)  # only the lower half: keeps the top corners as flood seeds
    a[below] = KEY
    im2 = Image.fromarray(a.astype('uint8'), 'RGB')
    for seed in [(0, 0), (w - 1, 0)]:
        if im2.getpixel(seed) != KEY:
            ImageDraw.floodfill(im2, seed, KEY, thresh=14)
    arr = np.array(im2)
    is_bg = (arr[:, :, 0] == 255) & (arr[:, :, 1] == 0) & (arr[:, :, 2] == 255)
    if clear_enclosed_above is not None:
        # Enclosed near-white regions (not eye-whites: those are small) whose centre is above this row are
        # background seen through gaps in the figure, e.g. between a headphone band and the head.
        from collections import deque
        white = (arr.min(axis=2) >= 241) & ~is_bg
        seen = np.zeros(white.shape, bool)
        for sy, sx in zip(*np.nonzero(white)):
            if seen[sy, sx]:
                continue
            q = deque([(sy, sx)]); seen[sy, sx] = True; pts = []
            while q:
                y, x = q.popleft(); pts.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and white[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; q.append((ny, nx))
            cy = sum(p[0] for p in pts) / len(pts)
            if len(pts) > 1500 and cy < clear_enclosed_above:
                for y, x in pts:
                    is_bg[y, x] = True
    alpha = Image.fromarray(np.where(is_bg, 0, 255).astype('uint8'), 'L')
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    rgba = Image.open(os.path.join(OUT, f'{name}.png')).convert('RGBA')
    rgba.putalpha(alpha)
    bbox = rgba.getbbox()
    rgba = rgba.crop(bbox)
    # square canvas, small margin, fixed output size
    side = int(max(rgba.size) * 1.06)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(rgba, ((side - rgba.width) // 2, (side - rgba.height) // 2), rgba)
    canvas = canvas.resize((size, size), Image.LANCZOS)
    path = os.path.join(FINAL, f'{name}.png')
    canvas.save(path, optimize=True)
    print(f'{name}: {os.path.getsize(path) // 1024} KB, opaque {np.array(canvas)[:, :, 3].mean() / 2.55:.0f}% of canvas')
    return canvas


def montage(names):
    tiles = [Image.open(os.path.join(FINAL, f'{n}.png')) for n in names]
    s = tiles[0].width
    bgs = [(255, 255, 255), (107, 33, 168), (30, 27, 75)]  # white, Academy purple, dark
    sheet = Image.new('RGB', (s * len(tiles), s * len(bgs)))
    for r, bg in enumerate(bgs):
        for c, t in enumerate(tiles):
            cell = Image.new('RGB', (s, s), bg)
            cell.paste(t, (0, 0), t)
            sheet.paste(cell, (c * s, r * s))
    sheet = sheet.resize((sheet.width // 2, sheet.height // 2), Image.LANCZOS)
    sheet.save(os.path.join(OUT, 'montage.png'))


if __name__ == '__main__':
    names = ['vee', 'ava', 'theo', 'nova']
    for n in names:
        cutout(n, arc=(n == 'ava'), clear_enclosed_above=(1024 if n == 'nova' else None))
    montage(names)

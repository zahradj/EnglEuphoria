"""Turns sticker images (listed one per line in art-stickers.txt) into real
cut-outs: flood-fills the plain white background from the image edges to
transparent (stopping at the drawing's dark outline), then crops to the
drawing with a small margin. Run by .github/workflows/bake-art.yml after
scripts/generate-art.mjs; only touches images that are still opaque."""
import sys
from collections import deque
from PIL import Image

def cut(path):
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    px = im.load()
    if any(px[x, y][3] < 255 for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]):
        print('already transparent:', path); return
    def bg(c): return c[0] > 228 and c[1] > 228 and c[2] > 228
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]: continue
        seen[i] = 1
        if not bg(px[x, y]): continue
        px[x, y] = (255, 255, 255, 0)
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    box = im.getbbox()
    if box:
        m = 12
        box = (max(0, box[0] - m), max(0, box[1] - m), min(w, box[2] + m), min(h, box[3] + m))
        im = im.crop(box)
    im.save(path)
    print('cut out:', path, im.size)

for line in open(sys.argv[1] if len(sys.argv) > 1 else 'art-stickers.txt'):
    p = line.strip()
    if p:
        try: cut(p)
        except FileNotFoundError: print('missing', p)

"""Paste a square original back into the centre of its generated 16:9
widening, with soft left/right edges, so the middle is pixel-identical to
the art the lesson's hotspots were measured on and only the sides are new.

Usage: python scripts/outpaint-composite.py art-outpaint.txt
(lines: "<wide out>\t<square source>", written by generate-art.mjs)
"""
import sys
from PIL import Image, ImageFilter

W, H = 1376, 768
lines = [l for l in open(sys.argv[1]).read().splitlines() if l.strip()] if len(sys.argv) > 1 else []
for line in lines:
    out, src = line.split("\t")
    wide = Image.open(out).convert("RGB").resize((W, H), Image.LANCZOS)
    sq = Image.open(src).convert("RGB").resize((H, H), Image.LANCZOS)
    x0 = (W - H) // 2
    feather = 36
    mask = Image.new("L", (H, H), 255)
    px = mask.load()
    for x in range(feather):
        a = int(255 * (x + 1) / (feather + 1))
        for y in range(H):
            px[x, y] = min(px[x, y], a)
            px[H - 1 - x, y] = min(px[H - 1 - x, y], a)
    wide.paste(sq, (x0, 0), mask)
    wide.save(out, "PNG", optimize=True)
    print("composited", out)

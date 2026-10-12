"""python3 scripts/split-sticker-objects.py <sheet.png> name1 name2 ...  (owner rule 2026-10-12: cut-out stickers only)
Cut a sticker sheet by OBJECT (not grid): each sticker = a connected non-white blob (dilated so a ball joins its
owner), inner whites kept (holes filled), trimmed and centred on a 1024 transparent square. Order: rows, then columns."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sheet, names = sys.argv[1], sys.argv[2:]
im = Image.open(sheet).convert('RGB'); a = np.asarray(im).astype(int)
ink = (a.min(2) < 236) | (np.ptp(a, axis=2) > 22)
blob = ndimage.binary_dilation(ink, iterations=4)
lab, k = ndimage.label(blob)
areas = ndimage.sum(blob, lab, range(1, k + 1))
big = list(np.argsort(-areas)[:len(names)] + 1)
cents = ndimage.center_of_mass(blob, lab, range(1, k + 1))
for j in range(1, k + 1):  # small pieces (a ball, a zzz) join the nearest big sticker
    if j in big or areas[j - 1] < 30: continue
    cy, cx = cents[j - 1]
    near = min(big, key=lambda b: (cents[b - 1][0] - cy) ** 2 + (cents[b - 1][1] - cx) ** 2)
    lab[lab == j] = near
objs = [(b, ndimage.find_objects((lab == b).astype(int))[0]) for b in big]
# rows by centre y (cluster), then x
objs.sort(key=lambda o: (o[1][0].start + o[1][0].stop) / 2)
rows, cur = [], []
for o in objs:
    cy = (o[1][0].start + o[1][0].stop) / 2
    if cur and cy - (cur[-1][1][0].start + cur[-1][1][0].stop) / 2 > a.shape[0] * 0.12: rows.append(cur); cur = []
    cur.append(o)
rows.append(cur)
ordered = [o for r in rows for o in sorted(r, key=lambda o: o[1][1].start)]
for name, (i, sl) in zip(names, ordered):
    m = (lab[sl] == i) & ink[sl]
    # the sticker's white die-cut border counts as part of it: fill holes, then grow 3px into the near-white rim
    m = ndimage.binary_fill_holes(ndimage.binary_closing(m, iterations=3))
    rgb = a[sl].astype(np.uint8)
    alpha = (m * 255).astype(np.uint8)
    obj = Image.fromarray(np.dstack([rgb, alpha]), 'RGBA')
    obj = obj.crop(obj.getbbox())
    side = int(max(obj.size) * 1.08)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(obj, ((side - obj.width) // 2, (side - obj.height) // 2), obj)
    canvas = canvas.resize((1024, 1024), Image.LANCZOS)
    out = f'public/lep1/items/item-{name}.png'; canvas.save(out, optimize=True); print(out, obj.size)

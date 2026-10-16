"""Academy: cut a Canva sticker sheet into transparent card pictures by PICTURE, not by grid cell (public/academy-art/cards/<id>.webp).

  python3 scripts/academy-split-cards-auto.py <sheet.png> <count> id1 id2 ...   (reading order: top row left to right, then the next row)

For sheets whose pictures are wider than their grid cells (academy-split-cards.py would cut them). Pictures are found as groups of non-white pixels
(joined across small gaps), each is cut out like academy-split-cards.py (white connected to the picture's border becomes transparent) and saved 1024x1024."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

sheet, count, ids = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
im = Image.open(sheet).convert('RGB')
a = np.asarray(im).astype(int)
white = (a.min(2) > 232) & (np.ptp(a, axis=2) < 18)
ink = ~white
merged = ndimage.binary_dilation(ink, iterations=int(__import__("os").environ.get("GAP", "8")))
lab, n = ndimage.label(merged)
sizes = ndimage.sum(ink, lab, range(1, n + 1))
keep = sorted(np.argsort(sizes)[::-1][:count] + 1)
boxes = []
for k in keep:
    ys, xs = np.where((lab == k) & ink)
    boxes.append((ys.min(), ys.max() + 1, xs.min(), xs.max() + 1))
rows_mid = np.median([(b[0] + b[1]) / 2 for b in boxes])
boxes.sort(key=lambda b: (0 if (b[0] + b[1]) / 2 < im.height / 2 else 1, (b[2] + b[3]) / 2))
assert len(boxes) == len(ids), f'{len(boxes)} pictures for {len(ids)} ids'
for (y0, y1, x0, x1), cid in zip(boxes, ids):
    pad = 6
    cell = a[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]
    cw = (cell.min(2) > 232) & (np.ptp(cell, axis=2) < 18)
    l2, _ = ndimage.label(cw)
    border = set(np.unique(np.concatenate([l2[0], l2[-1], l2[:, 0], l2[:, -1]]))) - {0}
    obj = ~np.isin(l2, list(border))
    obj = ndimage.binary_opening(obj, iterations=1)
    l3, m = ndimage.label(obj)
    if m > 1:
        sz = ndimage.sum(obj, l3, range(1, m + 1))
        obj = np.isin(l3, [i + 1 for i, s in enumerate(sz) if s >= sz.max() * 0.03])
    alpha = (ndimage.gaussian_filter(obj.astype(float), 0.7) * 255).clip(0, 255).astype(np.uint8)
    ys, xs = np.where(obj)
    yy0, yy1, xx0, xx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    piece = Image.fromarray(np.dstack([cell.astype(np.uint8), alpha])[yy0:yy1, xx0:xx1], 'RGBA')
    k2 = (1024 - 140) / max(piece.width, piece.height)
    piece = piece.resize((round(piece.width * k2), round(piece.height * k2)), Image.LANCZOS)
    out = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    out.paste(piece, ((1024 - piece.width) // 2, (1024 - piece.height) // 2), piece)
    out.save(f'public/academy-art/cards/{cid}.webp', 'WEBP', quality=90)
    print(f'public/academy-art/cards/{cid}.webp', piece.size)

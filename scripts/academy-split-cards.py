"""Academy: cut a Canva sticker sheet into transparent card pictures (public/academy-art/cards/v-<word>.webp).

  python3 scripts/academy-split-cards.py <sheet.png> <rows> <cols> word1 word2 ... (row by row; '-' skips a cell)

Same cut-out as split-sticker-sheet.py (white connected to the cell border becomes transparent), but for the Academy hub (hub separation)."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

sheet, rows, cols, words = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4:]
im = Image.open(sheet).convert('RGB')
W, H = im.size
for k, word in enumerate(words):
    if word == '-':
        continue
    r, c = divmod(k, cols)
    pad = int(0.05 * W // cols)  # a little bleed so an object that crosses the grid line is not cut
    cell = np.asarray(im.crop((max(0, c * W // cols - pad), max(0, r * H // rows - pad), min(W, (c + 1) * W // cols + pad), min(H, (r + 1) * H // rows + pad)))).astype(int)
    white = (cell.min(2) > 232) & (np.ptp(cell, axis=2) < 18)
    lab, _ = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    obj = ~bg
    obj = ndimage.binary_opening(obj, iterations=1)
    lab2, n = ndimage.label(obj)
    if n > 1:  # keep the object, drop specks
        sizes = ndimage.sum(obj, lab2, range(1, n + 1))
        obj = np.isin(lab2, [i + 1 for i, s in enumerate(sizes) if s >= sizes.max() * 0.05])
    alpha = (ndimage.gaussian_filter(obj.astype(float), 0.7) * 255).clip(0, 255).astype(np.uint8)
    ys, xs = np.where(obj)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgba = np.dstack([cell.astype(np.uint8), alpha])[y0:y1, x0:x1]
    piece = Image.fromarray(rgba, 'RGBA')
    s = 1024 - 2 * 70
    k = s / max(piece.width, piece.height)  # fill the square like the other item pictures (up or down)
    piece = piece.resize((round(piece.width * k), round(piece.height * k)), Image.LANCZOS)
    out = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    out.paste(piece, ((1024 - piece.width) // 2, (1024 - piece.height) // 2), piece)
    path = f'public/academy-art/cards/v-{word}.webp'
    out.save(path, 'WEBP', quality=90)
    print(path, piece.size)

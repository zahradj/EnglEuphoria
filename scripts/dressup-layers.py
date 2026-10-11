"""Cut fitted dress-up clothes out of a "dressed" picture of a character (Pre-A1 dress-up game).

The dressed picture is a Canva edit of the character's own picture (same pose, same framing, only clothes
added), fetched with "raw": true so it lines up pixel for pixel with the base. Every pixel that differs from
the base belongs to a piece of clothing; each piece is found by its colour (and, where two pieces share a
colour, by a height band), and the outlines in between go to the nearest piece. Each piece is saved as a
transparent PNG the size of the base, so the game just stacks them on the character.

  python3 scripts/dressup-layers.py <base.png> <dressed.png> <out_dir> '<pieces json>'

pieces json: {"hat": {"colour": "green"}, "pants": {"colour": "blue", "y1": 857}, "shoes": {"colour": ["blue", "white"], "y0": 857}}
colours: red, orange, yellow, green, blue, purple, pink, white, brown. y0/y1 limit the seed band (pixels).
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

base_p, dressed_p, out_dir, spec = sys.argv[1], sys.argv[2], sys.argv[3], json.loads(sys.argv[4])
b = Image.open(base_p).convert('RGBA')
bw = Image.new('RGB', b.size, 'white'); bw.paste(b, (0, 0), b)
d = Image.open(dressed_p).convert('RGB').resize(b.size, Image.LANCZOS)
B = np.asarray(bw).astype(int); D = np.asarray(d).astype(int)

# 1. what changed: a clear colour difference, cleaned of specks, holes filled
diff = np.abs(D - B).max(2) > 48
diff = ndimage.binary_opening(diff, iterations=2)
diff = ndimage.binary_closing(diff, iterations=3)
diff = ndimage.binary_fill_holes(diff)
lab, n = ndimage.label(diff)
sizes = ndimage.sum(diff, lab, range(1, n + 1))
diff = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 600])

# 2. colour of each dressed pixel (HSV)
hsv = np.asarray(d.convert('HSV')).astype(float)
H, S, V = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
COL = {
    'red': ((H < 14) | (H > 340)) & (S > .45) & (V > .3),
    'orange': (H >= 14) & (H < 38) & (S > .45) & (V > .45),
    'yellow': (H >= 38) & (H < 68) & (S > .45) & (V > .5),
    'green': (H >= 68) & (H < 170) & (S > .3) & (V > .25),
    'blue': (H >= 190) & (H < 255) & (S > .3) & (V > .25),
    'purple': (H >= 255) & (H < 300) & (S > .3),
    'pink': (H >= 300) & (H <= 340) & (S > .3),
    'white': (S < .18) & (V > .8),
    'brown': (H < 40) & (S > .35) & (V <= .45) & (V > .15),
}
yy = np.arange(D.shape[0])[:, None] * np.ones((1, D.shape[1]), int)

# 3. seeds per piece, then every changed pixel goes to its nearest seed
names = list(spec)
seed = np.zeros(diff.shape, int)
for k, name in enumerate(names, 1):
    s = spec[name]
    cols = s['colour'] if isinstance(s['colour'], list) else [s['colour']]
    m = diff & np.any([COL[c] for c in cols], axis=0)
    if 'y0' in s: m &= yy >= s['y0']
    if 'y1' in s: m &= yy < s['y1']
    m = ndimage.binary_opening(m, iterations=1)
    seed[m & (seed == 0)] = k
    print(name, 'seed px', int(m.sum()))
_, (iy, ix) = ndimage.distance_transform_edt(seed == 0, return_indices=True)
owner = seed[iy, ix] * diff

os.makedirs(out_dir, exist_ok=True)
for k, name in enumerate(names, 1):
    m = owner == k
    lab, n = ndimage.label(m)  # drop stray islands far from the piece
    if n > 1:
        sizes = ndimage.sum(m, lab, range(1, n + 1))
        m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= max(300, sizes.max() * .02)])
    a = ndimage.gaussian_filter(m.astype(float), .6)  # soft 1px edge
    rgba = np.dstack([D.astype(np.uint8), (np.clip(a * 1.6, 0, 1) * 255).astype(np.uint8)])
    Image.fromarray(rgba, 'RGBA').save(os.path.join(out_dir, f'{name}.png'), optimize=True)
    ys, xs = np.where(m)
    print(name, 'px', int(m.sum()), 'bbox', (xs.min(), ys.min(), xs.max(), ys.max()) if len(xs) else None)

"""Make a second colour of a sticker by moving its main colour to another hue (outlines and white stay).

  python3 scripts/recolor-sticker.py <in.png> <out.png> <from_hue> <to_hue> [<range>=35] [<sat_scale>=1] [<val_scale>=1]

Hues in degrees (red 0, orange 30, yellow 55, green 120, blue 215, purple 280, pink 330). Every pixel whose hue is
within <range> of <from_hue> and that has some colour (saturation > 0.2) is moved by (to_hue - from_hue); shading
and highlights keep their relative lightness. Used for colour pairs of one Canva sticker (blue coat → red coat).
"""
import sys
import numpy as np
from PIL import Image

src, dst, h0, h1 = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
rng = float(sys.argv[5]) if len(sys.argv) > 5 else 35.0
sat_k = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0
val_k = float(sys.argv[7]) if len(sys.argv) > 7 else 1.0
im = Image.open(src).convert('RGBA')
alpha = np.asarray(im)[..., 3]
hsv = np.asarray(im.convert('RGB').convert('HSV')).astype(float)
H = hsv[..., 0] * 360 / 255
S = hsv[..., 1] / 255
d = (H - h0 + 180) % 360 - 180
m = (np.abs(d) <= rng) & (S > 0.2)
H2 = np.where(m, (H + (h1 - h0)) % 360, H)
hsv[..., 0] = H2 * 255 / 360
hsv[..., 1] = np.where(m, np.clip(hsv[..., 1] * sat_k, 0, 255), hsv[..., 1])
hsv[..., 2] = np.where(m, np.clip(hsv[..., 2] * val_k, 0, 255), hsv[..., 2])
rgb = Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')
out = np.dstack([np.asarray(rgb), alpha])
Image.fromarray(out, 'RGBA').save(dst, optimize=True)
print(f'{dst}: {int(m.sum())} px recoloured {h0:.0f}° → {h1:.0f}°')

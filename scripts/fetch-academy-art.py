"""Saves Academy pictures made with Canva into the repo (run by .github/workflows/academy-art.yml).

scripts/academy-art-request.json = [{"url": "<signed Canva export URL>", "out": "public/academy-art/cast/ava/neutral.webp", "kind": "cast" | "scene" | "card"}, ...]
Academy-only (hub separation): the Playground has its own fetcher. Cast pictures are saved 900x1200 (3:4) with the plain grey background cut out (transparent WebP), scenes 1620x1080 (3:2) WebP, vocabulary cards 800x800 WebP (square, no cut-out).
Pictures come from Canva only, never Higgsfield (CLAUDE.md "Media generators")."""
import io, json, os, sys, urllib.request
from PIL import Image, ImageDraw, ImageFilter

SIZES = {'cast': (900, 1200), 'scene': (1620, 1080), 'card': (800, 800)}


def cut_out(im):
    """Removes the plain light-grey background by flood-filling from the border (the ink outline stops the fill)."""
    w, h = im.size
    work = im.copy()
    marker = (255, 0, 255)
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (0, h // 2), (w - 1, h // 2)]:
        if work.getpixel(xy) != marker:
            ImageDraw.floodfill(work, xy, marker, thresh=38)
    bg = Image.new('L', im.size, 0)
    bgpx, wpx = bg.load(), work.load()
    for y in range(h):
        for x in range(w):
            if wpx[x, y] == marker:
                bgpx[x, y] = 255
    bg = bg.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.1))
    alpha = bg.point(lambda v: 255 - v)
    out = im.convert('RGBA')
    out.putalpha(alpha)
    return out

reqs = json.load(open('scripts/academy-art-request.json'))
ok = 0
for r in reqs:
    out = r['out']
    try:
        data = urllib.request.urlopen(urllib.request.Request(r['url'], headers={'User-Agent': 'Mozilla/5.0'}), timeout=90).read()
        im = Image.open(io.BytesIO(data)).convert('RGB')
        im = im.resize(SIZES[r.get('kind', 'cast')], Image.LANCZOS)
        if r.get('kind', 'cast') == 'cast':
            im = cut_out(im)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im.save(out, 'WEBP', quality=88, method=6)
        print('+', out, im.size)
        ok += 1
    except Exception as e:
        print('!', out, e)
print(f'{ok}/{len(reqs)} saved')
if ok == 0:
    sys.exit(1)

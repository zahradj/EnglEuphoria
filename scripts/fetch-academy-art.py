"""Saves Academy pictures made with Canva into the repo (run by .github/workflows/academy-art.yml).

scripts/academy-art-request.json = [{"url": "<signed Canva export URL>", "out": "public/academy-art/cast/ava/neutral.webp", "kind": "cast" | "scene"}, ...]
Academy-only (hub separation): the Playground has its own fetcher. Cast pictures are saved 900x1200 (3:4), scenes 1620x1080 (3:2), both WebP.
Pictures come from Canva only, never Higgsfield (CLAUDE.md "Media generators")."""
import io, json, os, sys, urllib.request
from PIL import Image

SIZES = {'cast': (900, 1200), 'scene': (1620, 1080)}
reqs = json.load(open('scripts/academy-art-request.json'))
ok = 0
for r in reqs:
    out = r['out']
    try:
        data = urllib.request.urlopen(urllib.request.Request(r['url'], headers={'User-Agent': 'Mozilla/5.0'}), timeout=90).read()
        im = Image.open(io.BytesIO(data)).convert('RGB')
        im = im.resize(SIZES[r.get('kind', 'cast')], Image.LANCZOS)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im.save(out, 'WEBP', quality=88, method=6)
        print('+', out, im.size)
        ok += 1
    except Exception as e:
        print('!', out, e)
print(f'{ok}/{len(reqs)} saved')
if ok == 0:
    sys.exit(1)

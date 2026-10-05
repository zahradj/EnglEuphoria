"""Saves pictures generated with Canva into the repo (run by .github/workflows/canva-art.yml).

scripts/canva-art-request.json = [{"url": "<Canva download URL>", "out": "public/lep1/...png", "sticker": false}, ...]
Wide pictures are saved at 1376x768, stickers at 1024x1024 with the white background cut out
(scripts/cutout-stickers.py). Existing files are overwritten (a request is a deliberate re-make).
Pictures come from Canva only — never Higgsfield (CLAUDE.md "Media generators")."""
import io, json, os, subprocess, sys, urllib.request
from PIL import Image

reqs = json.load(open('scripts/canva-art-request.json'))
stickers, ok = [], 0
for r in reqs:
    out = r['out']
    try:
        data = urllib.request.urlopen(urllib.request.Request(r['url'], headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read()
        im = Image.open(io.BytesIO(data)).convert('RGBA' if r.get('sticker') else 'RGB')
        size = (1024, 1024) if r.get('sticker') else (1376, 768)
        if not r.get('sticker') and abs(im.width / im.height - 16 / 9) > 0.02:  # cover-crop to 16:9
            w, h = im.size; tw = min(w, int(h * 16 / 9)); th = int(tw * 9 / 16)
            im = im.crop(((w - tw) // 2, (h - th) // 2, (w + tw) // 2, (h + th) // 2))
        im = im.resize(size, Image.LANCZOS)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im.save(out, 'PNG', optimize=True)
        print('+', out, im.size)
        ok += 1
        if r.get('sticker'): stickers.append(out)
    except Exception as e:
        print('!', out, e)
if stickers:
    open('canva-stickers.txt', 'w').write('\n'.join(stickers))
    subprocess.run([sys.executable, 'scripts/cutout-stickers.py', 'canva-stickers.txt'], check=False)
    os.remove('canva-stickers.txt')
print(f'{ok}/{len(reqs)} saved')
if ok == 0: sys.exit(1)

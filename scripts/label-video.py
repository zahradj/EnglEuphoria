"""Add body-part labels to a story clip or stills film: the word in a clean label, a line, and a dot exactly on the part.

    python3 scripts/label-video.py <in.mp4> <out-name> '<labels json>'

labels: [{"word": "head", "at": [x, y], "label": [x, y], "from": 0.5, "to": 4.0}, ...]
  at     where the dot goes (the body part), in % of the frame (0-100)
  label  where the label sits, in % of the frame (keep it on empty floor/wall, never over a face)
  from/to  seconds the label is shown (it pops in over 0.25 s)

Why we draw labels ourselves: AI video garbles letters, so generated clips stay text-free (videoPolicy) and every word
the child reads is added here, spelled exactly as taught, in one clear rounded font (scripts/fonts/Outfit-Bold.ttf, OFL).
Writes <out-name>.mp4 + <out-name>.webm at the input's size."""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
FONT = os.path.join(os.path.dirname(__file__), 'fonts', 'Outfit-Bold.ttf')
INK, FILL, LINE = (43, 30, 23, 255), (255, 255, 255, 245), (255, 122, 0, 255)  # app's dark brown ink, white pill, orange line

src, out, labels = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
probe = subprocess.run([FF, '-i', src], capture_output=True, text=True).stderr
import re
W, H = map(int, re.search(r', (\d{3,5})x(\d{3,5})', probe).groups())

tmp = tempfile.mkdtemp()
font = ImageFont.truetype(FONT, int(H * 0.075))
pngs = []
for n, lab in enumerate(labels):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ax, ay = lab['at'][0] * W / 100, lab['at'][1] * H / 100
    lx, ly = lab['label'][0] * W / 100, lab['label'][1] * H / 100
    word = lab['word']
    bx0, by0, bx1, by1 = d.textbbox((0, 0), word, font=font)
    tw, th = bx1 - bx0, by1 - by0
    padx, pady = H * 0.03, H * 0.018
    box = [lx - tw / 2 - padx, ly - th / 2 - pady, lx + tw / 2 + padx, ly + th / 2 + pady]
    # Line from the label's nearest edge to the dot.
    ex = min(max(ax, box[0]), box[2]); ey = box[3] if ay > box[3] else box[1] if ay < box[1] else ly
    lw = max(4, int(H * 0.008))
    d.line([(ex, ey), (ax, ay)], fill=(255, 255, 255, 255), width=lw + 6)
    d.line([(ex, ey), (ax, ay)], fill=LINE, width=lw)
    r = H * 0.016
    d.ellipse([ax - r - 3, ay - r - 3, ax + r + 3, ay + r + 3], fill=(255, 255, 255, 255))
    d.ellipse([ax - r, ay - r, ax + r, ay + r], fill=LINE)
    d.rounded_rectangle([box[0] + 3, box[1] + 5, box[2] + 3, box[3] + 5], radius=(box[3] - box[1]) / 2, fill=(0, 0, 0, 60))
    d.rounded_rectangle(box, radius=(box[3] - box[1]) / 2, fill=FILL, outline=LINE, width=max(3, int(H * 0.005)))
    d.text((lx - tw / 2 - bx0, ly - th / 2 - by0), word, font=font, fill=INK)
    p = os.path.join(tmp, f'l{n}.png'); img.save(p); pngs.append(p)

inputs, filt, prev = ['-i', src], [], '0:v'
for n, (p, lab) in enumerate(zip(pngs, labels)):
    inputs += ['-loop', '1', '-i', p]
    a, b = lab['from'], lab['to']
    # Fade in over 0.25 s and out over 0.25 s so the label never flashes.
    filt.append(f"[{n + 1}:v]format=rgba,fade=t=in:st={a}:d=0.25:alpha=1,fade=t=out:st={max(a, b - 0.25)}:d=0.25:alpha=1[o{n}]")
    filt.append(f"[{prev}][o{n}]overlay=0:0:enable='between(t,{a},{b})':shortest=1[v{n}]")
    prev = f'v{n}'
r = subprocess.run([FF, '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', f'[{prev}]', '-an', '-c:v', 'libx264', '-profile:v', 'main',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', out + '.mp4'], capture_output=True, text=True)
print('mp4', r.returncode, r.stderr[-500:] if r.returncode else '')
r = subprocess.run([FF, '-y', '-i', out + '.mp4', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', out + '.webm'], capture_output=True, text=True)
print('webm', r.returncode)

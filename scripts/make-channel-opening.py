"""YouTube channel opening "Pip's Playground Pop" (scenario: docs/scenarios/youtube-channel-opening.md).

Everything is our own animation and sound, made from the owner's logo (public/brand/engleuphoria-logo-wide.png)
and Pip (public/mascots/pip-fox-welcome.png): no paid clips, no voice, no zoom/pan of a still picture.

    python3 scripts/make-channel-opening.py <fredoka-bold.ttf> [hub-label]
writes public/brand/channel-opening-<hub>.mp4 (1920x1080, 30 fps, ~6.5 s, with sound).
"""
import math, random, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS, DUR = 1920, 1080, 30, 6.5
FONT = sys.argv[1]
HUB = sys.argv[2] if len(sys.argv) > 2 else 'Playground'
OUT = f'public/brand/channel-opening-{HUB.lower()}'
random.seed(7)

PURPLE, ORANGE, PINK, GREEN, LIME, BLUE = (139, 44, 245), (255, 138, 0), (255, 61, 127), (34, 190, 90), (190, 220, 0), (40, 140, 255)
LETTER_COLS = [PURPLE, ORANGE, GREEN, PINK, BLUE, ORANGE, PURPLE, GREEN, PINK, ORANGE, BLUE, GREEN]

def ease_out(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def spring(x, k=7.0, damp=4.5):
    """0 -> 1 with a bouncy overshoot."""
    if x <= 0: return 0.0
    return 1 - math.exp(-damp * x) * math.cos(k * x)

# ---------- art ----------
logo = Image.open('public/brand/engleuphoria-logo-wide.png').convert('RGBA')
circle = logo.crop((20, 20, 448, 448))  # the colour circle with the "e" (the owner's logo)
CIRC_D = 380
circle = circle.resize((CIRC_D, CIRC_D), Image.LANCZOS)
pip = Image.open('public/mascots/pip-fox-welcome.png').convert('RGBA')
pip = pip.crop(pip.getbbox())
PIP_H = 470
pip = pip.resize((int(pip.width * PIP_H / pip.height), PIP_H), Image.LANCZOS)

font = ImageFont.truetype(FONT, 200)
pill_font = ImageFont.truetype(FONT, 78)
WORD = 'EnglEuphoria'

def letter_sprite(ch, col):
    """One letter: colour fill, thick white outline, soft shadow."""
    pad = 40
    l, t, r, b = font.getbbox(ch)
    im = Image.new('RGBA', (r - l + pad * 2, 260 + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x, y = pad - l, pad
    shadow = Image.new('RGBA', im.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text((x + 6, y + 10), ch, font=font, fill=(30, 0, 60, 150), stroke_width=12, stroke_fill=(30, 0, 60, 150))
    im.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(6)))
    d.text((x, y), ch, font=font, fill=col + (255,), stroke_width=12, stroke_fill=(255, 255, 255, 255))
    # glossy highlight on the top half of the letter
    hl = Image.new('RGBA', im.size, (0, 0, 0, 0))
    ImageDraw.Draw(hl).text((x, y), ch, font=font, fill=(255, 255, 255, 70))
    mask = Image.new('L', im.size, 0); ImageDraw.Draw(mask).rectangle((0, 0, im.width, y + 95), fill=255)
    im.paste(Image.composite(hl, Image.new('RGBA', im.size, (0, 0, 0, 0)), mask), (0, 0), Image.composite(hl, Image.new('RGBA', im.size, (0, 0, 0, 0)), mask))
    return im, x, y

letters = []
pen = 0
for i, ch in enumerate(WORD):
    spr, ox, oy = letter_sprite(ch, LETTER_COLS[i % len(LETTER_COLS)])
    adv = font.getlength(ch)
    letters.append({'spr': spr, 'ox': ox, 'oy': oy, 'pen': pen})
    pen += adv
WORD_W = pen
LOGO_CX, LOGO_CY = 520, 430
WORD_X0 = LOGO_CX + CIRC_D // 2 + 60
scale_word = min(1.0, (W - 80 - WORD_X0) / WORD_W)
if scale_word < 1:
    for L in letters:
        L['spr'] = L['spr'].resize((int(L['spr'].width * scale_word), int(L['spr'].height * scale_word)), Image.LANCZOS)
        L['ox'] *= scale_word; L['oy'] *= scale_word; L['pen'] *= scale_word
    WORD_W *= scale_word
WORD_BASE_Y = LOGO_CY - int(150 * scale_word)

# Playground tag
pw = int(pill_font.getlength(HUB)) + 120
pill = Image.new('RGBA', (pw, 130), (0, 0, 0, 0))
pd = ImageDraw.Draw(pill)
grad = Image.new('RGBA', pill.size)
for x in range(pw):
    t = x / pw
    c = tuple(int(ORANGE[k] * (1 - t) + PINK[k] * t) for k in range(3))
    ImageDraw.Draw(grad).line([(x, 0), (x, 130)], fill=c + (255,))
m = Image.new('L', pill.size, 0); ImageDraw.Draw(m).rounded_rectangle((4, 4, pw - 4, 126), radius=60, fill=255)
pill.paste(grad, (0, 0), m)
pd.rounded_rectangle((4, 4, pw - 4, 126), radius=60, outline=(255, 255, 255, 255), width=8)
pd.text((pw // 2, 64), HUB, font=pill_font, fill=(255, 255, 255, 255), anchor='mm', stroke_width=3, stroke_fill=(200, 60, 40, 255))
PILL_X = WORD_X0 + int(WORD_W / 2) - pw // 2
PILL_Y = 610

def ball_sprite(r=34):
    im = Image.new('RGBA', (r * 2 + 4, r * 2 + 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cols = [ORANGE, PURPLE, GREEN, BLUE]
    for k in range(4):
        d.pieslice((2, 2, r * 2 + 2, r * 2 + 2), k * 90, (k + 1) * 90, fill=cols[k] + (255,))
    d.ellipse((2, 2, r * 2 + 2, r * 2 + 2), outline=(255, 255, 255, 255), width=5)
    d.ellipse((r * 0.6, r * 0.45, r * 0.95, r * 0.8), fill=(255, 255, 255, 170))
    return im
BALL = ball_sprite()

def star(size, col=(255, 255, 255, 255)):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    c = size / 2
    pts = []
    for k in range(8):
        r = c if k % 2 == 0 else c * 0.28
        a = k * math.pi / 4 - math.pi / 2
        pts.append((c + r * math.cos(a), c + r * math.sin(a)))
    ImageDraw.Draw(im).polygon(pts, fill=col)
    return im

# background: deep purple glow + three slow colour blobs (alive, never a moving picture)
yy, xx = np.mgrid[0:H, 0:W]
rad = np.sqrt(((xx - W * 0.45) / W) ** 2 + ((yy - H * 0.45) / H) ** 2)
base_bg = np.stack([60 - 40 * rad, 22 - 14 * rad, 120 - 70 * rad], -1).clip(0, 255)
BLOBS = [(PURPLE, 0.25, 0.3, 0.35), (ORANGE, 0.8, 0.25, 0.3), (GREEN, 0.7, 0.85, 0.32), (PINK, 0.15, 0.85, 0.25)]

def background(t):
    small = Image.fromarray(base_bg[::4, ::4].astype(np.uint8))
    d = ImageDraw.Draw(small, 'RGBA')
    sw, sh = small.size
    for k, (col, bx, by, br) in enumerate(BLOBS):
        cx = (bx + 0.04 * math.sin(t * 0.9 + k)) * sw
        cy = (by + 0.04 * math.cos(t * 0.7 + k * 2)) * sh
        r = br * sh * (0.9 + 0.08 * math.sin(t * 1.3 + k))
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col + (70,))
    small = small.filter(ImageFilter.GaussianBlur(40))
    bg = small.resize((W, H), Image.BICUBIC).convert('RGBA')
    fade = ease_out(t / 0.6)
    if fade < 1:
        bg = Image.blend(Image.new('RGBA', (W, H), (12, 4, 30, 255)), bg, fade)
    return bg

CONF = [{'col': random.choice([PURPLE, ORANGE, GREEN, PINK, LIME, BLUE]), 'r': random.randint(8, 20),
         'sx': random.choice([-60, W + 60]) if random.random() < 0.5 else random.randint(0, W),
         'sy': random.randint(0, H) if random.random() < 0.5 else random.choice([-60, H + 60]),
         'tx': random.randint(60, W - 60), 'ty': random.randint(60, H - 60), 'ph': random.random() * 6.28,
         'delay': random.random() * 0.4} for _ in range(46)]

def paste_scaled(dst, spr, cx, cy, sx, sy=None, rot=0.0, alpha=1.0, anchor='center'):
    sy = sx if sy is None else sy
    if sx <= 0.01 or sy <= 0.01 or alpha <= 0: return
    im = spr.resize((max(1, int(spr.width * sx)), max(1, int(spr.height * sy))), Image.BICUBIC)
    if rot: im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 1:
        a = im.split()[3].point(lambda v: int(v * alpha)); im.putalpha(a)
    if anchor == 'center': x, y = int(cx - im.width / 2), int(cy - im.height / 2)
    else: x, y = int(cx - im.width / 2), int(cy - im.height)  # bottom-center
    dst.alpha_composite(im, (max(0, x), max(0, y))) if x >= 0 and y >= 0 else dst.paste(im, (x, y), im)

PIP_X, PIP_FLOOR = 210, H + 20
T_POP = 1.9
LETTER_T0, LETTER_DT = 2.45, 0.09
T_PILL = 4.05

def frame(i):
    t = i / FPS
    f = background(t)
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))  # see-through shapes are drawn here, then blended
    d = ImageDraw.Draw(ov)
    # confetti
    for c in CONF:
        k = ease_out((t - c['delay']) / 0.9)
        x = c['sx'] + (c['tx'] - c['sx']) * k + 10 * math.sin(t * 1.5 + c['ph'])
        y = c['sy'] + (c['ty'] - c['sy']) * k + 12 * math.cos(t * 1.2 + c['ph'])
        r = c['r'] * (0.85 + 0.15 * math.sin(t * 3 + c['ph']))
        d.ellipse((x - r, y - r, x + r, y + r), fill=c['col'] + (210,))
    f.alpha_composite(ov); ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    # Pip pops up (squash and stretch), later waves
    pk = (t - 0.8) / 0.6
    if pk > 0:
        rise = spring(pk, 8, 5)
        sy = 1 + 0.12 * math.sin(min(1, pk) * math.pi) - 0.06 * math.exp(-4 * pk) * math.sin(pk * 14)
        sx = 2 - sy
        wave = 5 * math.sin((t - T_PILL) * 7) if t > T_PILL else 0
        paste_scaled(f, pip, PIP_X, H - 24 + (PIP_H + 60) * (1 - rise), sx, sy, rot=wave, anchor='bottom')
    # the bubble Pip blows: grows and floats to the logo spot, then POPS
    if 1.2 <= t < T_POP:
        k = ease_out((t - 1.2) / (T_POP - 1.2))
        bx = 360 + (LOGO_CX - 360) * k
        by = 690 + (LOGO_CY - 690) * k
        r = 30 + (CIRC_D / 2 - 30) * k + 6 * math.sin(t * 18)
        d.ellipse((bx - r, by - r, bx + r, by + r), fill=(200, 230, 255, 60), outline=(255, 255, 255, 200), width=6)
        d.ellipse((bx - r * 0.55, by - r * 0.6, bx - r * 0.15, by - r * 0.3), fill=(255, 255, 255, 150))
    if T_POP <= t < T_POP + 0.45:
        k = (t - T_POP) / 0.45
        rr = CIRC_D / 2 + 140 * k
        d.ellipse((LOGO_CX - rr, LOGO_CY - rr, LOGO_CX + rr, LOGO_CY + rr), outline=(255, 255, 255, int(220 * (1 - k))), width=int(10 * (1 - k)) + 1)
        for a in range(12):
            ang = a * math.pi / 6
            dist = CIRC_D / 2 + 180 * ease_out(k)
            x, y = LOGO_CX + dist * math.cos(ang), LOGO_CY + dist * math.sin(ang)
            s = 12 * (1 - k)
            d.ellipse((x - s, y - s, x + s, y + s), fill=(255, 255, 255, int(230 * (1 - k))))
    f.alpha_composite(ov)
    # logo springs out of the pop
    lk = (t - T_POP) / 0.7
    if lk > 0:
        s = spring(lk, 9, 4.2)
        rot = 12 * math.exp(-4 * lk) * math.sin(lk * 12)
        bob = 6 * math.sin((t - 3) * 2.2) if t > 3 else 0
        paste_scaled(f, circle, LOGO_CX, LOGO_CY + bob, s, rot=rot)
        for n, (dx, dy, sz, ph) in enumerate([(150, -160, 70, 0), (215, -95, 44, 1.7), (-170, -150, 52, 3.1)]):
            tw = 0.6 + 0.4 * math.sin(t * 6 + ph)
            ss = spring((t - T_POP - 0.15 - n * 0.08) / 0.5, 10, 5) * tw
            paste_scaled(f, star(sz), LOGO_CX + dx, LOGO_CY + dy + bob, ss)
    # letters drop in one by one with a bounce, then ride a gentle wave
    for n, L in enumerate(letters):
        lt = (t - LETTER_T0 - n * LETTER_DT) / 0.55
        if lt <= 0: continue
        drop = spring(lt, 9, 5)
        y = WORD_BASE_Y - 420 * (1 - drop)
        land = math.exp(-6 * lt) * math.sin(lt * 18) if lt > 0.3 else 0
        sx, sy = 1 + 0.10 * land, 1 - 0.10 * land
        wv = 12 * math.sin((t - 4.6) * 5 - n * 0.55) if t > 4.6 else 0
        spr = L['spr']
        cx = WORD_X0 + L['pen'] - L['ox'] + spr.width / 2
        cy = y + spr.height / 2 + wv
        paste_scaled(f, spr, cx, cy + spr.height * (1 - sy) / 2, sx, sy)
    # hub tag slides up, a ball rolls across it
    pk = (t - T_PILL) / 0.5
    if pk > 0:
        s = spring(pk, 9, 5)
        paste_scaled(f, pill, PILL_X + pw / 2, PILL_Y + 65 + 80 * (1 - s), 0.6 + 0.4 * s, alpha=min(1, pk * 2))
        bk = (t - T_PILL - 0.15) / 0.9
        if 0 < bk < 1.4:
            bx = PILL_X - 60 + (pw + 120) * ease_out(min(1, bk))
            by = PILL_Y - 34 - 40 * abs(math.sin(bk * math.pi * 2.2)) * (1 - min(1, bk))
            paste_scaled(f, BALL, bx, by, 1, rot=-bk * 540, alpha=1 if bk < 1.1 else max(0, 1 - (bk - 1.1) / 0.3))
    # sparkles twinkle at the end
    if t > 4.8:
        for n in range(9):
            ph = n * 0.7
            a = max(0, math.sin((t - 4.8) * 4 + ph))
            x = (WORD_X0 + (n * 173) % int(WORD_W)) if n % 2 else 300 + n * 160
            y = 200 + (n * 97) % 600
            paste_scaled(f, star(36), x, y, 0.5 + 0.5 * a, alpha=a)
    # fade to black at the very end
    if t > DUR - 0.45:
        k = (t - (DUR - 0.45)) / 0.45
        f = Image.blend(f, Image.new('RGBA', (W, H), (0, 0, 0, 255)), min(1, k))
    return f.convert('RGB')

# ---------- sound (all synthesized here; no voice) ----------
SR = 44100
N = int(SR * DUR)
mix = np.zeros(N)

def add(sig, at):
    s = int(at * SR); e = min(N, s + len(sig))
    if s < N: mix[s:e] += sig[:e - s]

def tone(freq, dur, decay=6.0, harm=((1, 1.0), (2, 0.35), (3, 0.15)), vol=0.3):
    tt = np.arange(int(dur * SR)) / SR
    f0 = freq if callable(freq) else (lambda x: freq)
    ph = 2 * np.pi * np.cumsum(f0(tt)) / SR
    sig = sum(a * np.sin(h * ph) for h, a in harm)
    env = np.exp(-decay * tt) * np.minimum(1, tt / 0.004)
    return vol * sig * env

def noise(dur, vol=0.2):
    return vol * np.random.default_rng(1).uniform(-1, 1, int(dur * SR))

rng = np.random.default_rng(3)
# whoosh: noise swelling in, smoothed brighter over time
wn = rng.uniform(-1, 1, int(0.8 * SR))
k = np.linspace(1, 0, len(wn)) * 40 + 3
sm = np.array([wn[max(0, j - int(k[j])):j + 1].mean() for j in range(len(wn))])
add(0.5 * sm * np.sin(np.linspace(0, np.pi, len(sm))), 0.0)
# boing as Pip pops up
add(tone(lambda x: 260 + 220 * (1 - np.exp(-8 * x)) + 40 * np.sin(2 * np.pi * 9 * x) * np.exp(-5 * x), 0.5, decay=5, vol=0.25), 0.82)
# bubble stretching
add(tone(lambda x: 420 + 700 * x / 0.7, 0.7, decay=1.5, harm=((1, 1),), vol=0.08), 1.2)
# POP
pt = np.arange(int(0.09 * SR)) / SR
pop = 0.6 * np.sin(2 * np.pi * np.cumsum(1400 * np.exp(-30 * pt) + 250) / SR) * np.exp(-40 * pt)
pop[:int(0.012 * SR)] += rng.uniform(-0.4, 0.4, int(0.012 * SR))
add(pop, T_POP)
# sparkle chime on the logo
for n, fr in enumerate([1568, 2093, 2637, 3136]):
    add(tone(fr, 1.2, decay=3.5, harm=((1, 1), (2.76, 0.25)), vol=0.12), T_POP + 0.05 + n * 0.06)
# xylophone: one rising note per letter (major pentatonic)
scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3]
for n in range(len(WORD)):
    add(tone(scale[n], 0.5, decay=9, harm=((1, 1), (3.93, 0.3), (9.5, 0.08)), vol=0.22), LETTER_T0 + n * LETTER_DT + 0.12)
# ball rolling: soft taps
for n in range(6):
    add(tone(180 + 20 * n, 0.08, decay=40, harm=((1, 1),), vol=0.18), T_PILL + 0.2 + n * 0.12)
# ta-da: two bright chords
for fr in [392, 493.9, 587.3]:
    add(tone(fr, 0.25, decay=6, vol=0.10), T_PILL + 0.1)
for fr in [523.25, 659.25, 783.99, 1046.5]:
    add(tone(fr, 1.6, decay=1.8, vol=0.10), T_PILL + 0.32)
# sparkle tail
for n in range(10):
    add(tone(2400 + rng.uniform(0, 1600), 0.4, decay=8, harm=((1, 1),), vol=0.05), 4.9 + n * 0.11)
# soft bass bounce under it all
for n, fr in enumerate([130.8, 130.8, 174.6, 196.0, 130.8, 196.0]):
    add(tone(fr, 0.5, decay=5, harm=((1, 1), (2, 0.4)), vol=0.12), 0.85 + n * 0.62)
fade = np.ones(N); fl = int(0.45 * SR); fade[-fl:] = np.linspace(1, 0, fl)
mix = mix * fade
mix = 0.95 * mix / max(1e-6, np.abs(mix).max())
st = np.stack([mix, mix], -1)
with wave.open(OUT + '.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())

# ---------- render ----------
p = subprocess.Popen([FF, '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', OUT + '.wav',
                      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
                      '-shortest', '-movflags', '+faststart', OUT + '.mp4'], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
for i in range(int(DUR * FPS)):
    p.stdin.write(frame(i).tobytes())
p.stdin.close(); p.wait()
print('wrote', OUT + '.mp4')

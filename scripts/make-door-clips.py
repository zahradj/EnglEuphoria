"""Exact door motion for the U7L5 barn film (owner, 2026-10-09: everything moves; the AI kept opening the wrong door).

Builds 5 s clips from the approved, aligned Canva pictures bg-u7l5-barn-0..4 (no zoom, no pan of the picture):
  <snd>-sound.mp4  door k gives two small rattles (a sound behind it), every door stays shut
  <name>-door.mp4  door k swings open on its hinge, revealing the approved picture of the animal; the animal breathes
    python3 scripts/make-door-clips.py
"""
import math, subprocess
import numpy as np
from PIL import Image
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS, SEC = 1280, 720, 30, 5
OUT = 'public/lep1/video/clips/u7l5-barn'
DOORS = [(30.0, 42.5), (43.5, 56.0), (57.5, 70.0), (71.5, 84.5)]  # % of width; y 40-72 %
Y0, Y1 = 0.40, 0.72
pic = lambda k: Image.open(f'public/lep1/scenes/bg-u7l5-barn-{k}-wide.png').convert('RGB').resize((W, H), Image.LANCZOS)
ease = lambda x: 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, x)))

def box(k):
    x0, x1 = DOORS[k]
    return int(x0 / 100 * W), int(Y0 * H), int(x1 / 100 * W), int(Y1 * H)

def write(name, frames):
    p = subprocess.Popen([FF, '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', f'{OUT}/{name}.mp4'],
                         stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    for f in frames: p.stdin.write(f.tobytes())
    p.stdin.close(); p.wait(); print('wrote', name)

def sound_clip(k):
    """Door k rattles twice; nothing opens."""
    base = pic(k)  # picture with doors 1..k open; door k+1 (index k) shut
    x0, y0, x1, y1 = box(k)
    door = base.crop((x0, y0, x1, y1))
    for i in range(FPS * SEC):
        t = i / FPS
        f = base.copy()
        shake = 0
        for a, b in ((0.8, 1.8), (2.5, 3.5)):
            if a <= t <= b:
                shake = 3.0 * math.sin((t - a) * 2 * math.pi * 7) * math.sin(math.pi * (t - a) / (b - a))
        if shake:
            f.paste(door, (x0 + int(round(shake)), y0))
        yield f

def door_clip(k):
    """Door k swings open (hinge on its left edge), then the animal breathes."""
    A, B = pic(k), pic(k + 1)
    x0, y0, x1, y1 = box(k)
    dw, dh = x1 - x0, y1 - y0
    shut = A.crop((x0, y0, x1, y1))
    mask_full = np.zeros((H, W), np.float32); mask_full[y0:y1, x0:x1] = 1
    a_np, b_np = np.asarray(A, np.float32), np.asarray(B, np.float32)
    inner = B.crop((x0 + 4, y0 + 4, x1 - 4, y1))
    for i in range(FPS * SEC):
        t = i / FPS
        # 0-1.4 s door swings; 1.4-2.2 s the rest of the picture settles into the approved end picture
        swing = ease((t - 0.3) / 1.1)
        settle = ease((t - 1.4) / 0.8)
        frame = a_np * (1 - settle) + b_np * settle
        frame[y0:y1, x0:x1] = b_np[y0:y1, x0:x1]  # inside the doorway: the approved open door + animal
        f = Image.fromarray(frame.clip(0, 255).astype(np.uint8))
        if swing < 1:
            pw = max(2, int(dw * (1 - 0.88 * swing)))  # the door panel narrows as it turns on the hinge
            panel = shut.resize((pw, dh), Image.LANCZOS)
            shade = Image.new('RGB', panel.size, (0, 0, 0))
            panel = Image.blend(panel, shade, 0.35 * swing)
            f.paste(panel, (x0, y0))
        elif t > 2.2:
            s = 1 + 0.012 * math.sin((t - 2.2) * 2 * math.pi / 1.6)  # the animal breathes
            iw, ih = inner.size
            big = inner.resize((int(iw * s), int(ih * s)), Image.LANCZOS)
            f.paste(big.crop((0, big.size[1] - ih, iw, big.size[1])) if s >= 1 else big, (x0 + 4, y0 + 4))
        yield f

if __name__ == '__main__':
    for k, snd in enumerate(['moo', 'oink', 'baa', 'quack']):
        write(f'{snd}-sound', sound_clip(k))
    for k, name in enumerate(['cow', 'pig', 'sheep', 'duck']):
        write(f'{name}-door', door_clip(k))

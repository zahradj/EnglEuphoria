"""Story film from still pictures (lessons without real clips).

Owner's rule (2026-10-03): NO zoom / pan / Ken Burns on stills — ffmpeg's
zoompan moves in whole-pixel steps and the picture visibly shakes. Each
picture holds perfectly still and cross-fades softly into the next.

    python3 scripts/make-stills-film.py public/lep1/video/<name> '[["bg-a-wide.png", 0], ["bg-b-wide.png", 5], ...]'

Pages are [picture in public/lep1/scenes, start second]; the film keeps those
start times (atSec in the lesson). Writes <name>.mp4 + <name>.webm, 1280x720."""
import json, subprocess, sys
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
out, pages = sys.argv[1], json.loads(sys.argv[2])
FPS, X, LAST = 30, 0.8, 6  # fade seconds; how long the last page holds
starts = [p[1] for p in pages]
inputs, filt = [], []
for i, (img, start) in enumerate(pages):
    hold = (starts[i + 1] - start if i + 1 < len(pages) else LAST) + (X if i + 1 < len(pages) else 0)
    inputs += ['-loop', '1', '-t', f'{hold:.3f}', '-i', 'public/lep1/scenes/' + img]
    filt.append(f'[{i}:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps={FPS},format=yuv420p,setsar=1[v{i}]')
prev = 'v0'
for i in range(1, len(pages)):
    filt.append(f'[{prev}][v{i}]xfade=transition=fade:duration={X}:offset={starts[i]:.3f}[x{i}]')
    prev = f'x{i}'
r = subprocess.run([FF, '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', f'[{prev}]', '-c:v', 'libx264', '-profile:v', 'main',
                    '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '22', '-movflags', '+faststart', '-r', str(FPS), out + '.mp4'], capture_output=True, text=True)
print('mp4', r.returncode, r.stderr[-400:] if r.returncode else '')
r = subprocess.run([FF, '-y', '-i', out + '.mp4', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', out + '.webm'], capture_output=True, text=True)
print('webm', r.returncode)

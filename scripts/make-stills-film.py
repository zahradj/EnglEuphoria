"""Story film from still pictures (lessons without real clips).

Owner's rule (2026-10-03): NO zoom / pan / Ken Burns on stills — ffmpeg's
zoompan moves in whole-pixel steps and the picture visibly shakes. Each
picture holds perfectly still and cross-fades softly into the next.

    python3 scripts/make-stills-film.py public/lep1/video/<name> '[["bg-a-wide.png", 0], ["bg-b-wide.png", 5], ...]'

Pages are [picture in public/lep1/scenes, start second]; the film keeps those
start times (atSec in the lesson). Writes <name>.mp4 + <name>.webm, 1280x720.

A page may also be an approved motion clip ("public/lep1/video/clips/<story>/<beat>.mp4"): it plays from its
first frame and its last frame holds if the page lasts longer than the clip. An optional third value is the
cross-fade (seconds) INTO that page (default 0.8) — e.g. a long fade from the start of a stir clip into the
mixed-paint picture."""
import json, subprocess, sys
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
out, pages = sys.argv[1], json.loads(sys.argv[2])
FPS, X, LAST = 30, 0.8, 6  # fade seconds; how long the last page holds
starts = [p[1] for p in pages]
fades = [p[2] if len(p) > 2 else X for p in pages]
inputs, filt = [], []
for i, page in enumerate(pages):
    img, start = page[0], page[1]
    hold = (starts[i + 1] - start + fades[i + 1]) if i + 1 < len(pages) else LAST
    if img.endswith('.mp4'):
        inputs += ['-t', f'{hold:.3f}', '-i', img]
        pad = f',tpad=stop_mode=clone:stop_duration={hold:.3f},trim=duration={hold:.3f}'
    else:
        inputs += ['-loop', '1', '-t', f'{hold:.3f}', '-i', 'public/lep1/scenes/' + img]
        pad = ''
    filt.append(f'[{i}:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps={FPS},format=yuv420p,setsar=1{pad}[v{i}]')
prev = 'v0'
for i in range(1, len(pages)):
    filt.append(f'[{prev}][v{i}]xfade=transition=fade:duration={fades[i]}:offset={starts[i]:.3f}[x{i}]')
    prev = f'x{i}'
r = subprocess.run([FF, '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', f'[{prev}]', '-c:v', 'libx264', '-profile:v', 'main',
                    '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '22', '-movflags', '+faststart', '-r', str(FPS), out + '.mp4'], capture_output=True, text=True)
print('mp4', r.returncode, r.stderr[-400:] if r.returncode else '')
r = subprocess.run([FF, '-y', '-i', out + '.mp4', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', out + '.webm'], capture_output=True, text=True)
print('webm', r.returncode)

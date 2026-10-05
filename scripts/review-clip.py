"""Frame-by-frame review aid for a generated story clip (video-quality-gate, STRICT MODE step 4).

    python3 scripts/review-clip.py <story key> <beat id>

Writes <clip>.review.png next to the clip:
  - the start picture, then a frame every 0.25 s, then the end picture (if the beat has one), labelled with times;
  - a motion strip: how much each frame changed from the one before (a spike = a jump, morph or flash).
Prints numbers that catch the failures we have seen:
  - START MATCH: first frame vs the approved start picture (low = the clip did not start from our picture);
  - END MATCH:   last frame vs the beat's endImage (low = the clip did not reach the pose the line asks for);
  - MOTION:      total and peak frame-to-frame change; "hold pose" beats must stay calm (no dancing, no marching).
The numbers only screen. A person still checks every frame against the checklist in src/lib/videoPolicy.ts
(hands/paws and finger count, faces, extra or missing limbs/characters, objects, background, text, the line's action).
PIL only (no numpy needed)."""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageChops, ImageDraw, ImageStat
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H = 320, 180          # thumbnail size
FPS = 4                  # frames per second sampled
HOLD_MOTION_MAX = 6.0    # mean abs change (0-255) per 0.25 s allowed in a hold-pose clip
MATCH_MIN = 0.80         # similarity (1 - mean abs diff / 255) a start/end frame must reach
POSE_MIN = 0.75          # pose progress the last frame must reach (measured only where start and end pictures differ)

key, beat_id = sys.argv[1], sys.argv[2]
story = json.load(open('scripts/story-videos.json'))[key]
beat = next(b for b in story['beats'] if b['id'] == beat_id)
clip = os.path.join(story['out'], f'{beat_id}.mp4')
if not os.path.exists(clip):
    sys.exit(f'no clip {clip}')

tmp = tempfile.mkdtemp()
subprocess.run([FF, '-v', 'error', '-i', clip, '-vf', f'fps={FPS},scale={W}:{H}', os.path.join(tmp, 'f%03d.png')], check=True)
frames = [Image.open(os.path.join(tmp, f)).convert('RGB') for f in sorted(os.listdir(tmp))]
if not frames:
    sys.exit('no frames decoded')

def thumb(path):
    return Image.open(path).convert('RGB').resize((W, H))

def similarity(a, b):
    d = ImageStat.Stat(ImageChops.difference(a, b)).mean
    return 1 - (sum(d) / len(d)) / 255

def change(a, b):
    d = ImageStat.Stat(ImageChops.difference(a, b)).mean
    return sum(d) / len(d)

def pose_progress(start_im, end_im, frame):
    """Only where the start and end pictures differ (the moving paws/bodies): 0 = still in the start pose, 1 = in the end pose."""
    mask = ImageChops.difference(start_im, end_im).convert('L').point(lambda v: 255 if v > 40 else 0)
    if not mask.getbbox():
        return None
    ds = sum(ImageStat.Stat(ImageChops.difference(frame, start_im), mask).mean)
    de = sum(ImageStat.Stat(ImageChops.difference(frame, end_im), mask).mean)
    return ds / (ds + de) if ds + de else 1.0

start = thumb(beat['image'])
end = thumb(beat['endImage']) if beat.get('endImage') else None
moves = [change(frames[i - 1], frames[i]) for i in range(1, len(frames))]
s_match = similarity(start, frames[0])
e_match = similarity(end, frames[-1]) if end else None
progress = pose_progress(start, end, frames[-1]) if end else None

problems = []
if s_match < MATCH_MIN:
    problems.append(f'START MATCH {s_match:.2f} < {MATCH_MIN}: the clip does not start from the approved picture')
if end is not None and e_match < MATCH_MIN:
    problems.append(f'END MATCH {e_match:.2f} < {MATCH_MIN}: the clip does not end in the pose the line asks for')
if progress is not None and progress < POSE_MIN:
    problems.append(f'POSE {progress:.2f} < {POSE_MIN}: where the bodies should move, the last frame is not in the end pose')
if beat.get('holdPose') and max(moves, default=0) > HOLD_MOTION_MAX:
    problems.append(f'MOTION peak {max(moves):.1f} > {HOLD_MOTION_MAX}: too much movement for a hold-pose clip (dancing/marching?)')
mean_move = sum(moves) / max(len(moves), 1)
peak_t = (moves.index(max(moves)) + 1) / FPS if moves else 0
for i in range(1, len(moves)):
    if moves[i] > 3 * max(mean_move, 1) and moves[i] > 8:
        problems.append(f'SPIKE at {(i + 1) / FPS:.2f}s ({moves[i]:.1f}): look for a jump, morph, flash or new limb here')

# Contact sheet: start | frames ... | end, 6 per row, plus the motion strip.
tiles = [('START picture', start)] + [(f'{i / FPS:.2f}s', f) for i, f in enumerate(frames)] + ([('END picture', end)] if end else [])
cols = 6
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (W + 6) + 6, rows * (H + 24) + 6 + 90), 'white')
dr = ImageDraw.Draw(sheet)
for n, (label, im) in enumerate(tiles):
    x, y = 6 + (n % cols) * (W + 6), 6 + (n // cols) * (H + 24)
    sheet.paste(im, (x, y + 18))
    dr.text((x, y + 2), label, fill=(200, 60, 0) if 'picture' in label else (0, 0, 0))
y0 = rows * (H + 24) + 10
dr.text((6, y0), f'motion per 0.25 s (peak {max(moves, default=0):.1f} at {peak_t:.2f}s, mean {mean_move:.1f})', fill=(0, 0, 0))
bw = (sheet.width - 12) / max(len(moves), 1)
for i, m in enumerate(moves):
    h = min(60, m * 4)
    dr.rectangle([6 + i * bw, y0 + 80 - h, 6 + (i + 1) * bw - 2, y0 + 80], fill=(220, 80, 40) if m > HOLD_MOTION_MAX else (80, 140, 220))
out = clip[:-4] + '.review.png'
sheet.save(out)

print(f'{key}/{beat_id}: "{beat.get("line", "")}"')
print(f'  frames {len(frames)}  START MATCH {s_match:.2f}' + (f'  END MATCH {e_match:.2f}  POSE {progress if progress is not None else 1:.2f}' if e_match is not None else '  (no end picture)'))
print(f'  MOTION mean {mean_move:.1f}  peak {max(moves, default=0):.1f} at {peak_t:.2f}s')
print('  ' + ('\n  '.join(problems) if problems else 'screen: no automatic flags — now check every frame by eye'))
print(f'  sheet: {out}')
sys.exit(1 if problems else 0)

"""Song video: sung verse takes joined into one song, one moving clip per sung line, word labels on top.

    python3 scripts/make-song-video.py scripts/song-videos/<name>.json

Spec (see scripts/song-videos/*.json):
  {"out": "public/lep1/video/<film>", "audioOut": "public/lep1/audio/<song>.mp3",
   "labelsFrom": [["scripts/film-labels/<story>-pages.json", "scripts/film-labels/<story>.json"]],
   "verses": [{"audio": "public/lep1/audio/<verse>.mp3", "lines": [[<line start s in the take>, "<clip.mp4>", {label}?], ...]}]}
  clip null = the line continues the previous shot; a label with "replace": true hides the reused story labels.

- Each take is trimmed to its music (leading intro of later verses, trailing silence) and levelled to the same loudness,
  then the verses are joined (docs/scenarios/*-song-video.md: one sung line = one shot).
- A clip shorter than its line never freezes: its last 1.5 s bounces back and forth (owner 2026-10-09: "everything
  moves"), so a throw or a door does not play backwards.
- Word labels are reused from the story film (`labelsFrom`): a word label shown during a clip there is shown at the
  same moment of that clip here (same spot, same word, spelled as taught). Karaoke words are left out: the lesson's
  song page shows the sung line.
Writes <out>.mp4/.webm (silent; the lesson plays the song), <audioOut>, <out>.review.mp4 (with the song, for the
owner) and prints lineDurationsMs for the scene."""
import json, os, re, subprocess, sys
import numpy as np
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.join(os.path.dirname(__file__), '..')
os.chdir(ROOT)
spec = json.load(open(sys.argv[1]))
TMP = os.path.join('/tmp', 'song-video-' + os.path.basename(spec['out']))
os.makedirs(TMP, exist_ok=True)


def run(*args):
    r = subprocess.run([FF, '-y', '-v', 'error', *args], capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr[-800:])


def duration(path):
    s = subprocess.run([FF, '-i', path], capture_output=True, text=True).stderr
    h, m, sec = re.search(r'Duration: (\d+):(\d+):([\d.]+)', s).groups()
    return int(h) * 3600 + int(m) * 60 + float(sec)


def music_span(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float)
    win = [20 * np.log10(np.sqrt(np.mean(a[i:i + 800] ** 2)) + 1) for i in range(0, len(a) - 800, 800)]
    loud = [i / 10 for i, x in enumerate(win) if x > 40]
    mean = 20 * np.log10(np.sqrt(np.mean(a ** 2)) + 1)
    return loud[0], loud[-1], mean


# 1. audio: trim, level, join
parts, offset, shots = [], 0.0, []
ref_level = None
for vi, verse in enumerate(spec['verses']):
    first, last, level = music_span(verse['audio'])
    ref_level = ref_level if ref_level is not None else level
    start = 0.0 if vi == 0 else max(first, verse['lines'][0][0] - 0.6)
    end = min(duration(verse['audio']), last + 0.6)
    part = f'{TMP}/v{vi}.wav'
    run('-i', verse['audio'], '-af', f'atrim={start:.2f}:{end:.2f},asetpts=N/SR/TB,volume={ref_level - level:.1f}dB,'
        f'afade=t=out:st={end - start - 0.4:.2f}:d=0.4', part)
    parts.append(part)
    for t, clip, *label in verse['lines']:
        shots.append([round(offset + max(0.0, t - start), 2), clip, *label])
    offset += end - start
total = round(offset, 2)
run(*sum([['-i', p] for p in parts], []), '-filter_complex', ''.join(f'[{i}:a]' for i in range(len(parts))) +
    f'concat=n={len(parts)}:v=0:a=1[a]', '-map', '[a]', '-c:a', 'libmp3lame', '-b:a', '128k', spec['audioOut'])
shots[0][0] = 0.0
starts = [s[0] for s in shots]  # every sung line (for lineDurationsMs)
shots = [s for s in shots if s[1]]  # clip null = the line continues the previous shot

# 2. clips: bounce the tail of a clip that is shorter than its line
pages = []
for i, (t, clip, *_) in enumerate(shots):
    need = (shots[i + 1][0] if i + 1 < len(shots) else total) - t + 0.5
    d = duration(clip)
    if d < need:
        tail = min(1.5, d)
        out = f'{TMP}/{i}-{os.path.basename(clip)}'
        reps = int((need - d) / tail) + 2
        # the whole clip, then its tail backwards, forwards, backwards... (each use of the tail is its own copy)
        segs = ('[0:v]split=2[a][t];[t]trim=start=%.3f,setpts=PTS-STARTPTS,split=%d' % (d - tail, reps) +
                ''.join(f'[s{k}]' for k in range(reps)) + ';')
        for k in range(reps):
            segs += f'[s{k}]{"reverse" if k % 2 == 0 else "null"}[x{k}];'
        segs += '[a]' + ''.join(f'[x{k}]' for k in range(reps)) + f'concat=n={reps + 1}:v=1[v]'
        run('-i', clip, '-filter_complex', segs, '-map', '[v]', '-an', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', out)
        clip = out
    pages.append([clip, t, 0 if i == 0 else 0.4])

# 3. labels reused from the story film
labels = []
for pages_file, labels_file in spec.get('labelsFrom', []):
    old_pages, old_labels = json.load(open(pages_file)), json.load(open(labels_file))
    for j, (clip, start, *_) in enumerate(old_pages):
        nxt = old_pages[j + 1][1] if j + 1 < len(old_pages) else 1e9
        mine = [l for l in old_labels if 'word' in l and start <= l['from'] < nxt]
        for i, (t, c, *own) in enumerate(shots):
            if os.path.basename(c) != os.path.basename(clip) or (own and own[0].get('replace')):
                continue
            end = (shots[i + 1][0] if i + 1 < len(shots) else total) - 0.2
            for l in mine:
                a, b = t + l['from'] - start, min(end, t + l['to'] - start)
                if b - a > 0.6:
                    labels.append({**l, 'from': round(a, 2), 'to': round(b, 2)})

# a line may bring its own label (3rd value: {"word", "at", "label"}), shown for the whole line
for i, (t, clip, *label) in enumerate(shots):
    if label:
        end = (shots[i + 1][0] if i + 1 < len(shots) else total) - 0.2
        labels.append({**{k: v for k, v in label[0].items() if k != 'replace'}, 'from': round(t + 0.4, 2), 'to': round(end, 2)})

# 4. film
env = dict(os.environ, FILM_LAST=f'{total - shots[-1][0]:.2f}')
r = subprocess.run(['python3', 'scripts/make-stills-film.py', f'{TMP}/raw', json.dumps(pages)], env=env, capture_output=True, text=True)
print(r.stdout.strip())
r = subprocess.run(['python3', 'scripts/label-video.py', f'{TMP}/raw.mp4', spec['out'], json.dumps(labels)], capture_output=True, text=True)
print(r.stdout.strip()[-300:])
run('-i', spec['out'] + '.mp4', '-i', spec['audioOut'], '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
    f'{TMP}/review.mp4')
print('song', total, 's  shots', len(shots), ' labels', len(labels))
print('lineDurationsMs:', [int(round((b - a) * 1000)) for a, b in zip(starts, starts[1:] + [total])])
print('review copy:', f'{TMP}/review.mp4')

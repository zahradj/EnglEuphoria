"""Exact line cue times of a song take, from the heard words (verify-song.py writes <take>.words.json).

    python3 scripts/song-line-times.py <song key> <take.mp3>

Aligns the lyric words to the heard words in order (difflib, so repeated words like "head, head" stay in their own
line), takes each line's first matched word (moved back by the words before it that were missed), keeps the cues
increasing and fills a line nobody heard from its neighbours. Prints the line starts and lineDurationsMs for the scene
(cue 0 = audio start, so the first line also covers the intro)."""
import difflib, json, pathlib, re, subprocess, sys
import imageio_ffmpeg

key, take = sys.argv[1], sys.argv[2]
lines = json.load(open('scripts/songs.json'))[key]['lines']
heard = json.loads(pathlib.Path(take).with_suffix('.words.json').read_text())
norm = lambda w: re.sub(r"(.)\1{2,}", r"\1", re.sub(r"[^a-z']", '', w.lower()))
lyric, line_of, pos = [], [], []
for i, line in enumerate(lines):
    for k, w in enumerate(x for x in (norm(y) for y in line.split()) if x):
        lyric.append(w); line_of.append(i); pos.append(k)
sm = difflib.SequenceMatcher(None, lyric, [h[0] for h in heard], autojunk=False)
first = {}
for b in sm.get_matching_blocks():
    for k in range(b.size):
        i = line_of[b.a + k]
        if i not in first:
            first[i] = max(0.0, heard[b.b + k][1] - 0.35 * pos[b.a + k])
starts = [first.get(i) for i in range(len(lines))]
for i in range(1, len(starts)):  # keep increasing
    if starts[i] is not None and starts[i - 1] is not None and starts[i] <= starts[i - 1]:
        starts[i] = None
s = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-i', take], capture_output=True, text=True).stderr
h, m, sec = re.search(r'Duration: (\d+):(\d+):([\d.]+)', s).groups()
total = int(h) * 3600 + int(m) * 60 + float(sec)
known = [(i, t) for i, t in enumerate(starts) if t is not None]
for i in range(len(starts)):  # fill gaps by interpolation
    if starts[i] is None:
        before = [(j, t) for j, t in known if j < i]
        after = [(j, t) for j, t in known if j > i]
        if before and after:
            (j0, t0), (j1, t1) = before[-1], after[0]
            starts[i] = t0 + (t1 - t0) * (i - j0) / (j1 - j0)
        elif before:
            starts[i] = before[-1][1] + 4.0 * (i - before[-1][0])
        else:
            starts[i] = max(0.0, after[0][1] - 4.0 * (after[0][0] - i))
starts = [round(t, 2) for t in starts]
print('missed lines:', [i + 1 for i in range(len(lines)) if i not in first] or 'none')
print('line starts:', starts)
cues = [0.0] + starts[1:]
print('lineDurationsMs:', [round((b - a) * 1000) for a, b in zip(cues, cues[1:] + [total])])

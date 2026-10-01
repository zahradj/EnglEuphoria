#!/usr/bin/env python3
"""
Transcribes song takes with Whisper and scores the SUNG words against the lyrics
in scripts/songs.json, then prints the real per-line cue start times (the
`lineDurationsMs` values the Song scene wants).

Usage:  python scripts/verify-song.py <key> <take.mp3> [<take.mp3> ...]
        e.g. python scripts/verify-song.py hello out/hello-take1.mp3 out/hello-take2.mp3

Needs:  pip install faster-whisper   (model base.en is fetched on first run)

Score = word-level similarity (0..1) between lyrics and transcript, plus a hard
check that no big block of extra words was sung. >= 0.85 and no extra block ->
safe to ship. Always eyeball the printed transcript as well: Whisper mishears
sung vowels occasionally.
"""
import json, re, sys, difflib, pathlib
from faster_whisper import WhisperModel

root = pathlib.Path(__file__).parent
songs = json.loads((root / "songs.json").read_text(encoding="utf-8"))
key, takes = sys.argv[1], sys.argv[2:]
lines = songs[key]["lines"]

def norm(w):
    w = re.sub(r"[^a-z']", "", w.lower())
    return re.sub(r"(.)\1{2,}", r"\1", w)  # "byeeee" -> "bye"

lyric_words, line_of = [], []
for i, line in enumerate(lines):
    for w in line.split():
        n = norm(w)
        if n:
            lyric_words.append(n); line_of.append(i)

model = WhisperModel("base.en", device="cpu", compute_type="int8")
for take in takes:
    segs, info = model.transcribe(take, word_timestamps=True, language="en",
                                  condition_on_previous_text=False)
    words = [(norm(w.word), w.start, w.end) for s in segs for w in s.words if norm(w.word)]
    heard = [w[0] for w in words]
    sm = difflib.SequenceMatcher(None, lyric_words, heard, autojunk=False)
    ratio = sm.ratio()
    matched = sum(b.size for b in sm.get_matching_blocks())
    extra = len(heard) - matched          # sung words that are not in the lyrics
    missing = len(lyric_words) - matched  # lyric words not heard
    # first matched word of each lyric line -> that line's start time
    starts = {}
    for b in sm.get_matching_blocks():
        for k in range(b.size):
            li = line_of[b.a + k]
            starts.setdefault(li, words[b.b + k][1])
    print(f"\n=== {take}  length={info.duration:.1f}s  score={ratio:.2f}  missing={missing}  extra={extra}")
    print("heard:", " ".join(heard))
    ordered = [starts.get(i) for i in range(len(lines))]
    print("line starts (s):", [None if s is None else round(s, 1) for s in ordered])
    if all(s is not None for s in ordered):
        # lineDurationsMs[i] = start[i+1]-start[i]; first line absorbs any intro,
        # last line runs to the end of the audio (cue 0 is always the audio start).
        cues = [0.0] + ordered[1:]
        durs = [round((cues[i + 1] - cues[i]) * 1000) for i in range(len(cues) - 1)]
        durs.append(round((info.duration - cues[-1]) * 1000))
        print("lineDurationsMs:", durs)

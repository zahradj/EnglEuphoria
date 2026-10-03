#!/usr/bin/env python3
"""Stitch a Pre-A1 Lesson 5 story film from its generated clips.

Reads scripts/story-videos.json[<key>]: every beat's clip <out>/<id>.mp4 is
muted, scaled to 1280x720 @30fps, trimmed to `beatSeconds` (default 8) with a
short fade in/out; a beat whose clip is missing falls back to a slow zoom on
its still picture (blueprint §3a "video pending"). Writes <film>.mp4 (H.264,
faststart) and <film>.webm next to it. Beat i starts at i * beatSeconds, which
is what the lesson's story-video `atSec` values must say.

  python3 scripts/stitch-story-video.py u2l5-shelly
"""
import json, os, subprocess, sys, tempfile
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
key = sys.argv[1]
story = json.load(open('scripts/story-videos.json'))[key]
secs = story.get('beatSeconds', 8)
film = story['film']
tmp = tempfile.mkdtemp()
parts = []
for i, b in enumerate(story['beats']):
    out = f'{tmp}/{i:02d}.mp4'
    clip = os.path.join(story['out'], b['id'] + '.mp4')
    fade = f'fade=t=in:st=0:d=0.4,fade=t=out:st={secs - 0.4}:d=0.4'
    if os.path.exists(clip):
        cmd = [FF, '-y', '-i', clip, '-an', '-vf', f'scale=1280:720,fps=30,format=yuv420p,{fade}', '-t', str(secs), '-c:v', 'libx264', '-profile:v', 'main', '-crf', '21', out]
        src = 'clip'
    else:
        n = secs * 30
        cmd = [FF, '-y', '-loop', '1', '-i', b['image'], '-vf', f"scale=2752:1536,zoompan=z='1+0.12*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1280x720:fps=30,format=yuv420p,{fade}", '-frames:v', str(n), '-c:v', 'libx264', '-profile:v', 'main', '-crf', '21', out]
        src = 'STILL (video pending)'
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit(f'{b["id"]}: {r.stderr[-400:]}')
    print(f'{i * secs:>3}s  {b["id"]}: {src}')
    parts.append(out)
with open(f'{tmp}/list.txt', 'w') as f:
    f.write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run([FF, '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list.txt', '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', film + '.mp4'], check=True, capture_output=True)
subprocess.run([FF, '-y', '-i', film + '.mp4', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', film + '.webm'], check=True, capture_output=True)
print('wrote', film + '.mp4', round(os.path.getsize(film + '.mp4') / 1e6, 1), 'MB')

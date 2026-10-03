"""Living game backgrounds: turns each Higgsfield clip of a game picture
(scripts/story-videos.json, key "<lesson>-loops", e.g. u2l6-loops) into a
seamless loop — played forwards then backwards ("ping-pong"), so the last
frame meets the first — at 1280x720, muted, small enough for the web.

    python3 scripts/make-game-loops.py u2l6-loops

Writes public/lep1/video/loops/<lesson>-<beat id>.mp4 (e.g. u2l6-river.mp4).
Games use it as `bgVideo` over the still picture (LivingBg in gameFx.tsx)."""
import json, os, subprocess, sys
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
key = sys.argv[1]
cfg = json.load(open('scripts/story-videos.json'))[key]
lesson = key.rsplit('-loops', 1)[0]
os.makedirs('public/lep1/video/loops', exist_ok=True)
for beat in cfg['beats']:
    src = os.path.join(cfg['out'], beat['id'] + '.mp4')
    if not os.path.exists(src):
        print('missing clip', src); continue
    out = f"public/lep1/video/loops/{lesson}-{beat['id']}.mp4"
    vf = ('[0:v]trim=0:4.8,setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=increase,'
          'crop=1280:720,fps=24,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[v]')
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src, '-filter_complex', vf, '-map', '[v]', '-an',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
    print('wrote', out, round(os.path.getsize(out) / 1e6, 1), 'MB')

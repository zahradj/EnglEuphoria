"""YouTube version of a song video: the channel opening (logo intro), then the song video with its song.

    python3 scripts/make-youtube-version.py <song video with sound.mp4> <out.mp4> [opening.mp4]

The opening defaults to public/brand/channel-opening-playground.mp4 (scripts/make-channel-opening.py). Both parts are
scaled to 1920x1080, 30 fps, AAC 44.1 kHz stereo and joined with a short fade from the opening into the song."""
import re, subprocess, sys
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
video, out = sys.argv[1], sys.argv[2]
opening = sys.argv[3] if len(sys.argv) > 3 else 'public/brand/channel-opening-playground.mp4'


def duration(path):
    s = subprocess.run([FF, '-i', path], capture_output=True, text=True).stderr
    h, m, sec = re.search(r'Duration: (\d+):(\d+):([\d.]+)', s).groups()
    return int(h) * 3600 + int(m) * 60 + float(sec)


d0, fade = duration(opening), 0.5
norm_v = 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p,setsar=1'
norm_a = 'aformat=sample_rates=44100:channel_layouts=stereo'
filt = (f'[0:v]{norm_v}[v0];[1:v]{norm_v}[v1];[0:a]{norm_a}[a0];[1:a]{norm_a}[a1];'
        f'[v0][v1]xfade=transition=fade:duration={fade}:offset={d0 - fade:.3f}[v];'
        f'[a0][a1]acrossfade=d={fade}[a]')
r = subprocess.run([FF, '-y', '-v', 'error', '-i', opening, '-i', video, '-filter_complex', filt, '-map', '[v]', '-map', '[a]',
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
                    '-movflags', '+faststart', out], capture_output=True, text=True)
print('ok' if r.returncode == 0 else r.stderr[-600:], out, f'{duration(out):.1f} s' if r.returncode == 0 else '')

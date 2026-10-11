"""Re-time (and shrink) an animated GIF exported from Canva. Canva holds every page for 5 s and the API cannot set
page timing, so the frames are kept exactly as Canva drew them and only the frame time and size change.

  python3 scripts/retime-gif.py <in.gif> <out.gif> <ms per frame> [<size px>=600]
"""
import sys
from PIL import Image, ImageSequence

src, dst, ms = sys.argv[1], sys.argv[2], int(sys.argv[3])
size = int(sys.argv[4]) if len(sys.argv) > 4 else 600
im = Image.open(src)
frames = [f.convert('RGB').resize((size, size), Image.LANCZOS) for f in ImageSequence.Iterator(im)]
import os, tempfile
tmp = tempfile.NamedTemporaryFile(suffix='.gif', delete=False).name  # src may be dst: read first, write after
frames[0].save(tmp, save_all=True, append_images=frames[1:], duration=ms, loop=0)
os.replace(tmp, dst)
print(dst, len(frames), 'frames', ms, 'ms', size, 'px')

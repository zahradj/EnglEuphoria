#!/usr/bin/env python3
"""A1 U9L4 story pages, composed (not generated): the Gemini tower room + the castle's existing cut-out stickers.

Edits of ONE base picture, so the room, the light and the cast stay identical page to page (CLAUDE.md picture rules:
pictures from Canva/Gemini, stickers cut out; this script only places them). Run: python3 scripts/compose-tower-story.py
"""
from PIL import Image

MC = 'public/magic-castle'
ROOM = f'{MC}/scenes/bg-castle-tower-empty.png'
S = {
    'wim': f'{MC}/scenes/sticker-wim.png', 'cat': f'{MC}/scenes/sticker-catcat.png',
    'bed': f'{MC}/stickers/bed.png', 'lamp': f'{MC}/stickers/lamp.png', 'armchair': f'{MC}/stickers/armchair.png',
    'crown': f'{MC}/stickers/crown.png', 'ball': 'public/lep1/items/item-ball.png', 'book': 'public/lep1/items/item-book.png',
}


def put(base, key, cx, bottom, h, flip=False):
    """Place sticker `key` with its bottom-centre at (cx, bottom) (fractions of the room), `h` = height fraction."""
    im = Image.open(S[key]).convert('RGBA')
    im = im.crop(im.getchannel('A').getbbox())
    H = int(base.height * h); W = int(im.width * H / im.height)
    im = im.resize((W, H), Image.LANCZOS)
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    base.alpha_composite(im, (int(base.width * cx - W / 2), int(base.height * bottom - H)))


def furnished(base):
    put(base, 'lamp', 0.33, 0.80, 0.23)
    put(base, 'bed', 0.50, 0.85, 0.38)
    put(base, 'lamp', 0.67, 0.80, 0.23)
    put(base, 'armchair', 0.865, 0.96, 0.25)


def page(n):
    base = Image.open(ROOM).convert('RGBA')
    if n == 1:  # This is Wim's tower room. There is a big bed. There are two lamps.
        furnished(base)
        put(base, 'cat', 0.45, 0.985, 0.20)
        put(base, 'wim', 0.27, 0.99, 0.46)
    elif n == 2:  # Oh no! Where is my crown? … It's in front of the door!
        put(base, 'lamp', 0.33, 0.80, 0.23)
        put(base, 'bed', 0.50, 0.85, 0.38)
        put(base, 'cat', 0.645, 0.83, 0.15)           # Cat-cat peeks out between the bed and the lamp
        put(base, 'lamp', 0.67, 0.80, 0.23)
        put(base, 'armchair', 0.865, 0.96, 0.25)
        put(base, 'ball', 0.52, 0.62, 0.075)          # a ball on the bed
        put(base, 'book', 0.44, 0.965, 0.075)         # a book on the floor
        put(base, 'crown', 0.115, 0.87, 0.085)        # the crown in front of the door
        put(base, 'wim', 0.235, 0.99, 0.46, flip=True)
    else:  # Whose ball is it? It's Cat-cat's ball! … Wim has his crown.
        furnished(base)
        put(base, 'cat', 0.50, 0.985, 0.20)
        put(base, 'ball', 0.575, 0.985, 0.085)
        put(base, 'wim', 0.27, 0.99, 0.46)
        put(base, 'crown', 0.338, 0.745, 0.085)       # Wim holds up his crown
    out = f'{MC}/scenes/bg-castle-tower-p{n}.png'
    base.convert('RGB').save(out, optimize=True)
    print(out)


if __name__ == '__main__':
    for n in (1, 2, 3):
        page(n)

"""Plan + insert the Blend It! (sound-blend) page into every Pre-A1 lesson from Unit 1 Lesson 4 on (owner,
2026-10-11: "add a blending sounds game for the student to start reading"; blueprint slot 14: universal).

Words use ONLY letter sounds the child has met in a sound-model page up to that lesson (vowels: a from U1L3,
o from U3L5, e from U4L1), have a picture in public/lep1/items, favour the newest sound, and avoid the
previous lesson's words. The page goes right after the lesson's last phonics page (or before the sticker).

  python3 scripts/plan-blend-rollout.py          # print the plan
  python3 scripts/plan-blend-rollout.py --apply  # insert the pages into unit1/scenes.ts (idempotent)
"""
import json, os, re, sys

SCENES = 'src/content/playground-library/unit1/scenes.ts'
# Letters modelled per lesson (sound-model pages), in teaching order.
TAUGHT = {
    (1, 1): 'hm', (1, 2): 'wn', (1, 3): 'as', (1, 4): 'bt',
    (2, 1): 'ryb', (2, 2): 'g', (2, 3): 'c', (3, 1): 'd', (3, 2): 't', (3, 3): 'k', (3, 4): 'p', (3, 5): 'o',
    (4, 1): 'e', (4, 2): 'n', (4, 3): 'f', (4, 4): 'b', (4, 5): 't', (5, 2): 's', (5, 3): 'g', (5, 5): 'd',
    (6, 1): 'k', (8, 3): 'p', (9, 1): 'd', (9, 3): 't', (9, 4): 'p', (9, 5): 'w',
    (10, 1): 'rj', (10, 2): 'i', (10, 3): 'l',
}
POOL = ['hat', 'bat', 'mat', 'man', 'ham', 'rat', 'cat', 'can', 'cab', 'cap', 'map', 'pan', 'tap', 'bag', 'fan',
        'pot', 'top', 'mop', 'dog', 'rod', 'cob', 'bed', 'hen', 'ten', 'net', 'pen', 'web', 'peg', 'jam', 'jet', 'pig', 'pin', 'bin', 'wig', 'lid', 'log']
LOOKS = ['train', 'frog', 'slide', 'gumball']
PHONICS = {'sound-model', 'sound-sort', 'sound-pop', 'brick-crush', 'alphabet-blocks', 'trace', 'basket', 'dash', 'sound-pick'}

src = open(SCENES).read()
lessons = []
for u in range(1, 11):
    for l in range(1, 8):
        name = f'LESSON_{l}_SCENES' if u == 1 else f'LESSON_U{u}L{l}_SCENES'
        if f'export const {name}: Scene[] = [' in src:
            lessons.append((u, l, name))

def blocks(name):
    """Top-level scene objects of a lesson array: (start, end, text)."""
    i = src.index(f'export const {name}: Scene[] = [') + len(f'export const {name}: Scene[] = [')
    out, depth, start, k, q = [], 0, None, i, None
    while True:
        ch = src[k]
        if q:
            if ch == '\\': k += 2; continue
            if ch == q: q = None
        elif src.startswith('//', k): k = src.index('\n', k); continue  # comments may hold apostrophes
        elif src.startswith('/*', k): k = src.index('*/', k) + 2; continue
        elif ch in '\'"`': q = ch
        elif ch == '{':
            if depth == 0: start = k
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: out.append((start, k + 1, src[start:k + 1]))
        elif ch == ']' and depth == 0:
            return out, k
        k += 1

known, used, prev, plan = set(), {w: 0 for w in POOL}, [], []
for u, l, name in lessons:
    new = TAUGHT.get((u, l), '')
    known |= set(new)
    if (u, l) < (1, 4):
        continue
    cand = [w for w in POOL if set(w) <= known and os.path.exists(f'public/lep1/items/item-{w}.png')]
    n = 3 if u <= 3 else 4
    cand.sort(key=lambda w: (-sum(ch in new for ch in set(w)), w in prev, used[w], POOL.index(w)))
    words = cand[:n]
    for w in words: used[w] += 1
    prev = words
    plan.append((u, l, name, new, words))

if '--apply' not in sys.argv:
    for u, l, name, new, words in plan:
        print(f'U{u}L{l} new={new or "-":4} {words}')
    sys.exit()

for u, l, name, new, words in reversed(plan):  # from the end so offsets stay valid
    bl, _ = blocks(name)
    if any("kind: 'sound-blend'" in t for _, _, t in bl):
        continue
    kinds = [re.search(r"kind: '([^']+)'", t).group(1) for _, _, t in bl]
    idx = max([i for i, k in enumerate(kinds) if k in PHONICS], default=None)
    if idx is None:  # no phonics page: before the sticker / home mission / goodbye song / finale
        idx = next(kinds.index(k) for k in ('sticker-reward', 'home-mission', 'song', 'finale') if k in kinds and (k != 'song' or kinds.count('song') > 1)) - 1
        if kinds[idx] == 'song' or idx < 0:
            idx = max(0, idx)
    bg = re.search(r"\bbg: ([^,\n]+),", bl[idx][2]) or re.search(r"\bbg: ([^,\n]+),", bl[idx - 1][2])
    lid = 'u1l%d' % l if u == 1 else f'u{u}l{l}'
    # vary the world (owner 2026-10-11: "do not just use the train"): continue the train/frog/slide/gumball rotation
    look = LOOKS[src.count("kind: 'sound-blend'") % len(LOOKS)]
    look_txt = '' if look == 'train' else f" look: '{look}',"
    teacher = {'train': 'Tap each car and say the sound', 'frog': 'Tap each stepping stone and say the sound', 'slide': 'Tap each ball on the slide and say the sound', 'gumball': 'Tap each gumball and say the sound'}[look]
    rounds = ', '.join(f"{{ word: '{w}', img: `${{A}}/items/item-{w}.png` }}" for w in words)
    page = (f"\n  {{\n    // Blend It! (blueprint slot 14, owner 2026-10-11): words made only of sounds the child has met.\n"
            f"    id: '{lid}-blend', kind: 'sound-blend',{look_txt} bg: {bg.group(1)},\n"
            f"    teacher: 'Blend It! {teacher}, press Blend!, then find the picture. Every word uses sounds we know.',\n"
            f"    rounds: [{rounds}],\n  }},")
    end = bl[idx][1] + (1 if src[bl[idx][1]] == ',' else 0)
    src = src[:end] + page + src[end:]
open(SCENES, 'w').write(src)
print('inserted', len(plan), 'pages')

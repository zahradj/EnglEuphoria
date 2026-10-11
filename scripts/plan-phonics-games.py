"""Add a phonics GAME to every Pre-A1 lesson that had none (owner, 2026-10-11: "in a lot of lessons there are
no phonic sound games … add them in all lessons, be creative"). Three new picture-first games rotate so two
lessons in a row never get the same one: sound-mole (whack-a-mole), letter-monsters (feed the monster with the
first letter), sound-fish (catch the fish). Letters = the lesson's new sound + review sounds of its unit.
Never c and k in one game (same sound). Inserted after the lesson's last phonics page (sound-model, trace…),
before Blend It!; idempotent (id '<lesson>-phonics').

  python3 scripts/plan-phonics-games.py [--apply]
"""
import re, sys

SCENES = 'src/content/playground-library/unit1/scenes.ts'
POOL = {  # recognisable pictures per first sound: word -> item file
    'b': {'ball': 'ball', 'banana': 'banana', 'bear': 'bear', 'bed': 'bed', 'bee': 'bee', 'bird': 'bird', 'book': 'book'},
    'c': {'cat': 'cat', 'car': 'car', 'cake': 'cake', 'cow': 'cow', 'cookie': 'cookie', 'carrot': 'carrot'},
    'k': {'key': 'key', 'kite': 'kite', 'kangaroo': 'kangaroo', 'kitten': 'kitten'},
    'g': {'goat': 'goat', 'gift': 'gift', 'grapes': 'grapes', 'guitar': 'guitar'},
    'r': {'rabbit': 'rabbit', 'rainbow': 'rainbow', 'robot': 'robot', 'rocket': 'rocket', 'ring': 'ring'},
    'wh': {'whale': 'whale', 'wheel': 'wheel', 'whistle': 'whistle'},
    'sh': {'sheep': 'sheep', 'shell': 'shell', 'ship': 'ship', 'shoes': 'shoes-blue'},
    'd': {'dog': 'dog', 'doll': 'doll', 'door': 'door', 'duck': 'duck-yellow'},
    't': {'teddy': 'teddy', 'table': 'table', 'train': 'train', 'tree': 'tree'},
    'p': {'pig': 'pig', 'pizza': 'pizza', 'pen': 'pen', 'plane': 'plane', 'pumpkin': 'pumpkin'},
    'e': {'egg': 'egg', 'elephant': 'elephant'},
    'n': {'nest': 'nest', 'net': 'net', 'nose': 'nose', 'nut': 'nut'},
    'f': {'fish': 'fish', 'fan': 'fan', 'frog': 'frog', 'feather': 'feather', 'flag': 'flag'},
    's': {'sun': 'sun', 'snake': 'snake', 'sofa': 'sofa', 'star': 'star-gold'},
    'ch': {'chair': 'chair', 'cheese': 'cheese', 'chicken': 'chicken', 'cherries': 'cherries'},
    'h': {'hat': 'hat', 'horse': 'horse', 'hen': 'hen', 'house': 'house'},
    'm': {'moon': 'moon', 'mouse': 'mouse', 'milk': 'milk', 'mop': 'mop'},
    'a': {'apple': 'apple', 'ant': 'ant', 'alligator': 'alligator'},
}
PLAN = [  # (unit, lesson, letters: new sound first)
    (2, 2, ['g', 'b', 'r']), (2, 4, ['wh', 'g', 'c']), (2, 5, ['sh', 'wh', 'c']), (2, 6, ['r', 'g', 'sh']),
    (3, 1, ['d', 'b', 't']), (3, 2, ['t', 'd', 'b']), (3, 6, ['k', 'p', 't']), (4, 6, ['e', 'n', 'f']),
    (5, 1, ['m', 'd', 'b']), (5, 6, ['s', 'g', 'd']), (6, 3, ['k', 'ch', 'b']), (6, 5, ['ch', 'k', 'd']),
    (6, 6, ['k', 'ch', 's']), (7, 5, ['c', 'd', 'p', 'h']), (7, 6, ['d', 'c', 'h']), (8, 6, ['a', 'b', 'm']),
    (9, 1, ['d', 'sh', 'p']),
]
KINDS = ['sound-mole', 'letter-monsters', 'sound-fish']
# Unit reviews (lesson 6) must not repeat the same slot of the unit before (lessonVariety stale-slot rule).
OVERRIDE = {(3, 6): 'sound-fish', (6, 6): 'letter-monsters'}
COLORS = ['#8BD450', '#FF9F43', '#A78BFA', '#4FC3F7']
PHONICS = {'sound-model', 'trace', 'dash', 'basket', 'sound-sort', 'sound-pop', 'brick-crush', 'alphabet-blocks', 'alphabet-order', 'word-build', 'sound-pick'}

def pic(letter, word):
    return f"{{ word: '{word}', img: `${{A}}/items/item-{POOL[letter][word]}.png` }}"

def words(letter, n, skip=0):
    w = list(POOL[letter])
    return [w[(skip + i) % len(w)] for i in range(n)]

def page(kind, lid, letters, bg, k):
    head = f"  {{\n    // Phonics game (owner 2026-10-11): {', '.join(letters)}.\n    id: '{lid}-phonics', kind: '{kind}', bg: {bg}, who: 'pip',\n"
    if kind == 'sound-mole':
        rounds = []
        for i, L in enumerate(letters[:2]):
            others = [o for o in letters if o != L]
            pics = [pic(L, w) for w in words(L, 3, k)] + [pic(o, w) for j, o in enumerate(others) for w in words(o, 2 if len(others) == 1 else 1, k + j)][:3]
            rounds.append(f"{{ letter: '{L}', pictures: [{', '.join(pics)}] }}")
        return head + "    teacher: 'Sound Moles! Listen to the sound, then bonk every mole whose picture starts with it. Say each word!',\n" + \
            "    rounds: [\n      " + ',\n      '.join(rounds) + ",\n    ],\n  },"
    if kind == 'letter-monsters':
        mons = ', '.join(f"{{ letter: '{L}', color: '{COLORS[i]}' }}" for i, L in enumerate(letters[:3]))
        cards = []
        for r in range(2):
            for i, L in enumerate(letters[:3]):
                cards.append(pic(L, words(L, 1, k + r * 2 + i)[0]))
        cards = cards[::2] + cards[1::2]  # mix the letters
        return head + "    teacher: 'Hungry Letter Monsters! Say the word, listen to its first sound, and feed it to the monster with that letter. Tap a tummy to hear its sound.',\n" + \
            f"    monsters: [{mons}],\n    cards: [{', '.join(cards)}],\n  }},"
    rounds = []
    for i, L in enumerate(letters[:3]):
        others = [o for o in letters if o != L]
        fish = [pic(L, words(L, 1, k + i)[0])] + [pic(o, words(o, 1, k + i + j + 1)[0]) for j, o in enumerate(others)]
        while len(fish) < 4:
            o = others[len(fish) % len(others)]; fish.append(pic(o, words(o, 1, k + len(fish) + 3)[0]))
        fish = fish[i % 4:] + fish[:i % 4]  # the right fish is not always first
        rounds.append(f"{{ letter: '{L}', fish: [{', '.join(dict.fromkeys(fish))}] }}")
    return head + "    teacher: 'Sound Fishing! Listen to the sound and catch the fish whose picture starts with it. Say the word!',\n" + \
        "    rounds: [\n      " + ',\n      '.join(rounds) + ",\n    ],\n  },"

src = open(SCENES).read()
def blocks(name):
    i = src.index(f'export const {name}: Scene[] = [') + len(f'export const {name}: Scene[] = [')
    out, depth, start, k, q = [], 0, None, i, None
    while True:
        ch = src[k]
        if q:
            if ch == '\\': k += 2; continue
            if ch == q: q = None
        elif src.startswith('//', k): k = src.index('\n', k); continue
        elif src.startswith('/*', k): k = src.index('*/', k) + 2; continue
        elif ch in '\'"`': q = ch
        elif ch == '{':
            if depth == 0: start = k
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: out.append((start, k + 1, src[start:k + 1]))
        elif ch == ']' and depth == 0: return out
        k += 1

for n, (u, l, letters) in reversed(list(enumerate(PLAN))):
    kind = OVERRIDE.get((u, l), KINDS[n % 3])
    if 'c' in letters and 'k' in letters: raise SystemExit(f'U{u}L{l}: c and k together')
    name = f'LESSON_U{u}L{l}_SCENES'
    print(f'U{u}L{l}: {kind} {letters}')
    if '--apply' not in sys.argv: continue
    bl = blocks(name)
    if any(f"id: 'u{u}l{l}-phonics'" in t for _, _, t in bl): continue
    kinds = [re.search(r"kind: '([^']+)'", t).group(1) for _, _, t in bl]
    idx = max([i for i, k2 in enumerate(kinds) if k2 in PHONICS], default=None)
    if idx is None:
        idx = (kinds.index('sound-blend') if 'sound-blend' in kinds else kinds.index('sticker-reward') if 'sticker-reward' in kinds else len(kinds) - 2) - 1
    bg = re.search(r"\bbg: ([^,\n]+),", bl[idx][2]) or re.search(r"\bbg: ([^,\n]+),", bl[idx + 1][2])
    end = bl[idx][1] + (1 if src[bl[idx][1]] == ',' else 0)
    src = src[:end] + '\n' + page(kind, f'u{u}l{l}', letters, bg.group(1), n) + src[end:]
if '--apply' in sys.argv:
    open(SCENES, 'w').write(src); print('applied')

"""Lyric gate for lesson songs: do the words fit the beat, the rhyme and the lesson? (.claude/skills/kids-song-writer)

    python3 scripts/check-lyrics.py <song key> [<song key> ...]     # keys in scripts/songs.json that have "sections"

A song entry that uses the gate:
  "bpm": 112, "beatsPerLine": 4, "barsPerLine": 2, "key": "C major", "targetWords": ["cow", "farm"],
  "sections": [{"name": "Verse 1", "rhyme": "AABB", "lines": [...]}, {"name": "Chorus", "rhyme": "ABAB", "lines": [...]}]

Checks (exit 1 on any FAIL):
  - BEATS    every line has exactly `beatsPerLine` stressed syllables (content words + stressed syllables of long words,
             CMU pronouncing dictionary; small function words are unstressed unless the line needs them)
  - SPEED    syllables per line fit the time a line gets (barsPerLine bars of 4/4 at bpm): <= 2 syllables per beat,
             and >= beatsPerLine (no line so thin the singer has to stretch every word)
  - MATCH    lines in the same place of sections with the same name type (Verse 1/Verse 2...) differ by <= 1 syllable
             and have the same stress count, so every verse sings to the same tune
  - RHYME    the section's rhyme scheme: lines with the same letter end in a perfect, family or additive rhyme
             (same stressed vowel; the consonants after it the same or of the same family); identical words = WARN
  - WORDS    every target word is sung >= 3 times
  - LENGTH   whole song (sections at bpm) <= 75 s for Pre-A1
Words the dictionary doesn't know (oink, E-I-E-I-O...) come from SPECIAL below."""
import json, re, sys
import pronouncing

FUNCTION = set('a an the and or but of to in on at for with by from up as is am are was be it its it\'s i my me we our you your '
               'he his him she her they them their this that these those there here so too not no do does can will just '
               'then than what where who how oh let\'s let us like'.split())
# word -> (syllables, stresses) for words the CMU dictionary lacks or gets wrong for singing
SPECIAL = {'oink': (1, '1'), 'baa': (1, '1'), 'moo': (1, '1'), 'quack': (1, '1'), 'e-i-e-i-o': (5, '10101'),
           'e-i': (2, '10'), 'e-i-o': (3, '101'), 'yippee': (2, '01'), 'ta-da': (2, '01'), 'grandpa': (2, '10'),
           'grandpa\'s': (2, '10'), 'cream': (1, '0'), 'tum': (1, '1'), 'meow': (1, '1'), 'goodnight': (2, '01'), 'isn\'t': (2, '10'), 'where\'s': (1, '1'), 'it\'s': (1, '0'), 'i\'m': (1, '0')}
FAMILIES = [set('P B T D K G'.split()), set('F V TH DH S Z SH ZH'.split()), set('M N NG'.split()), set(['L', 'R']), set(['CH', 'JH'])]


def words(line):
    return [w for w in re.findall(r"[a-z][a-z'\-]*", line.lower().replace('’', "'")) if w.strip("-'")]


def word_info(w):
    if w in SPECIAL:
        return SPECIAL[w]
    p = pronouncing.phones_for_word(w)
    if not p and '-' in w:
        parts = [word_info(x) for x in w.split('-') if x]
        return sum(a for a, _ in parts), ''.join(b for _, b in parts)
    if not p:
        return None
    st = pronouncing.stresses(p[0])
    return len(st), st


def scan(line):
    """(syllables, content stresses, stresses possible if small words take a beat, unknown words)"""
    syl, beats, light, unknown = 0, 0, 0, []
    for w in words(line):
        info = word_info(w)
        if info is None:
            unknown.append(w)
            continue
        n, st = info
        syl += n
        if (w in FUNCTION and n == 1) or '1' not in st:
            light += 1
            continue
        beats += st.count('1')
    return syl, beats, beats + light, unknown


def rhyme_part(w):
    w = w.strip("-'")
    if w in SPECIAL:
        return {'oink': 'OY1 NG K', 'baa': 'AA1', 'moo': 'UW1', 'quack': 'AE1 K', 'e-i-e-i-o': 'OW1', 'e-i-o': 'OW1',
                'yippee': 'IY1', 'ta-da': 'AA1', 'grandpa': 'AA1', 'meow': 'AW1'}.get(w)
    p = pronouncing.phones_for_word(w)
    return pronouncing.rhyming_part(p[0]) if p else None


def rhymes(a, b):
    if a == b:
        return 'identical'
    ra, rb = rhyme_part(a), rhyme_part(b)
    if not ra or not rb:
        return 'unknown'
    va, *ca = ra.split(); vb, *cb = rb.split()
    if va.rstrip('012') != vb.rstrip('012'):
        return 'no'
    if ca == cb:
        return 'perfect'
    if len(ca) == len(cb) and all(x == y or any(x in f and y in f for f in FAMILIES) for x, y in zip(ca, cb)):
        return 'family'
    if ca[:len(cb)] == cb or cb[:len(ca)] == ca:
        return 'additive'
    return 'assonance'


def check(key, song):
    bpm, bpl, bars = song['bpm'], song.get('beatsPerLine', 4), song.get('barsPerLine', 2)
    line_s = bars * 4 * 60 / bpm
    fails, warns, total = [], [], 0.0
    print(f'== {key}  {bpm} BPM, {bars} bars ({line_s:.1f} s) per line, {bpl} beats per line')
    by_type = {}
    for sec in song['sections']:
        total += len(sec['lines']) * line_s
        print(f'  [{sec["name"]}] rhyme {sec.get("rhyme", "-")}')
        rows = []
        for i, line in enumerate(sec['lines']):
            syl, beats, most, unk = scan(line)
            flag = []
            if unk:
                flag.append(f'unknown {unk}')
                warns.append(f'{sec["name"]} L{i + 1}: add {unk} to SPECIAL')
            if beats > bpl or most < bpl:
                flag.append(f'BEATS {beats}-{most}')
                fails.append(f'{sec["name"]} L{i + 1} "{line}": {beats} stressed syllables (up to {most}), needs {bpl}')
            elif beats < bpl:
                flag.append(f'(+{bpl - beats} small word{"s" if bpl - beats > 1 else ""} on a beat)')
            beats = bpl if beats <= bpl <= most else beats
            rows.append((syl, beats))
            if syl > 2 * bars * 4 or syl < bpl:
                flag.append(f'SPEED {syl}')
                fails.append(f'{sec["name"]} L{i + 1} "{line}": {syl} syllables for {bars * 4} beats')
            print(f'    {syl:2d} syl {beats} beats  {line}  {" ".join(flag)}')
        scheme = sec.get('rhyme', '')
        ends = [words(l)[-1] for l in sec['lines']]
        for a in range(len(scheme)):
            for b in range(a + 1, len(scheme)):
                if scheme[a] == scheme[b] and scheme[a] != 'X':
                    r = rhymes(ends[a], ends[b])
                    if r in ('no', 'unknown'):
                        fails.append(f'{sec["name"]}: "{ends[a]}" / "{ends[b]}" do not rhyme ({scheme})')
                    elif r == 'identical':
                        warns.append(f'{sec["name"]}: "{ends[a]}" / "{ends[b]}" same word (ok for a refrain only)')
                    elif r == 'assonance':
                        warns.append(f'{sec["name"]}: "{ends[a]}" / "{ends[b]}" only share the vowel')
        kind = re.sub(r'\s*\d+$', '', sec['name'])
        if kind in by_type:
            for i, ((s1, b1), (s2, b2)) in enumerate(zip(by_type[kind], rows)):
                if abs(s1 - s2) > 1 or b1 != b2:
                    fails.append(f'{sec["name"]} L{i + 1}: {s2} syl/{b2} beats vs {s1}/{b1} in the first {kind} (same tune)')
        else:
            by_type[kind] = rows
    sung = ' '.join(' '.join(words(l)) for s in song['sections'] for l in s['lines'])
    for w in song.get('targetWords', []):
        n = len(re.findall(rf'\b{re.escape(w.lower())}s?\b', sung))
        if n < 3:
            fails.append(f'target word "{w}" sung {n} times (needs 3)')
    total += song.get('introBars', 2) * 4 * 60 / bpm
    if total > song.get('maxSeconds', 75):
        fails.append(f'song is {total:.0f} s (max {song.get("maxSeconds", 75)} s)')
    print(f'  length {total:.1f} s')
    for w in warns:
        print('  WARN', w)
    for f in fails:
        print('  FAIL', f)
    print('  ' + ('PASS' if not fails else f'{len(fails)} FAIL'))
    return not fails


songs = json.load(open('scripts/songs.json'))
ok = all([check(k, songs[k]) for k in sys.argv[1:]])
sys.exit(0 if ok else 1)

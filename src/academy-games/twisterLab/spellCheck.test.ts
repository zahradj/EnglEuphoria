import { describe, expect, it } from 'vitest';
import { checkSpelling, letterMarks, levenshtein } from './spellCheck';
import { TWISTERS, wordsOf } from './twisterData';

const SEA = 'She sells seashells by the seashore.';

describe('spelling correction (fixed algorithm, no AI)', () => {
  it('a perfect answer is all right, ignoring capitals and punctuation', () => {
    const r = checkSpelling('she sells seashells by the seashore', SEA);
    expect(r.allRight).toBe(true);
    expect(r.errors).toBe(0);
    expect(r.words.every((w) => w.status === 'ok')).toBe(true);
    expect(checkSpelling('SHE, SELLS: SEASHELLS by the Seashore!!', SEA).allRight).toBe(true);
  });

  it('finds a spelling slip and shows the fix', () => {
    const r = checkSpelling('She sels seashels by the seashore', SEA);
    const slips = r.words.filter((w) => w.status === 'spelling');
    expect(slips.map((w) => w.expected)).toEqual(['sells', 'seashells']);
    const sells = slips[0];
    expect(sells.typed).toBe('sels');
    expect(sells.marks!.map((m) => m.ch).join('')).toBe('sells');
    expect(sells.marks!.filter((m) => m.fix).map((m) => m.ch)).toEqual(['l']); // the missing l
    expect(r.errors).toBe(2);
    expect(r.allRight).toBe(false);
  });

  it('a different word is "wrong", not a spelling slip (even when it is one letter away)', () => {
    const betty = TWISTERS.find((t) => t.id === 'betty-botter')!.text;
    const r = checkSpelling('Betty Botter bought some butter but she said the butter is butter', betty);
    const last = r.words[r.words.length - 1];
    expect(last.expected).toBe('bitter');
    expect(last.status).toBe('wrong');
  });

  it('finds missing words and extra words', () => {
    const r = checkSpelling('She sells seashells the seashore today', SEA);
    expect(r.words.find((w) => w.expected === 'by')!.status).toBe('missing');
    expect(r.extra).toEqual(['today']);
    expect(r.errors).toBe(2);
  });

  it('"sea shells" for "seashells" is one fix: write it as one word', () => {
    const r = checkSpelling('She sells sea shells by the seashore', SEA);
    const w = r.words.find((x) => x.expected === 'seashells')!;
    expect(w.status).toBe('spelling');
    expect(w.note).toMatch(/one word/);
    expect(r.extra).toEqual([]);
    expect(r.errors).toBe(1);
  });

  it('an empty answer is every word missing', () => {
    const r = checkSpelling('', SEA);
    expect(r.words.every((w) => w.status === 'missing')).toBe(true);
    expect(r.errors).toBe(wordsOf(SEA).length);
  });

  it('is deterministic: the same input always gives the same answer', () => {
    const a = checkSpelling('Peter Pyper pikd a peck of pickled pepers', TWISTERS[2].text);
    const b = checkSpelling('Peter Pyper pikd a peck of pickled pepers', TWISTERS[2].text);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.words.filter((w) => w.status === 'spelling').map((w) => w.expected)).toEqual(['piper', 'picked', 'peppers']);
  });

  it('every registered twister passes against itself and against its own chunks joined', () => {
    for (const t of TWISTERS) {
      expect(checkSpelling(t.text, t.text).allRight, t.id).toBe(true);
      expect(checkSpelling(t.chunks.join(' '), t.text).allRight, t.id).toBe(true);
    }
  });

  it('levenshtein and letterMarks basics', () => {
    expect(levenshtein('peper', 'pepper')).toBe(1);
    expect(levenshtein('same', 'same')).toBe(0);
    expect(levenshtein('', 'abc')).toBe(3);
    const marks = letterMarks('peper', 'pepper');
    expect(marks.map((m) => m.ch).join('')).toBe('pepper');
    expect(marks.filter((m) => m.fix)).toHaveLength(1);
    expect(letterMarks('thiefs', 'thieves').filter((m) => m.fix).map((m) => m.ch)).toEqual(['v', 'e']);
  });
});

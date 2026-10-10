import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CONTRASTS, SOUND_LAB_VOICES, sideOf, soundLabLines } from './soundLabData';
import { ACADEMY_GAMES } from '../academyGamesCatalog';
import { normalizeForSpeech, unresolvedSpeechRisks } from '@/lib/speechPolicy';

/** The pairs must be real, unambiguous minimal pairs: a wrong pair teaches the wrong ear. */
describe('Sound Lab pairs', () => {
  const all = CONTRASTS.flatMap((c) => c.pairs.map((p) => ({ c, p })));

  it('has four locks, each with eight pairs', () => {
    expect(CONTRASTS).toHaveLength(4);
    for (const c of CONTRASTS) expect(c.pairs, c.id).toHaveLength(8);
  });

  it('every pair is two different plain lowercase words, and no word is used twice in a lock', () => {
    for (const c of CONTRASTS) {
      const words = c.pairs.flat();
      expect(new Set(words).size, c.id).toBe(words.length);
      for (const [a, b] of c.pairs) { expect(a).not.toBe(b); expect(a).toMatch(/^[a-z]+$/); expect(b).toMatch(/^[a-z]+$/); }
    }
  });

  it('the spelling shows the contrast (b/v, p/b, th/s), so the two words really differ in that sound', () => {
    for (const [a, b] of CONTRASTS.find((c) => c.id === 'th-s')!.pairs) { expect(a, a).toMatch(/th/); expect(b, b).not.toMatch(/th/); expect(b, b).toMatch(/s/); }
    for (const [a, b] of CONTRASTS.find((c) => c.id === 'b-v')!.pairs) { expect(a, a).toMatch(/b/); expect(a, a).not.toMatch(/v/); expect(b, b).toMatch(/v/); }
    for (const [a, b] of CONTRASTS.find((c) => c.id === 'p-b')!.pairs) { expect(a, a).toMatch(/p/); expect(b, b).toMatch(/b/); }
  });

  it('leaves out words a text-to-speech voice reads two ways', () => {
    const words = all.flatMap(({ p }) => p);
    for (const bad of ['live', 'lead', 'wind', 'mouth', 'bass', 'vase', 'read', 'close', 'use', 'wound', 'tear', 'bow', 'row', 'minute']) expect(words, bad).not.toContain(bad);
  });

  it('every lock explains what to listen for and gives exactly one fix, and never a score', () => {
    for (const c of CONTRASTS) {
      expect(c.listenFor.length).toBeGreaterThan(15);
      expect(c.oneFix.length).toBeGreaterThan(15);
      for (const t of [c.listenFor, c.oneFix, c.a.how, c.b.how]) expect(t).not.toMatch(/%|score|accent/i);
    }
  });

  it('sideOf finds the side of a word', () => {
    const c = CONTRASTS[0];
    expect(sideOf(c, 'ship')).toBe(0);
    expect(sideOf(c, 'sheep')).toBe(1);
    expect(sideOf(c, 'zzz')).toBe(-1);
  });
});

describe('Sound Lab voices and lines', () => {
  it('uses three different recorded voices (a woman, a man, another woman)', () => {
    expect(new Set(SOUND_LAB_VOICES).size).toBe(3);
  });
  it('says every word in every voice, and every line reads cleanly', () => {
    const lines = soundLabLines();
    const words = CONTRASTS.flatMap((c) => c.pairs.flat());
    expect(lines).toHaveLength(words.length * 3);
    for (const [, w] of lines) { expect(unresolvedSpeechRisks(w), w).toEqual([]); expect(normalizeForSpeech(w), w).toBe(w); }
  });
  it('is registered in the Academy library with a cover on disk', () => {
    const g = ACADEMY_GAMES.find((x) => x.id === 'sound-lab')!;
    expect(g).toBeDefined();
    expect(existsSync(join(process.cwd(), 'public', g.cover.replace(/^\//, '')))).toBe(true);
  });
});

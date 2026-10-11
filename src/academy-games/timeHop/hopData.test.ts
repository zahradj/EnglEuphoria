import { describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {}, supabaseUrl: '', supabaseAnonKey: '' }));
import { cacheFileName } from '@/content/playground-library/unit1/audio';
import { ACADEMY_GAMES } from '../academyGamesCatalog';
import { HOP_PAIRS, REGULAR_SPELLING, SIGNALS, hopLines, pairByBase, signalAnswer, signalOptions, spellingOptions } from './hopData';
import { hopCardKey, pickHopVerbs, summarizeHop } from './hopMemory';
import { review } from '../verbForge/verbMemory';

describe('Time Hop data', () => {
  it('regular verbs follow their own spelling rule', () => {
    for (const v of REGULAR_SPELLING) {
      const b = v.base;
      const expected = v.kind === 'ed' ? `${b}ed` : v.kind === 'd' ? `${b}d` : v.kind === 'ied' ? `${b.slice(0, -1)}ied` : `${b}${b[b.length - 1]}ed`;
      expect(v.past, b).toBe(expected);
    }
  });

  it('spelling options: three different spellings, the right one included, no raw base form', () => {
    for (const v of REGULAR_SPELLING) {
      const o = spellingOptions(v);
      expect(o, v.base).toHaveLength(3);
      expect(new Set(o).size, v.base).toBe(3);
      expect(o).toContain(v.past);
      expect(o).not.toContain(v.base);
    }
  });

  it('every signal sentence has one clear answer and two different options', () => {
    for (const s of SIGNALS) {
      const p = pairByBase(s.base)!;
      expect(p, s.base).toBeTruthy();
      const [a, b] = signalOptions(s);
      expect(a).not.toBe(b);
      expect(signalAnswer(s)).toBe(s.tense === 'present' ? p.base : p.past);
      expect(s.text).toContain('___');
      expect(s.text, s.text).not.toMatch(/\b(he|she|it)\b/i); // no third-person -s needed
    }
  });

  it('every spoken line is a baked static clip on disk (no live voice)', () => {
    const missing = hopLines().filter((l) => !existsSync(join(process.cwd(), 'public', 'audio-cache', `${cacheFileName('teacher', l)}.mp3`)));
    expect(missing).toEqual([]);
    expect(HOP_PAIRS.length).toBeGreaterThan(60);
  });

  it('is in the Academy catalog with a cover that exists', () => {
    const g = ACADEMY_GAMES.find((x) => x.id === 'time-hop')!;
    expect(g).toBeTruthy();
    expect(existsSync(join(process.cwd(), 'public', g.cover.replace(/^\//, '')))).toBe(true);
  });
});

describe('Time Hop vault', () => {
  it('a verb is as strong as its weaker direction; due and new verbs come first', () => {
    const verbs = [{ base: 'go' }, { base: 'see' }, { base: 'eat' }];
    let v = review({}, hopCardKey('go', 'toPast'), true);
    expect(summarizeHop(verbs, v).boxes[0]).toBe(3); // only one direction known: still box 0
    v = review(v, hopCardKey('go', 'toPresent'), true);
    expect(summarizeHop(verbs, v).boxes[2]).toBe(1);
    const wrong = review({}, hopCardKey('see', 'toPast'), false, 1000);
    const order = pickHopVerbs(verbs, wrong, 3, 2000).map((x) => x.base);
    expect(order[0]).toBe('see'); // due first
  });
});

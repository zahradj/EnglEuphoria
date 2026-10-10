import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ALL_VERBS, FAMILIES, IRREGULAR_VERBS, PATTERNS, REGULAR_VERBS, SENTENCES, answerOf, familyVerbs, regularised, sentenceOptions, verbForgeLines, verbByBase,
  type VerbPattern,
} from './verbData';
import { ACADEMY_GAMES } from '../academyGamesCatalog';
import { normalizeForSpeech, unresolvedSpeechRisks } from '@/lib/speechPolicy';

/** The verbs must be RIGHT: a wrong form in a teaching game is the worst possible bug. */
const patternOf = (b: string, p: string, pp: string): VerbPattern =>
  b === p && p === pp ? 'AAA' : p === pp ? 'ABB' : b === pp ? 'ABA' : 'ABC';

describe('verb data', () => {
  it('has no duplicate verbs and only plain lowercase letters', () => {
    const bases = ALL_VERBS.map((v) => v.base);
    expect(new Set(bases).size).toBe(bases.length);
    for (const v of ALL_VERBS) for (const f of [v.base, v.past, v.pp]) expect(f, v.base).toMatch(/^[a-z]+$/);
  });

  it('every irregular verb\'s pattern label matches its three forms', () => {
    for (const v of IRREGULAR_VERBS) expect(v.pattern, `${v.base} ${v.past} ${v.pp}`).toBe(patternOf(v.base, v.past, v.pp));
  });

  it('every regular verb follows the -ed rules', () => {
    const doubled = ['stop', 'plan'];
    for (const v of REGULAR_VERBS) {
      expect(v.past, v.base).toBe(v.pp);
      const expected = doubled.includes(v.base) ? `${v.base}${v.base.slice(-1)}ed` : regularised(v.base);
      expect(v.past, v.base).toBe(expected);
    }
    expect(regularised('like')).toBe('liked');
    expect(regularised('study')).toBe('studied');
    expect(regularised('play')).toBe('played');
    expect(regularised('walk')).toBe('walked');
  });

  it('well-known verbs have the right forms', () => {
    const f = (b: string) => { const v = verbByBase(b)!; return `${v.base}-${v.past}-${v.pp}`; };
    expect(f('go')).toBe('go-went-gone');
    expect(f('see')).toBe('see-saw-seen');
    expect(f('eat')).toBe('eat-ate-eaten');
    expect(f('write')).toBe('write-wrote-written');
    expect(f('buy')).toBe('buy-bought-bought');
    expect(f('come')).toBe('come-came-come');
    expect(f('cut')).toBe('cut-cut-cut');
    expect(f('swim')).toBe('swim-swam-swum');
    expect(f('fly')).toBe('fly-flew-flown');
    expect(f('forget')).toBe('forget-forgot-forgotten');
  });

  it('every family has a rule, a hook and members that really share its sound pattern', () => {
    for (const fam of Object.values(FAMILIES)) {
      expect(fam.rule.length).toBeGreaterThan(3);
      expect(fam.hook.length).toBeGreaterThan(10);
    }
    expect(familyVerbs('sing').map((v) => v.base)).toEqual(['sing', 'drink', 'swim', 'begin', 'ring']);
    for (const v of familyVerbs('sing')) { expect(v.past).toMatch(/a/); expect(v.pp).toMatch(/u/); }
    for (const v of familyVerbs('know')) { expect(v.past.endsWith('ew')).toBe(true); expect(v.pp.endsWith('n')).toBe(true); }
    for (const v of familyVerbs('ought')) { expect(v.past).toBe(v.pp); expect(v.past).toMatch(/(ought|aught)$/); }
    for (const v of familyVerbs('speak')) expect(v.pp).toBe(`${v.past}n`);
  });

  it('every pattern id used by the verbs exists in the pattern list', () => {
    const ids = PATTERNS.map((p) => p.id);
    for (const v of ALL_VERBS) expect(ids).toContain(v.pattern);
  });

  it('leaves out the verbs a text-to-speech voice or an American/British split would get wrong', () => {
    for (const bad of ['read', 'lead', 'wind', 'get', 'learn', 'dream', 'burn', 'be']) expect(verbByBase(bad), bad).toBeUndefined();
  });
});

describe('sentences', () => {
  it('each sentence has one gap, a clue that is in the text, a known verb and exactly three distinct options including the answer', () => {
    for (const s of SENTENCES) {
      expect(s.text.split('___').length, s.text).toBe(2);
      expect(s.text, s.text).toContain(s.clue);
      expect(verbByBase(s.base), s.base).toBeDefined();
      const opts = sentenceOptions(s);
      expect(opts.length, s.text).toBe(3);
      expect(new Set(opts).size, s.text).toBe(3);
      expect(opts, s.text).toContain(answerOf(s));
    }
  });

  it('the answer is the right form for the time words (past after finished times, participle after have/has)', () => {
    for (const s of SENTENCES) {
      const past = /\b(last|yesterday|ago|at the party|this morning)\b/i.test(s.text);
      const perfect = /\b(has|have)\b/i.test(s.text);
      if (past) expect(s.form, s.text).toBe('past');
      if (perfect) expect(s.form, s.text).toBe('pp');
    }
  });
});

describe('voice lines', () => {
  const lines = verbForgeLines();
  it('says every form of every verb and every answered sentence', () => {
    for (const v of ALL_VERBS) for (const f of [v.base, v.past, v.pp]) expect(lines).toContain(f);
    expect(lines).toContain('Last summer we went to Spain.');
  });
  it('reads cleanly (no unresolved pronunciation risks) and needs no cleanup', () => {
    for (const l of lines) {
      expect(unresolvedSpeechRisks(l), l).toEqual([]);
      expect(normalizeForSpeech(l), l).toBe(l);
    }
  });
});

describe('the game in the Academy library', () => {
  it('is registered with a cover picture on disk', () => {
    const g = ACADEMY_GAMES.find((x) => x.id === 'verb-forge')!;
    expect(g).toBeDefined();
    expect(g.levels).toContain('A2');
    expect(existsSync(join(process.cwd(), 'public', g.cover.replace(/^\//, '')))).toBe(true);
  });
});

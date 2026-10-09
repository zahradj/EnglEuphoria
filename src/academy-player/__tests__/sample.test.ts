// The sample lesson must pass the validator AND the progressive-stack 95 % rule against the Academy roadmap's own item list.
import { describe, expect, it } from 'vitest';
import { A1S01E1 } from '../samples/a1s01e1';
import { initState, step } from '../engine';
import { knownWordShare, validateScript } from '../validateScript';
import { ACADEMY_ITEMS } from '../../curriculum/academy/items';

// closed-class words an A1 learner meets through grammar (not counted as items)
const FUNCTION_WORDS = ['a', 'an', 'the', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'my', 'your', 'our', 'his', 'her', 'their', 'is', 'am', 'are', 'be', 'not', 'and', 'but', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'who', 'what', 'where', 'this', 'that', 'there', 'now', 'yes', 'next', 'time', 'from', 'have', 'say', 'again', 'first', 'four', 'one', 'now', 'then', 'try', 'right', 'look', 'from', 'story', 'word', 'words'];
// routine classroom-instruction verbs the player repeats in every lesson (buttons and prompts, learned by doing)
const INSTRUCTION_WORDS = ['pick', 'build', 'find', 'show', 'take', 'which', 'how', 'or', 'know', 'start', 'mission', 'write', 'writes', 'copy'];
const CAST = ['vee', 'ava', 'theo', 'mia', 'sam'];

describe('sample lesson A1-S01-E1', () => {
  it('passes the validator with no errors', () => {
    expect(validateScript(A1S01E1).filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('uses only Academy cast members', () => {
    expect(A1S01E1.cast.every((c) => ['Vee', 'Ava', 'Theo', 'Mia'].includes(c))).toBe(true);
  });

  it('keeps to the lesson: at least 95 % of the running words are known (this lesson\'s E1 items, closed-class words, glossed words)', () => {
    const e1 = ACADEMY_ITEMS['A1-S01'].E1.map((i) => i[0].toLowerCase());
    const e2Preview = ACADEMY_ITEMS['A1-S01'].E2.map((i) => i[0].toLowerCase()); // not taught yet: must NOT be needed
    const known = new Set<string>([...e1, ...FUNCTION_WORDS, ...INSTRUCTION_WORDS, ...CAST]);
    const { share, unknown } = knownWordShare(A1S01E1, known);
    expect(unknown.filter((w) => e2Preview.includes(w))).toEqual([]);
    expect(share, `unknown words: ${unknown.join(', ')}`).toBeGreaterThanOrEqual(0.95);
  });

  it('teaches exactly the Season\'s E1 words in its flash sets (<= 4 per set)', () => {
    const e1 = new Set(ACADEMY_ITEMS['A1-S01'].E1.map((i) => i[0].toLowerCase()));
    for (const b of A1S01E1.beats) {
      if (b.t !== 'flash') continue;
      expect(b.cards.length).toBeLessThanOrEqual(4);
      b.cards.forEach((c) => expect(e1.has(c.word.toLowerCase())).toBe(true));
    }
  });

  it.each([[0, 'chill'], [1, 'normal'], [2, 'push']])('can be played start to finish on dial %i (%s) with the first correct choice each time', (dial, name) => {
    let s = initState(A1S01E1, 3);
    for (let guard = 0; guard < 300 && !s.finished; guard++) {
      const b = A1S01E1.beats[s.beatIndex];
      if (b.t === 'choice') {
        const c = b.options.findIndex((o) => o.correct);
        s = step(A1S01E1, s, { type: 'choose', index: c >= 0 ? c : b.options.some((o) => o.set?.dial) ? dial : 0 });
      } else if (b.t === 'chat' && b.reply) s = step(A1S01E1, s, { type: 'choose', index: b.reply.options.findIndex((o) => o.correct) });
      else s = step(A1S01E1, s, { type: 'next' });
    }
    expect(s.finished).toBe(true);
    expect(s.vars.dial).toBe(name);
    expect(s.answers.every((a) => a.correct)).toBe(true);
    expect(s.answers.length).toBe(4); // chat reply, story choice, two odd-one-out games
    expect(s.stage.segment).toBe(7);
  });

  it('covers all eight segments in order, with Take 1 -> feedback -> Take 2 on every dial branch', () => {
    const segs = A1S01E1.beats.filter((b) => b.t === 'segment').map((b) => (b as { index: number }).index);
    expect(segs).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    const builds = (from: string, to: string) => {
      const a = A1S01E1.beats.findIndex((b) => b.t === 'label' && b.name === from);
      const z = A1S01E1.beats.findIndex((b) => b.t === 'label' && b.name === to);
      return A1S01E1.beats.slice(a, z).filter((b) => b.t === 'build').length;
    };
    expect(builds('m-chill', 'm-normal')).toBe(2);
    expect(builds('m-normal', 'm-push')).toBe(2);
    expect(builds('m-push', 'm-done')).toBe(2);
  });

  it('never uses browser text-to-speech anywhere in the player source', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join, resolve } = await import('node:path');
    const root = resolve(__dirname, '..');
    const walk = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? (n === '__tests__' ? [] : walk(join(d, n))) : /\.(ts|tsx)$/.test(n) ? [join(d, n)] : []));
    const offenders = walk(root).filter((f) => /speechSynthesis|SpeechSynthesisUtterance/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

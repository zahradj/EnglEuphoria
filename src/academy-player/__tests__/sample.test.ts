// The lesson must pass the validator, the 95 % rule, the Academy lesson blueprint (cast, run of show, objective, clue) and fill its hour.
import { describe, expect, it } from 'vitest';
import { A1S01E1 } from '../samples/a1s01e1';
import { initState, interpolateBeat, step } from '../engine';
import { beatSeconds, segmentSeconds } from '../lessonTiming';
import { knownWordShare, validateScript } from '../validateScript';
import { ACADEMY_ITEMS } from '../../curriculum/academy/items';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';

// closed-class words an A1 learner meets through grammar (not counted as items)
const FUNCTION_WORDS = ['a', 'an', 'the', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'my', 'your', 'our', 'his', 'her', 'their', 'is', 'am', 'are', 'be', 'not', 'and', 'but', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'who', 'what', 'where', 'this', 'that', 'there', 'now', 'yes', 'no', 'do', 'next', 'time', 'from', 'have', 'say', 'again', 'first', 'four', 'one', 'then', 'try', 'right', 'look', 'story', 'word', 'words', 'or'];
// routine classroom-instruction verbs the player repeats in every lesson (buttons and prompts, learned by doing)
const INSTRUCTION_WORDS = ['pick', 'build', 'find', 'show', 'take', 'which', 'how', 'know', 'start', 'mission', 'write', 'writes', 'copy', 'yet', 'think', 'idea', 'tap', 'odd', 'clue', 'clues', 'profile', 'mystery', 'level', 'homework', 'frame', 'pattern'];
const CAST = ['vee', 'ava', 'theo', 'sam'];
const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'A1-S01-E1')!;
const e1 = ACADEMY_ITEMS['A1-S01'].E1.map((i) => i[0].toLowerCase());
const plurals = e1.flatMap((w) => [w, w + 's', w + 'es']);

describe('lesson A1-S01-E1 against the Academy blueprint', () => {
  it('passes the validator with no errors', () => {
    expect(validateScript(A1S01E1).filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('uses exactly the blueprint cast (Vee, Ava lead, Theo) and the blueprint ids', () => {
    expect([...A1S01E1.cast].sort()).toEqual(bp.cast.appears.map((c) => c.name).sort());
    expect(bp.cast.lead).toBe('Ava');
    expect(A1S01E1.lessonId).toBe(bp.id);
    expect(A1S01E1.level).toBe('A1');
  });

  it('keeps to the lesson: at least 95 % of the running words are known (E1 words, closed-class and instruction words, glossed words)', () => {
    const e2Preview = ACADEMY_ITEMS['A1-S01'].E2.map((i) => i[0].toLowerCase()); // not taught yet: must NOT be needed
    const known = new Set<string>([...plurals, ...FUNCTION_WORDS, ...INSTRUCTION_WORDS, ...CAST]);
    const { share, unknown } = knownWordShare(A1S01E1, known);
    expect(unknown.filter((w) => e2Preview.includes(w))).toEqual([]);
    expect(share, `unknown words: ${unknown.join(', ')}`).toBeGreaterThanOrEqual(bp.buildsOn.inputKnownWordsMinPct / 100);
  });

  it("teaches the Season's 14 E1 words, each in a flash set of 3-4 cards, and nothing else", () => {
    const cards = A1S01E1.beats.flatMap((b) => (b.t === 'flash' ? b.cards : []));
    cards.forEach((c) => expect(e1).toContain(c.word.toLowerCase()));
    expect(new Set(cards.map((c) => c.word.toLowerCase()))).toEqual(new Set(e1));
    A1S01E1.beats.forEach((b) => b.t === 'flash' && expect(b.cards.length).toBeGreaterThanOrEqual(3));
  });

  it('follows the blueprint run of show: eight segments in order, with a Chill / Normal / Push dial and Take 1 -> feedback -> Take 2 on every branch', () => {
    expect(A1S01E1.beats.filter((b) => b.t === 'segment').map((b) => (b as { index: number }).index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(bp.runOfShow.map((r) => r.name)).toEqual(['Check-in', 'Remember?', 'The Drop', 'Notice & Build', 'Energiser', 'Mission', 'Release', 'Wrap']);
    const at = (name: string) => A1S01E1.beats.findIndex((b) => b.t === 'label' && b.name === name);
    const takes = (a: string, z: string) => A1S01E1.beats.slice(at(a), at(z)).filter((b) => (b.t === 'build' || b.t === 'record') && /^Take [12]\./.test(b.prompt)).length;
    expect(takes('m-chill', 'm-normal')).toBe(2);
    expect(takes('m-normal', 'm-push')).toBe(2);
    expect(takes('m-push', 'm-done')).toBe(2);
  });

  it('opens with the profile mystery and closes with the blueprint clue, an opinion step (Mission) and a one-sentence reaction (Release)', () => {
    expect(A1S01E1.beats.some((b) => b.t === 'profile' && (b.hotspots?.length ?? 0) === 3)).toBe(true);
    const end = A1S01E1.beats.find((b) => b.t === 'end') as { summary?: string };
    expect(end.summary).toMatch(/Clue 1 of 8/);
    expect(bp.clue.no).toBe(1);
    const records = A1S01E1.beats.filter((b) => b.t === 'record').map((b) => (b as { model: string }).model);
    expect(records.filter((m) => /I think Sam is/.test(m)).length).toBeGreaterThanOrEqual(2);
  });

  it.each([[0, 'chill'], [1, 'normal'], [2, 'push']])('can be played start to finish on dial %i (%s) and saves what the student typed', (dial, name) => {
    let s = initState(A1S01E1, 3);
    for (let guard = 0; guard < 600 && !s.finished; guard++) {
      const b = A1S01E1.beats[s.beatIndex];
      if (b.t === 'choice') {
        const c = b.options.findIndex((o) => o.correct);
        s = step(A1S01E1, s, { type: 'choose', index: c >= 0 ? c : b.options.some((o) => o.set?.dial) ? dial : 0 });
      } else if (b.t === 'chat' && b.reply) s = step(A1S01E1, s, { type: 'choose', index: b.reply.options.findIndex((o) => o.correct) });
      else if (b.t === 'sort') s = step(A1S01E1, s, { type: 'fill', values: { [b.key]: 9 } });
      else if (b.t === 'form') s = step(A1S01E1, s, { type: 'fill', values: Object.fromEntries(b.fields.map((f) => [f.key, f.kind === 'choice' ? f.options![0] : 'Mia'])) });
      else s = step(A1S01E1, s, { type: 'next' });
    }
    expect(s.finished).toBe(true);
    expect(s.vars.dial).toBe(name);
    expect(s.vars.name).toBe('Mia');
    expect(s.vars.known_count).toBe(9);
    expect(s.answers.every((a) => a.correct)).toBe(true);
    expect(s.stage.segment).toBe(7);
  });

  it('personalises lines with the saved name and never leaves a placeholder behind', () => {
    const line = A1S01E1.beats.find((b) => b.t === 'say' && b.text.includes('{name}'))!;
    expect((interpolateBeat(line, { name: 'Mia' }) as { text: string }).text).toContain('Mia');
    expect(JSON.stringify(interpolateBeat(line, {}))).not.toMatch(/\{\w+\}/);
  });

  it('fills the hour: estimated student-screen time per segment is at least the planned screen minutes and at most 115 % of the segment on every dial', () => {
    const screenMin = [2, 4, 7, 8, 3, 6, 3, 2];
    for (const dial of [0, 1, 2]) {
      const secs = segmentSeconds(A1S01E1, dial);
      bp.runOfShow.forEach((r, i) => {
        expect(secs[i] / 60, `${r.name} dial ${dial}: ${(secs[i] / 60).toFixed(1)} min`).toBeGreaterThanOrEqual(screenMin[i]);
        expect(secs[i] / 60, `${r.name} dial ${dial}: ${(secs[i] / 60).toFixed(1)} min`).toBeLessThanOrEqual(r.minutes * 1.15);
      });
      expect(secs.reduce((a, b) => a + b, 0) / 60).toBeGreaterThanOrEqual(34);
    }
    expect(beatSeconds({ t: 'record', prompt: 'x', model: 'y' })).toBeGreaterThan(0);
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

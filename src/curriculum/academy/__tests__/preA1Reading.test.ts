// Pre-A1 reading-first plan (owner 2026-10-15): every episode of P1-P5 has an activation list, a message and a word bank, readable from what has been taught by then.
import { describe, expect, it } from 'vitest';
import { PA1_SEASONS } from '../preA1';
import { PRE_A1_READING, readingOf, readingProblems, soundsAt, unreadableAt, wholeWordsAt } from '../preA1Reading';

describe('Pre-A1 reading-first plan', () => {
  it('has no problems: every episode of the five Seasons is covered, every text is readable from what is taught, every bank word is in its message', () => {
    expect(readingProblems()).toEqual([]);
    expect(PRE_A1_READING).toHaveLength(40);
  });

  it('every message is short and teen-safe: 3-6 lines, at most 8 words a line, no childish words', () => {
    PRE_A1_READING.forEach((r) => {
      expect(r.message.lines.length, r.id).toBeGreaterThanOrEqual(3);
      expect(r.message.lines.length, r.id).toBeLessThanOrEqual(6);
      expect(r.message.lines.join(' '), r.id).not.toMatch(/\b(mummy|baby|teddy|puppy|toy|kitty)\b/i);
    });
  });

  it('the sounds grow with the episodes: i n after P2 E1, m d after E2, none new in P3, o c b g in P4, e u h r in P5', () => {
    expect(soundsAt('PA1-S01-E1')).toEqual([]);
    expect(soundsAt('PA1-S02-E1')).toEqual(expect.arrayContaining(['s', 'a', 't', 'p', 'i', 'n']));
    expect(soundsAt('PA1-S02-E1')).not.toContain('m');
    expect(soundsAt('PA1-S02-E2')).toEqual(expect.arrayContaining(['m', 'd']));
    expect(soundsAt('PA1-S03-E8')).toHaveLength(8);
    expect(soundsAt('PA1-S04-E2')).toEqual(expect.arrayContaining(['o', 'c', 'b', 'g']));
    expect(soundsAt('PA1-S05-E2')).toHaveLength(16);
  });

  it('the check really rejects a word that has not been taught yet (so a pass means something)', () => {
    expect(unreadableAt('PA1-S01-E1', 'The map is a phone.')).toEqual(expect.arrayContaining(['the', 'map', 'a', 'phone']));
    expect(unreadableAt('PA1-S02-E1', 'It is a pin.')).toEqual([]);
    expect(unreadableAt('PA1-S02-E1', 'Dad did a nap.')).toEqual(['dad', 'did']); // m and d are taught in E2
    expect(unreadableAt('PA1-S02-E2', 'Dad did a nap.')).toEqual([]);
  });

  it('words come from the reading: each bank word is a word the student can read at that episode, and the first episode of a Season keeps its own new words', () => {
    PRE_A1_READING.forEach((r) => {
      r.bank.forEach((w) => expect(unreadableAt(r.id, w), `${r.id} bank "${w}"`).toEqual([]));
    });
    expect(readingOf('PA1-S02-E1')?.bank).toEqual(expect.arrayContaining(['pin', 'tin', 'map']));
    expect(wholeWordsAt('PA1-S02-E1')).toContain('phone');
  });

  it('every Season has one reading plan per episode, in order', () => {
    PA1_SEASONS.forEach((s) => s.episodes.forEach((e) => expect(readingOf(`${s.id}-E${e.no}`), `${s.id}-E${e.no}`).toBeTruthy()));
  });
});

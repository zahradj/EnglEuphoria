import { describe, it, expect } from 'vitest';
import { creditsForLesson, lessonLengthLabel, lessonOptions, matchingOption, type SlotLike } from './lessonSlots';

const t = (h: number, m = 0) => new Date(Date.UTC(2026, 9, 12, h, m));
const slot = (id: string, teacherId: string, start: Date, duration: 30 | 60): SlotLike => ({
  id, teacherId, startTime: start, endTime: new Date(start.getTime() + duration * 60_000), duration,
});

describe('lesson length and credits (one credit = 30 minutes, every hub)', () => {
  it('30 minutes costs 1 credit, 60 minutes costs 2', () => {
    expect(creditsForLesson(30)).toBe(1);
    expect(creditsForLesson(60)).toBe(2);
    expect(lessonLengthLabel(30)).toBe('30 min · 1 credit');
    expect(lessonLengthLabel(60)).toBe('1 hour · 2 credits');
  });

  it('a 30-minute lesson uses only 30-minute slots', () => {
    const slots = [slot('a', 'T', t(9), 30), slot('b', 'T', t(10), 60)];
    expect(lessonOptions(slots, 30).map((o) => o.sourceSlotIds)).toEqual([['a']]);
  });

  it('a 60-minute lesson is a whole 60-minute slot or two touching 30-minute slots', () => {
    const slots = [
      slot('whole', 'T1', t(14), 60),
      slot('h1', 'T2', t(9), 30), slot('h2', 'T2', t(9, 30), 30), // pair
      slot('lonely', 'T2', t(12), 30),                              // no partner
      slot('x1', 'T3', t(9), 30), slot('x2', 'T4', t(9, 30), 30),   // touching but different teachers
    ];
    const opts = lessonOptions(slots, 60);
    expect(opts.map((o) => o.sourceSlotIds)).toEqual([['h1', 'h2'], ['whole']]);
    expect(opts[0].duration).toBe(60);
    expect(opts[0].endTime.getTime() - opts[0].startTime.getTime()).toBe(60 * 60_000);
  });

  it('finds the same lesson a week later for a weekly series', () => {
    const opts = lessonOptions([slot('w', 'T', t(9), 60)], 60);
    expect(matchingOption(opts, 'T', t(9).getTime() + 30_000)?.id).toBe('w');
    expect(matchingOption(opts, 'T', t(10).getTime())).toBeNull();
    expect(matchingOption(opts, 'OTHER', t(9).getTime())).toBeNull();
  });
});

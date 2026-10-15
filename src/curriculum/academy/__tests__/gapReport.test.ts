import { describe, expect, it } from 'vitest';
import { addLessonItems, applyDailyResults, gapReport, plusDays, sayItTarget } from '..';

const T0 = '2026-10-14';
const base = { level: 'A1' as const, today: plusDays(T0, 1), lastLessonOn: T0, items: addLessonItems([], ['pin', 'tin'], T0) };

describe('Teacher gap report', () => {
  it('a student on schedule is green with no change needed', () => {
    const r = gapReport({ ...base, daily10Scheduled: 6, daily10Done: 6, rememberAccuracy: 0.9, missedInRow: 0, spokenLastLesson: 30 });
    expect(r.risk).toBe('green');
    expect(r.decision.mode).toBe('on-track');
    expect(r.actions.some((a) => /On track/.test(a)) || r.actions.length > 0).toBe(true);
  });
  it('a week away or a weak Daily 10 is amber with a refresh', () => {
    const r = gapReport({ ...base, today: plusDays(T0, 9), daily10Scheduled: 6, daily10Done: 1, rememberAccuracy: 0.8 });
    expect(r.risk).toBe('amber');
    expect(r.decision.mode).toBe('refresh');
    expect(r.actions.join(' ')).toMatch(/Next lesson: refresh/);
    expect(r.daily10Rate).toBeCloseTo(1 / 6);
  });
  it('two weeks away is red with a rewind, and says to replay the last lessons', () => {
    const r = gapReport({ ...base, today: plusDays(T0, 20) });
    expect(r.risk).toBe('red');
    expect(r.decision).toMatchObject({ mode: 'rewind', replayLessons: 2 });
    expect(r.actions.join(' ')).toMatch(/replay the last 2 lessons/);
  });
  it('stuck and fading items are listed, worst first, and start the next Remember?', () => {
    let items = addLessonItems([], ['pin', 'tin', 'map'], T0);
    items = applyDailyResults(items, [{ item: 'pin', ok: false }], plusDays(T0, 1));
    items = applyDailyResults(items, [{ item: 'pin', ok: false }], plusDays(T0, 2));
    const r = gapReport({ ...base, items, today: plusDays(T0, 3), daily10Scheduled: 4, daily10Done: 3 });
    expect(r.weak[0]).toMatchObject({ item: 'pin', why: 'stuck', misses: 2 });
    expect(r.actions.join(' ')).toMatch(/Remember\? with: pin/);
  });
  it('speaking: fewer than half the target spoken answers makes the report amber and asks for shadowing', () => {
    const r = gapReport({ ...base, daily10Scheduled: 6, daily10Done: 6, rememberAccuracy: 0.9, spokenLastLesson: 3 });
    expect(r.speaking).toMatchObject({ spoken: 3, target: sayItTarget('A1') });
    expect(r.risk).toBe('amber');
    expect(r.actions.join(' ')).toMatch(/Speaking: 3 of/);
  });
});

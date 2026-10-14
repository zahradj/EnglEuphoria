import { describe, expect, it } from 'vitest';
import { DAILY_GAP_DAYS, DAILY_TEN_SIZE, addLessonItems, applyDailyResults, dailyTenFor, overdueDays, plusDays, statusOf, summary, taskFor } from '..';

const T0 = '2026-10-14';
const words = ['pin', 'tin', 'phone', 'map'];

describe('Daily 10 scheduler (spacing)', () => {
  it('new items are due the day after the lesson and start as new', () => {
    const s = addLessonItems([], words, T0);
    expect(s.every((x) => x.dueOn === plusDays(T0, 1) && x.box === 0)).toBe(true);
    expect(dailyTenFor(s, T0)).toEqual([]);
    expect(dailyTenFor(s, plusDays(T0, 1)).length).toBe(4);
    expect(addLessonItems(s, ['pin', 'new'], T0).length).toBe(5);
  });
  it('right answers walk an item through days 1, 3, 7, 14, 30 and make it secure', () => {
    let s = addLessonItems([], ['pin'], T0);
    let today = plusDays(T0, 1);
    const seen: number[] = [];
    for (let i = 0; i < DAILY_GAP_DAYS.length; i++) {
      s = applyDailyResults(s, [{ item: 'pin', ok: true }], today);
      seen.push(Date.parse(s[0].dueOn) / 86400000 - Date.parse(today) / 86400000);
      today = s[0].dueOn;
    }
    expect(seen).toEqual([...DAILY_GAP_DAYS]);
    expect(s[0].box).toBe(5);
    expect(statusOf(s[0], today)).toBe('secure');
  });
  it('a wrong answer sends the item back to tomorrow, and a stuck item is only recognised', () => {
    let s = addLessonItems([], ['pin'], T0);
    const d1 = plusDays(T0, 1);
    s = applyDailyResults(s, [{ item: 'pin', ok: true }], d1);
    s = applyDailyResults(s, [{ item: 'pin', ok: false }], s[0].dueOn);
    expect(s[0]).toMatchObject({ box: 0 });
    expect(s[0].misses).toBe(1);
    s = applyDailyResults(s, [{ item: 'pin', ok: false }], s[0].dueOn);
    expect(taskFor(s[0], s[0].dueOn)).toBe('recognise');
  });
  it('today\'s pack is at most ten items, fading items first, then the most overdue', () => {
    const many = addLessonItems([], Array.from({ length: 25 }, (_, i) => `w${i}`), T0);
    expect(dailyTenFor(many, plusDays(T0, 1)).length).toBe(DAILY_TEN_SIZE);
    const state = [
      { item: 'old', box: 3, dueOn: plusDays(T0, 1), misses: 0 },
      { item: 'late', box: 1, dueOn: plusDays(T0, 20), misses: 0 },
      { item: 'now', box: 0, dueOn: plusDays(T0, 30), misses: 0 },
    ];
    const pack = dailyTenFor(state, plusDays(T0, 30));
    expect(pack[0].item).toBe('old');
    expect(overdueDays(state[0], plusDays(T0, 30))).toBe(29);
    expect(statusOf(state[0], plusDays(T0, 30))).toBe('fading');
  });
  it('speaking is practised from the start: only new or stuck items are recognised, the rest are said or used', () => {
    const t = '2026-11-01';
    expect(taskFor({ item: 'a', box: 0, dueOn: t, misses: 0 }, t)).toBe('recognise');
    expect(taskFor({ item: 'a', box: 2, dueOn: t, misses: 0 }, t)).toBe('say');
    expect(taskFor({ item: 'a', box: 5, dueOn: t, misses: 0 }, t)).toBe('use');
  });
  it('the summary counts statuses and what is due', () => {
    const s = addLessonItems([], words, T0);
    expect(summary(s, plusDays(T0, 1))).toMatchObject({ new: 4, dueToday: 4 });
  });
});

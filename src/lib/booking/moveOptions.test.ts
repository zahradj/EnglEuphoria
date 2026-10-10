import { describe, it, expect } from 'vitest';
import { findMoveOptions, groupByDay, isSplitLesson, type CalendarRow } from './moveOptions';
import { seriesMembers, isBookedRow } from '@/services/cancelSlotService';

const at = (day: number, h: number, m = 0) => new Date(Date.UTC(2026, 9, day, h, m)).toISOString();
const row = (id: string, start: string, duration: 30 | 60, hub: string | null = null): CalendarRow => ({
  id, start_time: start, duration, hub_specialty: hub,
});
const NOW = new Date(Date.UTC(2026, 9, 9, 8, 0));

describe('where a booked lesson can be moved to', () => {
  it('a single-row lesson goes to an open row of its own length, never its current time', () => {
    const rows = [
      row('a', at(12, 9), 60), row('b', at(12, 10), 60), row('c', at(12, 11), 30), // 30 is the wrong length
      row('past', at(8, 9), 60),                                                  // already over
    ];
    expect(findMoveOptions(rows, { minutes: 60, split: false }, at(12, 9), NOW)).toEqual([at(12, 10)]);
  });

  it('a one-hour lesson held on two 30-minute rows needs two touching open rows', () => {
    const rows = [
      row('h1', at(12, 9), 30), row('h2', at(12, 9, 30), 30),   // pair
      row('lonely', at(12, 12), 30),                             // no partner
      row('x', at(12, 14), 30), row('y', at(12, 15), 30),        // not touching
    ];
    expect(findMoveOptions(rows, { minutes: 60, split: true }, at(13, 9), NOW)).toEqual([at(12, 9)]);
  });

  it("the lesson's own rows count as free, so a 30-minute shift is offered", () => {
    // Lesson now on 09:00 + 09:30; 10:00 is open. Shifting by 30 minutes needs 09:30 + 10:00.
    const rows = [row('own1', at(12, 9), 30), row('own2', at(12, 9, 30), 30), row('open', at(12, 10), 30)];
    expect(findMoveOptions(rows, { minutes: 60, split: true }, at(12, 9), NOW)).toEqual([at(12, 9, 30)]);
  });

  it('keeps to the same hub; an untagged row fits any hub', () => {
    const rows = [row('p', at(12, 9), 30, 'Playground'), row('a', at(12, 10), 30, 'Academy'), row('n', at(12, 11), 30, null)];
    expect(findMoveOptions(rows, { minutes: 30, split: false, hub: 'Playground' }, at(13, 9), NOW)).toEqual([at(12, 9), at(12, 11)]);
  });

  it('options come back in time order, once each', () => {
    const rows = [row('late', at(14, 9), 60), row('early', at(12, 9), 60), row('dupe', at(12, 9), 60)];
    expect(findMoveOptions(rows, { minutes: 60, split: false }, at(20, 9), NOW)).toEqual([at(12, 9), at(14, 9)]);
  });

  it('only a 60-minute lesson on two rows is "split"', () => {
    expect(isSplitLesson(60, 2)).toBe(true);
    expect(isSplitLesson(60, 1)).toBe(false);
    expect(isSplitLesson(30, 2)).toBe(false);
  });

  it('groups start times by calendar day', () => {
    const groups = groupByDay([at(12, 9), at(12, 10), at(13, 9)]);
    expect(groups.map((g) => g.starts.length)).toEqual([2, 1]);
  });
});

describe('weekly series removal', () => {
  const pattern = { type: 'weekly', selections: [{ weekday: 1, time: '10:00' }], created_at: 'x' };
  const other = { type: 'weekly', selections: [{ weekday: 1, time: '10:00' }], created_at: 'y' };
  const rows = [
    { id: '1', start_time: at(5, 10), recurring_pattern: pattern },
    { id: '2', start_time: at(12, 10), recurring_pattern: pattern },
    { id: '3', start_time: at(19, 10), recurring_pattern: pattern },
    { id: '4', start_time: at(19, 10), recurring_pattern: other },   // another series at the same time
    { id: '5', start_time: at(26, 10), recurring_pattern: null },    // a single slot
  ];

  it('takes this slot and the later weeks of the SAME series only', () => {
    const ids = seriesMembers(rows, pattern, new Date(at(12, 10))).map((r) => r.id);
    expect(ids).toEqual(['2', '3']);
  });

  it('never reaches back before the clicked week', () => {
    expect(seriesMembers(rows, pattern, new Date(at(19, 10))).map((r) => r.id)).toEqual(['3']);
  });

  it('tells booked rows (a lesson, or an invited student) from open ones', () => {
    expect(isBookedRow({ lesson_id: 'L', is_booked: true, student_id: 'S' })).toBe(true);
    expect(isBookedRow({ lesson_id: null, is_booked: true, student_id: 'S' })).toBe(true);
    expect(isBookedRow({ lesson_id: null, is_booked: false, student_id: null })).toBe(false);
  });
});

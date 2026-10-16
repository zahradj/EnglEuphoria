// Daily 10 scheduler (owner 2026-10-14: "add spacing"). Each item a student has met sits in a box; a right answer moves it up and pushes its next
// practice further away (days 1, 3, 7, 14, 30 after the last good answer), a wrong one sends it back to tomorrow. Today's Daily 10 is the (at most) ten
// most urgent items. Pure functions; the student's state is stored by the caller (database or browser). Academy-only; imports nothing outside this folder.
// Same spacing as recall.ts (DAILY_GAP_DAYS) so the lesson's Remember? and the Daily 10 agree. Boxes: 0 new, 1-2 learning, 3 known, 4-5 secure.
import { DAILY_GAP_DAYS } from './recall';

export const DAILY_TEN_SIZE = 10;
export const MAX_BOX = DAILY_GAP_DAYS.length; // 5

export interface DailyItem {
  item: string;
  /** 0 (new) to 5 (secure) */
  box: number;
  /** ISO date the item is next due */
  dueOn: string;
  /** ISO date of the last practice, if any */
  lastOn?: string;
  /** consecutive wrong answers (a stuck item gets a hint and a picture next time) */
  misses: number;
}
export type ItemStatus = 'new' | 'learning' | 'known' | 'secure' | 'fading';

const day = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000);
export const plusDays = (iso: string, n: number) => new Date((day(iso) + n) * 86400000).toISOString().slice(0, 10);

/** Items taught in a lesson on `lessonDate`: all due the next day. Existing items keep their state. */
export function addLessonItems(state: DailyItem[], items: string[], lessonDate: string): DailyItem[] {
  const have = new Set(state.map((s) => s.item));
  return [...state, ...items.filter((i) => !have.has(i)).map((item) => ({ item, box: 0, dueOn: plusDays(lessonDate, DAILY_GAP_DAYS[0]), misses: 0 }))];
}

/** Days an item is overdue (0 when not due yet). */
export const overdueDays = (s: DailyItem, today: string) => Math.max(0, day(today) - day(s.dueOn));

export function statusOf(s: DailyItem, today: string): ItemStatus {
  // fading: not practised for more than twice its gap past due (it is probably being forgotten)
  const gap = DAILY_GAP_DAYS[Math.min(s.box, MAX_BOX - 1)];
  if (s.box > 0 && overdueDays(s, today) > gap * 2) return 'fading';
  return s.box === 0 ? 'new' : s.box <= 2 ? 'learning' : s.box === 3 ? 'known' : 'secure';
}

/** Today's Daily 10: items due today or overdue, most overdue first (fading ones first of all), then lowest box; at most `size`. */
export function dailyTenFor(state: DailyItem[], today: string, size = DAILY_TEN_SIZE): DailyItem[] {
  return state
    .filter((s) => s.dueOn <= today)
    .sort((a, b) => Number(statusOf(b, today) === 'fading') - Number(statusOf(a, today) === 'fading') || overdueDays(b, today) - overdueDays(a, today) || a.box - b.box)
    .slice(0, size);
}

/** What kind of task an item gets: recognise (hear and pick), say it aloud, or use it in a sentence. Speaking is practised from the start (docs/academy-speaking-practice.md). */
export function taskFor(s: DailyItem, today: string): 'recognise' | 'say' | 'use' {
  const st = statusOf(s, today);
  if (st === 'new' || s.misses >= 2) return 'recognise';
  return st === 'secure' ? 'use' : 'say';
}

/** Record answers: right moves the item up a box and pushes its next practice out; wrong sends it back to tomorrow. Never loses an item. */
export function applyDailyResults(state: DailyItem[], results: { item: string; ok: boolean }[], today: string): DailyItem[] {
  const by = new Map(results.map((r) => [r.item, r.ok]));
  return state.map((s) => {
    if (!by.has(s.item)) return s;
    if (by.get(s.item)) {
      const box = Math.min(MAX_BOX, s.box + 1);
      return { ...s, box, lastOn: today, misses: 0, dueOn: plusDays(today, DAILY_GAP_DAYS[Math.min(box, MAX_BOX) - 1]) };
    }
    return { ...s, box: 0, lastOn: today, misses: s.misses + 1, dueOn: plusDays(today, 1) };
  });
}

/** Progress summary for the student and teacher. */
export function summary(state: DailyItem[], today: string): Record<ItemStatus, number> & { dueToday: number } {
  const out = { new: 0, learning: 0, known: 0, secure: 0, fading: 0, dueToday: 0 };
  state.forEach((s) => { out[statusOf(s, today)] += 1; if (s.dueOn <= today) out.dueToday += 1; });
  return out;
}

// A student's practice record, kept in the browser for now (a stand-in for the database, which is not connected in this session): the Daily 10 item states,
// finished lessons with their "Say it" tally, and the days the Daily 10 was done. Everything fails soft: a blocked or private window just forgets.
// Swap load/save for a database call later; the shape below is what the table would hold. Docs: docs/academy-recall-spacing-progression.md.
import { addLessonItems, applyDailyResults, plusDays, type DailyItem, type GapReportInput } from '../curriculum/academy';

export interface PracticeData {
  items: DailyItem[];
  lessons: { id: string; on: string; spoken: number }[];
  /** ISO dates on which a Daily 10 was finished */
  daily10Days: string[];
}
export const emptyPractice = (): PracticeData => ({ items: [], lessons: [], daily10Days: [] });

const KEY = 'academy-practice-v1';
export function loadPractice(studentKey: string): PracticeData {
  try {
    const raw = window.localStorage.getItem(`${KEY}:${studentKey}`);
    return raw ? { ...emptyPractice(), ...(JSON.parse(raw) as PracticeData) } : emptyPractice();
  } catch {
    return emptyPractice();
  }
}
export function savePractice(studentKey: string, data: PracticeData): void {
  try {
    window.localStorage.setItem(`${KEY}:${studentKey}`, JSON.stringify(data));
  } catch {
    /* blocked storage: nothing is remembered, nothing breaks */
  }
}

/** A lesson was finished: its new items enter the Daily 10 (due tomorrow) and its "Say it" tally is kept. The same lesson played again only updates its tally. */
/** The words the student kept from a reading page (vars.bank, a comma list): they join the lesson's own items and return on the spaced Daily 10 schedule. */
export const bankItems = (vars: Record<string, string> | undefined): string[] => [...new Set((vars?.bank ?? '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean))];

export function recordLesson(d: PracticeData, lessonId: string, items: string[], today: string, spoken: number): PracticeData {
  const others = d.lessons.filter((l) => l.id !== lessonId);
  return { ...d, items: addLessonItems(d.items, items, today), lessons: [...others, { id: lessonId, on: today, spoken }] };
}

/** A Daily 10 was finished: right answers move items up the spacing boxes, wrong ones send them back to tomorrow. */
export function recordDaily10(d: PracticeData, results: { item: string; ok: boolean }[], today: string): PracticeData {
  return { ...d, items: applyDailyResults(d.items, results, today), daily10Days: d.daily10Days.includes(today) ? d.daily10Days : [...d.daily10Days, today] };
}

/** The input of the teacher's gap report. "Scheduled" Daily 10 days are an estimate: about three a week since the first lesson, over the last 14 days. */
export function reportInput(d: PracticeData, level: GapReportInput['level'], today: string): GapReportInput {
  const last = [...d.lessons].sort((a, b) => b.on.localeCompare(a.on))[0];
  const first = [...d.lessons].sort((a, b) => a.on.localeCompare(b.on))[0];
  const since = first ? Math.max(0, Math.floor((Date.parse(today) - Date.parse(first.on)) / 86400000)) : 0;
  const window = Math.min(14, since);
  const from = plusDays(today, -14);
  return {
    level, today, lastLessonOn: last?.on,
    daily10Scheduled: window >= 1 ? Math.max(1, Math.round((window * 3) / 7)) : undefined,
    daily10Done: d.daily10Days.filter((x) => x > from).length,
    items: d.items,
    spokenLastLesson: last?.spoken,
  };
}

/**
 * Merge two practice records (this device and the database) without losing anything: per Daily 10 item the state with the later last practice wins
 * (a higher box on a tie), lessons keep the later play of each, Daily 10 days are the union.
 */
export function mergePractice(a: PracticeData, b: PracticeData): PracticeData {
  const items = new Map<string, DailyItem>();
  for (const s of [...a.items, ...b.items]) {
    const cur = items.get(s.item);
    const better = !cur || (s.lastOn ?? '') > (cur.lastOn ?? '') || ((s.lastOn ?? '') === (cur.lastOn ?? '') && s.box > cur.box);
    if (better) items.set(s.item, s);
  }
  const lessons = new Map<string, PracticeData['lessons'][number]>();
  for (const l of [...a.lessons, ...b.lessons]) {
    const cur = lessons.get(l.id);
    if (!cur || l.on > cur.on || (l.on === cur.on && l.spoken > cur.spoken)) lessons.set(l.id, l);
  }
  return { items: [...items.values()], lessons: [...lessons.values()], daily10Days: [...new Set([...a.daily10Days, ...b.daily10Days])].sort() };
}

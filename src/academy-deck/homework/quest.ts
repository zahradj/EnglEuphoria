// Homework quest (Daily 10): pure data + logic, no React. A quest = chests; a chest = one 10-minute practice with 3 short, auto-marked,
// recall-only games (no new teaching). Chests unlock on calendar days after the lesson (the spacing is an ASSUMPTION to be tuned with data).
// Results are logged per knowledge item (word/chunk) and per day, never as XP-as-proof. Academy rules: no ranking, no timers, no emoji.
import type { Slide } from '../types';

export interface Chest {
  id: number;
  title: string;
  /** days to wait after the previous chest was finished (the first chest opens the day after the lesson) */
  gapDays: number;
  slides: Slide[];
}
export interface LogEntry { item: string; ok: boolean; date: string; chest: number }
export interface HwProgress {
  stars: Record<number, number>;
  doneAt: Record<number, string>;
  /** calendar days on which the student practised (a day counter; nothing is lost when a day is missed) */
  days: string[];
  log: LogEntry[];
}
export const emptyProgress = (): HwProgress => ({ stars: {}, doneAt: {}, days: [], log: [] });

/** 3 stars: at most 1 wrong try in the whole chest; 2 stars: up to 4; otherwise 1. Wrong tries never block and never remove stars already won. */
export const starsFor = (wrongTotal: number): 1 | 2 | 3 => (wrongTotal <= 1 ? 3 : wrongTotal <= 4 ? 2 : 1);

const dayNumber = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000);
export const addDays = (iso: string, n: number) => new Date((dayNumber(iso) + n) * 86400000).toISOString().slice(0, 10);

/** First day a chest can be opened (null = it opens as soon as the lesson date is reached). */
export function availableOn(chests: Chest[], p: HwProgress, id: number, lessonDate: string): string | null {
  const i = chests.findIndex((c) => c.id === id);
  if (i < 0) return null;
  if (i === 0) return addDays(lessonDate, chests[0].gapDays);
  const prev = p.doneAt[chests[i - 1].id];
  return prev ? addDays(prev, chests[i].gapDays) : null;
}

export type ChestState = 'done' | 'open' | 'waiting' | 'locked';
export function chestState(chests: Chest[], p: HwProgress, id: number, today: string, lessonDate: string, demo = false): ChestState {
  if (p.doneAt[id]) return 'done';
  const i = chests.findIndex((c) => c.id === id);
  if (i > 0 && !p.doneAt[chests[i - 1].id]) return 'locked';
  if (demo) return 'open';
  const on = availableOn(chests, p, id, lessonDate);
  return on && on <= today ? 'open' : 'waiting';
}

/** Record a finished chest: stars (never lower than before), the day, and one log entry per item of every game. */
export function applyResult(p: HwProgress, chest: Chest, results: { slideId: string; items: string[]; wrong: number }[], today: string): HwProgress {
  const wrongTotal = results.reduce((a, r) => a + r.wrong, 0);
  const stars = Math.max(p.stars[chest.id] ?? 0, starsFor(wrongTotal));
  const log = [...p.log, ...results.flatMap((r) => r.items.map((item) => ({ item, ok: r.wrong === 0, date: today, chest: chest.id })))];
  return { stars: { ...p.stars, [chest.id]: stars }, doneAt: { ...p.doneAt, [chest.id]: p.doneAt[chest.id] ?? today }, days: p.days.includes(today) ? p.days : [...p.days, today], log };
}

export const totalStars = (p: HwProgress) => Object.values(p.stars).reduce((a, b) => a + b, 0);

/** Items the student got wrong most often (for the teacher: start the next Remember? with these). */
export function weakItems(p: HwProgress): { item: string; tries: number; correct: number; rate: number }[] {
  const by: Record<string, { tries: number; correct: number }> = {};
  for (const e of p.log) {
    const r = (by[e.item] ??= { tries: 0, correct: 0 });
    r.tries += 1;
    r.correct += e.ok ? 1 : 0;
  }
  return Object.entries(by).map(([item, r]) => ({ item, ...r, rate: r.correct / r.tries })).sort((a, b) => a.rate - b.rate || b.tries - a.tries);
}

const KEY = 'academy-homework-v1';
export function loadProgress(lessonId: string): HwProgress {
  try {
    const raw = window.localStorage.getItem(`${KEY}:${lessonId}`);
    return raw ? { ...emptyProgress(), ...(JSON.parse(raw) as HwProgress) } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}
export function saveProgress(lessonId: string, p: HwProgress) {
  try {
    window.localStorage.setItem(`${KEY}:${lessonId}`, JSON.stringify(p));
  } catch {
    /* private window or blocked storage: the quest still works, it just does not remember */
  }
}

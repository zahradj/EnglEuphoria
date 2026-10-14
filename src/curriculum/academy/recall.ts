// Recall, spacing and progression (owner 2026-10-14: "remind the students about previous knowledge", "add spacing", "add progression").
// Pure functions over the lesson sequence: which earlier items and patterns must return in this lesson's Remember? (expanding gaps), the Daily 10 calendar,
// the big reviews (Remix, Finale), and a "you are here" view of progress. Academy-only; imports nothing outside src/curriculum/academy/.
// Rationale: spaced, expanding retrieval beats massed practice (docs/academy-learning-science.md); the gaps below are design choices, not measured optima [target].
import type { AcademyLessonBlueprint } from './lessonBlueprint';
import type { ItemSeed } from './itemTypes';
import { ACADEMY_ITEMS } from './items';
import { PA1_SEASONS } from './preA1';

/**
 * Gaps (in lessons that teach new language; Remix and Finale do not count) at which an item returns: the next such lesson, then 2, 4, 8 and 16 later
 * (about 3 days, 1, 2, 4 and 8 weeks at two lessons a week, a little longer with the review lessons in between).
 */
export const RECALL_GAPS = [1, 2, 4, 8, 16] as const;
/** How many items of an introducing lesson return at each gap (4+3+3+2+2 = 14 = the per-lesson cap, so every item returns at least once). */
export const RECALL_QUOTA: Record<number, number> = { 1: 4, 2: 3, 4: 3, 8: 2, 16: 2 };
/** Most items a Remember? may bring back (Pre-A1: fewer, as new items are capped at 8). */
export const MAX_REMEMBER_ITEMS = 12;
export const MAX_REMEMBER_ITEMS_PRE_A1 = 8;
/** Daily 10 calendar: days after the lesson on which its items are practised again. */
export const DAILY_GAP_DAYS = [1, 3, 7, 14, 30] as const;

/** One lesson of a track, in teaching order. */
export interface RecallNode {
  id: string;
  /** new items this lesson introduces (E7 and E8 introduce none) */
  items: string[];
  /** grammar patterns this lesson introduces (labels) */
  patterns: string[];
  objective: string;
  /** Season this lesson belongs to (for the big reviews) */
  seasonId: string;
  /** 1-8 */
  episode: number;
  bigRemix: boolean;
  /** true for the last lesson of a level (level check) */
  levelCheck: boolean;
}

export interface RecallDue {
  fromLessonId: string;
  gap: number;
  items: string[];
}
export interface RecallPlan {
  lessonId: string;
  /** earlier items to bring back in Remember?, nearest gap first, capped */
  due: RecallDue[];
  /** earlier patterns to check (one quick use each) */
  patterns: { fromLessonId: string; gap: number; pattern: string }[];
  /** E7 / E8: the whole Season (and the Season before it in a Big Remix) comes back */
  bigReview: { seasons: string[] } | null;
  total: number;
  /** the teacher's error log (up to 3 recurring errors) also starts the Remember? */
  errorLogSlots: 3;
}

export const nodesOfRoadmap = (blueprints: readonly AcademyLessonBlueprint[]): RecallNode[] =>
  blueprints.map((b) => {
    const bank = ACADEMY_ITEMS[b.seasonId];
    const key = `E${b.episode.no}` as 'E1';
    const seeds: ItemSeed[] = b.episode.no <= 6 && bank ? bank[key] ?? [] : [];
    return {
      id: b.id,
      items: seeds.map((x) => x[0]),
      patterns: b.structures.map((x) => x.label),
      objective: b.objective,
      seasonId: b.seasonId,
      episode: b.episode.no,
      bigRemix: b.assessment.bigRemix,
      levelCheck: b.assessment.levelCheck,
    };
  });

/** The Pre-A1 track (P1-P5): items are the episodes' new items, patterns are the Season chunk (introduced in E3). */
export const nodesOfPreA1 = (): RecallNode[] =>
  PA1_SEASONS.flatMap((s, si) =>
    s.episodes.map((e) => ({
      id: `${s.id}-E${e.no}`,
      items: [...e.newItems],
      patterns: e.no === 3 ? [s.chunk] : [],
      objective: e.objective,
      seasonId: s.id,
      episode: e.no,
      bigRemix: false,
      levelCheck: si === PA1_SEASONS.length - 1 && e.no === 8,
    })),
  );

/** Items of lesson j that return at step `step` (0-4): a rotating window, so each of the lesson's items returns at least once across the five steps. */
function window(items: string[], gap: number): string[] {
  const step = RECALL_GAPS.indexOf(gap as (typeof RECALL_GAPS)[number]);
  const q = RECALL_QUOTA[gap];
  const start = RECALL_GAPS.slice(0, step).reduce((a, g) => a + RECALL_QUOTA[g], 0);
  return items.length === 0 ? [] : Array.from({ length: Math.min(q, items.length) }, (_, k) => items[(start + k) % items.length]);
}

export function recallPlan(nodes: readonly RecallNode[], lessonId: string, cap = MAX_REMEMBER_ITEMS): RecallPlan | null {
  const i = nodes.findIndex((n) => n.id === lessonId);
  if (i < 0) return null;
  const me = nodes[i];
  // earlier lessons that introduced language, nearest last
  const taught = nodes.slice(0, i).filter((n) => n.items.length > 0);
  const due: RecallDue[] = [];
  const patterns: RecallPlan['patterns'] = [];
  let total = 0;
  for (const gap of RECALL_GAPS) {
    const from = taught[taught.length - gap];
    if (!from) continue;
    const items = window(from.items, gap).slice(0, Math.max(0, cap - total));
    if (items.length) { due.push({ fromLessonId: from.id, gap, items }); total += items.length; }
    if (gap >= 2) from.patterns.forEach((pattern) => patterns.push({ fromLessonId: from.id, gap, pattern }));
  }
  let bigReview: RecallPlan['bigReview'] = null;
  if (me.episode >= 7) {
    const seasons = [me.seasonId];
    const prev = [...new Set(nodes.slice(0, i).map((n) => n.seasonId))].filter((x) => x !== me.seasonId).pop();
    if (me.bigRemix && prev) seasons.push(prev);
    bigReview = { seasons };
  }
  return { lessonId, due, patterns, bigReview, total, errorLogSlots: 3 };
}

/** Daily 10 calendar for the items of a lesson taught on `day` (a day number): the days they are practised again. */
export const dailyCalendar = (day: number): number[] => DAILY_GAP_DAYS.map((g) => day + g);

export interface Progress {
  lessonId: string;
  /** 1-8 within the Season */
  episode: number;
  seasonIndexInTrack: number;
  seasonsInTrack: number;
  buildsOn: string | null;
  unlocks: string | null;
  /** Seasons already finished before this lesson */
  seasonsDone: string[];
  itemsKnownBefore: number;
  newItems: number;
}
export function progressOf(nodes: readonly RecallNode[], lessonId: string): Progress | null {
  const i = nodes.findIndex((n) => n.id === lessonId);
  if (i < 0) return null;
  const seasons = [...new Set(nodes.map((n) => n.seasonId))];
  const me = nodes[i];
  const before = nodes.slice(0, i);
  return {
    lessonId,
    episode: me.episode,
    seasonIndexInTrack: seasons.indexOf(me.seasonId) + 1,
    seasonsInTrack: seasons.length,
    buildsOn: i > 0 ? nodes[i - 1].objective : null,
    unlocks: i + 1 < nodes.length ? nodes[i + 1].objective : null,
    seasonsDone: seasons.slice(0, seasons.indexOf(me.seasonId)),
    itemsKnownBefore: before.reduce((a, n) => a + n.items.length, 0),
    newItems: me.items.length,
  };
}

/**
 * Per-browser progress for the Playground games: stars per stop, how far the
 * student has got, and how many times the whole journey was finished. Local
 * only — it is a convenience, never a source of truth, so every read/write is
 * wrapped and the games work without it.
 */
const KEY = 'eg.playgroundGames.v2';

export interface GameProgress {
  /** Best stars (0-3) for each stop of the journey. */
  stageStars: number[];
  /** Furthest stop the student may start (index). */
  unlocked: number;
  /** Times the last stop was finished. */
  plays: number;
  /** Best overall rating (0-3) from a finished journey. */
  bestStars: number;
}

export const EMPTY_PROGRESS: GameProgress = { stageStars: [], unlocked: 0, plays: 0, bestStars: 0 };

export function readGameProgress(): Record<string, GameProgress> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, GameProgress>) : {};
  } catch {
    return {};
  }
}

export function getGameProgress(id: string): GameProgress {
  return { ...EMPTY_PROGRESS, ...(readGameProgress()[id] ?? {}) };
}

/** Overall rating of a journey: the average of its stops, rounded. */
export function overallStars(stageStars: number[], stageCount: number): number {
  if (stageStars.length < stageCount || stageStars.slice(0, stageCount).some((s) => !s)) return 0;
  return Math.round(stageStars.slice(0, stageCount).reduce((a, b) => a + b, 0) / stageCount);
}

export function recordStageResult(id: string, stageIdx: number, stars: number, stageCount: number): GameProgress {
  const all = readGameProgress();
  const prev = { ...EMPTY_PROGRESS, ...(all[id] ?? {}) };
  const stageStars = Array.from({ length: stageCount }, (_, i) => prev.stageStars[i] ?? 0);
  stageStars[stageIdx] = Math.max(stageStars[stageIdx], stars);
  const finishedJourney = stageIdx === stageCount - 1;
  const next: GameProgress = {
    stageStars,
    unlocked: Math.min(stageCount - 1, Math.max(prev.unlocked, stageIdx + 1)),
    plays: prev.plays + (finishedJourney ? 1 : 0),
    bestStars: Math.max(prev.bestStars, finishedJourney ? overallStars(stageStars, stageCount) : 0),
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...all, [id]: next }));
  } catch {
    /* private mode / blocked storage: just don't remember */
  }
  return next;
}

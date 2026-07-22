// Daily Discovery Play — local-only state tracker.
// Resets every 24h based on the user's local calendar day.

const KEY = 'engleuphoria.dailyPlay.v1';
export const DAILY_XP_BONUS = 25;

export type DailyGameKey = 'memory' | 'bubble';

export interface DailyPlayState {
  lastCompletedISODate: string | null; // YYYY-MM-DD in local time
  streak: number;
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDailyPlayState(): DailyPlayState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { lastCompletedISODate: null, streak: 0 };
    const parsed = JSON.parse(raw) as DailyPlayState;
    return {
      lastCompletedISODate: parsed.lastCompletedISODate ?? null,
      streak: Number.isFinite(parsed.streak) ? parsed.streak : 0,
    };
  } catch {
    return { lastCompletedISODate: null, streak: 0 };
  }
}

export function isDailyPlayCompleted(): boolean {
  return getDailyPlayState().lastCompletedISODate === todayISO();
}

export function markDailyPlayCompleted(): DailyPlayState {
  const cur = getDailyPlayState();
  const today = todayISO();
  if (cur.lastCompletedISODate === today) return cur; // already done
  const nextStreak = cur.lastCompletedISODate === yesterdayISO() ? cur.streak + 1 : 1;
  const next: DailyPlayState = { lastCompletedISODate: today, streak: nextStreak };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
  return next;
}

export function getStreak(): number {
  return getDailyPlayState().streak;
}

// Deterministic per-day pick: same game for all visits on the same calendar day.
export function getTodayGameKey(): DailyGameKey {
  const t = todayISO();
  let seed = 0;
  for (let i = 0; i < t.length; i++) seed = (seed * 31 + t.charCodeAt(i)) >>> 0;
  return seed % 2 === 0 ? 'memory' : 'bubble';
}

export function msUntilLocalMidnight(): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

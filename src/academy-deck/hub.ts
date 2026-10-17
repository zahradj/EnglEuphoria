import type { DeckScript } from './types';

/** "B1-S01-E1" -> level B1, season 1, episode 1; "PA1-S02-E3" -> Pre-A1. Falls back to the script's level. */
export function levelLine(script: DeckScript): { level: string; season?: number; episode?: number } {
  const m = /^(PA1|A1|A2|B1|B2|C1)-S(\d+)-E(\d+)/.exec(script.lessonId);
  if (!m) return { level: script.level };
  return { level: m[1] === 'PA1' ? 'Pre-A1' : m[1], season: Number(m[2]), episode: Number(m[3]) };
}

/** Player levels from experience points: a quiet, teen-tasteful ladder (no mascots). XP = 10 per right answer + 15 per line said aloud. */
export const RANKS = ['Newcomer', 'Explorer', 'Insider', 'Expert', 'Master'] as const;
export function rankOf(xp: number): { n: number; name: string; into: number; span: number } {
  const span = 150;
  const n = Math.min(RANKS.length, 1 + Math.floor(xp / span));
  return { n, name: RANKS[n - 1], into: n === RANKS.length ? span : xp - (n - 1) * span, span };
}
export const xpOf = (right: number, spoken: number): number => right * 10 + spoken * 15;

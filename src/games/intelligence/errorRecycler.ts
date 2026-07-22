// Error Recycler — surfaces items the learner recently got wrong so games
// exercise them again. Reads from LearnerIntelligence.error_patterns
// (aggregated from mistake_repository) AND live session_errors.
//
// Deterministic ordering:
//   1. session_errors (freshest, this-lesson) — highest priority
//   2. mastery_gap patterns with high frequency + persistence
//   3. developmental patterns (recent, moderate frequency)
//   4. careless patterns — LOWEST priority (already close to mastery)

import type { GameItem, GameSessionStats } from './types';
import type { ErrorPattern } from '@/intelligence/types';

const CLASS_WEIGHT: Record<ErrorPattern['classification'], number> = {
  mastery_gap: 1.0,
  developmental: 0.7,
  careless: 0.3,
};

export function recycleErrors(
  patterns: ErrorPattern[],
  session: GameSessionStats,
  limit: number,
): GameItem[] {
  const out: GameItem[] = [];

  // 1. Session-fresh errors first.
  for (const e of session.session_errors.slice(-limit)) {
    out.push({
      id: `err_session_${hash(e.payload)}`,
      payload: e.expected,
      meta: { surface: e.payload, source: 'session', at: e.at },
      provenance: 'error_recycle',
      value: 0.95,
    });
    if (out.length >= limit) return out;
  }

  // 2. Persisted patterns, scored.
  const scored = patterns
    .map((p) => ({
      p,
      score:
        CLASS_WEIGHT[p.classification] *
        (Math.log1p(p.frequency) + Math.min(1, p.persistence_days / 14)),
    }))
    .sort((a, b) => b.score - a.score);

  for (const { p, score } of scored) {
    if (out.length >= limit) break;
    // Dedup vs session-fresh (avoid recycling the same surface twice)
    if (out.some((it) => (it.meta?.surface as string | undefined)?.toLowerCase() === p.surface.toLowerCase())) continue;
    out.push({
      id: `err_pattern_${p.id}`,
      payload: p.target,
      meta: {
        surface: p.surface,
        category: p.category,
        classification: p.classification,
        frequency: p.frequency,
      },
      provenance: 'error_recycle',
      value: Math.min(0.9, 0.5 + score * 0.1),
    });
  }

  return out;
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 8);
}

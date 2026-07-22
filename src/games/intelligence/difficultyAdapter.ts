// Real-time difficulty adaptation for any running game.
//
// Deterministic: tier moves ±1 only when a rolling accuracy window crosses a
// bounded threshold. Never sampled. Bounded by the hub CEFR ceiling upstream
// (we only clamp 1..5 here — the arcade/coherence engines already refuse
// out-of-range tiers).

import type { DifficultyDecision, DifficultyTier, GameSessionStats } from './types';

const WINDOW_SIZE = 6;                 // last 6 attempts drive the decision
const UP_THRESHOLD = 5 / 6;            // 5/6 correct → bump up
const DOWN_THRESHOLD = 2 / 6;          // ≤2/6 correct → bump down
const FAST_MS = 2500;
const SLOW_MS = 9000;

export function adjustDifficulty(
  currentTier: DifficultyTier,
  currentScaffold: 0 | 1 | 2,
  stats: GameSessionStats,
): DifficultyDecision {
  const window = stats.window.slice(-WINDOW_SIZE);
  const denom = window.length || 1;
  const acc = window.filter(Boolean).length / denom;

  // Not enough evidence → hold steady.
  if (window.length < 3) {
    return {
      tier: currentTier,
      scaffolding_boost: currentScaffold,
      pacing: 'maintain',
      reason: 'insufficient_evidence',
    };
  }

  // Streak of 3 wrong → immediate compassionate down-shift.
  if (window.slice(-3).every((v) => v === false)) {
    return {
      tier: clamp(currentTier - 1),
      scaffolding_boost: Math.min(2, currentScaffold + 1) as 0 | 1 | 2,
      pacing: 'slow_down',
      reason: 'triple_miss_compassion',
    };
  }

  if (acc >= UP_THRESHOLD) {
    return {
      tier: clamp(currentTier + 1),
      scaffolding_boost: Math.max(0, currentScaffold - 1) as 0 | 1 | 2,
      pacing: fastPacing(stats.avg_response_ms),
      reason: `acc_${acc.toFixed(2)}_above_${UP_THRESHOLD.toFixed(2)}`,
    };
  }

  if (acc <= DOWN_THRESHOLD) {
    return {
      tier: clamp(currentTier - 1),
      scaffolding_boost: Math.min(2, currentScaffold + 1) as 0 | 1 | 2,
      pacing: 'slow_down',
      reason: `acc_${acc.toFixed(2)}_below_${DOWN_THRESHOLD.toFixed(2)}`,
    };
  }

  return {
    tier: currentTier,
    scaffolding_boost: currentScaffold,
    pacing: 'maintain',
    reason: `acc_${acc.toFixed(2)}_in_band`,
  };
}

function clamp(t: number): DifficultyTier {
  return Math.max(1, Math.min(5, Math.round(t))) as DifficultyTier;
}

function fastPacing(ms?: number): DifficultyDecision['pacing'] {
  if (ms && ms < FAST_MS) return 'accelerate';
  if (ms && ms > SLOW_MS) return 'slow_down';
  return 'maintain';
}

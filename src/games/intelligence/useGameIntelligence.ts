// React hook that wires any game component into the Game Intelligence Layer.
//
// Usage inside a game runner:
//
//   const { decision, onCorrect, onWrong, onSkip } = useGameIntelligence({
//     ctx, initialTier: 3, baseline,
//   });
//   const currentItem = decision.items[step];
//   ...
//   <button onClick={() => onCorrect(currentItem.id)}>...</button>
//
// The hook re-runs the intelligence layer whenever session stats change past
// the WINDOW_SIZE threshold, so difficulty adapts in real time.

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  runGameIntelligence,
  emptyStats,
  foldObservation,
} from './index';
import type {
  DifficultyTier,
  GameIntelligenceContext,
  GameIntelligenceDecision,
  GameItem,
  GameSessionStats,
} from './types';

export interface UseGameIntelligenceArgs {
  ctx: GameIntelligenceContext;
  initialTier: DifficultyTier;
  initialScaffold?: 0 | 1 | 2;
  /** Fresh target items the game wants to test (typically lesson vocab/grammar). */
  baseline: GameItem[];
}

export interface UseGameIntelligenceReturn {
  decision: GameIntelligenceDecision;
  stats: GameSessionStats;
  onCorrect: (itemId: string, responseMs?: number) => void;
  onWrong: (itemId: string, payload: string, expected: string, responseMs?: number) => void;
  onSkip: (itemId: string) => void;
  reset: () => void;
}

export function useGameIntelligence(args: UseGameIntelligenceArgs): UseGameIntelligenceReturn {
  const { ctx, initialTier, initialScaffold = 0, baseline } = args;
  const [stats, setStats] = useState<GameSessionStats>(emptyStats());
  const tierRef = useRef<DifficultyTier>(initialTier);
  const scaffoldRef = useRef<0 | 1 | 2>(initialScaffold);

  const decision = useMemo(() => {
    const d = runGameIntelligence({
      ctx,
      currentTier: tierRef.current,
      scaffold: scaffoldRef.current,
      sessionStats: stats,
      baseline,
    });
    tierRef.current = d.difficulty.tier;
    scaffoldRef.current = d.difficulty.scaffolding_boost;
    return d;
    // Recompute only when stats window advances or context changes — keeps
    // deterministic ordering during a single round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.target?.skill_key, ctx.cefr, ctx.round_size, baseline.length, stats.window.length]);

  const onCorrect = useCallback((_id: string, ms?: number) => {
    setStats((s) => foldObservation(s, { type: 'correct', response_ms: ms }));
  }, []);

  const onWrong = useCallback((_id: string, payload: string, expected: string, ms?: number) => {
    setStats((s) => foldObservation(s, { type: 'wrong', payload, expected, response_ms: ms }));
  }, []);

  const onSkip = useCallback((_id: string) => {
    setStats((s) => foldObservation(s, { type: 'skip' }));
  }, []);

  const reset = useCallback(() => setStats(emptyStats()), []);

  return { decision, stats, onCorrect, onWrong, onSkip, reset };
}

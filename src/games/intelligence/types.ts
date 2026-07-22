// Advanced AI Features — Game Intelligence Layer types.
//
// Cross-cutting runtime intelligence that wraps ANY game (Arcade,
// in-lesson Game Pack, Homework game, Chat Quest, Boss Round) with:
//   1. Difficulty adaptation (real-time tier ±1 based on running accuracy)
//   2. Error recycling (surface items from mistake_repository / error_patterns)
//   3. Personalization (inject learner interests into item selection)
//   4. Progressive review (pull spaced items from memory_items due queue)
//
// Pure TS, safe to import from edge functions. NEVER calls Lovable AI Gateway.
// Reads LearnerIntelligence assembled by `runIntelligence()`.

import type { Cefr } from '@/governance/types';
import type { LearnerIntelligence, ErrorPattern, ReviewItem } from '@/intelligence/types';
import type { ReinforcementTarget } from '@/coherence/types';

export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

/** A single playable item inside a game round (word, phrase, prompt, etc.). */
export interface GameItem {
  id: string;
  /** The primary linguistic payload — word / phrase / grammar prompt. */
  payload: string;
  /** Optional gloss / distractors / metadata. */
  meta?: Record<string, unknown>;
  /** Provenance — why the intelligence layer selected this item. */
  provenance:
    | 'target'          // from the lesson ReinforcementTarget
    | 'error_recycle'   // pulled from mistake_repository / error_patterns
    | 'spaced_review'   // pulled from memory_items due queue
    | 'interest_swap'   // topic swapped for learner interest
    | 'baseline';       // catalog fallback
  /** 0..1 educational value; drives ordering. */
  value: number;
}

/** Running session stats fed back to the difficulty adapter. */
export interface GameSessionStats {
  attempts: number;
  correct: number;
  streak: number;
  /** Last N attempts, newest last, `true` = correct. */
  window: boolean[];
  /** Average response ms across correct attempts (used for pacing). */
  avg_response_ms?: number;
  /** Recent mistakes captured this session (for the recycler). */
  session_errors: Array<{ payload: string; expected: string; at: string }>;
}

export interface DifficultyDecision {
  /** New tier the game should render at. */
  tier: DifficultyTier;
  /** Scaffolding boost 0..2 — extra hints/visuals shown in the UI. */
  scaffolding_boost: 0 | 1 | 2;
  /** Pacing hint carried through to game-feel. */
  pacing: 'slow_down' | 'maintain' | 'accelerate';
  /** Human-readable reason for the change (telemetry only). */
  reason: string;
}

export interface GameIntelligenceContext {
  cefr: Cefr;
  target: ReinforcementTarget | null;
  intelligence: Pick<
    LearnerIntelligence,
    | 'learner_profile'
    | 'error_patterns'
    | 'review_priority'
    | 'adaptive_support'
    | 'engagement_state'
    | 'speaking_confidence'
  >;
  /** Deterministic upper bound on items composed for this round. */
  round_size: number;
}

export interface GameIntelligenceDecision {
  items: GameItem[];
  difficulty: DifficultyDecision;
  /** Prompt fragment for LLM-driven games (chained after arcade prompt). */
  prompt_hint: string;
  /** Structured trace for QA / analytics. */
  trace: {
    from_target: number;
    from_error_recycle: number;
    from_spaced_review: number;
    from_interest_swap: number;
    from_baseline: number;
    interests_used: string[];
    error_ids_used: string[];
    review_keys_used: string[];
  };
}

export type ObservationCallback = (evt:
  | { type: 'correct'; itemId: string; response_ms?: number }
  | { type: 'wrong'; itemId: string; got?: string; expected?: string; response_ms?: number }
  | { type: 'skip'; itemId: string }
) => void;

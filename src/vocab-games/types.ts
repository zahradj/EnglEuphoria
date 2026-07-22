/**
 * Vocab Games Engine — public types.
 *
 * Standalone reinforcement engine mounted by Academy/Success (and optionally
 * Playground) lessons as ONE slide-slot. It never rewrites the host lesson —
 * the host passes targets + hub + cefr and the engine handles selection,
 * theming, rendering, scoring, and telemetry emission.
 *
 * Contract inherits from ESL Game Studio (G0):
 *   - Every game bound to a ReinforcementTarget.
 *   - Deterministic selection (no Math.random for archetype choice).
 *   - Hub caps: Academy 4/12min, Success 3/10min, Playground 3/8min.
 */

export type Hub = 'playground' | 'academy' | 'success';

export type Cefr = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface VocabTarget {
  /** Canonical headword. Lowercase. */
  word: string;
  /** Short learner-facing definition. */
  definition?: string;
  /** Example sentence containing the headword. */
  example?: string;
  /** Optional pre-generated image URL for the word. */
  image_url?: string | null;
}

export type VocabGameId =
  | 'memory_grid'      // card-flip memory (word ↔ definition)
  | 'meaning_maze'     // 4-choice definition MCQ
  | 'word_rush'        // rapid word ↔ image tap
  | 'definition_sprint'// typing-light: first-letter recall from definition
  | 'sound_match'      // word ↔ audio (uses Web Speech if no audio)
  | 'boss_round'       // KhanQuest narrative wrapper — MCQ as combat turns
  | 'rescue_round';    // Compassionate variant — correct answers heal an ally NPC

export interface VocabGameSpec {
  id: VocabGameId;
  targets: VocabTarget[];
  hub: Hub;
  cefr: Cefr;
  /** Difficulty tier 1..5. */
  tier: number;
}

export interface VocabGameEvent {
  game: VocabGameId;
  round_index: number;
  correct: boolean;
  target_word: string;
  ms_elapsed: number;
}

/**
 * Slot mode — same engine, three lesson contexts:
 *  - 'lesson'  : in-lesson reinforcement (full hub cap, varied games, retry-friendly)
 *  - 'review'  : Lesson 6-style review (fast, cumulative, recycles missed items)
 *  - 'quiz'    : Unit-end assessment (single-pass MCQ, no retries, 80% gate)
 */
export type VocabGamesMode = 'lesson' | 'review' | 'quiz';

export interface VocabGamesSlotProps {
  lessonId?: string;
  /** Optional unit id — enables Unit Progress Report on quiz completion. */
  unitId?: string;
  /** Optional unit title shown in the Unit Progress Report. */
  unitTitle?: string;
  /** Optional student display name for the Unit Progress Report. */
  studentName?: string;
  hub: Hub;
  cefr: Cefr;
  /** Reinforcement targets from coherence. Engine slices per game. */
  targets: VocabTarget[];
  /** Optional cap; defaults to hub cap. */
  maxGames?: number;
  /** Layout + exercise profile. Defaults to 'lesson'. */
  mode?: VocabGamesMode;
  /** Pass threshold for quiz mode (0..1). Defaults to 0.8. */
  passThreshold?: number;
  /** Fires per round; host wires to observer / SM-2. */
  onEvent?: (e: VocabGameEvent) => void;
  /** Fires once when the whole arc completes (all games finished). */
  onComplete?: (summary: {
    mode: VocabGamesMode;
    accuracy: number;
    passed?: boolean;
    ms_elapsed: number;
    events: VocabGameEvent[];
    /** One entry per boss_round played in this arc (empty when none). */
    boss_outcomes?: BossOutcome[];
  }) => void;
}

/** Emitted per BossRound completion (via engine + `vocab-arc:boss-complete`). */
export interface BossOutcome {
  hub: Hub;
  cefr: Cefr;
  correct: number;
  total: number;
  ms_elapsed: number;
  victory: boolean;
}


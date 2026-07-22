/**
 * Escape Room Engine — sequential language-puzzle doors.
 *
 * Each door is ONE linguistic puzzle bound to the lesson's ReinforcementTarget.
 * Solving unlocks the next door. Wrong = compassionate hint, retry allowed.
 *
 * Puzzle types (deterministic renderers, AI fills content):
 *   - unscramble  : letters → word (vocab)
 *   - cloze       : "I ___ breakfast" (grammar/vocab)
 *   - order       : reorder tokens into a sentence (syntax)
 *   - odd_one_out : pick the outlier (semantic/grammatical)
 *   - riddle      : short clues → answer (listening/reading + vocab)
 */

export type Hub = 'playground' | 'academy' | 'success';
export type Cefr = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type PuzzleKind = 'unscramble' | 'cloze' | 'order' | 'odd_one_out' | 'riddle';

interface BasePuzzle {
  id: string;
  kind: PuzzleKind;
  /** Which target this door practices. */
  target_ref: string;
  /** Learner-facing door label ("Door 1: The Kitchen"). */
  door_label: string;
  /** 1-sentence door narration (immersive). */
  door_narration: string;
  /** Compassionate hint shown after first wrong attempt. */
  hint: string;
  /** Celebratory feedback shown on solve. */
  solve_feedback: string;
  /** Image prompt (V0 guard tail). */
  image_prompt: string;
  image_url: string | null;
}

export interface UnscramblePuzzle extends BasePuzzle { kind: 'unscramble'; scrambled: string; answer: string }
export interface ClozePuzzle extends BasePuzzle { kind: 'cloze'; sentence: string; blank_index: number; options: string[]; answer: string }
export interface OrderPuzzle extends BasePuzzle { kind: 'order'; tokens: string[]; answer: string[] }
export interface OddOneOutPuzzle extends BasePuzzle { kind: 'odd_one_out'; items: string[]; answer: string; reason: string }
export interface RiddlePuzzle extends BasePuzzle { kind: 'riddle'; clues: string[]; options: string[]; answer: string }

export type Puzzle = UnscramblePuzzle | ClozePuzzle | OrderPuzzle | OddOneOutPuzzle | RiddlePuzzle;

export interface EscapeRoom {
  hub: Hub;
  cefr: Cefr;
  title: string;
  target_skill: string;
  target_ref_ids: string[];
  doors: Puzzle[];
  final_reward: { message: string; image_prompt: string; image_url: string | null };
}

export interface EscapeEvent {
  door_id: string;
  kind: PuzzleKind;
  solved: boolean;
  attempts: number;
  ms_elapsed: number;
}

export interface EscapeRoomSlotProps {
  hub: Hub;
  cefr: Cefr;
  lessonId?: string;
  room: EscapeRoom;
  onEvent?: (e: EscapeEvent) => void;
  onComplete?: (summary: {
    solved: number;
    total: number;
    total_attempts: number;
    ms_elapsed: number;
    events: EscapeEvent[];
  }) => void;
}

/**
 * Detective Mystery Engine — question-driven inference game.
 *
 * Student solves a case by asking questions from a bounded pool. Every
 * question is a linguistic act (yes/no form, wh- form, past-simple form)
 * bound to the lesson's ReinforcementTarget.
 *
 * Deterministic core:
 *   - Case + suspects + clues are AI-generated ONCE, then locked.
 *   - Runner just gates question→clue reveals + tracks a final accusation.
 *
 * Pedagogical target types:
 *   - "yes_no_questions" (Do you...? Did you...? Have you...?)
 *   - "wh_questions"     (Where were you...? What did you...?)
 *   - "past_simple"      (What did you do at 8pm?)
 *   - "modal_speculation"(He must have..., She might have...)  ← B1+ only
 */

export type Hub = 'playground' | 'academy' | 'success';
export type Cefr = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type QuestionKind = 'yes_no' | 'wh' | 'past_simple' | 'modal_speculation';

export interface Suspect {
  id: string;
  name: string;
  role: string;              // "the gardener", "the chef"
  alibi: string;             // narrative alibi, may contain a lie
  image_prompt: string;
  image_url: string | null;
  is_culprit: boolean;
}

export interface DetectiveQuestion {
  id: string;
  kind: QuestionKind;
  /** Learner-facing question text (the linguistic form under practice). */
  text: string;
  /** Which suspect this question targets. */
  suspect_id: string;
  /** Clue revealed on ask (compassionate, always useful). */
  reveals: string;
  target_ref: string;
}

export interface DetectiveCase {
  hub: Hub;
  cefr: Cefr;
  title: string;
  target_skill: string;
  target_ref_ids: string[];
  briefing: string;          // "Someone stole the trophy from the museum..."
  setting_image_prompt: string;
  setting_image_url: string | null;
  suspects: Suspect[];       // exactly one has is_culprit=true
  question_pool: DetectiveQuestion[];
  /** Max questions the student may ask before must accuse. */
  question_budget: number;
  epilogue: { win: string; lose: string };
}

export interface DetectiveEvent {
  type: 'ask' | 'accuse';
  payload: { question_id?: string; suspect_id?: string; correct?: boolean };
  ms_elapsed: number;
}

export interface DetectiveSlotProps {
  hub: Hub;
  cefr: Cefr;
  lessonId?: string;
  case: DetectiveCase;
  onEvent?: (e: DetectiveEvent) => void;
  onComplete?: (summary: {
    solved: boolean;
    questions_used: number;
    ms_elapsed: number;
    events: DetectiveEvent[];
  }) => void;
}

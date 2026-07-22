import type { XPActionType } from '../types';

/**
 * Base XP per action. Effort/mastery/bravery multipliers applied by xpAwarder.
 * Values are conservative on purpose — pedagogy first.
 */
export const XP_BASE: Record<XPActionType, number> = {
  phonics_listen: 10,
  vocab_quiz_pass: 25,
  speaking_submit: 50,
  speaking_bravery: 35,            // bravery itself is rewarded (attempt > correctness)
  pronunciation_attempt: 15,
  pronunciation_improvement: 40,
  library_read: 30,
  class_attended: 100,
  mission_complete: 75,
  mastery_milestone: 60,           // ≥85% on a tracked item (from adaptive layer)
  review_streak: 20,
  lesson_complete: 80,
};

/**
 * Hard rate caps per action per day. Prevents engagement farming.
 * Above the cap, action still counts pedagogically but XP is 0.
 */
export const XP_DAILY_CAP: Partial<Record<XPActionType, number>> = {
  phonics_listen: 20,
  vocab_quiz_pass: 30,
  speaking_submit: 15,
  speaking_bravery: 20,
  pronunciation_attempt: 30,
  library_read: 10,
  review_streak: 25,
};

export const MULTIPLIER_BOUNDS = {
  effort: { min: 1.0, max: 1.5 },
  mastery: { min: 1.0, max: 1.3 },
  bravery: { min: 1.0, max: 1.5 },
  consistency: { min: 1.0, max: 1.2 },
};

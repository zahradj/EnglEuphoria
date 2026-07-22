/**
 * Cycle 3 Adaptive Routing — Remediation thresholds.
 *
 * These constants drive both the macro (end-of-unit mastery quiz) and the
 * micro (in-lesson 3-strike) remedial pathways. Tuning here changes the
 * sensitivity of the entire "safety net" without code changes elsewhere.
 */
export const PASS_THRESHOLD = 80;

/** How many third-strike reteach events inside Phase 3 trigger an in-lesson Confidence Builder. */
export const MICRO_REMEDIATION_THIRD_STRIKE_TRIGGER = 2;

/** Hard cap on remedial regeneration attempts per source unit quiz to prevent loops. */
export const MAX_REMEDIAL_ATTEMPTS_PER_UNIT = 2;

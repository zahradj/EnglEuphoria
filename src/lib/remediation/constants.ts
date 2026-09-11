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

/**
 * Per-lesson, per-domain automatic Extra Practice gate — mirrors Novakid's
 * review-lesson rule: Speaking assigns on ANY failed competency; Grammar and
 * Reading assign once at least half of that domain's tracked competencies
 * failed this lesson. Domains not listed here fall back to the Grammar/
 * Reading (fraction) rule rather than the stricter Speaking (any) rule.
 */
export const DOMAIN_ANY_FAIL_TRIGGERS = new Set(['speaking']);
export const DOMAIN_FAIL_FRACTION_THRESHOLD = 0.5;

/** Hard cap on auto-assigned competency Extra Practice lessons per student per domain, to prevent loops. */
export const MAX_REMEDIAL_ATTEMPTS_PER_COMPETENCY_DOMAIN = 2;

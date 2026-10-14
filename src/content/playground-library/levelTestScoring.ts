/**
 * Scoring rules for the Playground level tests — owner-approved plan (2026-10-12) docs/assessment/prea1-assessment-plan.md.
 * Sections are reported like Cambridge YLE shields: 1–5 stars each. The decision is shown to the teacher (and parent),
 * never to the child as "failed".
 */

/** Stars for a share of right answers (0–1): 90–100 % = 5, 80–89 % = 4, 65–79 % = 3, 50–64 % = 2, under 50 % = 1. */
export function starsFor(share: number): number {
  if (!(share >= 0)) return 1;
  if (share >= 0.9) return 5;
  if (share >= 0.8) return 4;
  if (share >= 0.65) return 3;
  if (share >= 0.5) return 2;
  return 1;
}

/** Speaking: the teacher's 0–3 rubric per prompt → a share of the top mark. */
export function speakingShare(scores: number[]): number {
  const s = scores.filter((n) => n >= 0);
  if (!s.length) return 0;
  return s.reduce((a, b) => a + b, 0) / (s.length * 3);
}

export type LevelTestMode = 'final' | 'checkpoint' | 'unit';
export type Decision = 'ready' | 'almost' | 'not_yet' | 'go_on' | 'go_on_support' | 'review_first' | 'unit_pass' | 'unit_practise';

/**
 * `stars` in section order; `strongKeys` = sections that must reach 4 stars for "Ready" (final test: the two listening
 * sections and speaking).
 */
export function decide(mode: LevelTestMode, sections: { key: string; stars: number }[], strongKeys: string[] = []): Decision {
  const total = sections.reduce((a, s) => a + s.stars, 0);
  // Star thresholds scale with the number of sections: Pre-A1 tests have 4 (16 / 13 / 11 of 20), the A1 Halfway Check and
  // Final Test have 5 (20 / 17 / 14 of 25 — docs/assessment/a1-assessment-plan.md §4).
  const max = sections.length * 5;
  const need = (share: number) => Math.ceil(share * max - 1e-9);
  const low = sections.filter((s) => s.stars <= 2);
  const allThree = low.length === 0;
  if (mode === 'final') {
    const strongOk = sections.filter((s) => strongKeys.includes(s.key)).every((s) => s.stars >= 4);
    if (allThree && strongOk && total >= need(0.8)) return 'ready';
    if (allThree || (low.length === 1 && low[0].stars === 2)) return 'almost';
    return 'not_yet';
  }
  // unit Boss Test (mastery bar, plan §2): every part at 80 % or more (4+ stars) → pass; else practise the weak parts
  if (mode === 'unit') return sections.every((s) => s.stars >= 4) ? 'unit_pass' : 'unit_practise';
  // checkpoint
  if (allThree && total >= need(0.65)) return 'go_on';
  if ((allThree && total >= need(0.55)) || (low.length === 1 && low[0].stars === 2 && total >= need(0.55))) return 'go_on_support';
  return 'review_first';
}

export const DECISION_TEXT: Record<Decision, { label: string; next: string }> = {
  ready: { label: 'Ready for A1', next: 'Confirm, and send the level change request (Pre-A1 → A1, Unit 1) to the admin.' },
  almost: { label: 'Almost ready', next: 'A short bridge of 2–3 lessons on the weak skill, then the missed part again.' },
  not_yet: { label: 'Not yet', next: 'Stay in Pre-A1: review the weakest units (Practise again packs + review lessons), re-test in 3–4 weeks.' },
  go_on: { label: 'Go on', next: 'Continue to Unit 6.' },
  go_on_support: { label: 'Go on with support', next: 'Continue to Unit 6; give the weak skill\'s Practise again pack as homework for 2 weeks and re-check it in the Unit 6 test.' },
  review_first: { label: 'Review first', next: '2 review lessons on the weak units, then a short re-check before Unit 6.' },
  unit_pass: { label: 'Unit mastered', next: 'On to the next unit.' },
  unit_practise: { label: 'Practise again', next: 'Go on to the next unit, and give the Practise again homework for every part under 4 stars; re-check those words at the start of the next lessons.' },
};

/**
 * Decision texts for a test's level (`scene.level`): Pre-A1 tests use DECISION_TEXT as is; A1 tests (A1 Halfway Check after
 * Unit 5, A1 Final Test → A2, unit Boss Tests) say where an A1 child goes next (docs/assessment/a1-assessment-plan.md).
 */
export function decisionText(decision: Decision, level = 'Pre-A1'): { label: string; next: string } {
  if (level !== 'A1') return DECISION_TEXT[decision];
  const a1: Partial<Record<Decision, { label: string; next: string }>> = {
    ready: { label: 'Ready for A2', next: 'Confirm, and send the level change request (A1 → A2, Unit 1) to the admin.' },
    almost: { label: 'Almost ready', next: 'A short bridge of 2–3 lessons on the weak skill (+ an A2 Lesson 1 preview), then the missed part again.' },
    not_yet: { label: 'Not yet', next: 'Stay in A1: review the weakest units (Practise again packs + review lessons), re-test in 3–4 weeks.' },
    go_on: { label: 'Go on', next: 'Continue to A1 Unit 6.' },
    go_on_support: { label: 'Go on with support', next: 'Continue to A1 Unit 6; give the weak skill\'s Practise again pack as homework for 2 weeks and re-check it in the Unit 6 Boss Test.' },
    review_first: { label: 'Review first', next: '2 review lessons on the weakest A1 units, then a short re-check before Unit 6.' },
  };
  return a1[decision] ?? DECISION_TEXT[decision];
}

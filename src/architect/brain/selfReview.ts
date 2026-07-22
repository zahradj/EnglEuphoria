// Self-Review Checklist — mandatory pass before returning the blueprint.
// The Architect must answer each check with pass/fail + evidence.
// Any fail = REWRITE (max 1 retry). Persist result at `blueprint.review`.

export const SELF_REVIEW_CHECKS = [
  {
    id: 'activities_on_topic',
    question: 'Does every activity match the topic?',
  },
  {
    id: 'grammar_matches_goal',
    question: 'Does the grammar match the communication goal?',
  },
  {
    id: 'story_supports_learning',
    question: 'Does the story support the learning objective (mission + frame)?',
  },
  {
    id: 'vocab_natural',
    question: 'Does the target vocabulary appear naturally in context, not as isolated drills?',
  },
  {
    id: 'enough_speaking',
    question: 'Are there enough speaking opportunities (hub density floor met)?',
  },
  {
    id: 'not_repetitive',
    question: 'Does the lesson avoid feeling repetitive (no same activity type twice in a row)?',
  },
  {
    id: 'five_year_old_enjoys',
    question: 'Would a five-year-old enjoy this? (playful tone, movement, reward)',
  },
] as const;
export type SelfReviewId = typeof SELF_REVIEW_CHECKS[number]['id'];

export const SELF_REVIEW_PROMPT = `
## SELF-REVIEW CHECKLIST (mandatory — answer before returning JSON)

After drafting the blueprint, review it against these 7 checks. For each,
emit \`{ id, pass: boolean, evidence: string }\` on \`blueprint.review.checks\`.
Evidence must cite a specific slide index, vocab item, or story beat — not
a vague claim.

${SELF_REVIEW_CHECKS.map((c, i) => `${i + 1}. ${c.question}  (id: ${c.id})`).join('\n')}

Rules:
- Any check with \`pass: false\` MUST be fixed before returning. You get ONE
  rewrite attempt. If it still fails, return the blueprint with
  \`review.pass = false\` and \`review.blocker\` set so QA can reject cleanly.
- \`review.pass\` = true ONLY when all 7 checks pass.
- Do NOT invent evidence. If you cannot cite a slide/vocab/beat, the check
  is a fail.
`.trim();

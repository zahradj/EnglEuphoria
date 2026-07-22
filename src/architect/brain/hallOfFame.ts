// Hall of Fame — the top-lesson benchmark every blueprint must clear.
// The Architect compares its draft against this bar; if it wouldn't earn a
// spot, it MUST improve the draft before returning.

export interface HallOfFameCriterion {
  id: string;
  label: string;
  question: string;
  weight: number; // 1–5
}

// Rubric distilled from the top-tier ESL lessons we've shipped and studied
// (Novakid-style mission arcs, Cambridge YLE units, CELTA showcase plans).
// Extend as new exemplars are canonised.
export const HALL_OF_FAME_RUBRIC: HallOfFameCriterion[] = [
  { id: 'clear_mission',        label: 'Clear mission',              question: 'Can a five-year-old say in one sentence what today\'s mission is?', weight: 5 },
  { id: 'locked_grammar_frame', label: 'Locked grammar frame',       question: 'Does every dialogue/comic line match ONE sentence frame verbatim?', weight: 5 },
  { id: 'concrete_vocab',       label: 'Concrete vocab anchors',     question: 'Does every target word have a single-object image anchor?', weight: 4 },
  { id: 'story_with_problem',   label: 'Story with a real problem',  question: 'Does the story have a named obstacle solved BY the target language?', weight: 5 },
  { id: 'activity_variety',     label: 'Activity variety + ladder',  question: 'Do activities follow the ladder with zero mechanic repeats?', weight: 4 },
  { id: 'multisensory_journey', label: 'Multi-sensory journey',      question: 'Does every target word pass through SEE→HEAR→TOUCH→MOVE→SAY→USE→REPEAT?', weight: 4 },
  { id: 'speaking_density',     label: 'Speaking density',           question: 'Does the lesson hit its hub speaking floor with scaffolded bravery?', weight: 4 },
  { id: 'reward_payoff',        label: 'Reward payoff',              question: 'Is the celebration a concrete Theme Brain reward the learner sees?', weight: 3 },
  { id: 'continuity',           label: 'Continuity with journey',    question: 'Does it recycle prior vocab and leave a hook for the next lesson?', weight: 3 },
  { id: 'five_year_old_joy',    label: 'Five-year-old joy',          question: 'Would a five-year-old actually enjoy this — movement, characters, wins?', weight: 5 },
];

export const HALL_OF_FAME_PASS_THRESHOLD = 34; // out of 42 max weight

export const HALL_OF_FAME_PROMPT = `
## HALL OF FAME BENCHMARK (compare every draft against the top 100)

Before returning your blueprint, mentally place it beside the best lessons
ever shipped on this platform (Novakid-style mission arcs, Cambridge YLE
showcase units, CELTA-approved plans). Then ask ONE question:

> Would this lesson deserve to be added to the Hall of Fame?

If the answer is anything less than a confident YES, you MUST improve the
draft before returning it.

Score your draft on the rubric below. Emit results at
\`blueprint.hall_of_fame\`:
\`{ scores: [{ id, score_0_to_5, evidence }], total, verdict: "hall_of_fame" | "improve" }\`.

### Rubric (weights in parentheses — max score = 42)

${HALL_OF_FAME_RUBRIC.map(
  (c, i) => `${i + 1}. **${c.label}** (weight ${c.weight}) — ${c.question}  (id: \`${c.id}\`)`,
).join('\n')}

Rules:
- Score each criterion 0–5 with a specific evidence citation (slide index,
  vocab item, story beat). No vague claims.
- Total = Σ (score × weight / 5). Cap at 42.
- Verdict is \`hall_of_fame\` ONLY when total ≥ ${HALL_OF_FAME_PASS_THRESHOLD} AND
  no criterion scores below 3.
- If verdict is \`improve\`, name the WEAKEST criterion in
  \`hall_of_fame.improve_target\`, fix it, then re-score. You get ONE
  improvement pass; if it still fails, return the blueprint with
  \`hall_of_fame.verdict = "improve"\` and let QA reject cleanly — never
  ship a lesson you know is below the bar.
`.trim();

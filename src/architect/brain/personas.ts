// Specialist Personas — the Architect is a panel of experts, not one voice.
// Each persona owns one blueprint domain, hands off to the next, and signs
// its section. Downstream engines + QA can verify signatures.

export interface Persona {
  id: string;
  role: string;
  owns: string;
  handsOffTo: string | null;
  charter: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'curriculum_designer',
    role: 'Curriculum Designer',
    owns: 'topic, communication goal, mission, CEFR fit, continuity with prev/next lesson',
    handsOffTo: 'grammar_expert',
    charter:
      'Decide WHAT the learner will be able to do by the end. Bind the lesson to the Theme Brain, the CEFR ceiling, and the continuity context. Output: one topic sentence, one Can-Do micro-task, one mission.',
  },
  {
    id: 'grammar_expert',
    role: 'Grammar Expert',
    owns: 'sentence frame, form cards, question/negative forms, error prevention',
    handsOffTo: 'story_writer',
    charter:
      'Pick EXACTLY ONE grammar frame from Grammar-from-Goal that serves the Can-Do and respects the CEFR ceiling. Lock the frame verbatim. Provide positive/negative/question forms and 2 common learner errors to preempt.',
  },
  {
    id: 'story_writer',
    role: 'Story Writer',
    owns: '5-beat story arc, characters, problem, resolution, reward',
    handsOffTo: 'game_designer',
    charter:
      'Write the story using the Story Formula (Goal → Problem → Adventure → Success → Celebration). The Adventure MUST use the locked grammar frame with the theme objects. The Celebration MUST be the theme reward.',
  },
  {
    id: 'game_designer',
    role: 'Game Designer',
    owns: 'activity ladder, mechanic per rung, boss round, TPR + speaking slots',
    handsOffTo: 'image_director',
    charter:
      'Walk the Activity Ladder (Recognition → Identification → Decision → Speaking → Communication). Pick one mechanic per rung — never repeat a mechanic. Every target word must appear in ≥2 games. Reserve at least one TPR slot and one speaking mission.',
  },
  {
    id: 'image_director',
    role: 'Image Director',
    owns: 'image prompts, concrete anchors, art style, hub style guard tail',
    handsOffTo: 'lesson_reviewer',
    charter:
      'For every vocab card and story beat, write ONE concrete image prompt (≤45 words) bound to a single subject on a hub-styled background. Append the guard tail (no text, no bubbles, single panel). image_url MUST be null at generation time.',
  },
  {
    id: 'lesson_reviewer',
    role: 'Lesson Reviewer',
    owns: 'self-review checklist, never-rule audit, rewrite decision',
    handsOffTo: 'json_generator',
    charter:
      'Run the 7-check Self-Review and the "Never" rule audit. Cite evidence (slide index, vocab item, story beat). ANY fail → request a rewrite from the responsible persona. Approve only when all checks pass.',
  },
  {
    id: 'json_generator',
    role: 'JSON Generator',
    owns: 'final blueprint JSON — schema-valid, no placeholders, all signatures present',
    handsOffTo: null,
    charter:
      'ONLY after Lesson Reviewer approves, emit the final JSON blueprint. Every section must carry the signing persona id in `signed_by`. Never invent content — only serialize what upstream personas produced.',
  },
];

export function buildPersonasPrompt(): string {
  const lines = [
    '## SPECIALIST PERSONAS (you are a panel, not a single voice)',
    'You role-play SEVEN specialists in a strict handoff chain. Each specialist',
    'produces ONLY their section, signs it, and hands off to the next. No',
    'specialist may rewrite an upstream section — they must request a rewrite',
    'via the Lesson Reviewer instead.',
    '',
    'Handoff order: ' + PERSONAS.map((p) => p.role).join(' → '),
    '',
    'Each blueprint section MUST include `signed_by: "<persona_id>"`. The final',
    'blueprint MUST include `personas_trace: [{ persona, decision, evidence }]`',
    'so downstream engines and QA can audit each specialist\'s contribution.',
    '',
    '### Charters',
  ];
  for (const p of PERSONAS) {
    lines.push(
      '',
      `**${p.role}** (id: \`${p.id}\`)`,
      `- Owns: ${p.owns}`,
      `- Hands off to: ${p.handsOffTo ?? '— (final)'}`,
      `- Charter: ${p.charter}`,
    );
  }
  lines.push(
    '',
    'Rules:',
    '- No skipping personas. If a section is empty, the chain halts and the',
    '  responsible persona must retry.',
    '- Specialists communicate through the blueprint, not through prose. The',
    '  next persona reads ONLY what the previous one signed.',
    '- The JSON Generator writes NO new pedagogical content — it only',
    '  serializes what upstream personas produced.',
  );
  return lines.join('\n');
}

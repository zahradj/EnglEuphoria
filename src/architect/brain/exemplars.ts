// Exemplar Library — teach quality by contrast (good vs bad, with reasons).
// Extend freely. The Architect reads these as calibration, not as templates
// to copy — copying is banned by the constitution.

export interface Exemplar {
  kind: 'lesson' | 'story' | 'activity' | 'vocab' | 'grammar' | 'speaking';
  quality: 'good' | 'bad';
  label: string;
  example: string;
  reason: string;
}

export const EXEMPLARS: Exemplar[] = [
  // -------- Lessons --------
  {
    kind: 'lesson',
    quality: 'good',
    label: 'Colors — Rainbow Rescue mission',
    example:
      'Pip loses the four rainbow balloons in the park. Learner finds each colored balloon by answering "What color is it? — It is red." A boss round collects all four to earn the Rainbow Badge.',
    reason:
      'One concrete mission, one locked grammar frame, every target word recycled ≥3×, reward from Theme Brain, boss round covers all vocab.',
  },
  {
    kind: 'lesson',
    quality: 'bad',
    label: 'Colors — mixed drills',
    example:
      'Slide 1: name 6 colors. Slide 2: quiz on shapes. Slide 3: sing an unrelated ABC chant. Slide 4: "I like blue." Slide 5: fill blank "___ is red."',
    reason:
      'No mission, grammar frame drifts (name → like → cloze), off-theme content (shapes, ABC), no reward, no boss consolidation.',
  },

  // -------- Stories --------
  {
    kind: 'story',
    quality: 'good',
    label: 'Rainbow Rescue',
    example:
      'GOAL: Pip wants to fly the rainbow kites. PROBLEM: the wind blew four colored kites into the trees. ADVENTURE: Pip asks Bella "What color is it? — It is red." for each kite. SUCCESS: all four kites are back. CELEBRATION: Rainbow Badge.',
    reason:
      '5 beats present, problem is named, target grammar frame appears in the Adventure ≥3×, reward matches theme.',
  },
  {
    kind: 'story',
    quality: 'bad',
    label: 'A day with Pip',
    example: 'Pip wakes up. Pip eats breakfast. Pip sees a red apple. Pip is happy. The end.',
    reason:
      'No goal, no problem, no use of target grammar, no reward. Description instead of mission.',
  },

  // -------- Activities --------
  {
    kind: 'activity',
    quality: 'good',
    label: 'TPR — "Touch something red!"',
    example:
      'Learner physically points to a red object on screen while chanting "It is red." Repeats for each color.',
    reason:
      'Covers SEE + HEAR + TOUCH + SAY in one slide. Bound to grammar frame + theme objects.',
  },
  {
    kind: 'activity',
    quality: 'bad',
    label: 'Generic MCQ — "What is the capital of France?"',
    example: 'MCQ unrelated to the color mission, tests trivia not language.',
    reason: 'Off-theme, no grammar frame, no production, no image anchor.',
  },

  // -------- Vocab card --------
  {
    kind: 'vocab',
    quality: 'good',
    label: 'red → red balloon',
    example: '{ word: "red", concrete_anchor: "red balloon", example: "It is red." }',
    reason: 'Adjective bound to a concrete image anchor; example uses the lesson frame.',
  },
  {
    kind: 'vocab',
    quality: 'bad',
    label: 'red → "the color of passion"',
    example: '{ word: "red", definition: "the color of passion and fire" }',
    reason: 'Abstract definition, no image anchor, not usable by a five-year-old.',
  },

  // -------- Speaking --------
  {
    kind: 'speaking',
    quality: 'good',
    label: 'Speaking mission with mystery box',
    example:
      'Pip hides a colored object in a box. Learner asks "What color is it?" and guesses "It is ___." until correct.',
    reason:
      'Uses locked frame, has expansion ("It is a big red ball"), scaffold + ladder rung defined, bravery > correctness.',
  },
  {
    kind: 'speaking',
    quality: 'bad',
    label: '"Say something about colors."',
    example: 'Open prompt, no frame, no scaffold, no character binding.',
    reason: 'No scaffold, no ladder rung, unbounded — five-year-old will freeze.',
  },
];

export function buildExemplarsPrompt(): string {
  const groups: Record<string, Exemplar[]> = {};
  for (const ex of EXEMPLARS) {
    (groups[ex.kind] ||= []).push(ex);
  }
  const sections = Object.entries(groups).map(([kind, list]) => {
    const lines = list.map(
      (e) =>
        `- ${e.quality.toUpperCase()} — ${e.label}\n    Example: ${e.example}\n    Why: ${e.reason}`,
    );
    return `### ${kind.toUpperCase()} exemplars\n${lines.join('\n')}`;
  });
  return [
    '## EXEMPLAR LIBRARY (calibration — study, do NOT copy)',
    'Use these as taste calibration for what "good" and "bad" look like.',
    'Every design decision must be closer to a GOOD exemplar than to a BAD one.',
    'Copying an exemplar verbatim is banned — inherit the pattern, not the words.',
    '',
    ...sections,
  ].join('\n\n');
}

// Quiz & Homework Pedagogy Contract
// Distilled from external references (tutor-skills, human-skill-tree):
//   • Zero-hint policy            (quiz-rules.md)
//   • Plausible-distractor rule   (quiz-rules.md)
//   • Difficulty mix presets      (diagnostic / drill / review)
//   • Question-type taxonomy      (factual / conceptual / behavioral / comparison / scenario)
//   • Drill-by-rephrase rule      (never repeat the failed question verbatim)
//   • Metacognition prompts       (Judgment-of-Learning, post-quiz reflection)
//   • Recasting for ESL errors    (Krashen / CLT)
//
// This contract is prompt-only — it appends to the existing Coherence
// system prompt and is enforced softly by the quality engines. It does
// NOT override CEFR/curriculum/age/safety/communication tiers.

export type QuizMode = 'diagnostic' | 'weak_drill' | 'review';

export interface QuizPedagogyOptions {
  mode: QuizMode;
  /** Concept ids the learner has previously failed (from mistake_repository). */
  unresolvedConcepts?: string[];
  /** Total questions in this quiz/homework pack. */
  questionCount?: number;
}

const DIFFICULTY_MIX: Record<QuizMode, string> = {
  diagnostic: 'easy 40% · medium 40% · hard 20%',
  weak_drill: 'medium 30% · hard 70% (target unresolved concepts)',
  review:     'easy 33% · medium 34% · hard 33% (interleaved)',
};

export function buildQuizPedagogyContract(opts: QuizPedagogyOptions): string {
  const lines: string[] = [
    '',
    '## Quiz / Homework Pedagogy Contract (binding)',
    `- Mode: ${opts.mode}  ·  Difficulty mix: ${DIFFICULTY_MIX[opts.mode]}`,
    `- Question count: ${opts.questionCount ?? 4}`,
    '',
    '### Zero-Hint Policy (HARD)',
    '- Option labels and descriptions MUST NOT reveal correctness.',
    '- Forbid words like "(recommended)", "correct", "best answer" inside options.',
    '- Randomize the position of the correct answer (never always A or last).',
    '- Phrase the stem around behavior/purpose/output, never echo the answer.',
    '',
    '### Distractor Quality (HARD)',
    '- All wrong options must be real, plausible concepts from the same domain.',
    '- Each distractor should represent a documented learner misconception',
    '  (L1 interference, false friend, over-generalised rule, etc.).',
    '- No nonsense / joke / obviously-wrong options.',
    '',
    '### Question-Type Taxonomy (rotate)',
    '1. Factual recall          — "What does X mean / what is the form of Y?"',
    '2. Conceptual              — "Why do we use X here?"',
    '3. Behavioral prediction   — "What happens if the speaker says X?"',
    '4. Comparison / contrast   — "What is the difference between X and Y?"',
    '5. Scenario / debugging    — "Given this dialogue, which line is wrong?"',
    '- A single quiz MUST contain at least 3 different types.',
    '',
    '### Drill-by-Rephrase (when mode = weak_drill)',
    '- Do NOT repeat the exact failed prompt; rephrase in a new context.',
    '- Test the same underlying concept from a different angle / register.',
    `- Unresolved concepts to target: ${
      (opts.unresolvedConcepts ?? []).slice(0, 8).join(', ') || '(none provided)'
    }`,
    '',
    '### Metacognition Hooks (SOFT, encouraged)',
    '- After the last question, ask the learner a Judgment-of-Learning prompt',
    '  ("How confident are you in this topic? 1–5") and store it for the next pass.',
    '- End every pack with a 1-sentence reflection prompt ("What still feels fuzzy?").',
    '',
    '### Error Correction Style (ESL)',
    '- For speaking/writing items: correct via RECASTING — restate the learner',
    '  utterance naturally with the fix embedded, do not red-pen every error.',
    '- Praise the attempt before correcting (bravery > accuracy at A1–A2).',
    '',
    '### Anti-Patterns (REJECT)',
    '- Pure re-read / highlight / passive-recognition items.',
    '- Questions that test memory of the slide layout instead of the language.',
    '- Options that differ only by punctuation or capitalization.',
  ];
  return lines.join('\n');
}

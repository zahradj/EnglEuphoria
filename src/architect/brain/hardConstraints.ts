// Hard Constraints — the "Never" rules. Non-negotiable. Violations = reject.
// These are the guardrails that turn a good agent into a safe agent.

import type { Cefr } from '@/governance/types';

export const NEVER_RULES = [
  {
    id: 'one_grammar_point',
    rule: 'Never teach more than ONE grammar point per lesson.',
    detail:
      'Pick a single sentence frame from Grammar-from-Goal. Additional structures may appear only as passive exposure inside the story — never taught, never drilled.',
  },
  {
    id: 'prea1_vocab_cap',
    rule: 'Never introduce more than FOUR new vocabulary items in a Pre-A1 lesson.',
    detail:
      'Pre-A1: max 4 new words. A1: max 6. A2: max 8. B1+: max 10. Review items do NOT count toward the cap.',
  },
  {
    id: 'no_game_repeats',
    rule: 'Never use the same game/activity type twice in one lesson.',
    detail:
      'Two slides sharing the same mechanic (e.g. two MCQs, two matches) is banned. Different rung on the Activity Ladder = different mechanic.',
  },
  {
    id: 'no_abstract_vocab_for_young',
    rule: 'Never teach abstract vocabulary to young learners (Playground).',
    detail:
      'Every Playground vocab item MUST have a concrete image anchor. Banned examples: "essentially", "concept", "represents", "passion", "freedom". If it cannot be drawn as a single object, it is banned.',
  },
  {
    id: 'story_needs_problem',
    rule: 'Never create a story without a problem to solve.',
    detail:
      'Every story exposes `story.problem` as an explicit obstacle sentence. Descriptions of a character\'s day are NOT stories.',
  },
  {
    id: 'no_grammar_above_cefr',
    rule: "Never use grammar above the student's CEFR ceiling.",
    detail:
      'Check the CEFR cap for the hub. If the frame is above ceiling, downgrade to the highest allowed frame that still serves the communication goal.',
  },
] as const;
export type NeverRuleId = typeof NEVER_RULES[number]['id'];

const VOCAB_CAP_BY_CEFR: Record<string, number> = {
  'pre-a1': 4,
  a1: 6,
  a2: 8,
  b1: 10,
  b2: 10,
  c1: 10,
};

export function vocabCapFor(cefr?: Cefr | string): number {
  if (!cefr) return 6;
  return VOCAB_CAP_BY_CEFR[String(cefr).toLowerCase()] ?? 6;
}

export function buildHardConstraintsPrompt(cefr?: Cefr | string): string {
  const cap = vocabCapFor(cefr);
  const header = [
    '## HARD CONSTRAINTS — THE "NEVER" RULES (non-negotiable)',
    'These are guardrails, not suggestions. Any violation = the blueprint is',
    'rejected and rewritten. Confirm compliance in `blueprint.review.checks`.',
    `Today\'s CEFR is ${cefr ?? 'unknown'} → new-vocab cap = ${cap}.`,
    '',
  ];
  const body = NEVER_RULES.map(
    (r, i) => `${i + 1}. **${r.rule}**\n   ${r.detail}`,
  );
  return [...header, ...body].join('\n');
}

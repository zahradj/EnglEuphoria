// Prompt injector — appended AFTER buildArcadeSystemPrompt() and BEFORE the
// per-game round content prompt. Purely advisory (tier 6 soft).
// NEVER overrides CEFR / curriculum / age / safety / communication tiers.

import type { GameIntelligenceDecision } from './types';

export function buildGameIntelligencePrompt(decision: GameIntelligenceDecision): string {
  const { trace, difficulty } = decision;
  const lines: string[] = [
    '## Game Intelligence Layer (tier 6 — advisory)',
    `- Render difficulty tier: ${difficulty.tier} (scaffolding boost ${difficulty.scaffolding_boost}).`,
    `- Pacing hint: ${difficulty.pacing}.`,
  ];

  if (trace.error_ids_used.length > 0) {
    lines.push(
      `- Recycle ${trace.error_ids_used.length} error-pattern items — these MUST appear as playable prompts, not filler.`,
    );
  }
  if (trace.review_keys_used.length > 0) {
    lines.push(
      `- Inject ${trace.review_keys_used.length} spaced-review items from the memory queue. Do NOT re-introduce them — treat as retrieval.`,
    );
  }
  if (trace.interests_used.length > 0) {
    lines.push(
      `- Personalize surrounding context (setting / distractors) using: ${trace.interests_used.join(', ')}. Never substitute the linguistic target.`,
    );
  }
  lines.push(
    '- HARD RULES: obey CEFR ceiling, age-safety, and hub register above this layer. This layer only reshapes selection and pacing.',
  );

  return lines.join('\n');
}

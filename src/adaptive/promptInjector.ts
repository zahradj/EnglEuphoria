import type { AdaptationContext } from './types';

/**
 * Builds the adaptation system prompt block.
 * Chains AFTER planner+governance, BEFORE narrative/activity/pronunciation prompts.
 */
export function buildAdaptationSystemPrompt(ctx: AdaptationContext): string {
  const lines: string[] = [];
  lines.push('=== ADAPTIVE PERSONALIZATION CONTRACT ===');
  lines.push(`Student hub: ${ctx.profile.hub} | CEFR: ${ctx.profile.cefr_level}`);
  lines.push(`Pacing: ${ctx.profile.preferred_pacing} | Anxiety: ${ctx.profile.anxiety_level}`);
  lines.push(`Engagement: confidence=${ctx.engagement.confidence}, motivation=${ctx.engagement.motivation}, frustration_risk=${ctx.engagement.frustration_risk}`);

  lines.push('');
  lines.push('DIFFICULTY PROFILE:');
  lines.push(`- sentence_length_cap: ${ctx.difficulty.sentence_length_cap}`);
  lines.push(`- scaffolding: ${ctx.difficulty.scaffolding_level}`);
  lines.push(`- support_density: ${ctx.difficulty.support_density}`);
  lines.push(`- challenge_tier: ${ctx.difficulty.challenge_tier}`);
  lines.push(`- reading_complexity: ${ctx.difficulty.reading_complexity}`);

  if (ctx.profile.strengths.length) lines.push(`STRENGTHS: ${ctx.profile.strengths.join(', ')}`);
  if (ctx.profile.weaknesses.length) lines.push(`WEAKNESSES: ${ctx.profile.weaknesses.join(', ')}`);
  if (ctx.profile.pronunciation_challenges.length)
    lines.push(`PRONUNCIATION CHALLENGES: ${ctx.profile.pronunciation_challenges.join(', ')}`);

  if (ctx.review_queue.length) {
    lines.push('');
    lines.push('SPIRAL REVIEW QUEUE (recycle these):');
    for (const item of ctx.review_queue.slice(0, 8)) {
      lines.push(`- [${item.item_type}] ${item.item_key} (priority ${item.priority})`);
    }
  }

  if (ctx.errors.length) {
    lines.push('');
    lines.push('ERROR PATTERNS TO ADDRESS:');
    for (const e of ctx.errors.slice(0, 5)) {
      lines.push(`- ${e.category}: ${e.pattern_key} (freq=${e.frequency}, severity=${e.severity}); support: ${e.recommended_support.join(', ')}`);
    }
  }

  lines.push('');
  lines.push(`SPEAKING TIER: ${ctx.speaking.tier}`);
  lines.push(`Use starters: ${ctx.speaking.starters.join(' | ')}`);
  lines.push(`Use frames: ${ctx.speaking.frames.join(' | ')}`);

  if (ctx.adjustments.length) {
    lines.push('');
    lines.push('LESSON ADJUSTMENTS:');
    for (const a of ctx.adjustments) lines.push(`- ${a}`);
  }

  lines.push('');
  lines.push('RULES:');
  lines.push('- Personalize tone, complexity, and review WITHIN curriculum and CEFR ceiling.');
  lines.push('- Never invent vocab/grammar above the learner CEFR.');
  lines.push('- Always integrate review items into communicative tasks (no isolated drills).');
  lines.push('- Adjust emotional load: reduce risk for anxious learners; extend for confident learners.');
  lines.push('=== END ADAPTIVE CONTRACT ===');

  return lines.join('\n');
}

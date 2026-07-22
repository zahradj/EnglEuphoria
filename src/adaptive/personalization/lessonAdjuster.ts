import type { AdaptationContext, DifficultyProfile, ErrorPattern, LearnerProfile, ReviewQueueItem, SkillMasteryRecord } from '../types';

export interface LessonAdjusterInput {
  profile: LearnerProfile;
  mastery: SkillMasteryRecord[];
  errors: ErrorPattern[];
  difficulty: DifficultyProfile;
  review_queue: ReviewQueueItem[];
}

/**
 * Produces human-readable adjustment lines that drive the AI generation prompt.
 * Does NOT mutate the LessonPlan directly — those changes happen inside
 * planning/activities consumers that read AdaptationContext.
 */
export function adjustLessonPlan(input: LessonAdjusterInput): string[] {
  const lines: string[] = [];

  // Pre-teach weak vocab
  const weakVocab = input.mastery
    .filter((m) => m.skill_domain === 'vocabulary' && m.mastery < 60)
    .slice(0, 6)
    .map((m) => m.skill_key);
  if (weakVocab.length) lines.push(`PRE-TEACH vocabulary: ${weakVocab.join(', ')}`);

  // Reinforce weak grammar
  const weakGrammar = input.mastery
    .filter((m) => m.skill_domain === 'grammar' && m.mastery < 60)
    .slice(0, 4)
    .map((m) => m.skill_key);
  if (weakGrammar.length) lines.push(`REINFORCE grammar: ${weakGrammar.join(', ')}`);

  // Pronunciation targets
  const pron = input.mastery
    .filter((m) => m.skill_domain === 'pronunciation' && m.mastery < 70)
    .slice(0, 3)
    .map((m) => m.skill_key);
  if (pron.length) lines.push(`PRONUNCIATION targets: ${pron.join(', ')}`);

  // Difficulty hints
  lines.push(
    `DIFFICULTY: sentence_cap=${input.difficulty.sentence_length_cap}, ` +
      `scaffolding=${input.difficulty.scaffolding_level}, tier=${input.difficulty.challenge_tier}, ` +
      `reading=${input.difficulty.reading_complexity}`,
  );

  // Review queue (top items)
  const top = input.review_queue.slice(0, 5);
  if (top.length) {
    lines.push(
      `SPIRAL REVIEW: ${top.map((i) => `${i.item_type}:${i.item_key}`).join(', ')}`,
    );
  }

  // Error-pattern corrective tasks
  const highErrors = input.errors.filter((e) => e.severity !== 'low').slice(0, 4);
  for (const e of highErrors) {
    lines.push(`CORRECTIVE [${e.category}] for "${e.pattern_key}": ${e.recommended_support.join('; ')}`);
  }

  // Profile pacing
  lines.push(`PACING: ${input.profile.preferred_pacing}; ANXIETY: ${input.profile.anxiety_level}`);

  return lines;
}

export function applyAdjustmentsToContext(
  ctx: AdaptationContext,
  extra: string[],
): AdaptationContext {
  return { ...ctx, adjustments: [...ctx.adjustments, ...extra] };
}

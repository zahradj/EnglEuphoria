// Expert Lesson Architect — Brain composer.
// ----------------------------------------------------------------------------
// Assembles the right knowledge slices into a focused expert system prompt
// for the given hub × CEFR. Token-economical: ships only the relevant
// curriculum, methodology, and progression map context.

import type { Hub, Cefr } from '@/governance/types';
import { buildMethodologyPrompt } from './methodologies';
import { buildCefrPrompt } from './cefrCurriculum';
import { buildNovakidPrompt } from './novakidMap';
import { ARCHITECT_CONSTITUTION } from './constitution';
import { buildStagePurposePrompt } from './stagePurposes';
import { THINKING_WORKFLOW_PROMPT } from './thinkingWorkflow';
import { buildThemeBrainPrompt } from './themeBrain';
import { buildActivitySelectionPrompt } from './activitySelectionRules';
import { buildGrammarFromGoalPrompt } from './grammarFromGoal';
import { STORY_FORMULA_PROMPT } from './storyFormula';
import { LEARNING_JOURNEY_PROMPT } from './learningJourney';
import { DESIGN_WORKFLOW_PROMPT } from './designWorkflow';
import { buildExemplarsPrompt } from './exemplars';
import { SELF_REVIEW_PROMPT } from './selfReview';
import { buildContinuityPrompt, type ContinuityInput } from './continuityContext';
import { buildHardConstraintsPrompt } from './hardConstraints';
import { buildPersonasPrompt } from './personas';
import { HALL_OF_FAME_PROMPT } from './hallOfFame';
import { EMOTIONAL_BEATS_PROMPT } from './emotionalBeats';
import { BRAIN_PIPELINE_PROMPT } from './brainPipeline';

export * from './methodologies';
export * from './cefrCurriculum';
export * from './novakidMap';
export * from './stagePurposes';
export * from './thinkingWorkflow';
export * from './themeBrain';
export * from './activitySelectionRules';
export * from './grammarFromGoal';
export * from './storyFormula';
export * from './learningJourney';
export * from './designWorkflow';
export * from './exemplars';
export * from './selfReview';
export * from './continuityContext';
export * from './hardConstraints';
export * from './personas';
export * from './hallOfFame';
export * from './emotionalBeats';
export * from './brainPipeline';

export interface BrainContext {
  hub: Hub;
  cefr: Cefr;
  completedUnits?: number; // optional — drives Novakid next-unit suggestion
  theme?: string;          // seed theme — powers the Theme Brain slice
  communicationGoal?: string; // powers the Grammar-from-Goal slice
  continuity?: ContinuityInput; // previous/next lesson, review vocab, level, mistakes
}

/**
 * Composes the Expert Brain prompt block that prepends the Architect's
 * standard system prompt. Returns a single markdown string.
 */
export function buildBrainPrompt(ctx: BrainContext): string {
  const blocks: string[] = [];
  blocks.push(ARCHITECT_CONSTITUTION);
  blocks.push('');
  blocks.push('## EXPERT LESSON ARCHITECT — EMBEDDED CURRICULUM BRAIN');
  blocks.push(
    'You are inheriting a curated curriculum brain. Treat every rule below as binding pedagogical knowledge — not suggestions. Use it to produce a blueprint a master ESL designer would approve.',
  );
  blocks.push('');
  blocks.push(BRAIN_PIPELINE_PROMPT);
  blocks.push('');
  blocks.push(buildHardConstraintsPrompt(ctx.cefr));
  blocks.push('');
  blocks.push(buildPersonasPrompt());
  blocks.push('');
  // Curriculum Brain workflow: identity is in the constitution → then
  // learning-stage purposes → then thinking workflow → then theme brain,
  // activity ladder, grammar-from-goal, story formula.
  blocks.push(buildStagePurposePrompt(ctx.hub));
  blocks.push('');
  blocks.push(THINKING_WORKFLOW_PROMPT);
  const themeBlock = buildThemeBrainPrompt(ctx.theme);
  if (themeBlock) {
    blocks.push('');
    blocks.push(themeBlock);
  }
  blocks.push('');
  blocks.push(buildActivitySelectionPrompt(ctx.hub));
  blocks.push('');
  blocks.push(buildGrammarFromGoalPrompt(ctx.communicationGoal));
  blocks.push('');
  blocks.push(STORY_FORMULA_PROMPT);
  blocks.push('');
  blocks.push(EMOTIONAL_BEATS_PROMPT);
  blocks.push('');
  blocks.push(LEARNING_JOURNEY_PROMPT);
  blocks.push('');
  blocks.push(DESIGN_WORKFLOW_PROMPT);
  blocks.push('');
  blocks.push(buildContinuityPrompt(ctx.continuity ?? {}));
  blocks.push('');
  blocks.push(buildExemplarsPrompt());
  blocks.push('');
  blocks.push(SELF_REVIEW_PROMPT);
  blocks.push('');
  blocks.push(HALL_OF_FAME_PROMPT);
  blocks.push('');
  blocks.push(buildCefrPrompt(ctx.hub, ctx.cefr));
  blocks.push('');
  blocks.push(buildMethodologyPrompt(ctx.hub, ctx.cefr));
  if (ctx.hub === 'playground') {
    const novakid = buildNovakidPrompt(ctx.cefr, ctx.completedUnits ?? 0);
    if (novakid) {
      blocks.push('');
      blocks.push(novakid);
    }
  }
  blocks.push('');
  blocks.push('### REASONING CONTRACT');
  blocks.push(
    [
      '1. Choose grammar focus EXCLUSIVELY from the Grammar-from-Goal table above AND within the level grammar arc. Never go above the CEFR ceiling.',
      '2. Choose target vocab from the Theme Brain objects when present; else from the level vocab domains, within the per-lesson range.',
      '3. The communication goal MUST be one observable Can-Do micro-task aligned with the detected goal family.',
      '4. The hub_identity_signature MUST cite the register, topic lens, and an example phrase that proves this blueprint could ONLY belong to this hub at this CEFR.',
      '5. Review targets MUST include ≥3 items from the recycle pool (or prior lessons).',
      '6. Theme/story MUST follow the 5-beat Story Formula (Goal → Problem → Adventure → Success → Celebration) and NEVER include hub-forbidden categories.',
      '7. Activities MUST follow the ladder (Recognition → Identification → Decision → Speaking → Communication). Never repeat the same game type twice.',
      '8. Answer the 6 Thinking Workflow questions silently first; expose them as a compact `reasoning_trace` field on the blueprint.',
      '9. For Playground: anchor to the Novakid-style progression unit above and keep the continuing story arc with Pip and friends.',
    ].join('\n'),
  );
  return blocks.join('\n');
}

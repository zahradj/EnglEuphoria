// Composes the fixed system-prompt chain for every Gemini call.
// Order: planner → governance → adaptive → pronunciation → gamification.
// Narrative + per-activity prompts are appended by the activities engine.

import { buildPlannerSystemPrompt } from '@/planning/promptInjector';
import { buildGrammarSelectionSystemPrompt } from '@/planning/grammarPlanner';
import { buildGovernanceSystemPrompt } from '@/governance/promptInjector';
import { buildAdaptationSystemPrompt } from '@/adaptive/promptInjector';
import { buildGamificationSystemPrompt } from '@/gamification/promptInjector';
import { buildPlaygroundSystemPrompt } from '@/playground';
import { buildPreA1MasterPrompt, type CEFR as MasterCEFR } from '@/governance/prea1MasterPrompt';
import { buildPrea1Directive } from '@/planning/prea1Blueprint';
import { buildA1Directive } from '@/planning/a1Blueprint';
import { buildGoldenAnchorPrompt, type Cefr as GoldenCefr, type Hub as GoldenHub } from '@/qa/data/goldenLessons';
import { buildMotionAnimationPrompt } from './motionAnimationPrompt';
import type { LessonContext } from './types';

export interface PromptChainResult {
  systemPrompt: string;
  hash: string;
}

function stableHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return `pc_${(h >>> 0).toString(16)}`;
}

export function composePromptChain(
  ctx: Omit<LessonContext, 'meta' | 'activities' | 'qa'>,
  options?: { prependPrompts?: string[] },
): PromptChainResult {
  const parts: string[] = [];

  // 0. Cycle 5 — Brain persona prompt(s). Prepended verbatim so the hub
  //    rulebook binds before planner / governance / adaptive.
  if (options?.prependPrompts?.length) {
    for (const p of options.prependPrompts) {
      if (p && p.trim()) parts.push(p);
    }
  }

  // 0b. Golden Reference anchor (few-shot, structure-only, no content copy).
  const anchor = buildGoldenAnchorPrompt(
    ctx.cefr.toLowerCase() as GoldenCefr,
    ctx.hub as GoldenHub,
  );
  if (anchor) parts.push(anchor);

  // 1. Planner
  parts.push(buildPlannerSystemPrompt(ctx.plan));

  // 1b. Grammar selection (explicit upstream decision; generator MUST obey).
  if (ctx.grammarPlan) {
    parts.push(buildGrammarSelectionSystemPrompt(ctx.grammarPlan));
  }

  // 2. Governance (LessonState contract)
  parts.push(buildGovernanceSystemPrompt(ctx.lessonState));

  // 2b. Playground pedagogy contract (only for Playground hub)
  if (ctx.hub === 'playground') {
    parts.push(buildPlaygroundSystemPrompt());
  }

  // 2c. Pre-A1 non-reader contract (blueprint directive + master pillars).
  //     Chained whenever cefr === 'Pre-A1' regardless of hub — Academy Pre-A1
  //     learners are equally non-readers.
  if (ctx.cefr === 'Pre-A1') {
    parts.push(buildPrea1Directive((ctx.plan?.blueprint as any)?.lesson_number));
    parts.push(
      buildPreA1MasterPrompt({
        hub: (ctx.hub.charAt(0).toUpperCase() + ctx.hub.slice(1)) as any,
        cefr: 'Pre-A1' as MasterCEFR,
      }),
    );
  }

  // 2d. A1 early-reader contract (Playground only).
  if (ctx.cefr === 'A1' && ctx.hub === 'playground') {
    parts.push(buildA1Directive((ctx.plan?.blueprint as any)?.lesson_number));
  }



  // 3. Adaptive
  parts.push(buildAdaptationSystemPrompt(ctx.adaptive));

  // 4. Pronunciation (only if a system prompt was produced)
  if (ctx.pronunciation?.system_prompt) {
    parts.push(ctx.pronunciation.system_prompt);
  }

  // 5. Gamification
  if (ctx.gamification?.mission) {
    parts.push(
      buildGamificationSystemPrompt({
        hub: ctx.hub,
        profile: (ctx.gamification as any).motivationProfile ?? {
          profileType: 'balanced',
          encouragementStyle: 'warm',
          rewardDensity: 'medium',
          signals: {},
          lastRecomputedAt: new Date().toISOString(),
        },
        mission: ctx.gamification.mission.narrative,
      }),
    );
  }

  // 6. Motion + Mascot animation contract (motion-design + rive-interactive skills).
  //    Appended last so entrance/mascot rules bind after pedagogy is set.
  parts.push(buildMotionAnimationPrompt({
    hub: ctx.hub,
    theme: ctx.lessonState?.theme?.theme ?? ctx.lessonState?.vocab?.theme ?? null,
  }));



  const systemPrompt = parts.filter(Boolean).join('\n\n');
  return { systemPrompt, hash: stableHash(systemPrompt) };
}

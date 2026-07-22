// Review & Memory Optimization System — entrypoint.
// `runMemoryOptimization()` produces a MemoryDecision the orchestrator merges
// into the lesson generation context.

import type { Hub, Cefr } from '@/governance/types';
import type { LearnerIntelligence } from '@/intelligence/types';

import type { MemoryDecision, MemoryItem, MemoryMicroRepair } from './types';
import { prioritize } from './prioritizer';
import { escalateRecallLevel } from './recallLadder';
import { reinforceSpeaking } from './speakingReinforcement';
import { interleave } from './interleaver';
import { planSpiralEscalations } from './spiralEngine';
import { attachAnchors, buildEmotionalAnchor } from './emotionalAnchors';
import { planInjection } from './injectionPlanner';
import { buildHeatmap } from './heatmap';
import { getMemoryHubProfile } from './hubProfiles';

export * from './types';
export { buildMemorySystemPrompt } from './promptInjector';
export { scheduleNext } from './sm2/scheduler';
export { computeForgettingRisk, predictRetention, isProactiveReviewDue } from './forgettingCurve';
export { validateMemory } from './validator';
export type { MemoryValidationReport, MemoryValidationInput } from './validator';
export { onActivityFailure } from './triggers';
export type { ScheduledReview, FailureContext } from './triggers';

export interface RunMemoryInput {
  studentId: string;
  hub: Hub;
  cefr: Cefr;
  intelligence: LearnerIntelligence;
  items: MemoryItem[];           // pre-fetched from memory_items table
  now?: Date;
}

export function runMemoryOptimization(input: RunMemoryInput): MemoryDecision {
  const now = input.now ?? new Date();
  const profile = getMemoryHubProfile(input.hub);

  // 1. Prioritize
  let queue = prioritize(input.items, input.intelligence, now);

  // 2. Recall ladder (passive → active)
  queue = queue.map(escalateRecallLevel);

  // 3. Speaking reinforcement
  queue = reinforceSpeaking(queue, input.intelligence);

  // 4. Spiral escalations
  queue = planSpiralEscalations(queue, input.hub, input.cefr);

  // 5. Emotional anchors
  const anchor = buildEmotionalAnchor(input.intelligence);
  queue = attachAnchors(queue, anchor);

  // 6. Interleave (caps to hub max)
  const { selected, mix } = interleave(queue, {
    maxItems: profile.maxItemsPerLesson,
    minKindDiversity: 3,
  });

  // 7. Injection planning
  const injectionPlan = planInjection(selected, input.hub, mix);

  // 8. Heatmap snapshot
  const heatmap = buildHeatmap(input.items, now);

  // 9. Micro-repairs (≤2) for highest-risk items not already in queue
  const microRepairs = deriveMicroRepairs(input.items, queue, now);

  const systemPromptHint = summarizeHeatmap(heatmap);

  return {
    review_queue: selected,
    microRepairs,
    injectionPlan,
    heatmap,
    systemPromptHint,
    meta: { generatedAt: now.toISOString(), version: '1.0.0', hub: input.hub },
  };
}

function deriveMicroRepairs(
  items: MemoryItem[],
  queue: ReturnType<typeof prioritize>,
  now: Date,
): MemoryMicroRepair[] {
  const queuedKeys = new Set(queue.map((q) => q.item.skill_key));
  const candidates = items
    .filter((i) => !queuedKeys.has(i.skill_key))
    .map((i) => ({ item: i, risk: i.forgetting_risk }))
    .filter((x) => x.risk >= 0.6)
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 2);

  return candidates.map(({ item }): MemoryMicroRepair => {
    if (item.skill_kind === 'pronunciation' || item.skill_kind === 'phonics') {
      return {
        kind: 'pronunciation_replay',
        target: item.skill_key,
        duration_s: 25,
        prompt: `Quick replay: produce "${item.skill_key}" twice and self-rate.`,
        reason: `pronunciation retention fragile (risk ${item.forgetting_risk.toFixed(2)})`,
      };
    }
    if (item.skill_kind === 'grammar') {
      return {
        kind: 'mini_grammar_fix',
        target: item.skill_key,
        duration_s: 20,
        prompt: `Spot & fix one sentence using "${item.skill_key}".`,
        reason: `grammar item decaying`,
      };
    }
    if (item.skill_kind === 'vocab') {
      return {
        kind: 'vocab_flash',
        target: item.skill_key,
        duration_s: 15,
        prompt: `Use "${item.skill_key}" in a true sentence about today.`,
        reason: `vocabulary inactive`,
      };
    }
    return {
      kind: 'quick_speaking_repair',
      target: item.skill_key,
      duration_s: 30,
      prompt: `Say one sentence using "${item.skill_key}" out loud.`,
      reason: `speaking pattern fading`,
    };
  });
}

function summarizeHeatmap(h: ReturnType<typeof buildHeatmap>): string {
  const parts: string[] = [];
  if (h.forgotten.length) parts.push(`${h.forgotten.length} forgotten`);
  if (h.fragile.length) parts.push(`${h.fragile.length} fragile`);
  if (h.speaking_weak.length) parts.push(`${h.speaking_weak.length} speaking-weak`);
  if (h.pronunciation_unstable.length) parts.push(`${h.pronunciation_unstable.length} pron-unstable`);
  return parts.join(', ');
}

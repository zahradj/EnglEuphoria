// Per-stage activity type selection — deterministic, explainable.

import type { PedagogicalStage, PedagogicalStageSpec } from '@/planning/types';
import { rankForStage } from './fitScorer';
import type {
  ActivityPurpose,
  ActivityType,
  GenerationContext,
} from '../types';

const STAGE_TO_PURPOSE: Record<PedagogicalStage, ActivityPurpose> = {
  hook: 'hook',
  context: 'input',
  input: 'input',
  discovery: 'discovery',
  controlled: 'controlled',
  communicative: 'communicative',
  production: 'production',
  reflection: 'reflection',
};

export interface SelectedSlot {
  stage: PedagogicalStage;
  purpose: ActivityPurpose;
  type: ActivityType;
  stageSpec: PedagogicalStageSpec;
}

// Cambridge caps: MCQ-style ≤2 and fill-blank ≤2 per lesson.
const MCQ_TYPES: ReadonlySet<ActivityType> = new Set([
  'poll', 'reading', 'listening',
] as unknown as ActivityType[]);
const FILL_TYPES: ReadonlySet<ActivityType> = new Set([
  'fill_blank',
] as unknown as ActivityType[]);
const MAX_PER_TYPE = 3; // any single type max 3 times per lesson
const MAX_MCQ_FAMILY = 2;
const MAX_FILL_FAMILY = 2;
const ADJACENCY_WINDOW = 2; // no repeat within last 2 picks

function familyOverCap(
  type: ActivityType,
  counts: Map<ActivityType, number>,
): boolean {
  if (MCQ_TYPES.has(type)) {
    let n = 0;
    for (const [t, c] of counts) if (MCQ_TYPES.has(t)) n += c;
    if (n >= MAX_MCQ_FAMILY) return true;
  }
  if (FILL_TYPES.has(type)) {
    let n = 0;
    for (const [t, c] of counts) if (FILL_TYPES.has(t)) n += c;
    if (n >= MAX_FILL_FAMILY) return true;
  }
  return (counts.get(type) ?? 0) >= MAX_PER_TYPE;
}

/** Picks one activity type per slide in each stage. */
export function selectActivityTypes(ctx: GenerationContext): SelectedSlot[] {
  const slots: SelectedSlot[] = [];
  const usedCounts = new Map<ActivityType, number>();
  const orderedPicks: ActivityType[] = [];

  for (const stageSpec of ctx.plan.flow_map) {
    for (let i = 0; i < stageSpec.slide_count; i++) {
      const ranking = rankForStage(stageSpec, ctx).filter((r) => !r.rejected);
      if (!ranking.length) continue;

      const recentWindow = orderedPicks.slice(-ADJACENCY_WINDOW);
      // Pass 1: honor adjacency ban + per-lesson caps.
      let winner = ranking.find(
        (r) => !recentWindow.includes(r.type) && !familyOverCap(r.type, usedCounts),
      );
      // Pass 2: relax adjacency ban but keep caps.
      if (!winner) {
        winner = ranking.find((r) => !familyOverCap(r.type, usedCounts));
      }
      // Pass 3: last resort — take top-scored (caps are soft-broken by validator later).
      if (!winner) winner = ranking[0];
      if (!winner) continue;

      slots.push({
        stage: stageSpec.stage,
        purpose: STAGE_TO_PURPOSE[stageSpec.stage],
        type: winner.type,
        stageSpec,
      });
      usedCounts.set(winner.type, (usedCounts.get(winner.type) ?? 0) + 1);
      orderedPicks.push(winner.type);

      // Push a lightweight placeholder so subsequent scoring sees recency.
      ctx.previous.push({
        id: `__plan_${slots.length}`,
        type: winner.type,
        purpose: STAGE_TO_PURPOSE[stageSpec.stage],
        stage: stageSpec.stage,
        modalities: stageSpec.modalities,
        target_vocab_used: [],
        grammar_targets_used: [],
        narrative_anchor: { characters: [], setting: '', scene: '' },
        content: null,
        estimated_load: 'medium',
      });
    }
  }

  // Clear placeholders — generation will append real specs.
  ctx.previous = [];
  return slots;
}

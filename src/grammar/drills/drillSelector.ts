// Drill selector — picks drills based on Hub × CEFR, deterministically.

import { GRAMMAR_HUB_PROFILES } from '../hubProfiles';
import { buildDrill } from './catalog';
import type { DrillSpec, DrillType, GrammarTarget } from '../types';
import type { Cefr, Hub } from '@/governance/types';

const CEFR_RANK: Record<string, number> = {
  'Pre-A1': 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5,
};


export function selectDrills(hub: Hub, cefr: Cefr, target: GrammarTarget): {
  drills: DrillSpec[];
  productionTasks: DrillSpec[];
} {
  const profile = GRAMMAR_HUB_PROFILES[hub];
  const rank = CEFR_RANK[cefr] ?? 2;

  // CEFR-aware drill quota — higher CEFR adds more transformation-heavy drills.
  const count = Math.max(profile.minDrillCount, profile.minDrillCount + Math.floor(rank / 2));
  const chosen: DrillType[] = [];
  // Round-robin through profile.drillMix while respecting forbidden + count.
  let i = 0;
  while (chosen.length < count) {
    const t = profile.drillMix[i % profile.drillMix.length];
    if (!profile.forbidden.includes(t)) chosen.push(t);
    i++;
    if (i > 50) break;
  }

  const drills = chosen.map((t, idx) => buildDrill(t, target, idx));

  // Production tasks: always include speaking + one free-stage drill (Academy/Success).
  const productionTasks: DrillSpec[] = [];
  productionTasks.push({
    id: `prod_speaking_${target.id}`,
    type: 'speaking',
    stage: 'free',
    prompt: `Use ${target.label} in a 60-second spoken response. Context: ${profile.productionContexts[0]}.`,
    grammarTarget: target.id,
    items: profile.productionContexts.slice(0, 3).map((ctx, i) => ({
      cue: `Free production task ${i + 1}: ${ctx}`,
      audioRequired: true,
    })),
  });

  return { drills, productionTasks };
}

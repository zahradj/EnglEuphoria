// Builds the compact context bundle passed to the Expert Lesson Architect.
// Keeps token cost low by summarising heavy intelligence/memory payloads
// to plain strings rather than shipping raw shapes.

import type { Hub, Cefr } from '@/governance/types';
import type { ArchitectContextBundle } from './types';
import { HUB_PLANNING_PROFILES } from '@/planning/hubProfiles';

interface BuildContextInput {
  hub: Hub;
  cefr: Cefr;
  intelligence?: any;
  memoryItems?: any[];
  analyticsSignals?: any[];
  priorLessons?: Array<{ title: string; grammar?: string[]; vocab?: string[]; theme?: string }>;
  governanceConstraints?: ArchitectContextBundle['governanceConstraints'];
  activityCatalog?: string[];
}

export function buildArchitectContext(input: BuildContextInput): ArchitectContextBundle {
  const hubProfile = HUB_PLANNING_PROFILES[input.hub] ?? null;

  // Intelligence summary — collapse the brain into ~6 lines of plain text.
  let intelligenceSummary: string | undefined;
  const intel = input.intelligence;
  if (intel) {
    const lines: string[] = [];
    const masteryEntries = intel.mastery_map ? Object.values(intel.mastery_map) : [];
    if (masteryEntries.length) {
      const top = masteryEntries
        .slice()
        .sort((a: any, b: any) => (b.mastery ?? 0) - (a.mastery ?? 0))
        .slice(0, 5)
        .map((m: any) => `${m.skill ?? m.skill_id ?? '?'}=${Math.round((m.mastery ?? 0) * 100)}%`)
        .join(', ');
      const weak = masteryEntries
        .slice()
        .sort((a: any, b: any) => (a.mastery ?? 0) - (b.mastery ?? 0))
        .slice(0, 5)
        .map((m: any) => `${m.skill ?? m.skill_id ?? '?'}=${Math.round((m.mastery ?? 0) * 100)}%`)
        .join(', ');
      lines.push(`Mastery — strong: ${top || 'none'} | weak: ${weak || 'none'}`);
    }
    if (Array.isArray(intel.error_patterns) && intel.error_patterns.length) {
      const top = intel.error_patterns.slice(0, 4).map((e: any) => e.pattern ?? e.code ?? e).join('; ');
      lines.push(`Recurring errors: ${top}`);
    }
    if (intel.speaking_confidence) {
      lines.push(`Speaking confidence: tier=${intel.speaking_confidence.tier ?? '?'}, attempts7d=${intel.speaking_confidence.voluntary_attempts_7d ?? 0}`);
    }
    if (intel.engagement_state) {
      lines.push(`Engagement: attention=${intel.engagement_state.attention_score ?? '?'}, mood=${intel.engagement_state.mood ?? '?'}`);
    }
    if (intel.narrative_state?.active_arc) {
      lines.push(`Narrative arc: ${intel.narrative_state.active_arc}`);
    }
    intelligenceSummary = lines.join('\n') || undefined;
  }

  const memoryDue = (input.memoryItems ?? [])
    .filter((m: any) => m?.next_due_at && new Date(m.next_due_at).getTime() <= Date.now() + 24 * 3600_000)
    .map((m: any) => m.payload?.lemma ?? m.payload?.label ?? m.target_id ?? '')
    .filter(Boolean)
    .slice(0, 16);

  const analyticsHints = (input.analyticsSignals ?? [])
    .slice(0, 6)
    .map((s: any) => `${s.type ?? 'signal'}${s.severity ? `(${s.severity})` : ''}`)
    .filter(Boolean);

  return {
    hubProfile,
    priorLessons: input.priorLessons,
    intelligenceSummary,
    governanceConstraints: input.governanceConstraints,
    activityCatalog: input.activityCatalog,
    memoryDue: memoryDue.length ? memoryDue : undefined,
    analyticsHints: analyticsHints.length ? analyticsHints : undefined,
  };
}

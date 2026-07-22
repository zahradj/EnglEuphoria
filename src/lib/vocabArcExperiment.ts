/**
 * Vocab Arc A/B experiment flag (senior-ai-edtech-architect).
 *
 * Deterministically flags ~10% of lessons to SKIP the vocab reinforcement
 * arc, so we can measure recall lift against a control. The decision is
 * a stable hash of (lessonId, cohortSalt) so a given lesson is always in
 * the same arm (no bleed between preview/publish).
 *
 * Results are logged to `analytics_tuning_log` for correlation with the
 * `vocab_arc_complete` events in the beta-analytics tab.
 *
 * Tier 6 (soft, adaptive) — never overrides CEFR/curriculum/age/safety.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Hub } from '@/governance/types';

const COHORT_SALT = 'vocab-arc-ab:v1';
const SKIP_RATE = 0.1; // 10% control arm

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

export type VocabArcArm = 'treatment' | 'control';

export function vocabArcArm(lessonId: string | undefined | null): VocabArcArm {
  if (!lessonId) return 'treatment';
  return hash(`${COHORT_SALT}:${lessonId}`) < SKIP_RATE ? 'control' : 'treatment';
}

/** Log arm assignment for offline analysis. Best-effort (never throws). */
export async function logVocabArcArm(
  lessonId: string,
  hub: Hub,
  arm: VocabArcArm,
): Promise<void> {
  try {
    await (supabase as any).from('analytics_tuning_log').insert({
      source: 'vocab_arc_ab',
      target: 'vocab_gamification_inject',
      delta: { arm, hub, lesson_id: lessonId, cohort: COHORT_SALT },
    });
  } catch {
    /* telemetry only */
  }
}

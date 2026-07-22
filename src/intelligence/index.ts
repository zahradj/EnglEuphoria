// Educational Intelligence Layer — public surface.
//
// The layer sits ABOVE lesson generation and unifies all educational engines
// (mastery, errors, speaking, pronunciation, review, engagement, communication,
// adaptive, narrative, quality) into a single LearnerIntelligence object.
//
// Lifecycle:
//   1. caller → runIntelligence({ studentId, hub })   → LearnerIntelligence
//   2. caller → runLessonGeneration({ ..., intelligence })
//   3. player → posts ObservationEvents → eventHandlers update tables
//   4. layer rebuilds intelligence on next request (cache-aware)

import { assembleLearnerIntelligence, type AssembleArgs } from './assembler';
import { supabase } from '@/integrations/supabase/client';
import type { LearnerIntelligence } from './types';

export * from './types';
export { assembleLearnerIntelligence } from './assembler';
export { decideMicroRepairs } from './microRemediation/microRemediationEngine';
export type { CurrentSlideHint } from './microRemediation/microRemediationEngine';
export { getActiveNarrative, upsertNarrativeBeat, buildNarrativeContinuityHint } from './narrative/narrativeContinuity';
export { aggregateQualityScore } from './quality/qualityScoreAggregator';
export type { QualityScore } from './quality/qualityScoreAggregator';
export { buildTeacherInsight } from './insights/teacherInsightBuilder';
export type { TeacherInsight, MasteryHeatmapCell, StruggleAlert } from './insights/teacherInsightBuilder';
export { handleObservationEvent } from './observer/eventHandlers';

const CACHE_TTL_MS = 60_000; // 1 minute

/**
 * Public entry point — assembles the LearnerIntelligence for a student/hub.
 * Uses `intelligence_snapshots` as a short-lived cache.
 */
export async function runIntelligence(args: AssembleArgs): Promise<LearnerIntelligence> {
  // Try cache
  try {
    const { data } = await (supabase as any)
      .from('intelligence_snapshots')
      .select('payload, updated_at')
      .eq('student_id', args.studentId)
      .eq('hub', args.hub)
      .maybeSingle();
    if (data?.payload && data.updated_at) {
      const age = Date.now() - new Date(data.updated_at).getTime();
      if (age < CACHE_TTL_MS) {
        return { ...(data.payload as LearnerIntelligence), meta: { ...(data.payload as LearnerIntelligence).meta, source: 'cache' } };
      }
    }
  } catch { /* fall through */ }

  const intel = await assembleLearnerIntelligence(args);

  // Persist cache (best-effort)
  try {
    await (supabase as any).from('intelligence_snapshots').upsert({
      student_id: args.studentId,
      hub: args.hub,
      payload: intel,
      updated_at: new Date().toISOString(),
    });
  } catch { /* best-effort */ }

  return intel;
}

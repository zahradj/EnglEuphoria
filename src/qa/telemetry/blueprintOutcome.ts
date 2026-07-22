// ---------------------------------------------------------------------------
// Fire-and-forget telemetry for A1 / Pre-A1 blueprint + ESA-chunks QA outcomes.
// One row per QA pass to `analytics_tuning_log` with engine='qa.a1_blueprint'.
// ---------------------------------------------------------------------------
// Rationale: Wave 2 promoted PG_ESA_SHAPE_UNDECLARED / PG_CHUNKS_UNDECLARED to
// HARD gates. To close the loop we need visibility into how often lessons hit
// those gates and which lesson numbers repair most often — the same channel
// analytics uses for tier-6 tuning deltas (`analytics_tuning_log`).
//
// Non-blocking. Never throws. Skips silently when no relevant codes fired.
// ---------------------------------------------------------------------------

import { supabase } from '@/integrations/supabase/client';
import type { QAReport } from '../types';

const BLUEPRINT_CODES = new Set([
  'PG_ESA_SHAPE_UNDECLARED',
  'PG_CHUNKS_UNDECLARED',
  'A1_FORBIDDEN_ACTIVITY',
  'A1_WRITING_GATE_VIOLATION',
  'A1_SENTENCE_TOO_LONG',
  'A1_SPEAKING_FLOOR_MISSED',
  'PREA1_PRINTED_PROSE_LEAK',
  'PREA1_FORBIDDEN_ACTIVITY',
]);

export interface BlueprintTelemetryContext {
  lessonId: string;
  studentId: string;                       // required by analytics_tuning_log
  hub?: string;
  cefr?: string;
  lessonNumber?: number;
  passNo?: number;
}

export async function logBlueprintQAOutcome(
  ctx: BlueprintTelemetryContext,
  report: QAReport,
): Promise<void> {
  try {
    const fired = report.issues.filter((i) => BLUEPRINT_CODES.has(i.code));
    if (fired.length === 0) return;

    const codes = Array.from(new Set(fired.map((i) => i.code))).sort();
    const row = {
      engine: 'qa.a1_blueprint',
      lesson_id: ctx.lessonId,
      student_id: ctx.studentId,
      reason: `blueprint_qa verdict=${report.verdict} pass=${ctx.passNo ?? 1}`,
      before_state: {
        hub: ctx.hub ?? null,
        cefr: ctx.cefr ?? null,
        lesson_number: ctx.lessonNumber ?? null,
      },
      after_state: {
        verdict: report.verdict,
        codes,
      },
      delta: {
        fired_count: fired.length,
        blocked: fired.some((i) => i.severity === 'block'),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('analytics_tuning_log' as any) as any).insert(row);
  } catch (err) {
    // Telemetry must never break the pipeline.
    // eslint-disable-next-line no-console
    console.warn('[analytics_tuning_log] blueprint QA insert failed', err);
  }
}

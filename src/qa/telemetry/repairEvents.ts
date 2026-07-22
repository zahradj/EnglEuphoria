// Fire-and-forget telemetry for QA repair dispatches.
// One row per RepairDispatch bucket per QA pass. Never throws.

import { supabase } from '@/integrations/supabase/client';
import type { RepairDispatch } from '../repairDispatcher';

export interface RepairEventContext {
  lessonId: string;
  hub?: string;
  cefr?: string;
  lessonKind?: string;
  passNo?: number;
  verdict?: string;
}

export async function logRepairEvents(
  ctx: RepairEventContext,
  repairs: RepairDispatch[],
): Promise<void> {
  if (!repairs.length) return;
  try {
    const rows = repairs.map((r) => ({
      lesson_id: ctx.lessonId,
      hub: ctx.hub ?? null,
      cefr: ctx.cefr ?? null,
      lesson_kind: ctx.lessonKind ?? null,
      pass_no: ctx.passNo ?? 1,
      target: r.target,
      issue_codes: Array.from(new Set(r.issue_codes)),
      verdict: ctx.verdict ?? null,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('qa_repair_events' as any) as any).insert(rows);
  } catch (err) {
    // Telemetry must never break the pipeline.
    // eslint-disable-next-line no-console
    console.warn('[qa_repair_events] insert failed', err);
  }
}

// Auto-repair telemetry
// ---------------------
// Logs which repair hints fire across lesson generations so we can tune
// prompts / validators against the most expensive failure modes.
//
// - In-memory counters are always available (no network needed).
// - When a Supabase client is provided, a row is also written to
//   public.qa_repair_telemetry for cross-session aggregation.

import type { PublishDecision } from '@/qa/publishGate';
import type { QAIssue } from '@/qa/types';

const codeCounts = new Map<string, number>();
const engineCounts = new Map<string, number>();
let totalRuns = 0;
let blockedRuns = 0;

export interface LogRepairInput {
  lessonId?: string;
  hub?: string;
  cefr?: string;
  attemptIndex?: number;
  overallScore?: number;
  decision: PublishDecision;
  /** Raw QA issues — used to extract per-code locators for the dashboard. */
  issues?: QAIssue[];
}

/**
 * Builds `{ [code]: [{slideId, activityId, path}, ...] }` from the issues
 * that drove this publish decision so we can surface which lesson sections
 * most often block on each validator.
 */
function buildLocatorMap(
  decision: PublishDecision,
  issues: QAIssue[] | undefined,
): Record<string, Array<Record<string, string>>> | null {
  if (!issues || issues.length === 0) return null;
  const codes = new Set(decision.repair_codes);
  const out: Record<string, Array<Record<string, string>>> = {};
  for (const i of issues) {
    if (!codes.has(i.code) || !i.locator) continue;
    const loc: Record<string, string> = {};
    if (i.locator.slideId) loc.slideId = i.locator.slideId;
    if (i.locator.activityId) loc.activityId = i.locator.activityId;
    if (i.locator.path) loc.path = i.locator.path;
    if (Object.keys(loc).length === 0) continue;
    (out[i.code] ??= []).push(loc);
  }
  return Object.keys(out).length > 0 ? out : null;
}

export interface RepairTelemetrySink {
  // Minimal shape so we don't depend on a specific supabase client typing here.
  from(table: 'qa_repair_telemetry'): {
    insert(row: Record<string, unknown>): Promise<{ error: unknown }>;
  };
}

export async function logRepairOutcome(
  input: LogRepairInput,
  sink?: RepairTelemetrySink,
): Promise<void> {
  totalRuns++;
  if (!input.decision.allowed) blockedRuns++;

  for (const code of input.decision.repair_codes) {
    codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1);
  }
  for (const eng of input.decision.blocking_engines) {
    engineCounts.set(eng, (engineCounts.get(eng) ?? 0) + 1);
  }

  if (!sink) return;
  try {
    await sink.from('qa_repair_telemetry').insert({
      lesson_id: input.lessonId ?? null,
      hub: input.hub ?? null,
      cefr: input.cefr ?? null,
      attempt_index: input.attemptIndex ?? 0,
      next_action: input.decision.next_action,
      repair_codes: input.decision.repair_codes,
      blocking_engines: input.decision.blocking_engines,
      overall_score: input.overallScore ?? null,
      locators: buildLocatorMap(input.decision, input.issues),
    });
  } catch (e) {
    // Telemetry must never break the pipeline.
    if (typeof console !== 'undefined') {
      console.warn('[repairTelemetry] insert failed', e);
    }
  }
}

export interface RepairTelemetrySnapshot {
  totalRuns: number;
  blockedRuns: number;
  topCodes: Array<{ code: string; count: number }>;
  topEngines: Array<{ engine: string; count: number }>;
}

export function snapshotRepairTelemetry(limit = 10): RepairTelemetrySnapshot {
  const topCodes = [...codeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([code, count]) => ({ code, count }));
  const topEngines = [...engineCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([engine, count]) => ({ engine, count }));
  return { totalRuns, blockedRuns, topCodes, topEngines };
}

export function resetRepairTelemetry(): void {
  codeCounts.clear();
  engineCounts.clear();
  totalRuns = 0;
  blockedRuns = 0;
}

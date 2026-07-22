/**
 * Engine Mastery Certificates — auto-award when a student completes
 * ≥ THRESHOLD_RUNS of a given engine with ≥ THRESHOLD_ACCURACY average.
 *
 * Idempotent via the unique (user_id, engine) constraint.
 */
import { supabase } from "@/integrations/supabase/client";

export const THRESHOLD_RUNS = 5;
export const THRESHOLD_ACCURACY = 0.8;

export interface CertificateAward {
  engine: string;
  hub: string;
  runsCount: number;
  avgAccuracy: number;
  shareToken?: string | null;
  awardedAt: string;
}

/**
 * Evaluate the current user's engine runs. For any engine that crossed
 * the mastery threshold and has no certificate yet, insert one.
 * Returns any freshly-awarded certificates.
 */
export async function checkAndAwardCertificates(): Promise<CertificateAward[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: runs, error } = await supabase
    .from("student_engine_runs")
    .select("engine, hub, accuracy")
    .eq("user_id", user.id);
  if (error || !runs) return [];

  // Aggregate per engine
  const groups: Record<string, { hub: string; count: number; sum: number }> = {};
  for (const r of runs as any[]) {
    const key = r.engine;
    if (!groups[key]) groups[key] = { hub: r.hub || "playground", count: 0, sum: 0 };
    groups[key].count += 1;
    groups[key].sum += Number(r.accuracy) || 0;
  }

  const eligible: CertificateAward[] = [];
  for (const [engine, g] of Object.entries(groups)) {
    if (g.count < THRESHOLD_RUNS) continue;
    const avg = g.sum / g.count;
    if (avg < THRESHOLD_ACCURACY) continue;
    eligible.push({
      engine,
      hub: g.hub,
      runsCount: g.count,
      avgAccuracy: Math.round(avg * 100) / 100,
      awardedAt: new Date().toISOString(),
    });
  }
  if (eligible.length === 0) return [];

  // Fetch existing to avoid duplicate inserts
  const { data: existing } = await supabase
    .from("engine_mastery_certificates")
    .select("engine")
    .eq("user_id", user.id);
  const have = new Set((existing || []).map((r: any) => r.engine));
  const toInsert = eligible.filter((e) => !have.has(e.engine));
  if (toInsert.length === 0) return [];

  const { data: inserted } = await supabase
    .from("engine_mastery_certificates")
    .insert(
      toInsert.map((e) => ({
        user_id: user.id,
        engine: e.engine,
        hub: e.hub,
        runs_count: e.runsCount,
        avg_accuracy: e.avgAccuracy,
      })),
    )
    .select("engine, hub, runs_count, avg_accuracy, awarded_at, share_token");

  return (inserted || []).map((r: any) => ({
    engine: r.engine,
    hub: r.hub,
    runsCount: r.runs_count,
    avgAccuracy: Number(r.avg_accuracy),
    shareToken: r.share_token,
    awardedAt: r.awarded_at,
  }));
}

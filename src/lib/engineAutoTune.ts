// Engine difficulty auto-tune — reads recent accuracy so engineSlotInjector
// can downshift for struggling learners. Never overrides CEFR/curriculum.

import { supabase } from '@/integrations/supabase/client';

const WINDOW_SIZE = 5;
const LS_KEY = 'engleuphoria.engine.autoTune.v1';

/** Sync accessor for derivePages — reads a locally-cached rolling average. */
export function getCachedEngineAccuracy(): number | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const n = Number(JSON.parse(raw)?.avg);
    return Number.isFinite(n) && n >= 0 && n <= 1 ? n : null;
  } catch {
    return null;
  }
}

function writeCache(avg: number) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ avg, at: Date.now() }));
  } catch { /* quota */ }
}

/** Async accessor — pulls the last N runs from Supabase and refreshes the cache. */
export async function getRecentEngineAccuracy(
  studentUserId: string | null | undefined,
): Promise<number | null> {
  if (!studentUserId) return null;
  const { data, error } = await supabase
    .from('student_engine_runs')
    .select('accuracy')
    .eq('user_id', studentUserId)
    .order('created_at', { ascending: false })
    .limit(WINDOW_SIZE);
  if (error || !data || data.length === 0) return null;
  const vals = data
    .map((r: any) => Number(r.accuracy))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 1);
  if (!vals.length) return null;
  const avg = vals.reduce((s, n) => s + n, 0) / vals.length;
  writeCache(avg);
  return avg;
}

/** Update the local rolling average after a run is recorded (client-side). */
export function noteEngineRunAccuracy(accuracy: number) {
  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 1) return;
  const prev = getCachedEngineAccuracy();
  // EMA with weight 1/WINDOW_SIZE keeps the value responsive but stable.
  const next = prev === null ? accuracy : prev + (accuracy - prev) / WINDOW_SIZE;
  writeCache(next);
}


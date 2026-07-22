/**
 * Teacher-facing Vocab Arc insight (senior-ai-edtech-architect).
 *
 * Reads pre-aggregated `beta_insights` rows (metric='vocab_arc_accuracy')
 * written nightly by the `analytics-rollup` edge function, so teacher
 * dashboards load instantly instead of scanning raw events.
 *
 * Falls back to raw `analytics_events` if the rollup hasn't run yet.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Hub } from '@/governance/types';

export interface TeacherVocabInsight {
  hub: Hub | 'unknown';
  medianAccuracy: number; // 0..1
  p90Accuracy: number;    // 0..1
  sampleSize: number;
  windowDays: number;
  source: 'rollup' | 'raw';
}

export async function getTeacherVocabInsight(hub: Hub): Promise<TeacherVocabInsight | null> {
  // 1. Try the nightly rollup first.
  const { data: rollup } = await (supabase as any)
    .from('beta_insights')
    .select('p50, p90, sample_size, details, created_at, scope')
    .eq('metric', 'vocab_arc_accuracy')
    .order('created_at', { ascending: false })
    .limit(20);

  const match = (rollup ?? []).find(
    (r: any) => (r?.scope?.hub ?? '') === hub,
  );
  if (match && match.sample_size > 0) {
    return {
      hub,
      medianAccuracy: Number(match.p50) || 0,
      p90Accuracy: Number(match.p90) || 0,
      sampleSize: Number(match.sample_size) || 0,
      windowDays: Number(match?.details?.window_days) || 7,
      source: 'rollup',
    };
  }

  // 2. Fallback: scan raw events (last 7 days, capped).
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: raw } = await (supabase as any)
    .from('analytics_events')
    .select('event_data')
    .eq('event_type', 'vocab_arc_complete')
    .gte('created_at', since)
    .limit(2000);
  const accs: number[] = (raw ?? [])
    .filter((r: any) => (r?.event_data?.hub ?? 'unknown') === hub)
    .map((r: any) => Number(r?.event_data?.accuracy) || 0);
  if (!accs.length) return null;
  const sorted = [...accs].sort((a, b) => a - b);
  const pct = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))];
  return {
    hub,
    medianAccuracy: pct(0.5),
    p90Accuracy: pct(0.9),
    sampleSize: accs.length,
    windowDays: 7,
    source: 'raw',
  };
}

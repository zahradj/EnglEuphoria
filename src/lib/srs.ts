/**
 * Spaced Repetition System (SRS) — client helpers.
 *
 * Reports student performance on individual vocabulary/grammar items to the
 * `student_mastery` table so the AI blueprint generator can re-inject difficult
 * items into future lessons.
 *
 * Scoring rules (per spec):
 *   3 stars → +20 mastery, next review in 4 days
 *   2 stars → +5  mastery, next review in 1 day
 *   1 star  → −10 mastery, next review immediately
 *   Voice fail (0 stars) → same as 1 star
 */

import { supabase } from '@/integrations/supabase/client';
import { scheduleExpanding } from '@/lib/expandingScheduler';

export type Hub = 'Playground' | 'Academy' | 'Success';
export type ItemType =
  | 'vocabulary'
  | 'grammar'
  | 'phonics'
  | 'phrase'
  | 'grammar_rule'
  | 'abstract_concept';

const HUB_NORMALIZE: Record<string, Hub> = {
  playground: 'Playground',
  academy: 'Academy',
  success: 'Success',
  Playground: 'Playground',
  Academy: 'Academy',
  Success: 'Success',
};

interface SrsReportInput {
  user_id: string;
  hub: Hub | string;
  items: string[]; // words or grammar-rule keys
  stars: 0 | 1 | 2 | 3;
  item_type?: ItemType;
}

const SCORE_DELTA: Record<number, number> = { 3: 20, 2: 5, 1: -10, 0: -10 };
const NEXT_REVIEW_DAYS: Record<number, number> = { 3: 4, 2: 1, 1: 0, 0: 0 };

function nextReviewIso(stars: number): string {
  const d = new Date();
  const days = NEXT_REVIEW_DAYS[stars] ?? 0;
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Records or upserts mastery progress for one or more items at once.
 * Silent on failure — never blocks the lesson UX.
 */
export async function reportSrsResult({
  user_id,
  hub,
  items,
  stars,
  item_type = 'vocabulary',
}: SrsReportInput): Promise<void> {
  if (!user_id || !items?.length) return;

  const normalizedHub = HUB_NORMALIZE[hub] ?? 'Academy';
  const delta = SCORE_DELTA[stars] ?? 0;
  const useExpanding = item_type === 'grammar_rule' || item_type === 'abstract_concept';
  const correct = stars >= 2;
  const now = new Date().toISOString();

  const cleanItems = Array.from(
    new Set(
      items
        .map((s) => (typeof s === 'string' ? s.trim().toLowerCase() : ''))
        .filter((s) => s.length > 0 && s.length <= 120),
    ),
  );
  if (!cleanItems.length) return;

  // Fetch existing rows so we can compute the new mastery_score per item.
  const { data: existing, error: readErr } = await supabase
    .from('student_mastery')
    .select('item_key, mastery_score, times_correct, times_incorrect, srs_streak')
    .eq('user_id', user_id)
    .eq('item_type', item_type)
    .in('item_key', cleanItems);

  if (readErr) {
    console.warn('[SRS] read failed', readErr);
    return;
  }

  const existingMap = new Map(
    (existing ?? []).map((row: any) => [row.item_key, row]),
  );

  const rows = cleanItems.map((key) => {
    const prev = existingMap.get(key);
    const prevScore = prev?.mastery_score ?? 0;
    const newScore = Math.max(0, Math.min(100, prevScore + delta));
    let next_review_at: string;
    let srs_streak = prev?.srs_streak ?? 0;
    let srs_strategy: 'flat' | 'expanding' = 'flat';
    if (useExpanding) {
      srs_strategy = 'expanding';
      const exp = scheduleExpanding({ currentStreak: srs_streak, stars });
      next_review_at = exp.nextReviewAt;
      srs_streak = exp.nextStreak;
    } else {
      next_review_at = nextReviewIso(stars);
    }
    return {
      user_id,
      item_key: key,
      item_type,
      hub: normalizedHub,
      mastery_score: newScore,
      times_correct: (prev?.times_correct ?? 0) + (correct ? 1 : 0),
      times_incorrect: (prev?.times_incorrect ?? 0) + (correct ? 0 : 1),
      last_tested: now,
      next_review_at,
      srs_streak,
      srs_strategy,
    };
  });

  const { error: upsertErr } = await supabase
    .from('student_mastery')
    .upsert(rows, { onConflict: 'user_id,item_key,item_type' });

  if (upsertErr) {
    console.warn('[SRS] upsert failed', upsertErr);
  }
}

/**
 * Convenience wrapper used by SlideRenderer activities — pulls user_id from
 * the active session and forwards.
 */
export async function reportSrsForCurrentUser(
  args: Omit<SrsReportInput, 'user_id'>,
): Promise<void> {
  const { data } = await supabase.auth.getUser();
  const uid = data?.user?.id;
  if (!uid) return;
  return reportSrsResult({ ...args, user_id: uid });
}

/** Memory Bank summary — used by the dashboard widget. */
export interface MemoryBankSummary {
  total: number;
  mastered: number; // >= 80
  learning: number; // < 80 && > 0
  due_today: number;
  recent_words: string[];
}

export async function fetchMemoryBank(user_id: string, hub?: Hub): Promise<MemoryBankSummary> {
  let q = supabase
    .from('student_mastery')
    .select('item_key, mastery_score, next_review_at')
    .eq('user_id', user_id);
  if (hub) q = q.eq('hub', hub);

  const { data, error } = await q.limit(1000);
  if (error || !data) {
    return { total: 0, mastered: 0, learning: 0, due_today: 0, recent_words: [] };
  }
  const now = Date.now();
  const mastered = data.filter((r: any) => r.mastery_score >= 80).length;
  const learning = data.filter((r: any) => r.mastery_score < 80).length;
  const due_today = data.filter(
    (r: any) => new Date(r.next_review_at).getTime() <= now && r.mastery_score < 100,
  ).length;
  const recent_words = data
    .slice(-12)
    .map((r: any) => r.item_key)
    .reverse();
  return { total: data.length, mastered, learning, due_today, recent_words };
}

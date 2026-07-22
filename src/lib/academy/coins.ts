import { supabase } from '@/integrations/supabase/client';

export const ACADEMY_COINS_PER_BLOCK = 10;

export type AcademyCoinReason =
  | 'lesson_block_complete'
  | 'lesson_complete'
  | 'admin_adjust';

export interface AwardAcademyCoinsParams {
  studentId: string;
  lessonId?: string | null;
  blockId?: string | null;
  amount?: number;
  reason: AcademyCoinReason;
}

/**
 * Idempotent coin credit for the Academy hub.
 * Conflicts on the partial unique index (student_id, lesson_id, block_id) are
 * swallowed silently — the same block can never credit twice.
 *
 * Emits an `academy:coins-updated` window event on success so the top-bar
 * balance refreshes immediately.
 */
export async function awardAcademyCoins({
  studentId,
  lessonId = null,
  blockId = null,
  amount = ACADEMY_COINS_PER_BLOCK,
  reason,
}: AwardAcademyCoinsParams): Promise<{ awarded: boolean; error?: string }> {
  if (!studentId) return { awarded: false, error: 'missing studentId' };
  if (amount <= 0 || amount > 50) return { awarded: false, error: 'amount out of range' };

  const { data, error } = await supabase.rpc('award_academy_coins' as any, {
    p_amount: amount,
    p_reason: reason,
    p_lesson_id: lessonId,
    p_block_id: blockId,
  });

  if (error) {
    return { awarded: false, error: error.message };
  }

  const result = (data ?? {}) as { awarded?: boolean; reason?: string };
  // duplicate / daily_cap_reached are treated as non-fatal no-ops
  if (result.awarded === false && result.reason && result.reason !== 'duplicate' && result.reason !== 'daily_cap_reached') {
    return { awarded: false, error: result.reason };
  }

  try {
    window.dispatchEvent(new CustomEvent('academy:coins-updated'));
  } catch {
    /* SSR-safe */
  }

  return { awarded: result.awarded !== false };
}

import { supabase } from '@/integrations/supabase/client';
import type { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';

const SAFE_GAMES = ['matching_pairs', 'true_false_swipe', 'binary_choice', 'sorting_buckets'];

/**
 * Build a synthetic "Confidence Builder" slide for in-lesson micro-remediation.
 *
 * Pulls a low-difficulty activity from `daily_discovery_pool` matching the
 * hub and (best-effort) the failed skill tag. Falls back to a tiny in-memory
 * matching_pairs payload sourced from the current lesson's vocab list so the
 * injection never breaks the lesson flow.
 *
 * The resulting slide is marked with `meta.injected_by = 'micro_remediation'`
 * so XP/mastery tallies and analytics can filter it out cleanly.
 */
export async function buildConfidenceBuilderSlide(args: {
  hub: string;
  failedTag?: string;
  lessonVocab?: Array<{ word: string; translation?: string; definition?: string }>;
}): Promise<GeneratedSlide> {
  const { hub, failedTag, lessonVocab = [] } = args;

  // 1. Try the pool first.
  try {
    const { data } = await supabase
      .from('daily_discovery_pool')
      .select('id, game_type, game_payload')
      .eq('active', true)
      .eq('hub', hub)
      .in('game_type', SAFE_GAMES)
      .limit(8);

    if (data && data.length > 0) {
      // Prefer a row whose payload mentions the failed tag, otherwise first.
      const match =
        (failedTag &&
          data.find((r) =>
            JSON.stringify(r.game_payload).toLowerCase().includes(failedTag.toLowerCase()),
          )) ||
        data[0];

      return wrap(match.game_type, match.game_payload as Record<string, unknown>, failedTag);
    }
  } catch (e) {
    console.warn('[ConfidenceBuilder] pool fetch failed, falling back:', (e as Error).message);
  }

  // 2. Fallback — build a tiny matching_pairs from current lesson vocab.
  const pairs = lessonVocab
    .slice(0, 4)
    .map((v) => ({ left: v.word, right: v.translation || v.definition || v.word }))
    .filter((p) => p.left && p.right);

  const payload =
    pairs.length >= 2
      ? { pairs, instruction: "Let's match them one more time!" }
      : {
          pairs: [
            { left: 'yes', right: 'positive' },
            { left: 'no', right: 'negative' },
          ],
          instruction: "Let's try one more together!",
        };

  return wrap('matching_pairs', payload, failedTag);
}

function wrap(
  activityType: string,
  payload: Record<string, unknown>,
  failedTag?: string,
): GeneratedSlide {
  return {
    id: `confidence-builder-${Date.now()}`,
    slideType: 'activity',
    activityType,
    title: "Let's try one more together!",
    content: { ...payload, hint: payload.hint ?? 'You can do this — take your time.' },
    interaction: { type: activityType, data: payload },
    meta: {
      injected_by: 'micro_remediation',
      skill_tag: failedTag ?? null,
      hidden_from_progress: true,
    },
  } as unknown as GeneratedSlide;
}

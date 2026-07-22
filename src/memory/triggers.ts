// Cycle 4 — SRS re-deployment triggers.
//
// Pure functions that translate activity failures into spaced-review recipes.
// Intervals follow the existing SM-2+ ladder (2d, 4d, 8d, 16d).
// Persistence happens in the caller (intelligence-observer edge function or
// runMemoryOptimization) — this module is pure and side-effect-free.

import type { ActivityType } from '@/activities/types';

export type CefrLite = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface ScheduledReview {
  /** The activity type to redeploy when the review comes due. */
  redeploy_as: ActivityType;
  /** Days from now. */
  interval_days: number;
  /** Vocab or grammar tag the review targets. */
  target: string;
  /** Why this review was scheduled — kept for explainability + telemetry. */
  reason: string;
}

export interface FailureContext {
  activityType: ActivityType;
  target_vocab_used: string[];
  grammar_targets_used: string[];
  cefr: CefrLite;
}

const SRS_INTERVALS = [2, 4, 8, 16];

const isBeginner = (c: CefrLite) => c === 'Pre-A1' || c === 'A1';

export function onActivityFailure(ctx: FailureContext): ScheduledReview[] {
  const out: ScheduledReview[] = [];
  const vocab = dedupe(ctx.target_vocab_used);
  const grammar = dedupe(ctx.grammar_targets_used);

  switch (ctx.activityType) {
    case 'sentence_builder':
    case 'chunk_builder':
      for (const w of vocab) {
        out.push(...schedule(['matching', 'pronunciation'], w, 'sentence_builder_failure', SRS_INTERVALS.slice(0, 3)));
      }
      break;

    case 'tense_transform':
    case 'fill_blank':
    case 'grammar_sort':
    case 'grammar_color_builder':
      // Analytical drills only re-queue at A2+; below that we promote to guided output.
      if (isBeginner(ctx.cefr)) {
        for (const g of grammar) {
          out.push(...schedule(['substitution_drill', 'sentence_builder'], g, 'analytical_fail_beginner_fallback', SRS_INTERVALS.slice(0, 2)));
        }
      } else {
        for (const g of grammar) {
          out.push(...schedule(['substitution_drill', 'grammar_sort'], g, `${ctx.activityType}_failure`, SRS_INTERVALS.slice(0, 3)));
        }
      }
      break;

    case 'trace_letter':
    case 'trace_word':
    case 'blend_builder':
    case 'cvc_builder':
    case 'phoneme_tap':
    case 'decode_the_word':
    case 'rhyme_match':
    case 'sound_hunt': {
      const focus = vocab[0] ?? grammar[0] ?? 'phonics_focus';
      out.push(...schedule(['rhyme_match', 'decode_the_word'], focus, 'phonics_failure', SRS_INTERVALS.slice(0, 2)));
      break;
    }

    case 'speaking_mission':
    case 'roleplay':
    case 'storytelling': {
      // Speaking failures: re-queue echo + chunk_builder for each vocab/chunk.
      for (const w of vocab) {
        out.push(...schedule(['echo_repetition', 'chunk_builder'], w, 'speaking_failure', SRS_INTERVALS.slice(0, 3)));
      }
      break;
    }

    case 'matching':
    case 'listen_and_match':
    case 'audio_to_image_match':
      for (const w of vocab) {
        out.push(...schedule(['matching'], w, 'recognition_failure', SRS_INTERVALS.slice(0, 2)));
      }
      break;

    default:
      // No-op for activity types without a specific SRS recipe.
      break;
  }

  return out;
}

function schedule(
  types: ActivityType[],
  target: string,
  reason: string,
  intervals: number[],
): ScheduledReview[] {
  const out: ScheduledReview[] = [];
  for (let i = 0; i < intervals.length; i++) {
    out.push({
      redeploy_as: types[i % types.length],
      interval_days: intervals[i],
      target,
      reason,
    });
  }
  return out;
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set((arr ?? []).filter(Boolean)));
}

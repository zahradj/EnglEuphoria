// Repair: phonics → intelligibility swap.
//
// Triggered by QA issue code `PHONICS_EARLY_READER_GATE`. Replaces any
// decoding-first phonics slide/activity (illegal in Academy/Success above A1)
// with an intelligibility drill bound to the lesson's target vocabulary:
//
//   • If lesson has ≥2 target vocab → minimal_pairs (auditory contrast)
//   • Else if lesson has any target vocab → shadowing (echo+rhythm)
//   • Else → stress_identification (lesson title or first body sentence)
//
// Pure function. Returns a new QALesson; never mutates the input.

import type { QAActivity, QALesson, QASlide } from '../types';

const PHONICS_ACTIVITY_TYPES = new Set<string>([
  'phonics_card', 'phoneme_isolation', 'blending_animation', 'minimal_pair_tap',
  'grapheme_hunt', 'decoding_probe', 'phonics_bingo', 'blending',
  'syllable_counting', 'trace_letter',
]);
const PHONICS_SLIDE_KINDS = new Set<string>(['phonics_card', 'phonics', 'decoding']);

interface SwapResult {
  lesson: QALesson;
  swaps: Array<{ slideId: string; activityId?: string; from: string; to: string }>;
}

function collectVocab(lesson: QALesson): string[] {
  const seen = new Set<string>();
  for (const s of lesson.slides || []) {
    for (const a of s.activities || []) {
      for (const v of a.target_vocab_used || []) {
        if (v && v.trim()) seen.add(v.trim());
      }
    }
  }
  return [...seen];
}

function pickMinimalPair(vocab: string[]): [string, string] {
  // Deterministic: first two distinct vocab words.
  const [a, b] = [vocab[0], vocab[1]];
  return [a, b];
}

function buildReplacement(
  oldActivity: Pick<QAActivity, 'id' | 'narrative_anchor' | 'target_vocab_used'>,
  vocab: string[],
  lessonTitle: string,
): QAActivity {
  const base: QAActivity = {
    id: oldActivity.id,
    type: 'minimal_pairs',
    purpose: 'input' as any,
    stage: 'input',
    modalities: ['listening', 'speaking'],
    target_vocab_used: oldActivity.target_vocab_used ?? [],
    grammar_targets_used: [],
    narrative_anchor: oldActivity.narrative_anchor,
    content: {},
  };

  if (vocab.length >= 2) {
    const [a, b] = pickMinimalPair(vocab);
    base.type = 'minimal_pairs';
    base.content = {
      prompt: `Listen carefully: which word do you hear?`,
      pair: [a, b],
      bound_to_vocab: true,
      mode: 'lesson_vocab_contrast',
    };
    return base;
  }

  if (vocab.length === 1) {
    base.type = 'echo_repetition' as any; // shadowing-style rung
    base.content = {
      prompt: `Listen and shadow the speaker — match rhythm and stress.`,
      target: vocab[0],
      ladder_rung: 'shadowing',
    };
    return base;
  }

  base.type = 'pronunciation_tap' as any;
  base.content = {
    prompt: `Tap the stressed syllable as you hear it.`,
    target: lessonTitle || 'Listening for stress',
    ladder_rung: 'stress_identification',
  };
  return base;
}

/**
 * Apply the intelligibility swap to a lesson. Returns a new lesson with all
 * blocked phonics content replaced, plus a report of what changed.
 *
 * Safe to call on any lesson; if no phonics slides are present, the lesson is
 * returned unchanged.
 */
export function applyPhonicsIntelligibilitySwap(lesson: QALesson): SwapResult {
  const vocab = collectVocab(lesson);
  const swaps: SwapResult['swaps'] = [];

  const slides: QASlide[] = (lesson.slides || []).map((slide) => {
    const slideIsPhonics = PHONICS_SLIDE_KINDS.has(slide.kind);
    const newActivities: QAActivity[] = (slide.activities || []).map((a) => {
      if (!PHONICS_ACTIVITY_TYPES.has(a.type)) return a;
      const replacement = buildReplacement(a, vocab, lesson.title ?? '');
      swaps.push({ slideId: slide.id, activityId: a.id, from: a.type, to: replacement.type });
      return replacement;
    });

    if (!slideIsPhonics) {
      return { ...slide, activities: newActivities };
    }

    // The slide itself is a decoding-first kind — convert its kind and ensure
    // at least one intelligibility activity exists.
    const ensured = newActivities.length
      ? newActivities
      : [buildReplacement({ id: `${slide.id}_swap`, narrative_anchor: undefined, target_vocab_used: [] }, vocab, lesson.title ?? '')];
    swaps.push({ slideId: slide.id, from: slide.kind, to: 'pronunciation' });
    return {
      ...slide,
      kind: 'pronunciation',
      title: slide.title ?? 'Intelligibility drill',
      activities: ensured,
    };
  });

  return { lesson: { ...lesson, slides }, swaps };
}

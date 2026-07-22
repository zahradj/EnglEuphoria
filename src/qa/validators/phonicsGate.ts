// Phonics Early-Reader Gate validator.
//
// Hard-blocks phonics / decoding activities that appear in a lesson whose
// (hub, cefr) is NOT eligible for the early-reader track:
//   • Playground → always allowed.
//   • Academy / Success → allowed only at Pre-A1 / A1.
//
// Above A1 in Academy or Success, decoding-first content is age-inappropriate
// (teens and adults treated as non-readers). Pronunciation work at those
// levels must use the booster/integrated layers (shadowing, minimal pairs as
// intelligibility drills bound to lesson vocab, etc.) — not standalone phonics
// cards or phoneme-isolation tasks.

import type { QAIssue, QALesson } from '../types';
import { isEarlyReader } from '@/pronunciation/earlyReaderTrack';

// Activity types that are decoding-first and require the early-reader track.
const PHONICS_ACTIVITY_TYPES = new Set<string>([
  'phonics_card',
  'phoneme_isolation',
  'blending_animation',
  'minimal_pair_tap',
  'grapheme_hunt',
  'decoding_probe',
  // legacy / catalog
  'phonics_bingo',
  'blending',
  'syllable_counting',
  'trace_letter',
]);

// Slide kinds that imply decoding-first pedagogy.
const PHONICS_SLIDE_KINDS = new Set<string>([
  'phonics_card',
  'phonics',
  'decoding',
]);

function normalizeHub(hub: string): 'playground' | 'academy' | 'success' {
  const h = hub.toLowerCase();
  if (h === 'academy') return 'academy';
  if (h === 'success' || h === 'professional') return 'success';
  return 'playground';
}

function normalizeCefr(cefr: string): any {
  return cefr; // governance Cefr union matches QA CEFR strings
}

export function validatePhonicsGate(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const hub = normalizeHub(lesson.hub);
  const cefr = normalizeCefr(lesson.cefr);
  const eligible = isEarlyReader({ hub: hub as any, cefr });

  if (eligible) return issues; // gate open — nothing to enforce

  for (const slide of lesson.slides || []) {
    if (PHONICS_SLIDE_KINDS.has(slide.kind)) {
      issues.push({
        code: 'PHONICS_EARLY_READER_GATE',
        domain: 'age',
        severity: 'block',
        message: `Phonics slide "${slide.kind}" is not allowed in ${lesson.hub} ${lesson.cefr}. Decoding-first content is reserved for early readers (Playground, or Academy/Success Pre-A1/A1).`,
        locator: { slideId: slide.id },
        auto_repairable: true,
        suggestion: 'Replace with an integrated pronunciation drill bound to lesson vocab (minimal pair, shadowing, stress identification).',
      });
    }

    for (const activity of slide.activities || []) {
      if (PHONICS_ACTIVITY_TYPES.has(activity.type)) {
        issues.push({
          code: 'PHONICS_EARLY_READER_GATE',
          domain: 'age',
          severity: 'block',
          message: `Phonics activity "${activity.type}" is not allowed in ${lesson.hub} ${lesson.cefr}. Decoding-first activities are reserved for early readers (Playground, or Academy/Success Pre-A1/A1).`,
          locator: { slideId: slide.id, activityId: activity.id },
          auto_repairable: true,
          suggestion: 'Swap for an intelligibility drill: minimal_pairs (bound to lesson vocab), shadowing, stress_identification, or intonation_practice.',
        });
      }
    }
  }

  return issues;
}

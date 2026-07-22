/**
 * Pre-A1 Profile (single source of truth for the audio + visual-only track).
 *
 * Pre-A1 learners (typically ages 4–5) cannot read, cannot spell, and do not
 * know letters yet. Every activity at this level MUST be driven by audio +
 * pictures + tap/drag/echo/gesture. Printed text is decoration only and never
 * required to complete a task.
 *
 * This module intentionally re-exports the existing Pre-A1 blueprint so the
 * rest of the code has one canonical place to import from without changing
 * A1+ behaviour anywhere.
 */

import {
  PREA1_FORBIDDEN_ACTIVITIES,
  PREA1_UNIT_BLUEPRINT,
  buildPrea1Directive,
} from '@/planning/prea1Blueprint';

export const PRE_A1_FORBIDDEN_TYPES: readonly string[] = PREA1_FORBIDDEN_ACTIVITIES;

/** Every activity that is safe for a non-reader. Options MUST be images/emoji/audio. */
export const PRE_A1_ALLOWED_TYPES: readonly string[] = [
  'listen_match',
  'echo',
  'mimic',
  'shadowing',
  'point_and_say',
  'song_gesture',
  'syllable_clap',
  'picture_bingo',
  'tpr_action',
  'sound_hunt',
  'drag_drop_picture',
  'trace_letter',
  'yes_no_thumbs',
  'yes_no',
  'flashcard_review',
  'balloon_pop',
  'dance_break',
  'stretch_break',
  'doodle_break',
  'spin_wheel',
  'match',
  'multiple', // ONLY when options are image ids
  'rhyme_match',
  'sound_blend',
  'storybook',
  'exit_ticket', // emoji options
];

/** Speaking ladder ceiling: Pre-A1 never goes above repetition/echo. */
export const PRE_A1_SPEAKING_CEILING = 'repetition' as const;

/** Max characters of decorative text tolerated in an activity prompt. */
export const PRE_A1_MAX_PROMPT_WORDS = 5;

export function isPreA1(cefr?: string | null): boolean {
  const v = String(cefr ?? '').toLowerCase().replace(/[\s_-]/g, '');
  return v === 'prea1' || v === 'pre-a1';
}

export function isTypeAllowedAtPreA1(type: string): boolean {
  if (PRE_A1_FORBIDDEN_TYPES.includes(type)) return false;
  return PRE_A1_ALLOWED_TYPES.includes(type);
}

/** Prompt addendum chained into governance / activity prompts when CEFR === 'Pre-A1'. */
export function buildPreA1PromptAddendum(lessonNumber?: number): string {
  return [
    '',
    '## PRE-A1 AUDIO + VISUAL ONLY CONTRACT (binding)',
    '- Learner cannot read, cannot spell, does not know letters.',
    '- Every prompt MUST ship with an `audio_word` or `audio_prompt` + an `image_prompt`.',
    '- Options MUST be image ids or emoji — NEVER printed words.',
    '- Decorative text is allowed but must never be required to complete the task.',
    '- Speaking ladder ceiling = repetition (echo / shadow). NO free production.',
    '- Vocabulary cards render as picture + audio; the headword is spoken, never required to be read.',
    '- NO reading passages. Stories are narrated; children only tap/drag.',
    `- FORBIDDEN activity types (HARD): ${PRE_A1_FORBIDDEN_TYPES.join(', ')}.`,
    `- Prompt text ≤ ${PRE_A1_MAX_PROMPT_WORDS} words per field. Longer strings belong in audio.`,
    buildPrea1Directive(lessonNumber),
  ].join('\n');
}

export { PREA1_UNIT_BLUEPRINT };

// ---------------------------------------------------------------------------
// Pre-A1 Unit Blueprint (Playground, non-readers aged 4–5)
// ---------------------------------------------------------------------------
// Binding pedagogical spec for Pre-A1 lesson generation.
// - Picture-first, audio-first, gesture-first. ZERO text dependency.
// - 5–6 concrete nouns per unit, ONE sentence frame across all 6 lessons.
// - Options are always pictures/emoji/audio, never words.
// - Reading-dependent activities are FORBIDDEN.
// - TPR reset every 3rd activity. Speaking floor ≥ 4 tasks / lesson.
//
// Consumed by:
//   1) The planner (buildPrea1Directive → prepended to planning prompt)
//   2) The QA validator (validatePrea1Blueprint — hard-blocks violations)
// ---------------------------------------------------------------------------

export type Prea1ActivityId =
  | 'listen_match'      // audio → picture
  | 'echo'              // Pip says it, child repeats
  | 'syllable_clap'     // clap syllables
  | 'picture_bingo'     // 3x3 grid, audio calls
  | 'tpr_action'        // stand/clap/jump/point
  | 'point_and_say'     // point-to-picture + speak frame
  | 'sound_hunt'        // find the /s/ picture
  | 'song_gesture'      // sing with gestures
  | 'drag_drop_picture' // picture-only drag targets
  | 'trace_letter'      // finger-trace SVG
  | 'mimic'             // sentence frame repeat
  | 'yes_no_thumbs';    // thumbs up/down to audio

/** Activities that require reading — HARD BANNED at Pre-A1. */
export const PREA1_FORBIDDEN_ACTIVITIES: readonly string[] = [
  'fill_blank',
  'reading',
  'reading_comprehension',
  'dictation',
  'dictation_builder',
  'sentence_scramble',
  'word_scramble',
  'spelling',
  'multiple_choice_text',
  'cloze',
  'writing',
  'free_writing',
] as const;

export interface Prea1LessonSpec {
  lesson_number: 1 | 2 | 3 | 4 | 5 | 6;
  title_hint: string;
  focus: string;
  activity_mix: Prea1ActivityId[];  // recommended, in order
  speaking_floor: number;           // min speaking tasks
  tpr_min: number;                  // min TPR resets
  vocab_reuse_min: number;          // times each target word must recur
}

export const PREA1_UNIT_BLUEPRINT: readonly Prea1LessonSpec[] = [
  {
    lesson_number: 1,
    title_hint: 'Discovery — meet the pictures & the sentence frame',
    focus: 'Introduce 5–6 concrete nouns + sentence frame via audio/picture.',
    activity_mix: ['listen_match', 'echo', 'tpr_action', 'picture_bingo', 'point_and_say', 'song_gesture'],
    speaking_floor: 4, tpr_min: 2, vocab_reuse_min: 5,
  },
  {
    lesson_number: 2,
    title_hint: 'Expansion — recognise the pictures faster',
    focus: 'Recycle L1 vocab; add first phonics sound (initial /s/, /m/…).',
    activity_mix: ['listen_match', 'sound_hunt', 'echo', 'tpr_action', 'syllable_clap', 'point_and_say'],
    speaking_floor: 4, tpr_min: 2, vocab_reuse_min: 5,
  },
  {
    lesson_number: 3,
    title_hint: 'Extension — say the whole frame',
    focus: 'Chain vocab into the sentence frame with Pip modelling.',
    activity_mix: ['mimic', 'point_and_say', 'echo', 'tpr_action', 'drag_drop_picture', 'yes_no_thumbs'],
    speaking_floor: 5, tpr_min: 2, vocab_reuse_min: 6,
  },
  {
    lesson_number: 4,
    title_hint: 'Practice — mix & retrieve',
    focus: 'Mixed retrieval across L1–L3 vocab. No new content.',
    activity_mix: ['picture_bingo', 'listen_match', 'drag_drop_picture', 'tpr_action', 'point_and_say', 'echo'],
    speaking_floor: 4, tpr_min: 2, vocab_reuse_min: 6,
  },
  {
    lesson_number: 5,
    title_hint: 'Storybook — narrative re-exposure',
    focus: 'Pip story reuses all vocab in context; children echo & gesture.',
    activity_mix: ['echo', 'point_and_say', 'tpr_action', 'yes_no_thumbs', 'mimic', 'song_gesture'],
    speaking_floor: 5, tpr_min: 3, vocab_reuse_min: 7,
  },
  {
    lesson_number: 6,
    title_hint: 'Review + Mastery — audio-picture check',
    focus: 'Non-reader mastery check: audio prompt → correct picture.',
    activity_mix: ['listen_match', 'picture_bingo', 'point_and_say', 'yes_no_thumbs', 'echo', 'tpr_action'],
    speaking_floor: 4, tpr_min: 2, vocab_reuse_min: 6,
  },
] as const;

/** Prompt directive prepended to the planner for Pre-A1 hub=Playground. */
export function buildPrea1Directive(lessonNumber?: number): string {
  const spec =
    (lessonNumber && PREA1_UNIT_BLUEPRINT.find((s) => s.lesson_number === lessonNumber)) ||
    PREA1_UNIT_BLUEPRINT[0];

  return [
    'PRE-A1 NON-READER CONTRACT (BINDING):',
    '- Learners are 4–5 years old and CANNOT read. Text on screen is decoration only.',
    '- Options must be pictures, emoji, or audio. NEVER words.',
    '- ONE target concept per activity. ONE sentence frame across the whole unit.',
    '- Target vocab must recur ≥5× per lesson (recycling > breadth).',
    '- Speaking floor ≥ 4 tasks per lesson. Every 3rd activity is TPR (dance/clap/jump/point).',
    `- Forbidden activity types (HARD): ${PREA1_FORBIDDEN_ACTIVITIES.join(', ')}.`,
    `- Allowed activity types: ${Object.values(spec.activity_mix).join(', ')} and other picture/audio-only formats.`,
    `- This lesson (L${spec.lesson_number}) focus: ${spec.focus}`,
  ].join('\n');
}

/** QA hard-check. Returns violation codes; empty array = pass. */
export function validatePrea1Blueprint(activities: { type: string }[]): string[] {
  const violations: string[] = [];
  for (const a of activities) {
    if (PREA1_FORBIDDEN_ACTIVITIES.includes(a.type)) {
      violations.push(`PREA1_FORBIDDEN_ACTIVITY:${a.type}`);
    }
  }
  return violations;
}

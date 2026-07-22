// ---------------------------------------------------------------------------
// A1 Early-Reader Blueprint (Playground, ages 5–7)
// ---------------------------------------------------------------------------
// Binding pedagogical spec for A1 lesson generation.
// - Early readers: short sight-word sentences OK (≤ 8 words).
// - No essay / free_writing / debate / opinion / long dictation.
// - Writing gate: no free writing before L4 (only guided/word-level).
// - Speaking floor ≥ 3 tasks / lesson. TPR/song still expected.
// ---------------------------------------------------------------------------

export const A1_FORBIDDEN_ACTIVITIES: readonly string[] = [
  'essay',
  'free_writing',
  'analytical_writing',
  'debate',
  'opinion',
  'discursive',
  'reflection_essay',
  'long_dictation',
] as const;

/** Writing types that require the L4+ writing gate. */
export const A1_WRITING_GATED_TYPES: readonly string[] = [
  'writing', 'sentence_writing', 'paragraph_writing', 'guided_writing',
] as const;

export interface A1LessonSpec {
  lesson_number: 1 | 2 | 3 | 4 | 5 | 6;
  focus: string;
  speaking_floor: number;
  tpr_min: number;
  allow_writing: boolean;
}

export type A1EsaShape = 'straight_arrow' | 'boomerang' | 'patchwork';

export interface A1LessonBlueprint extends A1LessonSpec {
  esa_shape: A1EsaShape;
  chunk_targets: number;              // # lexical chunks introduced this lesson
  arc: readonly [
    'warm_up',                        // 1. TPR / song / greeting
    'prime',                          // 2. Introduce sight words / chunk
    'mimic',                          // 3. Echo / choral repeat
    'practice',                       // 4. Guided activity (match/drag/spin)
    'produce',                        // 5. Speak/read/(L4+ write) the frame
    'cool_off',                       // 6. Song recap or mini quiz
  ];
}

const ARC = ['warm_up', 'prime', 'mimic', 'practice', 'produce', 'cool_off'] as const;

export const A1_UNIT_BLUEPRINT: readonly A1LessonBlueprint[] = [
  { lesson_number: 1, focus: 'Discovery — sight words + short sentence frame', speaking_floor: 3, tpr_min: 2, allow_writing: false, esa_shape: 'straight_arrow', chunk_targets: 3, arc: ARC },
  { lesson_number: 2, focus: 'Expansion — decode short CVC sentences',        speaking_floor: 3, tpr_min: 2, allow_writing: false, esa_shape: 'straight_arrow', chunk_targets: 3, arc: ARC },
  { lesson_number: 3, focus: 'Extension — read + say the frame',              speaking_floor: 4, tpr_min: 1, allow_writing: false, esa_shape: 'boomerang',      chunk_targets: 2, arc: ARC },
  { lesson_number: 4, focus: 'Practice — first guided writing (word-level)',   speaking_floor: 3, tpr_min: 1, allow_writing: true,  esa_shape: 'boomerang',      chunk_targets: 2, arc: ARC },
  { lesson_number: 5, focus: 'Storybook — read-along + echo',                  speaking_floor: 4, tpr_min: 2, allow_writing: true,  esa_shape: 'patchwork',      chunk_targets: 2, arc: ARC },
  { lesson_number: 6, focus: 'Review + Mastery — read and speak',              speaking_floor: 3, tpr_min: 1, allow_writing: true,  esa_shape: 'patchwork',      chunk_targets: 0, arc: ARC },
] as const;

export const A1_MAX_SENTENCE_WORDS = 8;

/** Explicit 6-slide arc labels for prompt scaffolding. */
const ARC_LINES: readonly string[] = [
  '  1. warm_up   — TPR / song / greeting (1 activity, no reading load)',
  '  2. prime     — introduce sight-word chunk with picture + audio',
  '  3. mimic     — choral echo / repeat-after-me (speaking task)',
  '  4. practice  — ONE guided game (match / drag / spin / tap) using the chunk',
  '  5. produce   — student SAYS the frame (L1–3) or WRITES 1–2 words (L4+)',
  '  6. cool_off  — song recap or 3-question mini quiz',
];

export function buildA1Directive(lessonNumber?: number): string {
  const spec =
    (lessonNumber && A1_UNIT_BLUEPRINT.find((s) => s.lesson_number === lessonNumber)) ||
    A1_UNIT_BLUEPRINT[0];

  return [
    'A1 EARLY-READER CONTRACT (BINDING):',
    '- Learners are 5–7 years old, early readers. Short sight-word sentences OK.',
    `- Sentence-length cap: ≤ ${A1_MAX_SENTENCE_WORDS} words in any content.{prompt,text,sentence,question,instruction}.`,
    `- Forbidden activities (HARD): ${A1_FORBIDDEN_ACTIVITIES.join(', ')}.`,
    `- Writing gate: free/sentence writing is only allowed from L4 onwards. This lesson allow_writing=${spec.allow_writing}.`,
    `- Speaking floor ≥ ${spec.speaking_floor} tasks. TPR/song ≥ ${spec.tpr_min}.`,
    `- ESA shape (declare in lesson.meta.esa_shape): ${spec.esa_shape}.`,
    `- Lexical chunks (declare in lesson.meta.chunk_targets): introduce exactly ${spec.chunk_targets} new chunk(s); recycle prior chunks otherwise.`,
    '- 6-slide arc (BINDING order, one activity per slide):',
    ...ARC_LINES,
    `- L${spec.lesson_number} focus: ${spec.focus}`,
    '- Do NOT skip slides. Do NOT stack two activities on one slide. Do NOT reorder the arc.',
  ].join('\n');
}

/** Fit-scorer helper: is this activity type forbidden at A1? */
export function isA1Forbidden(type: string, lessonNumber?: number): boolean {
  if (A1_FORBIDDEN_ACTIVITIES.includes(type)) return true;
  if (A1_WRITING_GATED_TYPES.includes(type)) {
    const spec = lessonNumber && A1_UNIT_BLUEPRINT.find((s) => s.lesson_number === lessonNumber);
    if (spec && !spec.allow_writing) return true;
  }
  return false;
}

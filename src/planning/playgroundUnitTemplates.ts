// Playground unit pacing — extracted verbatim from the
// Animal Adventure Academy blueprint (uploaded reference at
// docs/reference/animal-adventure-academy/routes/playground.*.tsx).
//
// This is the canonical 7-lesson Playground unit arc. The planner +
// architect consume it to:
//   1. lock the phase sequence per lesson (so generated lessons match
//      the reference pacing exactly),
//   2. compute slide budgets (one slide per phase, ~75s each = 30min),
//   3. derive default cognitive-stage mapping for governance.
//
// Hub-scoped — Playground only. Academy / Success are unaffected.

import type { PedagogicalStage } from './types';

export type PlaygroundLessonKind =
  | 'discovery'        // L1 — first contact, full phonics intro
  | 'expansion'        // L2 — new vocab cluster, reuse L1 grammar frame
  | 'extension'        // L3 — extend grammar frame (add adjective slot)
  | 'practice'         // L4 — mixed retrieval across L1–L3
  | 'storybook'        // L5 — narrative re-exposure
  | 'review'           // L6 — consolidation
  | 'mastery_quiz';    // L7 — 80% gate (see Mastery Milestone Gate memory)

export interface PlaygroundPhaseSpec {
  id: string;
  label: string;
  stage: PedagogicalStage;
  /** Estimated seconds-on-task. Slides ≈ ceil(seconds / 75). */
  seconds: number;
}

export interface PlaygroundLessonTemplate {
  kind: PlaygroundLessonKind;
  lesson_number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title_hint: string;            // e.g. "Discovery — new vocab set"
  phases: PlaygroundPhaseSpec[];
  total_seconds: number;         // 30min = 1800s target
  notes: string[];
}

// ---------------------------------------------------------------------------
// L1 — Discovery (Animals reference)
// vocab → practice → memory → modeling → sentence → phonics → blend → spell
// → chant → break → cool
// ---------------------------------------------------------------------------
const L1_DISCOVERY: PlaygroundLessonTemplate = {
  kind: 'discovery',
  lesson_number: 1,
  title_hint: 'Discovery — meet the new vocabulary set',
  total_seconds: 1800,
  phases: [
    { id: 'vocab',     label: 'Vocabulary',    stage: 'input',         seconds: 150 },
    { id: 'listen',    label: 'Listen & point',stage: 'controlled',    seconds: 120 },
    { id: 'practice',  label: 'Practice',      stage: 'controlled',    seconds: 120 },
    { id: 'memory',    label: 'Memory game',   stage: 'controlled',    seconds: 120 },
    { id: 'modeling',  label: 'Modeling',      stage: 'input',         seconds: 120 },
    { id: 'sentence',  label: 'Sentence',      stage: 'communicative', seconds: 150 },
    { id: 'phonics',   label: 'Phonics',       stage: 'discovery',     seconds: 120 },
    { id: 'blend',     label: 'Blending',      stage: 'controlled',    seconds: 90  },
    { id: 'trace',     label: 'Letter trace',  stage: 'controlled',    seconds: 90  },
    { id: 'spell',     label: 'Spelling',      stage: 'production',    seconds: 120 },
    { id: 'roleplay',  label: 'Mini role-play',stage: 'production',    seconds: 120 },
    { id: 'chant',     label: 'Chant',         stage: 'communicative', seconds: 120 },
    { id: 'quickquiz', label: 'Quick quiz',    stage: 'reflection',    seconds: 90  },
    { id: 'break',     label: 'Brain break',   stage: 'reflection',    seconds: 90  },
    { id: 'cool',      label: 'Cool down',     stage: 'reflection',    seconds: 120 },
  ],
  notes: [
    'First contact lesson: introduce NEW target vocab sized by CEFR_VOCAB_BUDGETS (Pre-A1: 2–3 · A1: 4–5 in Playground) + 1 phonics target.',
    'Frame is the simplest grammar pattern of the unit (e.g. "It is a ___").',
    'Phonics is the longest dedicated block of the unit — model + blend + spell.',
  ],
};

// ---------------------------------------------------------------------------
// L2 — Expansion (Jungle reference)
// vocab → modeling → memory → describe → phonics → listen → spell → color
// → chant → break → cool
// ---------------------------------------------------------------------------
const L2_EXPANSION: PlaygroundLessonTemplate = {
  kind: 'expansion',
  lesson_number: 2,
  title_hint: 'Expansion — new vocab cluster, reuse L1 frame',
  total_seconds: 1800,
  phases: [
    { id: 'vocab',     label: 'Vocabulary',   stage: 'input',         seconds: 150 },
    { id: 'listen',    label: 'Listen match', stage: 'controlled',    seconds: 120 },
    { id: 'modeling',  label: 'Modeling',     stage: 'input',         seconds: 120 },
    { id: 'memory',    label: 'Memory game',  stage: 'controlled',    seconds: 120 },
    { id: 'describe',  label: 'Describe',     stage: 'communicative', seconds: 150 },
    { id: 'phonics',   label: 'Phonics',      stage: 'discovery',     seconds: 120 },
    { id: 'practice',  label: 'Listen task',  stage: 'controlled',    seconds: 120 },
    { id: 'trace',     label: 'Letter trace', stage: 'controlled',    seconds: 90  },
    { id: 'spell',     label: 'Spelling',     stage: 'production',    seconds: 120 },
    { id: 'color',     label: 'Coloring',     stage: 'production',    seconds: 120 },
    { id: 'roleplay',  label: 'Role-play',    stage: 'production',    seconds: 120 },
    { id: 'chant',     label: 'Chant',        stage: 'communicative', seconds: 90  },
    { id: 'quickquiz', label: 'Quick quiz',   stage: 'reflection',    seconds: 90  },
    { id: 'break',     label: 'Brain break',  stage: 'reflection',    seconds: 90  },
    { id: 'cool',      label: 'Cool down',    stage: 'reflection',    seconds: 100 },
  ],
  notes: [
    'Reuse the L1 grammar frame verbatim with a NEW vocab cluster sized by CEFR_VOCAB_BUDGETS (Playground).',
    'Add a single descriptive slot (color or adjective) — do not change the verb.',
    'Phonics target is a NEW initial sound; review L1 phonics implicitly.',
  ],
};

// ---------------------------------------------------------------------------
// L3 — Extension (Ocean reference)
// vocab → modeling → memory → describe → phonics → build → practice → spell
// → chant → break → cool
// ---------------------------------------------------------------------------
const L3_EXTENSION: PlaygroundLessonTemplate = {
  kind: 'extension',
  lesson_number: 3,
  title_hint: 'Extension — extend the frame (add adjective slot)',
  total_seconds: 1800,
  phases: [
    { id: 'vocab',     label: 'Vocabulary',     stage: 'input',         seconds: 150 },
    { id: 'listen',    label: 'Listen match',   stage: 'controlled',    seconds: 120 },
    { id: 'modeling',  label: 'Modeling',       stage: 'input',         seconds: 120 },
    { id: 'memory',    label: 'Memory game',    stage: 'controlled',    seconds: 120 },
    { id: 'describe',  label: 'Describe',       stage: 'communicative', seconds: 150 },
    { id: 'phonics',   label: 'Phonics',        stage: 'discovery',     seconds: 120 },
    { id: 'build',     label: 'Build sentence', stage: 'production',    seconds: 150 },
    { id: 'practice',  label: 'Practice',       stage: 'controlled',    seconds: 120 },
    { id: 'trace',     label: 'Letter trace',   stage: 'controlled',    seconds: 90  },
    { id: 'spell',     label: 'Spelling',       stage: 'production',    seconds: 90  },
    { id: 'roleplay',  label: 'Role-play',      stage: 'production',    seconds: 120 },
    { id: 'chant',     label: 'Chant',          stage: 'communicative', seconds: 90  },
    { id: 'quickquiz', label: 'Quick quiz',     stage: 'reflection',    seconds: 90  },
    { id: 'break',     label: 'Brain break',    stage: 'reflection',    seconds: 90  },
    { id: 'cool',      label: 'Cool down',      stage: 'reflection',    seconds: 100 },
  ],
  notes: [
    'Extend the L1/L2 frame with a second descriptor: "It is a [size] [color] [noun]".',
    'Build-sentence phase is the production peak — drag/drop the new slot.',
    'Third and final new phonics target of the unit.',
  ],
};

// ---------------------------------------------------------------------------
// L4 — Practice (mixed retrieval)
// warm-up → phonics review → listen & point → match word → frame → done
// ---------------------------------------------------------------------------
const L4_PRACTICE: PlaygroundLessonTemplate = {
  kind: 'practice',
  lesson_number: 4,
  title_hint: 'Practice — mixed retrieval across L1–L3',
  total_seconds: 1800,
  phases: [
    { id: 'hello',   label: 'Warm up',           stage: 'hook',          seconds: 180 },
    { id: 'phonics', label: 'Phonics review',    stage: 'controlled',    seconds: 300 },
    { id: 'listen',  label: 'Listen & point',    stage: 'controlled',    seconds: 360 },
    { id: 'match',   label: 'Match word',        stage: 'controlled',    seconds: 300 },
    { id: 'frame',   label: 'It is a ___',       stage: 'production',    seconds: 420 },
    { id: 'done',    label: 'All done',          stage: 'reflection',    seconds: 240 },
  ],
  notes: [
    'No new vocab and no new phonics — interleaved retrieval only.',
    'Frame phase reuses the L3 expanded pattern with vocab from all 3 lessons.',
    'Fewer phases by design: each phase is longer (3–7 min) for sustained practice.',
  ],
};

// ---------------------------------------------------------------------------
// L5 — Storybook (narrative re-exposure)
// ---------------------------------------------------------------------------
const L5_STORYBOOK: PlaygroundLessonTemplate = {
  kind: 'storybook',
  lesson_number: 5,
  title_hint: 'Storybook — narrative re-exposure',
  total_seconds: 1800,
  phases: [
    { id: 'hook',    label: 'Story hook',       stage: 'hook',          seconds: 180 },
    { id: 'read1',   label: 'Read part 1',      stage: 'input',         seconds: 270 },
    { id: 'check1',  label: 'Comprehension',    stage: 'controlled',    seconds: 180 },
    { id: 'read2',   label: 'Read part 2',      stage: 'input',         seconds: 270 },
    { id: 'check2',  label: 'Comprehension',    stage: 'controlled',    seconds: 180 },
    { id: 'retell',  label: 'Retell with Pip',  stage: 'production',    seconds: 360 },
    { id: 'sing',    label: 'Unit chant',       stage: 'communicative', seconds: 180 },
    { id: 'cool',    label: 'Cool down',        stage: 'reflection',    seconds: 180 },
  ],
  notes: [
    'Re-expose all unit vocab inside one continuous story — no new language.',
    'Story must use the L3 expanded frame at least twice.',
    'Retell is the speaking peak; scaffold with sentence stems.',
  ],
};

// ---------------------------------------------------------------------------
// L6 — Review (consolidation before quiz)
// ---------------------------------------------------------------------------
const L6_REVIEW: PlaygroundLessonTemplate = {
  kind: 'review',
  lesson_number: 6,
  title_hint: 'Review — consolidation before the quiz',
  total_seconds: 1800,
  phases: [
    { id: 'warmup',     label: 'Warm up',          stage: 'hook',          seconds: 150 },
    { id: 'vocabwheel', label: 'Vocab wheel',      stage: 'controlled',    seconds: 270 },
    { id: 'phonixmix',  label: 'Phonics mix',      stage: 'controlled',    seconds: 270 },
    { id: 'describe',   label: 'Describe me',      stage: 'communicative', seconds: 300 },
    { id: 'speak',      label: 'Speaking circle',  stage: 'production',    seconds: 330 },
    { id: 'selfcheck',  label: 'Self-check',       stage: 'reflection',    seconds: 240 },
    { id: 'cool',       label: 'Cool down',        stage: 'reflection',    seconds: 240 },
  ],
  notes: [
    'Touch every target word + every phonics target at least once.',
    'Self-check seeds the L7 quiz — same item types, lower stakes.',
    'No new content. Pure consolidation.',
  ],
};

// ---------------------------------------------------------------------------
// L7 — Mastery Quiz (80% gate — see Mastery Milestone Gate memory)
// ---------------------------------------------------------------------------
const L7_QUIZ: PlaygroundLessonTemplate = {
  kind: 'mastery_quiz',
  lesson_number: 7,
  title_hint: 'Mastery Quiz — 80% to unlock the next unit',
  total_seconds: 1800,
  phases: [
    { id: 'warmup',  label: 'Quick warm up',    stage: 'hook',       seconds: 120 },
    { id: 'quiz',    label: 'Quiz',             stage: 'controlled', seconds: 1080 },
    { id: 'result',  label: 'Results',          stage: 'reflection', seconds: 300 },
    { id: 'reward',  label: 'Vault reward',     stage: 'reflection', seconds: 300 },
  ],
  notes: [
    'Single graded sitting — items mirror L6 self-check exactly.',
    'Pass threshold = 80% (Mastery Milestone Gate). Below = targeted reinforcement.',
    'Vault reward is unlocked only on pass; failure routes to the Reinforcement Generator.',
  ],
};

export const PLAYGROUND_UNIT_LESSON_TEMPLATES: readonly PlaygroundLessonTemplate[] = [
  L1_DISCOVERY,
  L2_EXPANSION,
  L3_EXTENSION,
  L4_PRACTICE,
  L5_STORYBOOK,
  L6_REVIEW,
  L7_QUIZ,
] as const;

export function getPlaygroundLessonTemplate(
  lessonNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7,
): PlaygroundLessonTemplate {
  return PLAYGROUND_UNIT_LESSON_TEMPLATES[lessonNumber - 1];
}

/** One slide ≈ 75s on task. Used by the planner to size the slide budget. */
export function slidesForPlaygroundLesson(
  lessonNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7,
): number {
  const tpl = getPlaygroundLessonTemplate(lessonNumber);
  return tpl.phases.reduce((n, p) => n + Math.max(1, Math.ceil(p.seconds / 75)), 0);
}

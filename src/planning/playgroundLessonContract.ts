// Per-lesson-kind contract for the Playground hub.
// Extracted from the Animal Adventure Academy blueprint (7-lesson unit arc).
//
// This is the single source of truth that wires:
//   - which activity types MUST appear / MUST NOT appear in each lesson kind
//   - what media (vocab images, scene images, storybook pages, songs, audio)
//     a generated lesson is expected to ship
//   - what homework recipe coherence should pack
//   - the narrative role of the lesson within its 7-lesson unit
//
// Hub-scoped — Playground only. Academy / Success ignore this contract.

import type { ActivityType } from '@/activities/types';
import type { HomeworkTaskType } from '@/coherence/types';
import type { PlaygroundLessonKind } from './playgroundUnitTemplates';

export type NarrativeRole =
  | 'discover'
  | 'expand'
  | 'extend'
  | 'drill'
  | 'story'
  | 'review'
  | 'assess';

export interface MediaRecipe {
  vocab_images: number;        // one card image per target word
  scene_images: number;        // hero / setting illustrations
  audio_clips: number;         // listen-and-repeat / dictation audio
  song: boolean;               // warm-up song (L1/L2/L3 per blueprint)
  storybook_pages: number;     // L5 only
}

export interface HomeworkRecipe {
  tasks_min: number;
  tasks_max: number;
  minutes_cap: number;
  allowed_kinds: HomeworkTaskType[];
}

export interface LessonKindContract {
  kind: PlaygroundLessonKind;
  lesson_number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  narrative_role: NarrativeRole;
  required_activity_types: ActivityType[];
  forbidden_activity_types: ActivityType[];
  media_recipe: MediaRecipe;
  homework_recipe: HomeworkRecipe;
}

// ---------------------------------------------------------------------------
// L1 — Discovery
// First contact with the new vocab set + grammar frame. Heavy phonics intro,
// warm-up song, spelling + chant.
// ---------------------------------------------------------------------------
const L1: LessonKindContract = {
  kind: 'discovery',
  lesson_number: 1,
  narrative_role: 'discover',
  required_activity_types: [
    'vocab_match_board',
    'echo_repetition',
    'audio_to_image_match',
    'trace_letter',
    'phonics_card',
  ],
  forbidden_activity_types: ['debate', 'review_challenge', 'evidence_hunt'],
  media_recipe: {
    vocab_images: 6,
    scene_images: 2,
    audio_clips: 8,
    song: true,
    storybook_pages: 0,
  },
  homework_recipe: {
    tasks_min: 1,
    tasks_max: 2,
    minutes_cap: 6,
    allowed_kinds: ['vocab_recall', 'mini_recording', 'parent_script'],
  },
};

// ---------------------------------------------------------------------------
// L2 — Expansion
// New vocab cluster, reuses L1 grammar frame, recycles L1 vocab.
// ---------------------------------------------------------------------------
const L2: LessonKindContract = {
  kind: 'expansion',
  lesson_number: 2,
  narrative_role: 'expand',
  required_activity_types: [
    'vocab_match_board',
    'listen_and_match',
    'sentence_builder',
    'chunk_builder',
  ],
  forbidden_activity_types: ['debate', 'review_challenge'],
  media_recipe: {
    vocab_images: 5,
    scene_images: 2,
    audio_clips: 6,
    song: true,
    storybook_pages: 0,
  },
  homework_recipe: {
    tasks_min: 1,
    tasks_max: 2,
    minutes_cap: 7,
    allowed_kinds: ['vocab_recall', 'sentence_build', 'mini_recording'],
  },
};

// ---------------------------------------------------------------------------
// L3 — Extension
// Extends grammar frame (adds adjective / time slot). Communicative push.
// ---------------------------------------------------------------------------
const L3: LessonKindContract = {
  kind: 'extension',
  lesson_number: 3,
  narrative_role: 'extend',
  required_activity_types: [
    'sentence_expansion',
    'substitution_drill',
    'dialogue_completion',
    'speaking_mission',
  ],
  forbidden_activity_types: ['debate', 'review_challenge'],
  media_recipe: {
    vocab_images: 4,
    scene_images: 2,
    audio_clips: 5,
    song: true,
    storybook_pages: 0,
  },
  homework_recipe: {
    tasks_min: 1,
    tasks_max: 2,
    minutes_cap: 7,
    allowed_kinds: ['sentence_build', 'mini_recording', 'parent_script'],
  },
};

// ---------------------------------------------------------------------------
// L4 — Practice
// Mixed retrieval across L1–L3. Drill-heavy, no new vocabulary.
// ---------------------------------------------------------------------------
const L4: LessonKindContract = {
  kind: 'practice',
  lesson_number: 4,
  narrative_role: 'drill',
  required_activity_types: [
    'fill_blank',
    'drag_drop',
    'rapid_fire_drill',
    'dictation_builder',
  ],
  forbidden_activity_types: ['debate'],
  media_recipe: {
    vocab_images: 0,
    scene_images: 1,
    audio_clips: 6,
    song: false,
    storybook_pages: 0,
  },
  homework_recipe: {
    tasks_min: 1,
    tasks_max: 3,
    minutes_cap: 8,
    allowed_kinds: ['vocab_recall', 'sentence_build', 'micro_writing', 'mini_recording'],
  },
};

// ---------------------------------------------------------------------------
// L5 — Storybook
// Narrative re-exposure. STORY-FIRST: no quizzes, no drills. All target
// vocab/grammar woven into the story arc.
// ---------------------------------------------------------------------------
const L5: LessonKindContract = {
  kind: 'storybook',
  lesson_number: 5,
  narrative_role: 'story',
  required_activity_types: [
    'interactive_story',
    'story_reconstruction',
    'reading',
    'speaking_mission',
  ],
  forbidden_activity_types: [
    'rapid_fire_drill',
    'substitution_drill',
    'fill_blank',
    'tense_transform',
    'review_challenge',
  ],
  media_recipe: {
    vocab_images: 0,
    scene_images: 2,
    audio_clips: 4,
    song: false,
    storybook_pages: 8,
  },
  homework_recipe: {
    tasks_min: 1,
    tasks_max: 2,
    minutes_cap: 8,
    allowed_kinds: ['mini_recording', 'parent_script', 'micro_writing'],
  },
};

// ---------------------------------------------------------------------------
// L6 — Review
// Consolidation. Mixes all skills, prepares the L7 mastery quiz.
// ---------------------------------------------------------------------------
const L6: LessonKindContract = {
  kind: 'review',
  lesson_number: 6,
  narrative_role: 'review',
  required_activity_types: [
    'vocab_match_board',
    'review_challenge',
    'retrieval',
    'speaking_mission',
  ],
  forbidden_activity_types: ['debate'],
  media_recipe: {
    vocab_images: 4,
    scene_images: 1,
    audio_clips: 5,
    song: false,
    storybook_pages: 0,
  },
  homework_recipe: {
    tasks_min: 2,
    tasks_max: 3,
    minutes_cap: 10,
    allowed_kinds: ['vocab_recall', 'sentence_build', 'mini_recording'],
  },
};

// ---------------------------------------------------------------------------
// L7 — Mastery Quiz
// 80% gate (see Mastery Milestone Gate). No homework — the quiz IS the
// assessment.
// ---------------------------------------------------------------------------
const L7: LessonKindContract = {
  kind: 'mastery_quiz',
  lesson_number: 7,
  narrative_role: 'assess',
  required_activity_types: [
    'review_challenge',
    'retrieval',
    'fill_blank',
    'audio_to_image_match',
  ],
  forbidden_activity_types: [
    'interactive_story',
    'story_reconstruction',
    'storytelling',
    'debate',
    'reflection',
  ],
  media_recipe: {
    vocab_images: 0,
    scene_images: 1,
    audio_clips: 4,
    song: false,
    storybook_pages: 0,
  },
  homework_recipe: {
    tasks_min: 0,
    tasks_max: 0,
    minutes_cap: 0,
    allowed_kinds: [],
  },
};

export const PLAYGROUND_LESSON_CONTRACT: Record<PlaygroundLessonKind, LessonKindContract> = {
  discovery: L1,
  expansion: L2,
  extension: L3,
  practice: L4,
  storybook: L5,
  review: L6,
  mastery_quiz: L7,
};

export function getPlaygroundLessonContract(
  kind: PlaygroundLessonKind | null | undefined,
): LessonKindContract | null {
  if (!kind) return null;
  return PLAYGROUND_LESSON_CONTRACT[kind] ?? null;
}

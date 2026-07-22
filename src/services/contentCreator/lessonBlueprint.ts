// Lesson Blueprint — master data model
// ------------------------------------
// Curriculum-to-Lesson binding contract. Every lesson generation MUST originate
// from a LessonBlueprint. The unified generator no longer accepts freeform
// inputs — they MUST flow through buildLessonBlueprint() (see curriculumBinding.ts).
//
// Locked fields preserve curriculum integrity; editable fields are creative knobs.

import type { Hub, Cefr } from '@/governance/types';

export interface AdaptiveProfileHint {
  difficulty_tier?: 1 | 2 | 3 | 4 | 5;
  scaffolding_boost?: 0 | 1 | 2;
  pacing_hint?: 'slow_down' | 'maintain' | 'accelerate';
}

export interface StoryStateHint {
  arc?: string;
  theme?: string;
  characters?: string[];
}

export interface LessonBlueprint {
  lesson_id: string;
  unit_id: string;
  hub: Hub;
  cefr_level: Cefr;
  lesson_title: string;
  communication_goal: string;

  grammar_focus: string[];
  vocabulary_focus: string[];
  pronunciation_focus: string[];
  phonics_focus: string[];
  review_targets: string[];

  difficulty: 'beginner' | 'intermediate' | 'advanced';

  adaptive_profile: AdaptiveProfileHint;
  story_state: StoryStateHint;
  game_targets: string[];
  homework_targets: string[];

  // Relationships (resolved by curriculumBinding).
  unit_number: number;
  lesson_number: number;
  unit_title: string;
  curriculum_title: string;
  previous_lesson_title?: string;
  next_lesson_title?: string;
  prerequisite_skills: string[];
}

/**
 * Curriculum-critical fields. The Unified Generator MUST render these as
 * read-only / disabled inputs when arriving from a blueprint. Unlocking them
 * is a deliberate override the user must opt into.
 */
export const LOCKED_FIELDS = [
  'hub',
  'cefr_level',
  'unit_id',
  'lesson_id',
  'unit_number',
  'lesson_number',
  'communication_goal',
  'grammar_focus',
  'vocabulary_focus',
  'phonics_focus',
  'pronunciation_focus',
] as const;

/**
 * Creative knobs. Safe to edit without breaking curriculum coherence.
 */
export const EDITABLE_FIELDS = [
  'lesson_title',
  'story_state',
  'game_targets',
  'homework_targets',
  'adaptive_profile',
] as const;

export type LockedField = (typeof LOCKED_FIELDS)[number];
export type EditableField = (typeof EDITABLE_FIELDS)[number];

// ── Hub × CEFR matrix (mirrors mem://curriculum/hub-cefr-matrix). ─────────
const HUB_CEFR_MATRIX: Record<Hub, Cefr[]> = {
  playground: ['Pre-A1', 'A1', 'A2', 'B1'],
  academy: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'],
  success: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'],
};

const VOCAB_CAP: Record<Hub, number> = {
  playground: 8,
  academy: 14,
  success: 16,
};

export interface IntegrityIssue {
  code:
    | 'cefr_out_of_hub_range'
    | 'vocab_overload'
    | 'empty_communication_goal'
    | 'empty_grammar_focus'
    | 'missing_relationship';
  severity: 'block' | 'warn';
  message: string;
}

export interface IntegrityResult {
  ok: boolean;
  issues: IntegrityIssue[];
}

export function validateBlueprintIntegrity(bp: LessonBlueprint): IntegrityResult {
  const issues: IntegrityIssue[] = [];

  if (!HUB_CEFR_MATRIX[bp.hub]?.includes(bp.cefr_level)) {
    issues.push({
      code: 'cefr_out_of_hub_range',
      severity: 'block',
      message: `CEFR ${bp.cefr_level} is not allowed for hub ${bp.hub}.`,
    });
  }

  const cap = VOCAB_CAP[bp.hub];
  if (bp.vocabulary_focus.length > cap) {
    issues.push({
      code: 'vocab_overload',
      severity: 'block',
      message: `Vocabulary has ${bp.vocabulary_focus.length} items, hub cap is ${cap}.`,
    });
  }

  if (!bp.communication_goal?.trim()) {
    issues.push({
      code: 'empty_communication_goal',
      severity: 'block',
      message: 'Lesson blueprint requires a communication goal.',
    });
  }

  if (!bp.grammar_focus.length) {
    issues.push({
      code: 'empty_grammar_focus',
      severity: 'warn',
      message: 'No grammar focus defined — lesson may drift off-syllabus.',
    });
  }

  if (!bp.unit_number || !bp.lesson_number) {
    issues.push({
      code: 'missing_relationship',
      severity: 'block',
      message: 'Blueprint missing unit/lesson coordinates.',
    });
  }

  const ok = !issues.some((i) => i.severity === 'block');
  return { ok, issues };
}

/**
 * Stable hash for deduping repeated generations of the same blueprint
 * (used by curriculumSafety to detect lesson duplication).
 */
export function blueprintHash(bp: LessonBlueprint): string {
  const key = [
    bp.hub,
    bp.cefr_level,
    bp.unit_number,
    bp.lesson_number,
    bp.communication_goal,
    [...bp.grammar_focus].sort().join('|'),
    [...bp.vocabulary_focus].sort().join('|'),
  ].join('::');
  let h = 0;
  for (let i = 0; i < key.length; i++) h = ((h << 5) - h + key.charCodeAt(i)) | 0;
  return `bp_${(h >>> 0).toString(16)}`;
}

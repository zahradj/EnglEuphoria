// Curriculum Binding Layer
// ------------------------
// Translates curriculum nodes (CurriculumData + BlueprintLessonRef) into a
// LessonBlueprint, resolves lesson relationships (prev/next/review/prereqs),
// and converts the blueprint into the input shape consumed by the Unified
// Lesson Generator.

import type {
  CurriculumData,
  BlueprintLessonRef,
} from '@/components/creator-studio/CreatorContext';
import type { Hub, Cefr } from '@/governance/types';
import type { LessonBlueprint } from './lessonBlueprint';
import type { UnifiedLessonInput } from './unifiedLessonGenerator';

function csv(s?: string | string[] | null): string[] {
  if (!s) return [];
  if (Array.isArray(s)) return s.filter(Boolean);
  return s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function cefrToDifficulty(c: Cefr): 'beginner' | 'intermediate' | 'advanced' {
  const x = c.toUpperCase();
  if (['PRE-A1', 'A1', 'A2'].includes(x)) return 'beginner';
  if (['B1', 'B2'].includes(x)) return 'intermediate';
  return 'advanced';
}

export interface LessonRelationships {
  previous: BlueprintLessonRef | null;
  next: BlueprintLessonRef | null;
  review_targets_in_unit: BlueprintLessonRef[];
  prerequisite_skills: string[];
}

/**
 * Walk the curriculum tree to resolve neighbors for a given lesson.
 * Returns previous (same unit; falls back to last lesson of prior unit),
 * next (same unit; falls back to first of next unit), in-unit review targets
 * (any earlier lesson whose skill_focus === 'Review'), and prerequisite skills
 * (distinct skill_focus values from all prior lessons).
 */
export function getLessonRelationships(
  curriculum: CurriculumData,
  unitIdx: number,
  lessonIdx: number,
): LessonRelationships {
  const units = curriculum.units;
  const unit = units[unitIdx];
  if (!unit) {
    return { previous: null, next: null, review_targets_in_unit: [], prerequisite_skills: [] };
  }
  const lessons = unit.lessons;

  const previous =
    lessons[lessonIdx - 1] ??
    (unitIdx > 0 ? units[unitIdx - 1].lessons[units[unitIdx - 1].lessons.length - 1] : null);

  const next =
    lessons[lessonIdx + 1] ?? (unitIdx + 1 < units.length ? units[unitIdx + 1].lessons[0] : null);

  const review_targets_in_unit = lessons
    .slice(0, lessonIdx)
    .filter((l) => (l.skill_focus ?? '').toString().toLowerCase().includes('review'));

  // Distinct skill foci from all earlier lessons in all earlier units + current unit.
  const skills = new Set<string>();
  for (let u = 0; u <= unitIdx; u++) {
    const upTo = u === unitIdx ? lessonIdx : units[u].lessons.length;
    for (let l = 0; l < upTo; l++) {
      const s = units[u].lessons[l].skill_focus;
      if (s) skills.add(String(s));
    }
  }

  return {
    previous,
    next,
    review_targets_in_unit,
    prerequisite_skills: Array.from(skills),
  };
}

export interface LoadBlueprintArgs {
  curriculum: CurriculumData;
  unitIdx: number;
  lessonIdx: number;
}

/**
 * Builds a fully-typed LessonBlueprint from the curriculum tree. This is the
 * single entry the Unified Generator should use when invoked from the
 * Curriculum Map.
 */
export function loadLessonBlueprintFromCurriculum(
  args: LoadBlueprintArgs,
): LessonBlueprint {
  const { curriculum, unitIdx, lessonIdx } = args;
  const unit = curriculum.units[unitIdx];
  const lesson = unit.lessons[lessonIdx];
  const rel = getLessonRelationships(curriculum, unitIdx, lessonIdx);

  const unitNumber = unit.unit_number ?? unitIdx + 1;
  const lessonNumber = lesson.lesson_number ?? lessonIdx + 1;
  const hub = curriculum.hub as Hub;
  const cefr = curriculum.cefr_level as Cefr;

  // Pass enriched fields through when present; only synthesize fallbacks for
  // missing data so we never overwrite real curriculum blueprint output.
  const fallbackGrammar = csv(
    lesson.skill_focus === 'Grammar' ? String(lesson.skill_focus) : null,
  );
  const grammar_focus =
    lesson.grammar_focus && lesson.grammar_focus.length
      ? lesson.grammar_focus
      : fallbackGrammar.length
        ? fallbackGrammar
        : csv(lesson.skill_focus);

  return {
    lesson_id: lesson.id || `u${unitNumber}_l${lessonNumber}`,
    unit_id: unit.id || `u${unitNumber}`,
    hub,
    cefr_level: cefr,
    lesson_title: lesson.title,
    communication_goal:
      lesson.communication_goal ||
      lesson.objective ||
      lesson.learning_objective ||
      'communicate clearly in a short real-world exchange',

    grammar_focus,
    vocabulary_focus: lesson.vocabulary_focus ?? [],
    pronunciation_focus: lesson.pronunciation_focus ?? [],
    phonics_focus: lesson.phonics_focus ?? [],
    review_targets:
      lesson.review_targets && lesson.review_targets.length
        ? lesson.review_targets
        : rel.review_targets_in_unit.map((l) => l.title),

    difficulty: cefrToDifficulty(cefr),

    adaptive_profile: {
      difficulty_tier: lesson.adaptive_profile?.difficulty_tier ?? 3,
      scaffolding_boost: lesson.adaptive_profile?.scaffolding_boost ?? 0,
      pacing_hint: lesson.adaptive_profile?.pacing_hint ?? 'maintain',
    },
    story_state: {
      theme: lesson.story_state?.theme ?? unit.theme,
      arc: lesson.story_state?.arc ?? `Unit ${unitNumber} · Lesson ${lessonNumber}`,
      characters: lesson.story_state?.characters ?? [],
    },
    game_targets: lesson.game_targets ?? [],
    homework_targets: lesson.homework_targets ?? [],

    unit_number: unitNumber,
    lesson_number: lessonNumber,
    unit_title: unit.unit_title,
    curriculum_title: curriculum.curriculum_title,
    previous_lesson_title: rel.previous?.title,
    next_lesson_title: rel.next?.title,
    prerequisite_skills: rel.prerequisite_skills,
  };
}

/**
 * Converts a LessonBlueprint into the input expected by the Unified Lesson
 * Generator. The generator stays the same shape; this layer is what makes
 * curriculum the source of truth.
 */
export function linkBlueprintToGenerator(
  bp: LessonBlueprint,
  ai: UnifiedLessonInput['ai'],
  overrides?: Partial<UnifiedLessonInput['blueprint']>,
): UnifiedLessonInput {
  return {
    hub: bp.hub,
    cefr: bp.cefr_level,
    unitId: bp.unit_id,
    lessonId: bp.lesson_id,
    ai,
    blueprint: {
      title: overrides?.title ?? bp.lesson_title,
      theme: overrides?.theme ?? bp.story_state.theme ?? 'everyday english',
      grammarFocus: overrides?.grammarFocus ?? bp.grammar_focus,
      targetVocab: overrides?.targetVocab ?? bp.vocabulary_focus,
      communicationGoal: overrides?.communicationGoal ?? bp.communication_goal,
      reviewTargets: overrides?.reviewTargets ?? bp.review_targets,
    },
  };
}

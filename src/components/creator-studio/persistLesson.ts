import { supabase } from '@/integrations/supabase/client';
import type { ActiveLessonData, PPPSlide } from './CreatorContext';
import { cefrToDifficulty, hubToTargetSystem } from '@/services/lessonHubMapping';

/**
 * Persist a lesson (its slides + metadata) to Supabase `curriculum_lessons`.
 * - First save (no `lesson_id`) → INSERT, returns the new row id.
 * - Subsequent saves (has `lesson_id`) → UPDATE in place.
 *
 * Used by the StudioHeader (Save Draft / Publish buttons) AND by the
 * generation flow as an auto-save the moment the AI returns slides, so a
 * page refresh never wipes a generated lesson.
 */
export type LessonKind = 'standard' | 'trial' | 'story';

/**
 * True once a lesson has a real, human-meaningful learning objective —
 * not just an empty/whitespace string. This pipeline has no automated
 * content-quality gate (unlike the Academy/Success blueprint creator's
 * `runLessonQualityCheck`), so this is the one thing worth enforcing
 * centrally before a lesson can go live in the Master Library.
 */
function hasRealObjective(lesson: ActiveLessonData): boolean {
  const obj = (lesson.target_goal || lesson.source_lesson?.objective || lesson.source_lesson?.learning_objective || '').trim();
  return obj.length >= 12;
}

export async function persistLesson(
  lesson: ActiveLessonData,
  slides: PPPSlide[],
  isPublished: boolean,
  kind: LessonKind = 'standard',
  extraMetadata?: Record<string, unknown>,
): Promise<{ ok: true; lesson_id: string } | { ok: false; error: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, error: 'You must be signed in to save.' };

  // Publish-time quality gate. Drafts (isPublished === false) are never
  // blocked — only the step that makes a lesson visible to students.
  if (isPublished) {
    if (!Array.isArray(slides) || slides.length === 0) {
      return { ok: false, error: 'This lesson has no slides yet — add content before publishing.' };
    }
    if ((lesson.hub === 'academy' || lesson.hub === 'success') && kind !== 'trial' && !hasRealObjective(lesson)) {
      return {
        ok: false,
        error: 'This lesson has no learning objective set. Add a Target Goal describing what students will learn before publishing to the Master Library.',
      };
    }
  }

  const basePayload: Record<string, any> = {
    title: lesson.lesson_title,
    description: lesson.target_goal ?? null,
    target_system: hubToTargetSystem(lesson.hub),
    difficulty_level: cefrToDifficulty(lesson.cefr_level),
    duration_minutes: 30,
    content: { slides, homework_missions: lesson.homework_missions ?? [] },
    ai_metadata: {
      source: 'creator-studio-ppp',
      kind,
      generated_at: new Date().toISOString(),
      blueprint_ref: lesson.source_lesson ?? null,
      hub: lesson.hub,
      cefr_level: lesson.cefr_level,
      ...(extraMetadata ?? {}),
    },
    is_published: isPublished,
    skills_focus: lesson.source_lesson?.skill_focus
      ? [String(lesson.source_lesson.skill_focus)]
      : [],
    language: 'en',
    is_review: lesson.source_lesson?.skill_focus === 'Review',
  };
  if (lesson.level_id) basePayload.level_id = lesson.level_id;
  if (lesson.unit_id) basePayload.unit_id = lesson.unit_id;
  if (lesson.parent_lesson_id !== undefined) basePayload.parent_lesson_id = lesson.parent_lesson_id;

  if (lesson.lesson_id) {
    const { data, error } = await supabase
      .from('curriculum_lessons')
      .update(basePayload)
      .eq('id', lesson.lesson_id)
      .select('id')
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    return { ok: true, lesson_id: data?.id ?? lesson.lesson_id };
  }

  const insertPayload = { ...basePayload, created_by: userId };
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .insert(insertPayload)
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, lesson_id: data.id };
}

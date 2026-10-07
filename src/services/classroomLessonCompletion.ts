import { supabase } from '@/integrations/supabase/client';
import { completeSceneLesson } from '@/services/sceneLessonCompletionService';
import { questForLesson } from '@/content/homework-quests/registry';
import { identifySceneLesson } from '@/content/playground-library/sceneLessonRegistry';
import { identifyWelcomeTownLesson } from '@/content/playground-library/welcomeTownLessonRegistry';

/**
 * A student who reaches the finale of a lesson taught in a LIVE class gets the
 * same bookkeeping as one who plays it from the dashboard map
 * (SceneLessonPlayerModal): the map node completes, sounds/words reach the
 * student's Map of Sounds / Vocabulary Vault, and the lesson's Homework Quest
 * unlocks on the dashboard's Homework tab.
 *
 * Before this existed only the dashboard modal wrote any of that, so a lesson
 * taught in class left its Homework Quest locked ("Finish the lesson to
 * unlock") on the dashboard even though the library showed it as ready.
 */
export function identifyLesson(scenes: unknown) {
  return identifySceneLesson(scenes) ?? identifyWelcomeTownLesson(scenes);
}

/** Playground lessons a student can complete, by registry identity. */
export async function recordClassroomLessonCompletion(userId: string, scenes: unknown): Promise<boolean> {
  const id = identifyLesson(scenes);
  if (!id) return false; // ad-hoc scene list (trial, preview, game lesson) — nothing to record

  try {
    const { data: row, error } = await supabase
      .from('curriculum_lessons')
      .select('id')
      .eq('target_system', 'kids')
      .eq('is_published', true)
      .eq('ai_metadata->>contentFormat', id.contentFormat)
      .eq('ai_metadata->>unit_number', String(id.unitNumber))
      .eq('ai_metadata->>lesson_number', String(id.lessonNumber))
      .limit(1)
      .maybeSingle();
    if (error || !row) return false; // the slot isn't live for students yet

    const lessonKey = `${id.contentFormat}-${id.unitNumber}-${id.lessonNumber}`;
    // The quest assignment is not de-duplicated server-side, so never hand out a
    // second one for a lesson this student already has homework for.
    let alreadyAssigned = false;
    if (questForLesson(lessonKey)) {
      const { data: mine } = await supabase
        .from('homework_assignment_students')
        .select('assignment_id, homework_assignments!inner(lesson_id)')
        .eq('student_id', userId)
        .eq('homework_assignments.lesson_id', row.id)
        .limit(1);
      alreadyAssigned = (mine?.length ?? 0) > 0;
    }

    const result = await completeSceneLesson({
      userId,
      lessonRowId: row.id,
      title: id.title,
      scenes: scenes as never,
      lessonKey: alreadyAssigned ? undefined : lessonKey,
    });
    return result.progressOk;
  } catch (err) {
    console.error('[classroomLessonCompletion] failed', err);
    return false;
  }
}

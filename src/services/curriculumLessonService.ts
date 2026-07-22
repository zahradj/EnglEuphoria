import { supabase } from '@/integrations/supabase/client';
import { SystemId, CurriculumLesson, LessonMaterial } from '@/types/multiTenant';

// Fetch lessons by system (for backwards compatibility)
export async function getLessonsBySystem(systemId: SystemId): Promise<CurriculumLesson[]> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('target_system', systemId)
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching curriculum lessons:', error);
    throw error;
  }

  return (data || []) as CurriculumLesson[];
}

// Fetch lessons by level
export async function getLessonsByLevel(levelId: string): Promise<CurriculumLesson[]> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select(`
      *,
      level:curriculum_levels(*)
    `)
    .eq('level_id', levelId)
    .eq('is_published', true)
    .order('sequence_order', { ascending: true });

  if (error) {
    console.error('Error fetching lessons by level:', error);
    return [];
  }

  return (data || []) as CurriculumLesson[];
}

// Fetch a single lesson by ID with materials
export async function getCurriculumLessonById(lessonId: string): Promise<CurriculumLesson | null> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select(`
      *,
      level:curriculum_levels(
        *,
        track:tracks(*)
      )
    `)
    .eq('id', lessonId)
    .single();

  if (error) {
    console.error('Error fetching curriculum lesson:', error);
    return null;
  }

  return data as CurriculumLesson;
}

// Fetch lesson with its materials
export async function getLessonWithMaterials(lessonId: string): Promise<{
  lesson: CurriculumLesson;
  materials: LessonMaterial[];
} | null> {
  const lesson = await getCurriculumLessonById(lessonId);
  if (!lesson) return null;

  const { data: materials, error } = await supabase
    .from('lesson_materials')
    .select(`
      *,
      asset:library_assets(*)
    `)
    .eq('lesson_id', lessonId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching lesson materials:', error);
    return { lesson, materials: [] };
  }

  return {
    lesson,
    materials: (materials || []) as LessonMaterial[],
  };
}

// Get next lesson in sequence
export async function getNextLesson(
  currentLessonId: string
): Promise<CurriculumLesson | null> {
  const currentLesson = await getCurriculumLessonById(currentLessonId);
  if (!currentLesson || !currentLesson.level_id) return null;

  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('level_id', currentLesson.level_id)
    .eq('is_published', true)
    .gt('sequence_order', currentLesson.sequence_order)
    .order('sequence_order', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    // No next lesson in this level, check next level
    return null;
  }

  return data as CurriculumLesson;
}

// Get previous lesson in sequence
export async function getPreviousLesson(
  currentLessonId: string
): Promise<CurriculumLesson | null> {
  const currentLesson = await getCurriculumLessonById(currentLessonId);
  if (!currentLesson || !currentLesson.level_id) return null;

  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('level_id', currentLesson.level_id)
    .eq('is_published', true)
    .lt('sequence_order', currentLesson.sequence_order)
    .order('sequence_order', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data as CurriculumLesson;
}

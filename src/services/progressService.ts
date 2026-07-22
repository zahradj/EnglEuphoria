import { supabase } from '@/integrations/supabase/client';
import { StudentLessonProgress, ProgressStatus, SystemId } from '@/types/multiTenant';

// Get progress for a specific lesson
export async function getLessonProgress(
  userId: string,
  lessonId: string
): Promise<StudentLessonProgress | null> {
  const { data, error } = await supabase
    .from('student_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching lesson progress:', error);
    return null;
  }

  return data as StudentLessonProgress | null;
}

// Get all progress for a user
export async function getAllProgressForUser(userId: string): Promise<StudentLessonProgress[]> {
  const { data, error } = await supabase
    .from('student_lesson_progress')
    .select(`
      *,
      lesson:curriculum_lessons(*)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }

  return (data || []) as StudentLessonProgress[];
}

// Start a lesson (create or update progress to 'in_progress')
export async function startLesson(userId: string, lessonId: string): Promise<boolean> {
  const { error } = await supabase
    .from('student_lesson_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        status: 'in_progress' as ProgressStatus,
        started_at: new Date().toISOString(),
        attempts: 1,
      },
      {
        onConflict: 'user_id,lesson_id',
      }
    );

  if (error) {
    console.error('Error starting lesson:', error);
    return false;
  }

  return true;
}

// Complete a lesson
export async function completeLesson(
  userId: string,
  lessonId: string,
  score?: number
): Promise<boolean> {
  // First get existing progress to update attempts
  const existing = await getLessonProgress(userId, lessonId);

  const { error } = await supabase
    .from('student_lesson_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        status: 'completed' as ProgressStatus,
        score: score ?? null,
        completed_at: new Date().toISOString(),
        attempts: (existing?.attempts || 0) + 1,
      },
      {
        onConflict: 'user_id,lesson_id',
      }
    );

  if (error) {
    console.error('Error completing lesson:', error);
    return false;
  }

  return true;
}

// Update time spent on a lesson
export async function updateTimeSpent(
  userId: string,
  lessonId: string,
  additionalSeconds: number
): Promise<boolean> {
  const existing = await getLessonProgress(userId, lessonId);
  const currentTime = existing?.time_spent_seconds || 0;

  const { error } = await supabase
    .from('student_lesson_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        time_spent_seconds: currentTime + additionalSeconds,
        status: existing?.status || 'in_progress',
      },
      {
        onConflict: 'user_id,lesson_id',
      }
    );

  if (error) {
    console.error('Error updating time spent:', error);
    return false;
  }

  return true;
}

// Get progress statistics for a user
export async function getProgressStats(userId: string): Promise<{
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalTimeSpent: number;
  averageScore: number;
}> {
  const progress = await getAllProgressForUser(userId);

  const completed = progress.filter(p => p.status === 'completed');
  const inProgress = progress.filter(p => p.status === 'in_progress');
  const totalTime = progress.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
  const scoresWithValues = completed.filter(p => p.score !== null);
  const avgScore = scoresWithValues.length > 0
    ? scoresWithValues.reduce((sum, p) => sum + (p.score || 0), 0) / scoresWithValues.length
    : 0;

  return {
    totalLessons: progress.length,
    completedLessons: completed.length,
    inProgressLessons: inProgress.length,
    totalTimeSpent: totalTime,
    averageScore: Math.round(avgScore),
  };
}

// Get progress for lessons in a specific level
export async function getProgressByLevel(userId: string, levelId: string): Promise<{
  lessons: StudentLessonProgress[];
  completionRate: number;
}> {
  const { data, error } = await supabase
    .from('student_lesson_progress')
    .select(`
      *,
      lesson:curriculum_lessons!inner(*)
    `)
    .eq('user_id', userId)
    .eq('curriculum_lessons.level_id', levelId);

  if (error) {
    console.error('Error fetching progress by level:', error);
    return { lessons: [], completionRate: 0 };
  }

  const lessons = (data || []) as StudentLessonProgress[];
  const completed = lessons.filter(l => l.status === 'completed').length;
  const completionRate = lessons.length > 0 ? (completed / lessons.length) * 100 : 0;

  return { lessons, completionRate };
}

// Get recently accessed lessons
export async function getRecentLessons(userId: string, limit = 5): Promise<StudentLessonProgress[]> {
  const { data, error } = await supabase
    .from('student_lesson_progress')
    .select(`
      *,
      lesson:curriculum_lessons(*)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent lessons:', error);
    return [];
  }

  return (data || []) as StudentLessonProgress[];
}

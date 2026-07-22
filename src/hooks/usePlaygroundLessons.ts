import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PlaygroundLesson {
  id: string;
  number: number;
  title: string;
  type: 'video' | 'slide' | 'game' | 'quiz' | 'interactive';
  status: 'completed' | 'current' | 'locked';
  position: { x: number; y: number };
  content: {
    vocabulary: string[];
    sentence: string;
    videoUrl?: string;
    quizQuestion: string;
    quizOptions: string[];
    quizAnswer: string;
  };
  canvasSlides?: any[];
  score?: number;
  completedAt?: string;
}

interface CurriculumLessonRow {
  id: string;
  title: string;
  sequence_order: number | null;
  difficulty_level: string;
  content: unknown;
  description: string | null;
}

interface ProgressRow {
  lesson_id: string;
  status: string;
  score: number | null;
  completed_at: string | null;
}

// Pre-calculated positions for lessons on a winding path
const PATH_POSITIONS = [
  { x: 15, y: 75 },
  { x: 35, y: 55 },
  { x: 55, y: 70 },
  { x: 75, y: 50 },
  { x: 85, y: 65 },
  { x: 65, y: 40 },
  { x: 45, y: 30 },
  { x: 25, y: 45 },
  { x: 35, y: 20 },
  { x: 55, y: 15 },
  { x: 75, y: 25 },
  { x: 85, y: 35 },
  { x: 65, y: 55 },
  { x: 45, y: 60 },
  { x: 25, y: 80 },
];

// Default content for lessons that don't have full content yet
const getDefaultContent = (title: string, index: number): PlaygroundLesson['content'] => ({
  vocabulary: ['Hello', 'Learn', 'Fun'],
  sentence: `Let's learn about ${title}!`,
  videoUrl: undefined,
  quizQuestion: `What did you learn in "${title}"?`,
  quizOptions: ['A lot!', 'Something new', 'It was fun!'],
  quizAnswer: 'A lot!',
});

export const usePlaygroundLessons = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<PlaygroundLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch lessons and progress
  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch curriculum lessons for kids
      const { data: curriculumData, error: curriculumError } = await supabase
        .from('curriculum_lessons')
        .select('id, title, sequence_order, difficulty_level, content, description')
        .eq('target_system', 'kids')
        .eq('is_published', true)
        .order('sequence_order', { ascending: true });

      if (curriculumError) throw curriculumError;

      // Fetch user's progress if logged in
      let progressMap = new Map<string, ProgressRow>();
      if (user?.id) {
        const { data: progressData, error: progressError } = await supabase
          .from('student_lesson_progress')
          .select('lesson_id, status, score, completed_at')
          .eq('user_id', user.id);

        if (progressError) {
          console.warn('Could not fetch progress:', progressError);
        } else if (progressData) {
          progressData.forEach((p) => {
            progressMap.set(p.lesson_id, p as ProgressRow);
          });
        }
      }

      // Transform and compute statuses
      const transformedLessons: PlaygroundLesson[] = (curriculumData || []).map(
        (lesson: CurriculumLessonRow, index: number) => {
          const progress = progressMap.get(lesson.id);
          const position = PATH_POSITIONS[index % PATH_POSITIONS.length];
          
          // Parse content from database or use default
          let content = getDefaultContent(lesson.title, index);
          if (lesson.content && typeof lesson.content === 'object') {
            const dbContent = lesson.content as Record<string, unknown>;
            content = {
              vocabulary: (dbContent.vocabulary as string[]) || content.vocabulary,
              sentence: (dbContent.sentence as string) || content.sentence,
              videoUrl: dbContent.videoUrl as string | undefined,
              quizQuestion: (dbContent.quizQuestion as string) || content.quizQuestion,
              quizOptions: (dbContent.quizOptions as string[]) || content.quizOptions,
              quizAnswer: (dbContent.quizAnswer as string) || content.quizAnswer,
            };
          }

          // Check for canvas-based slides
          let canvasSlides: any[] | undefined;
          let type: PlaygroundLesson['type'] = 'slide';
          if (lesson.content && typeof lesson.content === 'object') {
            const dbContent = lesson.content as Record<string, unknown>;
            const slides = dbContent.slides as any[] | undefined;
            if (slides && slides.some((s: any) => s.canvasElements?.length > 0)) {
              canvasSlides = slides;
              type = 'interactive';
            }
          }

          // Determine lesson type based on content
          if (!canvasSlides) {
            if (content.videoUrl) type = 'video';
            if (lesson.difficulty_level === 'game') type = 'game';
          }

          return {
            id: lesson.id,
            number: index + 1,
            title: lesson.title,
            type,
            status: 'locked' as const,
            position,
            content,
            canvasSlides,
            score: progress?.score ?? undefined,
            completedAt: progress?.completed_at ?? undefined,
          };
        }
      );

      // Compute statuses based on progress
      let foundCurrent = false;
      transformedLessons.forEach((lesson, index) => {
        const progress = progressMap.get(lesson.id);
        
        if (progress?.status === 'completed') {
          lesson.status = 'completed';
        } else if (!foundCurrent) {
          // First non-completed lesson is current
          lesson.status = 'current';
          foundCurrent = true;
        } else {
          lesson.status = 'locked';
        }
      });

      // If no lessons exist, set first as current
      if (transformedLessons.length > 0 && !foundCurrent) {
        transformedLessons[0].status = 'current';
      }

      setLessons(transformedLessons);
    } catch (err) {
      console.error('Error fetching playground lessons:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch lessons'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Mark a lesson as complete
  const markLessonComplete = useCallback(
    async (lessonId: string, score: number = 100) => {
      if (!user?.id) {
        console.warn('Cannot save progress: user not logged in');
        // Still update local state for demo purposes
        setLessons((prev) => {
          const lessonIndex = prev.findIndex((l) => l.id === lessonId);
          if (lessonIndex === -1) return prev;

          return prev.map((lesson, index) => {
            if (lesson.id === lessonId) {
              return { ...lesson, status: 'completed' as const, score };
            }
            if (index === lessonIndex + 1 && lesson.status === 'locked') {
              return { ...lesson, status: 'current' as const };
            }
            return lesson;
          });
        });
        return;
      }

      try {
        // Upsert progress record
        const { error: upsertError } = await supabase
          .from('student_lesson_progress')
          .upsert(
            {
              user_id: user.id,
              lesson_id: lessonId,
              status: 'completed',
              score,
              completed_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,lesson_id' }
          );

        if (upsertError) throw upsertError;

        // Update local state
        setLessons((prev) => {
          const lessonIndex = prev.findIndex((l) => l.id === lessonId);
          if (lessonIndex === -1) return prev;

          return prev.map((lesson, index) => {
            if (lesson.id === lessonId) {
              return { 
                ...lesson, 
                status: 'completed' as const, 
                score,
                completedAt: new Date().toISOString(),
              };
            }
            if (index === lessonIndex + 1 && lesson.status === 'locked') {
              return { ...lesson, status: 'current' as const };
            }
            return lesson;
          });
        });
      } catch (err) {
        console.error('Error saving lesson progress:', err);
      }
    },
    [user?.id]
  );

  // Get current lesson
  const getCurrentLesson = useCallback(() => {
    return lessons.find((l) => l.status === 'current') || null;
  }, [lessons]);

  // Get completed count
  const getCompletedCount = useCallback(() => {
    return lessons.filter((l) => l.status === 'completed').length;
  }, [lessons]);

  // Get total XP (stars)
  const getTotalStars = useCallback(() => {
    return lessons
      .filter((l) => l.status === 'completed')
      .reduce((acc, l) => acc + (l.score || 100), 0);
  }, [lessons]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    loading,
    error,
    markLessonComplete,
    getCurrentLesson,
    getCompletedCount,
    getTotalStars,
    refetch: fetchLessons,
  };
};

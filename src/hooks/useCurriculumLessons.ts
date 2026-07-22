import { useQuery } from '@tanstack/react-query';
import { SystemId, CurriculumLesson } from '@/types/multiTenant';
import { getLessonsBySystem } from '@/services/curriculumLessonService';

export function useCurriculumLessons(systemId: SystemId) {
  return useQuery<CurriculumLesson[]>({
    queryKey: ['curriculum-lessons', systemId],
    queryFn: () => getLessonsBySystem(systemId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

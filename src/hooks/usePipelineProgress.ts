import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MASTER_CURRICULUM } from '@/data/masterCurriculum';

export interface PipelineProgress {
  totalLessons: number;
  generatedLessons: number;
  lessonsWithSlides: number;
  isLoading: boolean;
}

export const usePipelineProgress = (): PipelineProgress => {
  // Count total lessons from master curriculum
  const totalLessons = Object.values(MASTER_CURRICULUM).reduce((acc, system) => {
    return acc + Object.values(system.levels).reduce((lAcc, level) => {
      return lAcc + level.units.reduce((uAcc, unit) => uAcc + unit.lessons.length, 0);
    }, 0);
  }, 0);

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline-progress'],
    queryFn: async () => {
      const { count: generatedCount } = await supabase
        .from('curriculum_lessons')
        .select('*', { count: 'exact', head: true });

      const { count: slidesCount } = await supabase
        .from('curriculum_lessons')
        .select('*', { count: 'exact', head: true })
        .not('content', 'is', null);

      return {
        generatedLessons: generatedCount ?? 0,
        lessonsWithSlides: slidesCount ?? 0,
      };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    totalLessons,
    generatedLessons: data?.generatedLessons ?? 0,
    lessonsWithSlides: data?.lessonsWithSlides ?? 0,
    isLoading,
  };
};

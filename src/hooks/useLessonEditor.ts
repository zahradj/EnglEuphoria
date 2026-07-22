import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CurriculumLesson {
  id: string;
  title: string;
  description: string | null;
  content: any;
  is_published: boolean;
  target_system: string;
  difficulty_level: string;
  sequence_order: number | null;
  unit_id: string | null;
}

export function useLessonEditor(lessonId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch lesson
  const lessonQuery = useQuery({
    queryKey: ['lesson-editor', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data as CurriculumLesson;
    },
    enabled: !!lessonId,
  });

  // Save lesson content
  const saveMutation = useMutation({
    mutationFn: async ({ content }: { content: any }) => {
      if (!lessonId) throw new Error('No lesson ID');
      
      const { error } = await supabase
        .from('curriculum_lessons')
        .update({ content })
        .eq('id', lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-editor', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-lessons-library'] });
      toast.success('Lesson saved successfully!');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Failed to save lesson');
    },
  });

  // Update lesson metadata
  const updateMetadataMutation = useMutation({
    mutationFn: async (updates: Partial<CurriculumLesson>) => {
      if (!lessonId) throw new Error('No lesson ID');
      
      const { error } = await supabase
        .from('curriculum_lessons')
        .update(updates)
        .eq('id', lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-editor', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-lessons-library'] });
    },
    onError: () => {
      toast.error('Failed to update lesson');
    },
  });

  // Toggle publish status
  const togglePublishMutation = useMutation({
    mutationFn: async () => {
      if (!lessonId || !lessonQuery.data) throw new Error('No lesson data');
      
      const { error } = await supabase
        .from('curriculum_lessons')
        .update({ is_published: !lessonQuery.data.is_published })
        .eq('id', lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-editor', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-lessons-library'] });
      const currentStatus = lessonQuery.data?.is_published;
      toast.success(currentStatus ? 'Lesson unpublished' : 'Lesson published!');
    },
    onError: () => {
      toast.error('Failed to update publish status');
    },
  });

  // Delete lesson
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!lessonId) throw new Error('No lesson ID');
      
      const { error } = await supabase
        .from('curriculum_lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-lessons-library'] });
      toast.success('Lesson deleted');
    },
    onError: () => {
      toast.error('Failed to delete lesson');
    },
  });

  return {
    lesson: lessonQuery.data,
    isLoading: lessonQuery.isLoading,
    error: lessonQuery.error,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    updateMetadata: updateMetadataMutation.mutate,
    togglePublish: togglePublishMutation.mutate,
    isTogglingPublish: togglePublishMutation.isPending,
    deleteLesson: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

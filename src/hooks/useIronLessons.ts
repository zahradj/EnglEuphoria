import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface IronModule {
  id: string;
  module_name: string;
  module_number: number;
  cohort_group: 'A' | 'B' | 'C';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
}

export interface IronLesson {
  id: string;
  title: string;
  cohort_group: 'A' | 'B' | 'C';
  module_id: string | null;
  cefr_level: string | null;
  presentation_content: {
    concept?: string;
    keyPoints?: string[];
    table?: { headers: string[]; rows: string[][] };
    vocabulary?: VocabularyItem[];
    visualAidUrl?: string;
    visualAidPrompt?: string;
  };
  practice_content: {
    taskA: { instruction: string; pattern?: string; expectedOutput?: string };
    taskB: { instruction: string; buildsOn?: string; expectedOutput?: string };
    taskC: { instruction: string; buildsOn?: string; expectedOutput?: string };
  };
  production_content: {
    scenario?: string;
    mission?: string;
    constraints?: string[];
    successCriteria?: string;
    timeLimit?: string;
  };
  status: 'draft' | 'locked' | 'live';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  iron_modules?: IronModule;
}

export interface IronLessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  current_phase: 'presentation' | 'practice' | 'production' | 'completed';
  presentation_completed: boolean;
  practice_completion: {
    taskA: boolean;
    taskB: boolean;
    taskC: boolean;
  };
  production_submitted: boolean;
  production_response: string | null;
  started_at: string;
  completed_at: string | null;
}

// Hooks for Iron Modules
export const useIronModules = (cohortGroup?: 'A' | 'B' | 'C') => {
  return useQuery({
    queryKey: ['iron-modules', cohortGroup],
    queryFn: async () => {
      let query = supabase
        .from('iron_modules')
        .select('*')
        .order('module_number', { ascending: true });

      if (cohortGroup) {
        query = query.eq('cohort_group', cohortGroup);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IronModule[];
    },
  });
};

export const useCreateIronModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (module: Omit<IronModule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('iron_modules')
        .insert(module)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iron-modules'] });
      toast.success('Module created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create module: ' + error.message);
    },
  });
};

// Hooks for Iron Lessons
export const useIronLessons = (filters?: {
  cohortGroup?: 'A' | 'B' | 'C';
  status?: 'draft' | 'locked' | 'live';
  moduleId?: string;
}) => {
  return useQuery({
    queryKey: ['iron-lessons', filters],
    queryFn: async () => {
      let query = supabase
        .from('iron_lessons')
        .select('*, iron_modules(*)')
        .order('created_at', { ascending: false });

      if (filters?.cohortGroup) {
        query = query.eq('cohort_group', filters.cohortGroup);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.moduleId) {
        query = query.eq('module_id', filters.moduleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IronLesson[];
    },
  });
};

export const useIronLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['iron-lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iron_lessons')
        .select('*, iron_modules(*)')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data as IronLesson;
    },
    enabled: !!lessonId,
  });
};

export const useCreateIronLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lesson: {
      title: string;
      cohort_group: 'A' | 'B' | 'C';
      module_id?: string | null;
      cefr_level?: string;
      presentation_content: object;
      practice_content: object;
      production_content: object;
      status: 'draft' | 'locked' | 'live';
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('iron_lessons')
        .insert({
          ...lesson,
          created_by: userData?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iron-lessons'] });
      toast.success('Lesson created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create lesson: ' + error.message);
    },
  });
};

export const useUpdateIronLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<IronLesson> & { id: string }) => {
      const { data, error } = await supabase
        .from('iron_lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iron-lessons'] });
      toast.success('Lesson updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update lesson: ' + error.message);
    },
  });
};

export const useDeleteIronLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('iron_lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iron-lessons'] });
      toast.success('Lesson deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete lesson: ' + error.message);
    },
  });
};

// Hooks for Student Progress
export const useIronLessonProgress = (lessonId: string) => {
  return useQuery({
    queryKey: ['iron-progress', lessonId],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return null;

      const { data, error } = await supabase
        .from('iron_lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('student_id', userData.user.id)
        .maybeSingle();

      if (error) throw error;
      return data as IronLessonProgress | null;
    },
    enabled: !!lessonId,
  });
};

export const useUpdateIronProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      ...updates
    }: Partial<IronLessonProgress> & { lessonId: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('iron_lesson_progress')
        .upsert({
          lesson_id: lessonId,
          student_id: userData.user.id,
          ...updates,
        }, {
          onConflict: 'student_id,lesson_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['iron-progress', variables.lessonId] });
    },
  });
};

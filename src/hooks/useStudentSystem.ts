import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SystemId } from '@/types/multiTenant';
import { graduateStudent, setStudentSystem } from '@/services/graduationService';
import { toast } from 'sonner';

export function useStudentSystem(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: systemId, isLoading } = useQuery({
    queryKey: ['student-system', userId],
    queryFn: async () => {
      if (!userId) return 'kids' as SystemId;
      
      const { data, error } = await supabase
        .from('student_profiles')
        .select('system_id')
        .eq('user_id', userId)
        .single();

      if (error || !data) return 'kids' as SystemId;
      return (data.system_id || 'kids') as SystemId;
    },
    enabled: !!userId,
  });

  const graduateMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('No user ID');
      return graduateStudent(userId);
    },
    onSuccess: (result) => {
      if (result.success && result.newSystemId) {
        queryClient.invalidateQueries({ queryKey: ['student-system', userId] });
        toast.success(`Congratulations! You've graduated to ${result.newSystemId === 'teen' ? 'The Academy' : 'The Hub'}!`);
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error('Failed to graduate');
    },
  });

  const setSystemMutation = useMutation({
    mutationFn: (newSystemId: SystemId) => {
      if (!userId) throw new Error('No user ID');
      return setStudentSystem(userId, newSystemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-system', userId] });
    },
  });

  return {
    systemId: systemId || 'kids',
    isLoading,
    graduate: graduateMutation.mutate,
    isGraduating: graduateMutation.isPending,
    setSystem: setSystemMutation.mutate,
    isSettingSystem: setSystemMutation.isPending,
  };
}

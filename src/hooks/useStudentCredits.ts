import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudentCreditsResult {
  totalCredits: number;
  usedCredits: number;
  expiredCredits: number;
  availableCredits: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useStudentCredits = (studentId: string | null): StudentCreditsResult => {
  const [totalCredits, setTotalCredits] = useState(0);
  const [usedCredits, setUsedCredits] = useState(0);
  const [expiredCredits, setExpiredCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_credits')
        .select('total_credits, used_credits, expired_credits')
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching student credits:', error);
        return;
      }

      if (data) {
        setTotalCredits(data.total_credits ?? 0);
        setUsedCredits(data.used_credits ?? 0);
        setExpiredCredits(data.expired_credits ?? 0);
      } else {
        setTotalCredits(0);
        setUsedCredits(0);
        setExpiredCredits(0);
      }
    } catch (err) {
      console.error('Error in useStudentCredits:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Realtime subscription for instant updates
  useEffect(() => {
    if (!studentId) return;

    const channel = supabase
      .channel(`student-credits-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_credits',
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          fetchCredits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, fetchCredits]);

  const availableCredits = Math.max(0, totalCredits - usedCredits - expiredCredits);

  return {
    totalCredits,
    usedCredits,
    expiredCredits,
    availableCredits,
    loading,
    refresh: fetchCredits,
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminMetrics {
  totalTeachers: number;
  totalStudents: number;
  totalLessons: number;
  totalEarnings: number;
  pendingApplications: number;
  activeToday: number;
  classesToday: number;
  newStudentsToday: number;
}

export const useAdminMetrics = () => {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalTeachers: 0,
    totalStudents: 0,
    totalLessons: 0,
    totalEarnings: 0,
    pendingApplications: 0,
    activeToday: 0,
    classesToday: 0,
    newStudentsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch teachers count
      const { count: teachersCount } = await supabase
        .from('teacher_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('can_teach', true);

      // Fetch students count
      const { count: studentsCount } = await supabase
        .from('student_profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch lessons count
      const { count: lessonsCount } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });

      // Fetch total earnings
      const { data: earningsData } = await supabase
        .from('teacher_earnings')
        .select('platform_amount')
        .eq('status', 'paid');

      const totalEarnings = earningsData?.reduce((sum, earning) => 
        sum + (parseFloat(earning.platform_amount?.toString() || '0')), 0) || 0;

      // Fetch pending applications
      const { count: pendingCount } = await supabase
        .from('teacher_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch today's metrics
      const today = new Date().toISOString().split('T')[0];
      
      const { count: classesToday } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_at', `${today}T00:00:00`)
        .lte('scheduled_at', `${today}T23:59:59`);

      const { count: newStudentsToday } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .gte('created_at', `${today}T00:00:00`);

      setMetrics({
        totalTeachers: teachersCount || 0,
        totalStudents: studentsCount || 0,
        totalLessons: lessonsCount || 0,
        totalEarnings: Math.round(totalEarnings),
        pendingApplications: pendingCount || 0,
        activeToday: (studentsCount || 0) + (teachersCount || 0), // Simplified metric
        classesToday: classesToday || 0,
        newStudentsToday: newStudentsToday || 0,
      });
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, loading, error, refetch: fetchMetrics };
};
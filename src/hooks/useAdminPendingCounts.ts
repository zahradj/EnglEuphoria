import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminPendingCounts {
  profileApprovals: number;
  applications: number;
  pendingBonuses: number;
  atRiskTeachers: number;
  loading: boolean;
  refetch: () => void;
}

/**
 * Live counts for admin "action required" items:
 * - profileApprovals: teacher_profiles awaiting bio/video sign-off
 * - applications: teacher_applications still in the hiring pipeline
 * - pendingBonuses: teacher bonus payouts awaiting approval
 * - atRiskTeachers: teachers flagged at-risk (KPI < 55 for ≥2 consecutive weeks)
 */
export const useAdminPendingCounts = (pollMs = 60_000): AdminPendingCounts => {
  const [profileApprovals, setProfileApprovals] = useState(0);
  const [applications, setApplications] = useState(0);
  const [pendingBonuses, setPendingBonuses] = useState(0);
  const [atRiskTeachers, setAtRiskTeachers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
      const [
        { count: profileCount },
        { count: appCount },
        { count: bonusCount },
        { count: atRiskCount },
      ] = await Promise.all([
        supabase
          .from('teacher_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('profile_complete', true)
          .eq('profile_approved_by_admin', false),
        supabase
          .from('teacher_applications')
          .select('*', { count: 'exact', head: true })
          .in('status', ['submitted', 'under_review', 'pending', 'interview_scheduled']),
        supabase
          .from('teacher_payouts_ledger')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('teacher_kpi_alerts')
          .select('*', { count: 'exact', head: true })
          .gte('week_start', sevenDaysAgo)
          .gte('consecutive_weeks', 2),
      ]);
      setProfileApprovals(profileCount ?? 0);
      setApplications(appCount ?? 0);
      setPendingBonuses(bonusCount ?? 0);
      setAtRiskTeachers(atRiskCount ?? 0);
    } catch (err) {
      console.warn('useAdminPendingCounts: fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const id = setInterval(fetchCounts, pollMs);
    return () => clearInterval(id);
  }, [fetchCounts, pollMs]);

  return { profileApprovals, applications, pendingBonuses, atRiskTeachers, loading, refetch: fetchCounts };
};

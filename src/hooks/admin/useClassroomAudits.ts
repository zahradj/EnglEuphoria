import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditSession {
  id: string;
  room_id: string;
  teacher_id: string;
  student_id: string | null;
  lesson_type: string;
  scheduled_at: string | null;
  duration_minutes: number | null;
  fault_type: string | null;
  disconnect_reason: string | null;
  ai_verdict: string | null;
  ai_verdict_at: string | null;
  teacher_joined_at: string | null;
  student_joined_at: string | null;
  teacher_left_at: string | null;
  student_left_at: string | null;
  session_status: string;
  ended_at: string | null;
  created_at: string;
  booking_id: string | null;
  lesson_title: string | null;
  market_region: string | null;
}

export function useClassroomAudits() {
  const [rows, setRows] = useState<AuditSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const { data: resolved } = await supabase
      .from('classroom_resolutions')
      .select('session_id');
    const resolvedIds = new Set((resolved ?? []).map((r: any) => r.session_id));

    const { data } = await supabase
      .from('classroom_sessions')
      .select('*')
      .in('session_status', ['incomplete', 'ended', 'active'])
      .order('created_at', { ascending: false })
      .limit(200);

    const filtered = (data ?? []).filter((r: any) => !resolvedIds.has(r.id));
    setRows(filtered as unknown as AuditSession[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRows();
    const ch = supabase
      .channel('classroom-audits')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classroom_sessions' },
        () => fetchRows(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classroom_resolutions' },
        () => fetchRows(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [fetchRows]);

  return { rows, loading, refresh: fetchRows };
}

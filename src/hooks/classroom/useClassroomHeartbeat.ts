import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Args {
  sessionId: string | null;
  role: 'teacher' | 'student';
  intervalMs?: number;
}

interface PeerStatus {
  peerLastPingAt: string | null;
  peerOnline: boolean;
}

/**
 * Heartbeat hook for live classrooms.
 * - Every 5s: RPC tick_heartbeat → updates {role}_last_ping_at + inserts heartbeat audit row.
 * - On mount: also stamps {role}_joined_at via the same RPC (idempotent inside RPC).
 * - On unmount/beforeunload: stamps {role}_left_at.
 * - Subscribes to the session row for realtime peer ping data.
 */
export function useClassroomHeartbeat({
  sessionId,
  role,
  intervalMs = 5000,
}: Args): PeerStatus {
  const [peerLastPingAt, setPeerLastPingAt] = useState<string | null>(null);
  const [peerOnline, setPeerOnline] = useState(false);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;
    stoppedRef.current = false;

    const tick = async () => {
      if (stoppedRef.current) return;
      try {
        await supabase.rpc('tick_heartbeat', {
          p_session_id: sessionId,
          p_role: role,
        });
      } catch (e) {
        // swallow — heartbeat is best-effort
        console.warn('[heartbeat] tick failed', e);
      }
    };

    tick();
    const handle = setInterval(tick, intervalMs);

    const markLeave = async () => {
      try {
        const col = role === 'teacher' ? 'teacher_left_at' : 'student_left_at';
        await supabase
          .from('classroom_sessions')
          .update({ [col]: new Date().toISOString() })
          .eq('id', sessionId);
      } catch {}
    };

    window.addEventListener('beforeunload', markLeave);

    // Realtime: watch peer ping field
    const peerField = role === 'teacher' ? 'student_last_ping_at' : 'teacher_last_ping_at';
    const channel = supabase
      .channel(`heartbeat:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'classroom_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload: any) => {
          const v = payload?.new?.[peerField];
          if (v) {
            setPeerLastPingAt(v);
            const ageMs = Date.now() - new Date(v).getTime();
            setPeerOnline(ageMs < intervalMs * 3);
          }
        },
      )
      .subscribe();

    const staleCheck = setInterval(() => {
      if (!peerLastPingAt) return;
      const ageMs = Date.now() - new Date(peerLastPingAt).getTime();
      setPeerOnline(ageMs < intervalMs * 3);
    }, intervalMs);

    return () => {
      stoppedRef.current = true;
      clearInterval(handle);
      clearInterval(staleCheck);
      window.removeEventListener('beforeunload', markLeave);
      supabase.removeChannel(channel);
      markLeave();
    };
  }, [sessionId, role, intervalMs, peerLastPingAt]);

  return { peerLastPingAt, peerOnline };
}

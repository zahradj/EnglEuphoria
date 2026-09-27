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
  // Mirrors peerLastPingAt for the staleCheck interval's closure — the
  // effect below intentionally does NOT depend on peerLastPingAt (see
  // comment near the dependency array), so a plain state read there would
  // be frozen at whatever value existed on first mount.
  const peerLastPingAtRef = useRef<string | null>(null);

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
            peerLastPingAtRef.current = v;
            setPeerLastPingAt(v);
            const ageMs = Date.now() - new Date(v).getTime();
            setPeerOnline(ageMs < intervalMs * 3);
          }
        },
      )
      .subscribe();

    const staleCheck = setInterval(() => {
      const v = peerLastPingAtRef.current;
      if (!v) return;
      const ageMs = Date.now() - new Date(v).getTime();
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
    // Deliberately NOT depending on peerLastPingAt: that state changes on
    // every peer heartbeat (~every intervalMs), and including it here made
    // this whole effect tear down and re-run on that same cadence — whose
    // cleanup unconditionally stamps {role}_left_at, falsely marking an
    // actively-connected user as having left every few seconds. The
    // staleCheck interval reads the live value via peerLastPingAtRef
    // instead, so correctness doesn't depend on this effect re-running.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, role, intervalMs]);

  return { peerLastPingAt, peerOnline };
}

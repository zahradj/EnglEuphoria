// useClassroomChannel — thin wrapper over Supabase Realtime for the live classroom.
// Bidirectional broadcast channel keyed by `lesson_session_id`. Used by both the
// student client (emits telemetry + activity state) and the teacher control panel
// (emits overrides like REWARD / LOW_CONFIDENCE / NEXT_BLOCK).
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type ClassroomEvent =
  // From student → teacher
  | { type: 'ACTIVITY_STATE'; activityId: string; state: unknown; at: number }
  | { type: 'CURSOR'; x: number; y: number; at: number }
  | { type: 'WTC_TELEMETRY'; avgDb: number; lowConfidence: boolean; at: number }
  | { type: 'WTC_EVENT'; event: 'LOW_CONFIDENCE' | 'RECOVERED'; at: number }
  // From teacher → student (overrides)
  | { type: 'TRIGGER_REWARD'; at: number }
  | { type: 'TRIGGER_FALLBACK'; at: number }
  | { type: 'FORCE_NEXT_BLOCK'; at: number };

export interface UseClassroomChannelOptions {
  sessionId: string | undefined;
  role: 'student' | 'teacher';
  onEvent?: (e: ClassroomEvent) => void;
}

export function useClassroomChannel({ sessionId, role, onEvent }: UseClassroomChannelOptions) {
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onEventRef = useRef(onEvent);
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);

  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase.channel(`classroom:${sessionId}`, {
      config: { broadcast: { self: false } },
    });
    channel.on('broadcast', { event: 'classroom_event' }, (payload) => {
      const evt = payload?.payload as ClassroomEvent | undefined;
      if (evt) onEventRef.current?.(evt);
    });
    channel.subscribe((status) => setConnected(status === 'SUBSCRIBED'));
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      setConnected(false);
    };
  }, [sessionId]);

  const emit = useCallback((event: ClassroomEvent) => {
    const ch = channelRef.current;
    if (!ch) return;
    void ch.send({ type: 'broadcast', event: 'classroom_event', payload: event });
  }, []);

  return useMemo(() => ({ connected, emit, role }), [connected, emit, role]);
}

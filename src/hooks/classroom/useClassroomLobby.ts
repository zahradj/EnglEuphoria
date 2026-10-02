import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Classroom waiting room.
 *
 * The student waits until the teacher presses "Start classroom". "Started" is a
 * row in `classroom_lobby` (one per booking) so a reload on either side doesn't
 * send anyone back to the waiting room. Who is currently waiting/present comes
 * from a realtime presence channel, so the teacher sees "student is here" live.
 *
 * Safety: if the student's check can't be read (network / permission error) they
 * are let in rather than stranded behind a screen that can never open.
 */
export type LobbyRole = 'teacher' | 'student';

interface Options {
  bookingId: string;
  role: LobbyRole;
  userId: string;
  /** How often the student re-checks if realtime is silent (ms). */
  pollMs?: number;
}

export interface LobbyState {
  /** True once the teacher has started the class (or the check failed open). */
  started: boolean;
  /** First check still running. */
  loading: boolean;
  /** Is someone with the OTHER role in the lobby channel right now? */
  otherHere: boolean;
  /** Teacher only: start the class. Resolves true on success. */
  start: () => Promise<boolean>;
  starting: boolean;
  startError: string | null;
}

const db = () => (supabase as any).from('classroom_lobby');

export function useClassroomLobby({ bookingId, role, userId, pollMs = 5000 }: Options): LobbyState {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherHere, setOtherHere] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const startedRef = useRef(false);
  startedRef.current = started;

  // 1. Is the class already started? (initial read, realtime, and a slow poll as a safety net)
  useEffect(() => {
    let cancelled = false;

    const check = async (initial: boolean) => {
      try {
        const { data, error } = await db().select('booking_id').eq('booking_id', bookingId).maybeSingle();
        if (cancelled) return;
        if (error) throw error;
        if (data) { setStarted(true); return; }
        // A class that is already under way (the student was in it before this page
        // loaded — e.g. it began before the waiting room existed) counts as started,
        // so a mid-class reload never drops anyone into a waiting room nobody opens.
        const { data: session } = await (supabase as any)
          .from('classroom_sessions')
          .select('student_joined_at')
          .eq('room_id', bookingId)
          .maybeSingle();
        if (!cancelled && session?.student_joined_at) setStarted(true);
      } catch (e) {
        console.warn('[classroomLobby] could not read lobby state', e);
        // Fail open for the student: never strand them behind a screen that can't open.
        if (!cancelled && role === 'student' && initial) setStarted(true);
      } finally {
        if (!cancelled && initial) setLoading(false);
      }
    };
    void check(true);

    const rt = supabase
      .channel(`classroom-lobby-state:${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'classroom_lobby', filter: `booking_id=eq.${bookingId}` },
        () => { if (!cancelled) setStarted(true); },
      )
      .subscribe();

    const timer = window.setInterval(() => {
      if (!startedRef.current) void check(false);
    }, pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      supabase.removeChannel(rt);
    };
  }, [bookingId, role, pollMs]);

  // 2. Presence: who is here before the class starts.
  useEffect(() => {
    if (started) return;
    const other: LobbyRole = role === 'teacher' ? 'student' : 'teacher';
    const channel = supabase.channel(`classroom-lobby:${bookingId}`, { config: { presence: { key: `${role}:${userId}` } } });
    const sync = () => {
      const state = channel.presenceState() as Record<string, Array<{ role?: string }>>;
      setOtherHere(Object.values(state).some((metas) => metas.some((m) => m.role === other)));
    };
    channel
      .on('presence', { event: 'sync' }, sync)
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') await channel.track({ role, at: Date.now() });
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, role, userId, started]);

  const start = useCallback(async () => {
    if (role !== 'teacher') return false;
    setStarting(true);
    setStartError(null);
    try {
      const { error } = await db().insert({ booking_id: bookingId });
      // 23505 = already started (e.g. double click, or started on another device): that's fine.
      if (error && error.code !== '23505') throw error;
      setStarted(true);
      return true;
    } catch (e: any) {
      console.error('[classroomLobby] start failed', e);
      setStartError(e?.message ?? 'Could not start the class. Please try again.');
      return false;
    } finally {
      setStarting(false);
    }
  }, [bookingId, role]);

  return { started, loading, otherHere, start, starting, startError };
}

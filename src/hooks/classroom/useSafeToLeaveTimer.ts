import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Args {
  sessionId: string | null;
  lessonType: 'trial' | 'standard';
  scheduledAt: string | null; // ISO
  durationMinutes: number;
  studentJoined: boolean;
  startedAt?: string | null; // teacher entry time / session started
}

interface Result {
  canLeaveSafely: boolean;
  minutesUntilSafe: number;
  secondsUntilSafe: number;
  label: string;
  safeAtIso: string | null;
}

/**
 * Server-time anchored "Safe to Leave" timer.
 * - Fetches server clock via RPC server_now() every 10s to compute drift.
 * - All comparisons use the drift-corrected server clock so the user cannot
 *   shorten the wait by changing their local clock.
 */
export function useSafeToLeaveTimer({
  sessionId,
  lessonType,
  scheduledAt,
  durationMinutes,
  studentJoined,
  startedAt,
}: Args): Result {
  const [serverDriftMs, setServerDriftMs] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const t0 = Date.now();
        const { data } = await supabase.rpc('server_now');
        if (cancelled || !data) return;
        const serverMs = new Date(data as unknown as string).getTime();
        const roundTrip = (Date.now() - t0) / 2;
        setServerDriftMs(serverMs - (Date.now() - roundTrip));
      } catch {
        // Fallback to local time if RPC fails
      }
    };
    sync();
    const i = setInterval(sync, 10_000);
    return () => {
      cancelled = true;
      clearInterval(i);
    };
  }, [sessionId]);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const safeAt = (() => {
    if (lessonType === 'trial') {
      const base = startedAt ?? scheduledAt;
      if (!base) return null;
      return new Date(new Date(base).getTime() + 10 * 60_000);
    }
    if (!scheduledAt) return null;
    return new Date(new Date(scheduledAt).getTime() + durationMinutes * 60_000);
  })();

  const nowServer = Date.now() + serverDriftMs;
  const diffMs = safeAt ? safeAt.getTime() - nowServer : Number.POSITIVE_INFINITY;
  const canLeaveSafely = !studentJoined && diffMs <= 0 && safeAt !== null;
  const secondsUntilSafe = Math.max(0, Math.ceil(diffMs / 1000));
  const minutesUntilSafe = Math.ceil(secondsUntilSafe / 60);

  let label = 'End Class';
  if (!studentJoined) {
    if (canLeaveSafely) {
      label = 'Safe to Leave';
    } else if (Number.isFinite(diffMs) && diffMs > 0) {
      const mm = String(Math.floor(secondsUntilSafe / 60)).padStart(2, '0');
      const ss = String(secondsUntilSafe % 60).padStart(2, '0');
      label = `Waiting for student · ${mm}:${ss}`;
    }
  }

  // Reference tick to keep linter happy
  void tick;

  return {
    canLeaveSafely,
    minutesUntilSafe,
    secondsUntilSafe,
    label,
    safeAtIso: safeAt?.toISOString() ?? null,
  };
}

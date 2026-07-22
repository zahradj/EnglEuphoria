import { useState, useEffect, useRef } from "react";

/**
 * Classroom timer.
 *
 * When `startAt` is provided (e.g. the booking's `scheduled_at`), elapsed
 * time is computed from the wall clock so the timer continues advancing
 * across page reloads / re-entries — matching the real lesson window
 * (Playground = 30min, Academy/Success = 60min) instead of restarting
 * from zero every time the user re-enters the classroom.
 *
 * When `startAt` is omitted, falls back to a local count-up from mount
 * (legacy behaviour, used by non-booking surfaces).
 */
export function useClassroomTimer(startAt?: Date | string | number | null) {
  const startMs = (() => {
    if (startAt == null) return null;
    const t = startAt instanceof Date ? startAt.getTime() : new Date(startAt).getTime();
    return Number.isFinite(t) ? t : null;
  })();

  const [classTime, setClassTime] = useState<number>(() => {
    if (startMs == null) return 0;
    return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (startMs != null) {
      // Re-sync immediately on (re)mount so re-entry picks up the true elapsed.
      setClassTime(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
      timerRef.current = setInterval(() => {
        setClassTime(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
      }, 1000);
    } else {
      timerRef.current = setInterval(() => {
        setClassTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [startMs]);

  return { classTime };
}

import { useState, useEffect, useMemo } from 'react';

interface CountdownResult {
  timeRemaining: number;
  minutes: number;
  seconds: number;
  formattedTime: string;
  isStartingSoon: boolean;
  canEnter: boolean;
  hasStarted: boolean;
}

export const useNextClassCountdown = (scheduledAt: Date | null): CountdownResult => {
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    if (!scheduledAt) return 0;
    return Math.max(0, Math.floor((scheduledAt.getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!scheduledAt) return;

    const calculateRemaining = () => {
      return Math.max(0, Math.floor((scheduledAt.getTime() - Date.now()) / 1000));
    };

    setTimeRemaining(calculateRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(calculateRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledAt]);

  const result = useMemo<CountdownResult>(() => {
    const totalMinutes = Math.floor(timeRemaining / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = timeRemaining % 60;

    // Friendly formatting:
    // - >= 1h  →  "2h 14m 03s"
    // - <  1h  →  "14:03"
    const formattedTime = hours > 0
      ? `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const canEnter = timeRemaining <= 5 * 60; // 5 minutes or less
    const isStartingSoon = timeRemaining <= 5 * 60 && timeRemaining > 0;
    const hasStarted = timeRemaining <= 0;

    return {
      timeRemaining,
      minutes,
      seconds,
      formattedTime,
      isStartingSoon,
      canEnter,
      hasStarted
    };
  }, [timeRemaining]);

  return result;
};

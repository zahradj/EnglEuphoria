import { useState, useEffect, useCallback, useRef } from 'react';

interface UseIdleOpacityOptions {
  idleTimeout?: number;
  activeOpacity?: number;
  idleOpacity?: number;
}

export const useIdleOpacity = ({
  idleTimeout = 3000,
  activeOpacity = 1,
  idleOpacity = 0.4
}: UseIdleOpacityOptions = {}) => {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), idleTimeout);
  }, [idleTimeout]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  const onMouseMove = useCallback(() => resetTimer(), [resetTimer]);
  const onMouseEnter = useCallback(() => resetTimer(), [resetTimer]);

  return {
    opacity: isIdle ? idleOpacity : activeOpacity,
    isIdle,
    onMouseMove,
    onMouseEnter,
    style: {
      opacity: isIdle ? idleOpacity : activeOpacity,
      transition: 'opacity 300ms ease'
    }
  };
};

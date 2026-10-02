import { useEffect } from 'react';

/**
 * While `active` (the pen is on), call `onReturn` after `ms` with no new activity.
 * Change `activityKey` (e.g. the stroke count) to restart the wait.
 * A child who picks the pen and forgets it is on can't drag or tap the activity,
 * so the pen hands itself back to the pointer.
 */
export function usePenAutoReturn(active: boolean, activityKey: unknown, onReturn: () => void, ms = 8000): void {
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(onReturn, ms);
    return () => window.clearTimeout(t);
    // onReturn is intentionally not a dependency: callers pass a fresh closure each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, activityKey, ms]);
}

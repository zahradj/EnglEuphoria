/**
 * useStarHintTracker — shared 3-Star + Hint state for every interactive slide.
 *
 * Behavior:
 *  • starts at 3 gold stars.
 *  • every wrong answer decrements (clamped to a 1-star floor — students always pass).
 *  • after the 1st wrong answer → expose hint_text in `showHint`.
 *  • after the 2nd wrong answer → expose `showTargetHighlight` so the host
 *    activity can highlight the correct drop-zone / answer.
 *  • once correct, the parent reads `stars` to award XP.
 */
import { useCallback, useRef, useState } from 'react';

export interface StarHintState {
  stars: number;
  wrongCount: number;
  showHint: boolean;
  showTargetHighlight: boolean;
}

export interface StarHintTracker extends StarHintState {
  /** Call after every WRONG answer. Returns the new state. */
  registerWrong: () => StarHintState;
  /** Reset to a fresh 3-star state (used when the slide changes). */
  reset: () => void;
}

export function useStarHintTracker(): StarHintTracker {
  const [state, setState] = useState<StarHintState>({
    stars: 3,
    wrongCount: 0,
    showHint: false,
    showTargetHighlight: false,
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  const registerWrong = useCallback((): StarHintState => {
    const next: StarHintState = {
      // Floor at 1 star — students always finish.
      stars: Math.max(1, stateRef.current.stars - 1),
      wrongCount: stateRef.current.wrongCount + 1,
      showHint: stateRef.current.wrongCount + 1 >= 1,
      showTargetHighlight: stateRef.current.wrongCount + 1 >= 2,
    };
    setState(next);
    stateRef.current = next;
    return next;
  }, []);

  const reset = useCallback(() => {
    const fresh: StarHintState = {
      stars: 3,
      wrongCount: 0,
      showHint: false,
      showTargetHighlight: false,
    };
    setState(fresh);
    stateRef.current = fresh;
  }, []);

  return { ...state, registerWrong, reset };
}

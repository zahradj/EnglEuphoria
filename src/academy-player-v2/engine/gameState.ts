// Score, combo and tries of one game scene. No timer by default (comfort rule: no visible countdown unless the student turns it on).
import { useCallback, useReducer } from 'react';

export interface GameState { score: number; combo: number; bestCombo: number; tries: number; triesLeft: number; flash: null | 'hit' | 'miss'; }
type A = { type: 'hit'; points?: number } | { type: 'miss' } | { type: 'reset'; tries?: number } | { type: 'clearFlash' };

export const POINTS_PER_HIT = 10;
export const comboMultiplier = (combo: number) => (combo >= 5 ? 3 : combo >= 3 ? 2 : 1);
export const initialGame = (tries = 3): GameState => ({ score: 0, combo: 0, bestCombo: 0, tries, triesLeft: tries, flash: null });

export function gameReducer(s: GameState, a: A): GameState {
  switch (a.type) {
    case 'hit': {
      const combo = s.combo + 1;
      return { ...s, combo, bestCombo: Math.max(s.bestCombo, combo), score: s.score + (a.points ?? POINTS_PER_HIT) * comboMultiplier(combo), flash: 'hit' };
    }
    case 'miss': return { ...s, combo: 0, triesLeft: Math.max(0, s.triesLeft - 1), flash: 'miss' };
    case 'reset': return initialGame(a.tries ?? s.tries);
    case 'clearFlash': return { ...s, flash: null };
  }
}

export function useGameState(tries = 3) {
  const [state, dispatch] = useReducer(gameReducer, tries, initialGame);
  return {
    state,
    hit: useCallback((points?: number) => dispatch({ type: 'hit', points }), []),
    miss: useCallback(() => dispatch({ type: 'miss' }), []),
    reset: useCallback((t?: number) => dispatch({ type: 'reset', tries: t }), []),
    clearFlash: useCallback(() => dispatch({ type: 'clearFlash' }), []),
    out: state.triesLeft === 0,
  };
}

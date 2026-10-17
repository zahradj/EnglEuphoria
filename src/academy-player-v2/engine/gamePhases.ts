// Video-game lifecycle shared by every game scene (borrowed concept from the Playground player, re-implemented for the Academy):
// intro -> play -> win | lose -> (retry -> play). Pure reducer + a small hook; scoring in gameState.ts.
import { useCallback, useReducer } from 'react';

export type GamePhase = 'intro' | 'play' | 'win' | 'lose';
type A = { type: 'start' } | { type: 'win' } | { type: 'lose' } | { type: 'retry' };

export function phaseReducer(p: GamePhase, a: A): GamePhase {
  switch (a.type) {
    case 'start': return p === 'intro' ? 'play' : p;
    case 'win': return p === 'play' ? 'win' : p;
    case 'lose': return p === 'play' ? 'lose' : p;
    case 'retry': return p === 'lose' || p === 'win' ? 'play' : p;
  }
}

export function useGamePhases(initial: GamePhase = 'intro') {
  const [phase, dispatch] = useReducer(phaseReducer, initial);
  return {
    phase,
    start: useCallback(() => dispatch({ type: 'start' }), []),
    win: useCallback(() => dispatch({ type: 'win' }), []),
    lose: useCallback(() => dispatch({ type: 'lose' }), []),
    retry: useCallback(() => dispatch({ type: 'retry' }), []),
  };
}

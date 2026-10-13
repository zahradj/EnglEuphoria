import { describe, expect, it } from 'vitest';
import { friendMove } from './ticTacToeRules';

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const wins = (b: number[], p: number) => LINES.some((l) => l.every((i) => b[i] === p));

describe('Tic-Tac-Toe Duel: the friend plays fair but the child can always win', () => {
  it('takes the centre first on an empty board', () => {
    expect(friendMove([0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(4);
  });
  it('blocks the child’s line of two', () => {
    expect(friendMove([1, 1, 0, 0, 2, 0, 0, 0, 0])).toBe(2);
  });
  it('never completes a line of its own', () => {
    expect(friendMove([2, 2, 0, 1, 0, 0, 1, 0, 0])).not.toBe(2);
  });
  it('in every reachable game the friend never wins', () => {
    // exhaustive: the child plays any free square, the friend answers with friendMove
    const play = (b: number[]): void => {
      for (let i = 0; i < 9; i++) {
        if (b[i]) continue;
        const c = [...b]; c[i] = 1;
        if (wins(c, 1) || !c.includes(0)) continue;
        const m = friendMove(c);
        if (m < 0) continue;
        c[m] = 2;
        expect(wins(c, 2)).toBe(false);
        play(c);
      }
    };
    play([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

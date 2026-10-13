import { describe, expect, it } from 'vitest';
import { childAsks, friendAsks, isOver, settle, startState } from './goFishRules';

describe('Go Fish! rules', () => {
  it('pairs leave the hand at once', () => {
    expect(settle(['frog', 'bird', 'frog'], [])).toEqual({ hand: ['bird'], pairs: ['frog'] });
  });
  it('a "yes" makes a pair, a "go fish" draws from the pond', () => {
    const s = startState(['frog', 'bird'], ['frog', 'lion'], ['bird', 'lion']);
    const yes = childAsks(s, 'frog');
    expect(yes.result).toBe('yes');
    expect(yes.state.childPairs).toEqual(['frog']);
    const fish = childAsks(yes.state, 'bird');
    expect(fish.result).toBe('fish');
    expect(fish.drawn).toBe('bird');
    expect(fish.state.childPairs).toEqual(['frog', 'bird']);
    expect(isOver(fish.state)).toBe(true);
  });
  it('always ends: the child asking for any card, the friend answering, every deal of 4 pairs', () => {
    const labels = ['a', 'b', 'c', 'd'];
    const deck = [...labels, ...labels];
    for (let seed = 0; seed < 200; seed++) {
      const d = [...deck].sort((x, y) => ((x.charCodeAt(0) * (seed + 3)) % 7) - ((y.charCodeAt(0) * (seed + 5)) % 7));
      let s = startState(d.slice(0, 3), d.slice(3, 6), d.slice(6));
      let turns = 0;
      while (!isOver(s) && turns < 50) {
        s = childAsks(s, s.child[turns % s.child.length]).state;
        if (!isOver(s)) s = friendAsks(s).state;
        turns++;
      }
      expect(isOver(s), `seed ${seed}`).toBe(true);
    }
  });
});

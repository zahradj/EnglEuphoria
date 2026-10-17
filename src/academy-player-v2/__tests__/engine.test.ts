import { describe, expect, it } from 'vitest';
import { initialState, lessonReducer, XP_CLEAN, XP_SEEN, XP_WIN } from '../engine/lessonReducer';
import { comboMultiplier, gameReducer, initialGame } from '../engine/gameState';
import { phaseReducer } from '../engine/gamePhases';

describe('lessonReducer', () => {
  it('clamps navigation and tracks the furthest page', () => {
    let s = initialState(3);
    s = lessonReducer(s, { type: 'back' });
    expect(s.index).toBe(0);
    s = lessonReducer(lessonReducer(lessonReducer(s, { type: 'next' }), { type: 'next' }), { type: 'next' });
    expect(s.index).toBe(2);
    s = lessonReducer(s, { type: 'back' });
    expect(s.furthest).toBe(2);
  });
  it('pays a scored clean win once, with a gem; a retry after mistakes pays less and no gem', () => {
    let s = lessonReducer(initialState(2), { type: 'done', id: 'a', result: { won: true, score: 40 } });
    expect([s.xp, s.gems]).toEqual([XP_CLEAN, 1]);
    s = lessonReducer(s, { type: 'done', id: 'a', result: { won: true, score: 40 } });
    expect(s.xp).toBe(XP_CLEAN);
    s = lessonReducer(lessonReducer(s, { type: 'wrong', id: 'b' }), { type: 'done', id: 'b', result: { won: true, score: 10 } });
    expect([s.xp, s.gems]).toEqual([XP_CLEAN + XP_WIN, 1]);
  });
  it('an unscored page (story, rule) earns only a small seen bonus and no gem', () => {
    const s = lessonReducer(initialState(1), { type: 'done', id: 'x' });
    expect([s.xp, s.gems]).toEqual([XP_SEEN, 0]);
  });
  it('restore clamps a stale index', () => {
    expect(lessonReducer(initialState(3), { type: 'restore', state: { index: 99, furthest: 99 } }).index).toBe(2);
  });
});

describe('game state and phases', () => {
  it('combo multiplier steps at 3 and 5', () => {
    expect([0, 2, 3, 4, 5, 9].map(comboMultiplier)).toEqual([1, 1, 2, 2, 3, 3]);
  });
  it('a miss resets the combo and costs a try; a hit scores', () => {
    let g = gameReducer(initialGame(3), { type: 'hit' });
    g = gameReducer(gameReducer(g, { type: 'hit' }), { type: 'hit' });
    expect(g.combo).toBe(3);
    const hit = g.score;
    g = gameReducer(g, { type: 'miss' });
    expect([g.combo, g.triesLeft, g.score]).toEqual([0, 2, hit]);
  });
  it('phases run intro to play to win', () => {
    expect(phaseReducer('intro', { type: 'start' })).toBe('play');
    expect(phaseReducer('play', { type: 'win' })).toBe('win');
  });
});

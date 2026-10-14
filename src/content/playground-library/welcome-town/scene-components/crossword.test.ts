import { describe, expect, it } from 'vitest';
import { cellsOf, layoutCrossword } from './crosswordRules';
import { LESSON_5_SCENES } from '../scenes';
import { LESSON_A1U2L4_SCENES } from '../../jungle-adventure/scenes';

describe('crossword layout', () => {
  it('crosses words and keeps letters consistent', () => {
    const l = layoutCrossword(['snake', 'frog', 'lion', 'fish', 'nose', 'tail']);
    expect(l.placed.length).toBe(6);
    for (const p of l.placed) cellsOf(p).forEach((k, i) => expect(l.cells.get(k)).toBe(p.word[i]));
  });
  it('places every word of every lesson crossword', () => {
    const scenes = [...LESSON_5_SCENES, ...LESSON_A1U2L4_SCENES].filter((s) => s.kind === 'crossword');
    expect(scenes.length).toBeGreaterThan(0);
    for (const s of scenes) if (s.kind === 'crossword') {
      const l = layoutCrossword(s.words.map((w) => w.word));
      expect(l.placed.length, s.id).toBe(s.words.length);
      expect(Math.max(l.rows, l.cols), s.id).toBeLessThanOrEqual(9);
    }
  });
});

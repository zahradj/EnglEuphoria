import { describe, expect, it } from 'vitest';
import { decide, speakingShare, starsFor } from './levelTestScoring';

// The rules of docs/assessment/prea1-assessment-plan.md (owner-approved 2026-10-12).
const S = (lw: number, ls: number, snd: number, spk: number) => [
  { key: 'words', stars: lw }, { key: 'sentences', stars: ls }, { key: 'sounds', stars: snd }, { key: 'speaking', stars: spk },
];
const STRONG = ['words', 'sentences', 'speaking'];

describe('level test scoring', () => {
  it('maps a share of right answers to 1–5 stars', () => {
    expect([1, 0.9, 0.85, 0.8, 0.7, 0.65, 0.6, 0.5, 0.49, 0].map(starsFor)).toEqual([5, 5, 4, 4, 3, 3, 2, 2, 1, 1]);
  });
  it('turns the 0–3 speaking rubric into a share', () => {
    expect(speakingShare([3, 3, 3, 3])).toBe(1);
    expect(speakingShare([2, 2, -1])).toBeCloseTo(2 / 3);
    expect(speakingShare([])).toBe(0);
  });
  it('final test: ready needs every section 3+, listening + speaking 4+, 16+ in all', () => {
    expect(decide('final', S(4, 4, 4, 4), STRONG)).toBe('ready');
    expect(decide('final', S(5, 5, 3, 4), STRONG)).toBe('ready');
    expect(decide('final', S(4, 3, 5, 5), STRONG)).toBe('almost'); // a listening section only at 3
    expect(decide('final', S(4, 4, 3, 4), STRONG)).toBe('almost'); // 15 in all
    expect(decide('final', S(5, 5, 2, 5), STRONG)).toBe('almost'); // one section at 2
    expect(decide('final', S(5, 5, 1, 5), STRONG)).toBe('not_yet'); // a section at 1
    expect(decide('final', S(2, 5, 2, 5), STRONG)).toBe('not_yet'); // two sections at 2
  });
  it('unit Boss Test: every part at 4+ stars (80 %) passes', () => {
    expect(decide('unit', S(4, 4, 4, 5))).toBe('unit_pass');
    expect(decide('unit', S(5, 5, 3, 5))).toBe('unit_practise');
  });
  it('checkpoint: go on / with support / review first', () => {
    expect(decide('checkpoint', S(4, 3, 3, 3))).toBe('go_on');
    expect(decide('checkpoint', S(3, 3, 3, 3))).toBe('go_on_support'); // 12 in all
    expect(decide('checkpoint', S(4, 4, 2, 4))).toBe('go_on_support'); // one section at 2
    expect(decide('checkpoint', S(2, 2, 4, 4))).toBe('review_first');
    expect(decide('checkpoint', S(3, 3, 3, 1))).toBe('review_first');
  });
});

import { describe, expect, it } from 'vitest';
import { REQUIRED_INGREDIENTS, TEACHING_APPROACHES, analysisProblems, suggestApproaches, type LessonAnalysis } from '../lessonDesign';

const base: LessonAnalysis = { objective: 'Order food politely', criteria: ['I can order a meal'], knows: 'food words from school', gap: 'polite requests', skills: ['speaking', 'interaction'], newness: 'partly-known', level: 'B1' };

describe('lesson design (no fixed skeleton)', () => {
  it('requires ingredients, not an order or a minute split', () => {
    expect(REQUIRED_INGREDIENTS.map((i) => i.id)).toEqual(expect.arrayContaining(['objective', 'need', 'research', 'approach', 'model-rule', 'speaking', 'interactive']));
    expect(JSON.stringify(REQUIRED_INGREDIENTS)).not.toMatch(/\bminutes?\b/i);
  });
  it('offers several approaches, PPP and communicative among them', () => {
    const ids = TEACHING_APPROACHES.map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(['ppp', 'cl-tbl', 'ttt']));
  });
  it('chooses by analysis: partly-known speaking is not PPP first; new grammar is; Pre-A1 is sounds-first', () => {
    expect(suggestApproaches(base)[0].id).not.toBe('ppp');
    expect(suggestApproaches({ ...base, newness: 'new', skills: ['grammar'] })[0].id).toBe('ppp');
    expect(suggestApproaches({ ...base, level: 'Pre-A1', skills: ['pronunciation', 'reading'], newness: 'new' })[0].id).toBe('phonics');
  });
  it('flags an incomplete analysis', () => {
    expect(analysisProblems(base)).toEqual([]);
    expect(analysisProblems({ ...base, gap: '' }).length).toBe(1);
  });
});

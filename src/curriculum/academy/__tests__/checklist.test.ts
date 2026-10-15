import { describe, expect, it } from 'vitest';
import { STRANDS, RELEASE_CRITERIA, lessonResult, markOfScore, rubricToScore, suggestMark, unitResult, type LessonChecklist, type UnitAssessment } from '..';

const crit = (marks: ('nailed' | 'almost' | 'not-yet')[]) => marks.map((mark, i) => ({ text: `Goal ${i + 1}`, mark }));
const base = (marks: Parameters<typeof crit>[0], over: Partial<LessonChecklist> = {}): LessonChecklist => ({ lessonId: 'L', studentId: 's', on: '2026-10-15', level: 'A1', criteria: crit(marks), speakingStep: 'guided', errors: [], comfort: 'ok', notes: '', ...over });

describe('Lesson checklist', () => {
  it('suggests a mark from wrong tries and hints', () => {
    expect(suggestMark(0)).toBe('nailed');
    expect(suggestMark(1, 1)).toBe('nailed');
    expect(suggestMark(3)).toBe('almost');
    expect(suggestMark(2, 4)).toBe('almost');
    expect(suggestMark(7)).toBe('not-yet');
  });
  it('all goals nailed: the lesson is nailed and the teacher moves on', () => {
    const r = lessonResult(base(['nailed', 'nailed', 'nailed', 'nailed', 'nailed']));
    expect(r.verdict).toBe('nailed');
    expect(r.actions).toContain('Move on to the next lesson.');
  });
  it('one goal not yet, or two almost: needs more practice, with an action per goal and the error log first', () => {
    const r = lessonResult(base(['nailed', 'not-yet', 'nailed', 'almost', 'nailed'], { errors: ['pronunciation', 'word order'] }));
    expect(r.verdict).toBe('practise');
    expect(r.actions.join(' ')).toMatch(/Practise next lesson: Goal 2/);
    expect(r.actions.join(' ')).toMatch(/Recheck next lesson: Goal 4/);
    expect(r.actions.join(' ')).toMatch(/Start the next Remember\? with: pronunciation, word order/);
    expect(lessonResult(base(['nailed', 'almost', 'almost'])).verdict).toBe('practise');
  });
  it('half or more goals not yet: replay the lesson', () => {
    const r = lessonResult(base(['not-yet', 'not-yet', 'almost', 'nailed']));
    expect(r.verdict).toBe('replay');
    expect(r.actions.join(' ')).toMatch(/Replay this lesson/);
  });
  it('a tense student or a speaking step below the level target stops a "nailed" verdict', () => {
    expect(lessonResult(base(['nailed', 'nailed'], { comfort: 'tense' })).verdict).toBe('practise');
    const r = lessonResult(base(['nailed', 'nailed'], { speakingStep: 'repeat' }));
    expect(r.verdict).toBe('practise');
    expect(r.actions.join(' ')).toMatch(/Speaking: the lesson should reach "guided"/);
    expect(lessonResult(base(['nailed'], { speakingStep: null })).verdict).toBe('practise');
  });
});

const unit = (strands: number | number[], rel: 1 | 2 | 3 | 4 | (1 | 2 | 3 | 4)[], over: Partial<UnitAssessment> = {}): UnitAssessment => ({
  seasonId: 'A1-S03', studentId: 's', on: '2026-10-30', levelCheck: false, notes: '',
  strands: Object.fromEntries(STRANDS.map((s, i) => [s, Array.isArray(strands) ? strands[i] : strands])) as UnitAssessment['strands'],
  release: Object.fromEntries(RELEASE_CRITERIA.map((c, i) => [c, Array.isArray(rel) ? rel[i] : rel])) as UnitAssessment['release'], ...over,
});

describe('Unit assessment (final checklist of a Season)', () => {
  it('maps scores to marks (stricter almost-line at a level check) and rubric to a percentage', () => {
    expect([markOfScore(85), markOfScore(70), markOfScore(40)]).toEqual(['nailed', 'almost', 'not-yet']);
    expect(markOfScore(62, true)).toBe('not-yet');
    expect(markOfScore(62, false)).toBe('almost');
    expect([rubricToScore(1), rubricToScore(4)]).toEqual([25, 100]);
  });
  it('NAILED: five or more strands at 80 and a strong Release', () => {
    const r = unitResult(unit([90, 85, 82, 80, 88, 75], 4));
    expect(r.verdict).toBe('nailed');
    expect(r.plan.join(' ')).toMatch(/Move on/);
  });
  it('READY: nothing weak, but not all strong', () => {
    expect(unitResult(unit([70, 85, 65, 80, 62, 75], 3)).verdict).toBe('ready');
  });
  it('NEEDS MORE PRACTICE: one or two weak strands get named lessons, Daily 10 time and a retest', () => {
    const r = unitResult(unit([90, 40, 85, 80, 88, 75], 3));
    expect(r.verdict).toBe('practise');
    expect(r.weakStrands).toEqual(['speaking']);
    expect(r.plan.join(' ')).toMatch(/speaking: needs more practice. Replay lesson E4 \/ E6/);
    expect(r.plan.join(' ')).toMatch(/retest in 2 weeks/);
  });
  it('REPEAT: three weak strands, or a weak Release', () => {
    expect(unitResult(unit([40, 40, 40, 80, 80, 80], 3)).verdict).toBe('repeat');
    expect(unitResult(unit(90, 1)).verdict).toBe('repeat');
  });
  it('a level check needs more: six strong strands for "nailed", four for "ready"', () => {
    expect(unitResult(unit([90, 85, 82, 80, 88, 75], 4, { levelCheck: true })).verdict).toBe('ready');
    expect(unitResult(unit(90, 4, { levelCheck: true })).verdict).toBe('nailed');
    expect(unitResult(unit([70, 70, 70, 70, 70, 85], 3, { levelCheck: true })).verdict).toBe('practise');
  });
});

import { familyLines } from '..';
describe('Family lines (the checklist inside the lesson report)', () => {
  it('says what was nailed and what to practise, in plain words, and adds the unit result', () => {
    const lines = familyLines(base(['nailed', 'not-yet', 'nailed']), unit([90, 40, 85, 80, 88, 75], 3));
    expect(lines.join('\n')).toMatch(/Lesson goals: 2 of 3 nailed\./);
    expect(lines.join('\n')).toMatch(/To practise: Goal 2/);
    expect(lines.join('\n')).toMatch(/Unit result: Needs more practice, then move on\./);
    expect(lines.join('\n')).toMatch(/Needs more practice: speaking\./);
  });
  it('is empty when nothing was marked', () => {
    expect(familyLines(null, null)).toEqual([]);
  });
});

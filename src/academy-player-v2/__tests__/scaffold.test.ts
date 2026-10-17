import { describe, expect, it } from 'vitest';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';
import { scaffoldLesson } from '../tools/scaffold';

describe('lesson scaffold', () => {
  const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === 'B1-S01-E4')!;
  it('makes a lesson file, a research stub with a Game search section and a plan stub from the blueprint', () => {
    const s = scaffoldLesson(bp);
    expect(s.files.map((f) => f.path)).toEqual(['src/academy-player-v2/lessons/b1s01e4.ts', 'docs/research/academy-b1-s01-e4-research.md', 'docs/academy-b1-s01-e4-plan.md']);
    const lesson = s.files[0].content;
    expect(lesson).toContain("blueprintId: 'B1-S01-E4'");
    expect(lesson).toContain('partMinutes: [');
    expect(s.files[1].content).toMatch(/## 2\. Game search/);
    expect(s.files[1].content).toMatch(/1-2 chosen games per success criterion|One to two CHOSEN games per success criterion/);
    expect(s.registration).toContain("'B1-S01-E4'");
    expect(s.checklist.length).toBeGreaterThanOrEqual(6);
  });
  it('the part minutes come from the run of show and add up to 60', () => {
    const m = /partMinutes: (\[[^\]]*\])/.exec(scaffoldLesson(bp).files[0].content)![1];
    expect((JSON.parse(m) as number[]).reduce((a, b) => a + b, 0)).toBe(60);
  });
  it('a scaffold is invalid on purpose: it has TODO markers the author must clear', () => {
    expect(scaffoldLesson(bp).files[0].content).toMatch(/TODO/);
  });
});

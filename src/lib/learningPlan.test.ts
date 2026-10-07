import { describe, it, expect } from 'vitest';
import { buildLearningPlan, readLearningPlan, type PlanUnitInfo } from './learningPlan';

const units: PlanUnitInfo[] = Array.from({ length: 10 }, (_, i) => ({
  unitNumber: i + 1,
  unitTitle: `Title ${i + 1}`,
  lessonCount: 4,
}));

describe('buildLearningPlan', () => {
  it('walks the units in order at the chosen pace', () => {
    const plan = buildLearningPlan({ level: 'Pre-A1', startUnit: 1, lessonsPerWeek: 2, units })!;
    expect(plan.weeks.map((w) => w.unit)).toEqual([1, 1, 2, 2]);
    expect(plan.weeks[0].title).toBe('Title 1');
    expect(plan.totalWeeks).toBe(20); // 40 lessons / 2 per week
    expect(plan.unitsAfter).toBe(8);
  });

  it('starts at the unit the student has not mastered', () => {
    const plan = buildLearningPlan({ level: 'A1', startUnit: 6, lessonsPerWeek: 4, units })!;
    expect(plan.weeks.map((w) => w.unit)).toEqual([6, 7, 8, 9]);
    expect(plan.totalWeeks).toBe(5); // 20 lessons / 4 per week
    expect(plan.unitsAfter).toBe(1);
  });

  it('falls back to "Unit N" and 4 lessons per unit when the blueprint is empty', () => {
    const plan = buildLearningPlan({ level: 'A2', startUnit: 10, lessonsPerWeek: 1, units: [] })!;
    expect(plan.weeks.map((w) => w.title)).toEqual(['Unit 10', 'Unit 10', 'Unit 10', 'Unit 10']);
    expect(plan.totalWeeks).toBe(4);
    expect(plan.unitsAfter).toBe(0);
  });

  it('refuses an unusable pace or missing level', () => {
    expect(buildLearningPlan({ level: '', startUnit: 1, lessonsPerWeek: 2, units })).toBeNull();
    expect(buildLearningPlan({ level: 'A1', startUnit: 1, lessonsPerWeek: 0, units })).toBeNull();
    expect(buildLearningPlan({ level: 'A1', startUnit: 1, lessonsPerWeek: 9, units })).toBeNull();
  });

  it('round-trips through readLearningPlan and rejects junk', () => {
    const plan = buildLearningPlan({ level: 'A1', startUnit: 2, lessonsPerWeek: 3, units })!;
    expect(readLearningPlan(JSON.parse(JSON.stringify(plan)))).toEqual(plan);
    expect(readLearningPlan(null)).toBeNull();
    expect(readLearningPlan({ level: 'A1', weeks: [] })).toBeNull();
  });
});

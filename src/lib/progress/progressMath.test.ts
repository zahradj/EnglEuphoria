import { describe, expect, it } from 'vitest';
import { DEFAULT_WEEKLY_LESSONS, focusSkill, masteryLevel, normalizeSkills, ringPercent, skillStars, startOfWeek, weeklyLessonTarget } from './progressMath';

describe('masteryLevel', () => {
  it('shows "not started" until the student has met the skill', () => {
    expect(masteryLevel(0, false)).toBe('not_started');
    expect(masteryLevel(90, false)).toBe('not_started');
  });
  it('uses Khan-style bands', () => {
    expect(masteryLevel(10, true)).toBe('learning');
    expect(masteryLevel(39, true)).toBe('learning');
    expect(masteryLevel(40, true)).toBe('familiar');
    expect(masteryLevel(70, true)).toBe('proficient');
    expect(masteryLevel(85, true)).toBe('mastered');
    expect(masteryLevel(NaN, true)).toBe('learning');
  });
});

describe('skillStars', () => {
  it('gives a met skill at least one star and caps at five', () => {
    expect(skillStars(0, false)).toBe(0);
    expect(skillStars(0, true)).toBe(1);
    expect(skillStars(35, true)).toBe(2);
    expect(skillStars(100, true)).toBe(5);
    expect(skillStars(250, true)).toBe(5);
  });
});

describe('weeklyLessonTarget', () => {
  it('reads a lesson count from the free-text goal', () => {
    expect(weeklyLessonTarget('Complete 3 lessons 🎯')).toBe(3);
    expect(weeklyLessonTarget('Finish 5 classes')).toBe(5);
  });
  it('ignores numbers that are not lessons and falls back to a gentle default', () => {
    expect(weeklyLessonTarget('Learn 10 new words 📚')).toBe(DEFAULT_WEEKLY_LESSONS);
    expect(weeklyLessonTarget(null)).toBe(DEFAULT_WEEKLY_LESSONS);
    expect(weeklyLessonTarget('0 lessons')).toBe(DEFAULT_WEEKLY_LESSONS);
  });
  it('caps an unrealistic target', () => {
    expect(weeklyLessonTarget('99 lessons')).toBe(14);
  });
});

describe('startOfWeek / ringPercent', () => {
  it('starts the week on Monday at local midnight', () => {
    const wed = new Date(2026, 9, 14, 15, 30); // Wed 14 Oct 2026
    const s = startOfWeek(wed);
    expect([s.getFullYear(), s.getMonth(), s.getDate(), s.getHours()]).toEqual([2026, 9, 12, 0]);
    const sun = startOfWeek(new Date(2026, 9, 18, 9, 0));
    expect(sun.getDate()).toBe(12);
    expect(startOfWeek(new Date(2026, 9, 12, 0, 1)).getDate()).toBe(12);
  });
  it('never overfills the ring', () => {
    expect(ringPercent(1, 2)).toBe(50);
    expect(ringPercent(5, 2)).toBe(100);
    expect(ringPercent(1, 0)).toBe(0);
  });
});

describe('normalizeSkills / focusSkill', () => {
  it('always returns the five skills in a fixed order', () => {
    const s = normalizeSkills([{ domain: 'grammar', masteryPct: 55.4, children: [{}, {}] }]);
    expect(s.map((x) => x.domain)).toEqual(['vocabulary', 'grammar', 'pronunciation', 'fluency', 'reading']);
    expect(s[1]).toEqual({ domain: 'grammar', pct: 55, hasItems: true });
    expect(s[0]).toEqual({ domain: 'vocabulary', pct: 0, hasItems: false });
    expect(normalizeSkills(undefined)).toHaveLength(5);
  });
  it('suggests the weakest skill the student has actually met, and nothing before any', () => {
    const s = normalizeSkills([
      { domain: 'vocabulary', masteryPct: 80, children: [{}] },
      { domain: 'grammar', masteryPct: 30, children: [{}] },
    ]);
    expect(focusSkill(s)?.domain).toBe('grammar');
    expect(focusSkill(normalizeSkills([]))).toBeNull();
  });
});

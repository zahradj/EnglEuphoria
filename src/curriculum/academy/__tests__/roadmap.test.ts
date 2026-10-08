// Deploy gate for the Academy roadmap v2. A roadmap that breaks the approved sizing or the Season System rules fails here.
// Fix the roadmap, never the check (owner rules: docs/academy-lesson-system.md, .claude/skills/academy-roadmap-architect).
import { describe, expect, it } from 'vitest';
import { ACADEMY_ROADMAP, ACADEMY_ROADMAP_ISSUES, ACADEMY_ROADMAP_SUMMARY, ACADEMY_SEASONS, STRUCTURES, validateRoadmap } from '..';

describe('Academy roadmap v2', () => {
  it('has the approved sizing: 70 Seasons, 560 sessions', () => {
    expect(ACADEMY_ROADMAP.map((p) => [p.level, p.seasons.length])).toEqual([
      ['A1', 10],
      ['A2', 12],
      ['B1', 16],
      ['B2', 16],
      ['C1', 16],
    ]);
    expect(ACADEMY_ROADMAP_SUMMARY.seasons).toBe(70);
    expect(ACADEMY_ROADMAP_SUMMARY.sessions).toBe(560);
  });

  it('passes every validator rule (errors only; warnings are listed by the report script)', () => {
    const errors = ACADEMY_ROADMAP_ISSUES.filter((i) => i.severity === 'error');
    expect(errors).toEqual([]);
  });

  it('never puts a structure before its level floor', () => {
    const early = ACADEMY_SEASONS.flatMap((s) => s.structures.map((x) => ({ s, x }))).filter(({ s, x }) => {
      const info = STRUCTURES[x.id];
      return info && ['A1', 'A2', 'B1', 'B2', 'C1'].indexOf(s.level) < ['A1', 'A2', 'B1', 'B2', 'C1'].indexOf(info.floor);
    });
    expect(early).toEqual([]);
  });

  it('keeps going to (A2) and will (A2) in different Seasons, and splits the present perfect', () => {
    const season = (id: string) => ACADEMY_SEASONS.find((s) => s.structures.some((x) => x.id === id))?.id;
    expect(season('going-to')).not.toBe(season('will-decisions-predictions'));
    expect(season('present-perfect-experience')).not.toBe(season('present-perfect-for-since'));
    expect(season('present-perfect-for-since')).not.toBe(season('present-perfect-vs-past-simple'));
  });

  it('introduces the present continuous for the future only after going to and the "now" use', () => {
    const idx = (id: string) => ACADEMY_SEASONS.findIndex((s) => s.structures.some((x) => x.id === id));
    expect(idx('present-continuous-now')).toBeGreaterThanOrEqual(0);
    expect(idx('present-continuous-future')).toBeGreaterThan(idx('going-to'));
    expect(idx('present-continuous-future')).toBeGreaterThan(idx('present-continuous-now'));
  });

  it('teaches the past perfect only after past simple and past continuous', () => {
    const idx = (id: string) => ACADEMY_SEASONS.findIndex((s) => s.structures.some((x) => x.id === id));
    expect(idx('past-perfect')).toBeGreaterThan(idx('past-simple-irregular'));
    expect(idx('past-perfect')).toBeGreaterThan(idx('past-continuous'));
  });

  it('does not teach must/mustn\'t and the mustn\'t vs don\'t-have-to contrast in the same Season', () => {
    const a = ACADEMY_SEASONS.find((s) => s.structures.some((x) => x.id === 'must-mustnt'));
    const b = ACADEMY_SEASONS.find((s) => s.structures.some((x) => x.id === 'obligation-contrast'));
    expect(a?.id).not.toBe(b?.id);
    expect(a?.level).toBe('A2');
    expect(b?.level).toBe('B1');
  });

  it('catches a broken roadmap (the validator is not a rubber stamp)', () => {
    const broken = JSON.parse(JSON.stringify(ACADEMY_ROADMAP));
    broken[0].seasons.pop();
    broken[1].seasons[0].structures = [];
    broken[2].seasons[0].mediation = undefined;
    broken[3].seasons[1].title = broken[3].seasons[0].title;
    const codes = validateRoadmap(broken).map((i) => i.code);
    expect(codes).toEqual(expect.arrayContaining(['season_count', 'structure_count', 'mediation', 'dup_title']));
  });
});

import { describe, expect, it } from 'vitest';
import { ACADEMY_SEASONS, ACTIVE_LADDER_PROFILE, LADDER_PROFILES, ladderSteps, ladderTotals, stepOfSeason, getLadderStep, type LadderProfileId } from '..';

const PROFILES = Object.keys(LADDER_PROFILES) as LadderProfileId[];

describe('Academy level ladder (data)', () => {
  it('the lean ladder is active; the full ladder exists as an option', () => {
    expect(ACTIVE_LADDER_PROFILE).toBe('lean');
    expect(PROFILES.sort()).toEqual(['full', 'lean']);
  });

  it.each(PROFILES)('%s: step ids are unique and ordered from Pre-A1 up; every roadmap Season is in exactly one step', (p) => {
    const steps = ladderSteps(p);
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
    expect(steps[0].id).toBe('pre-a1');
    const order = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
    expect(steps.map((s) => order.indexOf(s.cefr))).toEqual([...steps.map((s) => order.indexOf(s.cefr))].sort((a, b) => a - b));
    for (const s of ACADEMY_SEASONS) {
      const hits = steps.filter((x) => x.level === s.level && x.seasons && s.no >= x.seasons[0] && s.no <= x.seasons[1]);
      expect(hits.length, `${s.id} in ${p}`).toBe(1);
      expect(stepOfSeason(s.level, s.no, p)).toBe(hits[0]);
    }
    // no gaps or overlaps inside a level
    for (const lvl of ['A1', 'A2', 'B1', 'B2', 'C1'] as const) {
      const ranges = steps.filter((x) => x.level === lvl).map((x) => x.seasons!);
      ranges.forEach((r, i) => expect(r[0]).toBe(i === 0 ? 1 : ranges[i - 1][1] + 1));
      expect(ranges[ranges.length - 1][1]).toBe(ACADEMY_SEASONS.filter((s) => s.level === lvl).length);
    }
  });

  it('Pre-A1 is the planned step with no roadmap Seasons yet: Lite = 5 Seasons (lean), Full = 6', () => {
    expect(getLadderStep('pre-a1', 'lean')).toMatchObject({ level: null, seasons: null, plannedSeasons: 5 });
    expect(getLadderStep('pre-a1', 'full')?.plannedSeasons).toBe(6);
  });

  it('Pre-A1 has one working title per planned Season, and no other step has planned Seasons', () => {
    for (const p of PROFILES) for (const s of ladderSteps(p)) expect(s.plannedTitles.length, `${p} ${s.id}`).toBe(s.plannedSeasons);
    expect(getLadderStep('pre-a1', 'lean')?.plannedTitles).toEqual(['Hello, letters', 'First sounds', 'Numbers and age', 'My things', 'People and places']);
  });

  it('A1 is split in both ladders (A1 = Seasons 1-6, A1 Upper = 7-12) and Upper labels are marked official or ours', () => {
    for (const p of PROFILES) {
      expect(getLadderStep('a1', p)?.seasons).toEqual([1, 6]);
      expect(getLadderStep('a1-upper', p)?.seasons).toEqual([7, 12]);
    }
    expect(getLadderStep('a1-upper')?.officialCefr).toBe(false); // A1+ is not an official CEFR level
    expect(getLadderStep('a2-upper', 'full')?.officialCefr).toBe(true); // A2+ is
    expect(getLadderStep('c1-upper', 'full')?.officialCefr).toBe(false);
  });

  it('totals: lean = 7 steps / 85 Seasons / 680 sessions; full = 11 steps / 86 Seasons / 688 sessions (the roadmap is 80 Seasons since 2026-10-14)', () => {
    expect(ladderTotals('lean')).toEqual({ steps: 7, seasons: 85, sessions: 680 });
    expect(ladderTotals('full')).toEqual({ steps: 11, seasons: 86, sessions: 688 });
    expect(ACADEMY_SEASONS.length).toBe(80);
  });
});

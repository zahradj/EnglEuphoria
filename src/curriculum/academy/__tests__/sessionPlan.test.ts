import { describe, expect, it } from 'vitest';
import { A1S01E1_PLAN } from '../sessions/a1s01e1';
import { ACADEMY_ITEMS } from '../items';

describe('SessionPlan A1-S01-E1', () => {
  const p = A1S01E1_PLAN;
  it('adds up to 60 minutes with a 51-minute core', () => {
    expect(p.segments.reduce((n, s) => n + s.minutes, 0)).toBe(60);
    expect(p.segments.filter((s) => s.core).reduce((n, s) => n + s.minutes, 0)).toBe(51);
    expect(p.segments.map((s) => s.name)).toEqual(['Check-in', 'Remember?', 'The Drop', 'Notice & Build', 'Energiser', 'Mission', 'Release', 'Wrap']);
  });
  it('has at least five fun ingredients and names a technique and comfort lever per segment', () => {
    expect(new Set(p.segments.flatMap((s) => s.fun ?? [])).size).toBeGreaterThanOrEqual(5);
    p.segments.forEach((s) => {
      expect(s.technique.length).toBeGreaterThan(0);
      expect(s.comfort.length).toBeGreaterThan(0);
    });
  });
  it('introduces exactly the Season\'s E1 items (14 at most)', () => {
    const e1 = ACADEMY_ITEMS['A1-S01'].E1.map((i) => i[0].toLowerCase());
    expect([...p.newItems].sort()).toEqual([...e1].sort());
    expect(p.newItems.length).toBeLessThanOrEqual(14);
  });
  it('has a dial with three levels, a Take 2, a Chill track, a Plan B and at most four can-dos', () => {
    expect(Object.keys(p.mission.dial).sort()).toEqual(['chill', 'normal', 'push']);
    expect(p.mission.take2.length).toBeGreaterThan(0);
    expect(p.chillTrack.length).toBeGreaterThan(0);
    expect(p.planB.length).toBeGreaterThan(0);
    expect(p.wrap.canDo.length).toBeLessThanOrEqual(4);
  });
});

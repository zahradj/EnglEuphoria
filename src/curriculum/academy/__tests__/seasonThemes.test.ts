// Owner: "Make sure that each season has a theme." Every Season (A1-C1) and every Pre-A1 Season has a real, unique theme.
import { describe, expect, it } from 'vitest';
import { ACADEMY_SEASONS, PA1_SEASONS } from '../index';

describe('every Season has a theme', () => {
  it('A1-C1: a non-empty theme and a story hook on each of the Seasons, no theme repeated', () => {
    expect(ACADEMY_SEASONS.length).toBeGreaterThan(0);
    for (const s of ACADEMY_SEASONS) {
      expect(s.theme?.trim().length, `${s.id} theme`).toBeGreaterThanOrEqual(4);
      expect(s.hook?.trim().length, `${s.id} hook`).toBeGreaterThan(10);
    }
    const themes = ACADEMY_SEASONS.map((s) => s.theme.trim().toLowerCase());
    expect(new Set(themes).size).toBe(themes.length);
  });
  it('Pre-A1: each Season has a theme (its story world), no theme repeated', () => {
    for (const s of PA1_SEASONS) expect(s.theme?.trim().length, `${s.id} theme`).toBeGreaterThanOrEqual(4);
    const themes = PA1_SEASONS.map((s) => s.theme.trim().toLowerCase());
    expect(new Set(themes).size).toBe(themes.length);
  });
});

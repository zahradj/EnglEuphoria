import { describe, it, expect } from 'vitest';
import { PA1_SEASONS, PRE_A1_MAX_NEW_ITEMS } from '../preA1';
import { ladderSteps } from '../ladder';

const canBlend = (w: string, sounds: readonly string[]) => [...w.toLowerCase()].every((c) => sounds.includes(c));

describe('Pre-A1 Seasons (lean ladder: P1-P3)', () => {
  it('there is one Season spec per planned Season, titled as the ladder says', () => {
    const step = ladderSteps('lean').find((s) => s.id === 'pre-a1')!;
    expect(PA1_SEASONS.map((s) => s.title)).toEqual(step.plannedTitles);
    expect(PA1_SEASONS.map((s) => s.seasonNo)).toEqual([1, 2, 3]);
  });

  it.each(PA1_SEASONS.map((s) => [s.id, s] as const))('%s: 8 episodes in order, at most 8 new items each, and E7/E8 introduce nothing', (_id, s) => {
    expect(s.episodes.map((e) => e.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    s.episodes.forEach((e) => expect(e.newItems.length, `${s.id} E${e.no}`).toBeLessThanOrEqual(PRE_A1_MAX_NEW_ITEMS));
    expect(s.episodes[6].newItems).toEqual([]);
    expect(s.episodes[7].newItems).toEqual([]);
  });

  it.each(PA1_SEASONS.slice(1).map((s) => [s.id, s] as const))('%s: decodable words use only the sounds taught so far; has games, a video-game mechanic and a release', (_id, s) => {
    s.decodable.forEach((w) => expect(canBlend(w, s.soundsSoFar), `${s.id} ${w}`).toBe(true));
    expect(s.games.length).toBeGreaterThanOrEqual(4);
    expect(s.videoGameMechanic.length).toBeGreaterThan(10);
    expect(s.release.length).toBeGreaterThan(10);
  });
});

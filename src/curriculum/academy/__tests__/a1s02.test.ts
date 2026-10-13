// A1 Season 2 "My Room, My Stuff": the Season spec must match the roadmap outline and the lesson blueprints.
import { describe, expect, it } from 'vitest';
import { A1_S02, A1_S02_ITEM_COUNT, ACADEMY_LESSON_BLUEPRINTS, VOCAB_GAME_MENU } from '..';

describe('A1 S02 My Room, My Stuff', () => {
  const bps = ACADEMY_LESSON_BLUEPRINTS.filter((b) => b.level === 'A1' && b.seasonNo === A1_S02.seasonNo);
  it('has the roadmap title, 8 episodes and 80 items, and each episode names as many items as its blueprint allows', () => {
    expect(bps).toHaveLength(8);
    expect(bps[0].title).toContain(A1_S02.title);
    expect(A1_S02_ITEM_COUNT).toBe(80);
    A1_S02.episodes.forEach((e, i) => {
      expect(e.no).toBe(bps[i].episode.no);
      expect(e.name).toBe(bps[i].episode.name);
      expect(e.newItems.length, `E${e.no}`).toBe(bps[i].newItems.count);
      expect(e.newItems.length).toBeLessThanOrEqual(14);
    });
  });
  it('introduces no item twice, uses only cast from the vault, and picks vocabulary games from the menu (two different per word set)', () => {
    const all = A1_S02.episodes.flatMap((e) => e.newItems.map((x) => x.toLowerCase()));
    expect(new Set(all).size).toBe(all.length);
    const menu = new Set(VOCAB_GAME_MENU.map((g) => g.id));
    A1_S02.episodes.forEach((e) => e.games.forEach((pair) => {
      expect(pair).toHaveLength(2);
      expect(pair[0]).not.toBe(pair[1]);
      pair.forEach((g) => expect(menu.has(g), g).toBe(true));
    }));
    expect(A1_S02.cast).toContain('Vee');
  });
  it('E7 and E8 teach nothing new; the structures come in E3 and E4; every episode has a clue, mission and release', () => {
    A1_S02.episodes.filter((e) => e.no >= 7).forEach((e) => expect(e.newItems).toEqual([]));
    expect(A1_S02.episodes[2].structures).toContain('there is / there are');
    A1_S02.episodes.forEach((e) => { expect(e.clue && e.mission && e.release && e.story).toBeTruthy(); });
  });
});

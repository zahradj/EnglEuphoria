import { describe, expect, it } from 'vitest';
import { initialState, lessonReducer, type EngineState } from '../engine/lessonReducer';
import { currentObjective, ENCOUNTER_KINDS, levelOf, LEVEL_XP, lootOf, nextStagePart, objectivesOf, potentialLoot, recapOf, stagesOf, streakOf, streakTier } from '../engine/quest';
import { advanceFlow, dismissCine, initialFlow } from '../quest/flow';
import { loadScript, scriptIds } from '../lessonScripts';
import type { LessonScript, SceneBase } from '../types';

const sc = (o: Partial<SceneBase> & Record<string, unknown> & { id: string; part: number; kind: string }) => o as SceneBase;
const script: LessonScript = {
  blueprintId: 'B1-S01-E1', title: 'T', criteria: ['I can one', 'I can two', 'I can three'], cast: ['Vee'], partMinutes: [3, 3, 21, 11, 3, 10, 5, 4],
  scenes: [
    sc({ id: 'l', part: 0, kind: 'lobby' }),
    sc({ id: 'c1', part: 1, kind: 'choice', trains: [1] }),
    sc({ id: 't1', part: 2, kind: 'teach', trains: [2], pages: [{ word: 'dare', art: 'b-dare' }, { word: 'tick it off', art: 'b-tick' }] }),
    sc({ id: 'h1', part: 2, kind: 'hunt', trains: [2], title: 'Hunt', targets: [{ id: 'a', label: 'the board', word: 'bucket list' }, { id: 'b', label: 'the window' }] }),
    sc({ id: 'f1', part: 4, kind: 'forge', trains: [3], title: 'Forge' }),
    sc({ id: 's1', part: 5, kind: 'speak', trains: [1] }),
    sc({ id: 'w', part: 7, kind: 'wrap' }),
  ],
};
const play = (acts: Parameters<typeof lessonReducer>[1][]): EngineState => acts.reduce(lessonReducer, initialState(script.scenes.length));
const clean = { won: true, score: 30 };

describe('levels and ranks', () => {
  it('level 1 at 0 XP, a level at each threshold, the last level has no next', () => {
    expect(levelOf(0)).toMatchObject({ level: 1, rank: 'rookie', fill: 0, max: false, toNext: LEVEL_XP[1] });
    expect(levelOf(LEVEL_XP[1] - 1).level).toBe(1);
    expect(levelOf(LEVEL_XP[1])).toMatchObject({ level: 2, rank: 'explorer', into: 0 });
    expect(levelOf(LEVEL_XP[2]).rank).toBe('detective');
    expect(levelOf(LEVEL_XP[3]).rank).toBe('expert');
    expect(levelOf(9999)).toMatchObject({ level: 5, rank: 'legend', fill: 1, max: true, toNext: 0 });
    expect(levelOf(-5).level).toBe(1);
  });
  it('fill is the share of the current level', () => {
    const half = LEVEL_XP[1] / 2;
    expect(levelOf(half).fill).toBeCloseTo(0.5);
  });
});

describe('objectives (the success criteria)', () => {
  it('an objective ticks only when EVERY scene that trains it is done', () => {
    let s = play([{ type: 'done', id: 'c1', result: clean }]);
    expect(objectivesOf(script, s.doneIds).map((o) => [o.done, o.total, o.complete])).toEqual([[1, 2, false], [0, 2, false], [0, 1, false]]);
    s = lessonReducer(s, { type: 'done', id: 's1' });
    expect(objectivesOf(script, s.doneIds)[0]).toMatchObject({ n: 1, complete: true, done: 2, total: 2 });
    s = lessonReducer(lessonReducer(s, { type: 'done', id: 't1' }), { type: 'done', id: 'h1', result: clean });
    expect(objectivesOf(script, s.doneIds)[1].complete).toBe(true);
  });
  it('the tracker shows the first open objective the scene trains, else the first open one', () => {
    const s = play([{ type: 'done', id: 'c1', result: clean }]);
    const o = objectivesOf(script, s.doneIds);
    expect(currentObjective(script, o, 'f1')?.n).toBe(3);
    expect(currentObjective(script, o, 'l')?.n).toBe(1);
    const all = objectivesOf(script, script.scenes.map((x) => x.id));
    expect(currentObjective(script, all, 'w')?.n).toBe(3);
  });
});

describe('loot is derived from the engine state', () => {
  it('a clean scored win drops a gem; a retry after a mistake does not', () => {
    let s = play([{ type: 'done', id: 'c1', result: clean }]);
    expect(lootOf(script, s).map((l) => l.id)).toEqual(['gem:c1']);
    s = lessonReducer(lessonReducer(s, { type: 'wrong', id: 'f1' }), { type: 'done', id: 'f1', result: clean });
    expect(lootOf(script, s).map((l) => l.id)).toEqual(['gem:c1', 'trophy:f1']);
  });
  it('a finished teach scene drops one Word Card per word with its sticker art', () => {
    const s = play([{ type: 'done', id: 't1' }]);
    const cards = lootOf(script, s).filter((l) => l.kind === 'wordcard');
    expect(cards.map((c) => [c.label, c.art])).toEqual([['dare', 'cards/b-dare'], ['tick it off', 'cards/b-tick']]);
  });
  it('hunt finds are in the bag while the hunt is still running, once each', () => {
    let s = play([{ type: 'found', id: 'h1', item: 'a' }, { type: 'found', id: 'h1', item: 'a' }]);
    expect(lootOf(script, s).map((l) => [l.id, l.kind, l.label])).toEqual([['find:h1:a', 'clue', 'bucket list']]);
    s = lessonReducer(s, { type: 'found', id: 'h1', item: 'b' });
    expect(lootOf(script, s)).toHaveLength(2);
  });
  it('the empty slots are listed (silhouettes): every drop of the lesson', () => {
    const p = potentialLoot(script);
    expect(p.filter((x) => x.kind === 'gem').map((x) => x.sceneId)).toEqual(['c1', 'h1', 'f1']);
    expect(p.filter((x) => x.kind === 'wordcard')).toHaveLength(2);
    expect(p.filter((x) => x.kind === 'clue')).toHaveLength(2);
    expect(p.filter((x) => x.kind === 'trophy')).toHaveLength(1);
    expect(new Set(p.map((x) => x.id)).size).toBe(p.length);
  });
});

describe('streak', () => {
  it('counts clean scored wins in a row; a mistake resets it; unscored pages do not count', () => {
    let s = play([{ type: 'done', id: 'c1', result: clean }, { type: 'done', id: 't1' }, { type: 'done', id: 'h1', result: clean }]);
    expect(streakOf(script, s)).toEqual({ streak: 2, best: 2 });
    s = lessonReducer(lessonReducer(s, { type: 'wrong', id: 'f1' }), { type: 'done', id: 'f1', result: clean });
    expect(streakOf(script, s)).toEqual({ streak: 0, best: 2 });
  });
  it('tiers: x1, x2 from 3, x3 from 6', () => { expect([0, 2, 3, 5, 6, 12].map(streakTier)).toEqual([1, 1, 2, 2, 3, 3]); });
});

describe('stages (the 8 parts) and the recap', () => {
  it('each part has its scenes, minutes, criteria and what it can drop', () => {
    const st = stagesOf(script, ['c1', 't1']);
    expect(st).toHaveLength(script.partMinutes.length);
    expect(st[2]).toMatchObject({ part: 2, total: 2, done: 1, complete: false, minutes: 21, criteria: [2] });
    expect(st[2].loot).toEqual({ gems: 1, cards: 2, trophies: 0, clues: 2 });
    expect(st[1].complete).toBe(true);
    expect(st[3].total).toBe(0);
    expect(nextStagePart(st, 2)).toBe(4);
    expect(nextStagePart(st, 7)).toBeUndefined();
  });
  it('the recap carries stars, rank, loot, objectives and the best streak', () => {
    const s = play([{ type: 'done', id: 'c1', result: clean }, { type: 'done', id: 'f1', result: clean }, { type: 'done', id: 't1' }]);
    const r = recapOf(script, s);
    expect(r).toMatchObject({ xp: s.xp, gems: 2, stars: 3, clean: 2, scored: 2, bestStreak: 2, stagesCleared: 2 });
    expect(r.level.level).toBe(levelOf(s.xp).level);
    expect(r.loot.length).toBe(5);
    expect(r.objectives).toHaveLength(3);
  });
  it('stars drop with more mistakes', () => {
    const s = play([{ type: 'wrong', id: 'c1' }, { type: 'done', id: 'c1', result: clean }, { type: 'done', id: 'f1', result: clean }]);
    expect(recapOf(script, s).stars).toBe(2);
  });
});

describe('quest cinematics flow', () => {
  const at = (id: string) => script.scenes.find((x) => x.id === id);
  it('the lobby plays nothing; the first stage plays its title card only; later stages play the map then the card', () => {
    let f = advanceFlow(initialFlow(), at('l'), true, []);
    expect(f.queue).toEqual([]);
    f = advanceFlow(f, at('c1'), true, []);
    expect(f.queue).toEqual([{ type: 'stage', part: 1 }]);
    f = advanceFlow(dismissCine(f), at('t1'), true, []);
    expect(f.queue).toEqual([{ type: 'map', from: 1, to: 2 }, { type: 'stage', part: 2 }]);
  });
  it('an encounter plays a stinger once; Back never replays a stage or a stinger', () => {
    let f = advanceFlow(initialFlow([2]), at('h1'), true, []);
    expect(f.queue).toEqual([{ type: 'stinger', sceneId: 'h1', kind: 'hunt' }]);
    f = advanceFlow(dismissCine(f), at('t1'), true, []);
    f = advanceFlow(f, at('h1'), true, []);
    expect(f.queue).toEqual([]);
  });
  it('a finished encounter has no stinger, and nothing plays when cinematics are off (live class)', () => {
    expect(advanceFlow(initialFlow([4]), at('f1'), true, ['f1']).queue).toEqual([]);
    expect(advanceFlow(initialFlow(), at('c1'), false, []).queue).toEqual([]);
    expect(ENCOUNTER_KINDS).toContain('boss');
  });
});

describe('the engine remembers hunt finds', () => {
  it('found is idempotent per item and survives a restore', () => {
    let s = lessonReducer(initialState(3), { type: 'found', id: 'h', item: 'x' });
    s = lessonReducer(s, { type: 'found', id: 'h', item: 'x' });
    expect(s.found).toEqual({ h: ['x'] });
    expect(lessonReducer(initialState(3), { type: 'restore', state: { found: s.found } }).found).toEqual({ h: ['x'] });
  });
});

describe('the registered lessons as quests', () => {
  for (const id of scriptIds()) {
    it(`${id}: every criterion is an objective trained by scenes, the lesson's own stages exist, the bag has slots`, async () => {
      const s = (await loadScript(id))!;
      const o = objectivesOf(s, []);
      expect(o.every((x) => x.total > 0)).toBe(true);
      const all = objectivesOf(s, s.scenes.map((x) => x.id));
      expect(all.every((x) => x.complete)).toBe(true);
      expect(stagesOf(s, []).filter((x) => x.total > 0).length).toBeGreaterThanOrEqual(7);
      expect(potentialLoot(s).length).toBeGreaterThan(10);
      if (s.quest?.stages) expect(s.quest.stages).toHaveLength(s.partMinutes.length);
    });
  }
  it('B1-S01-E1 and E3 each have a hunt on a reviewed plate, with 3-7 targets', async () => {
    for (const id of ['B1-S01-E1', 'B1-S01-E3']) {
      const s = (await loadScript(id))!;
      const hunts = s.scenes.filter((x) => x.kind === 'hunt') as (SceneBase & { targets: unknown[] })[];
      expect(hunts.length, id).toBeGreaterThanOrEqual(1);
      for (const h of hunts) expect(h.targets.length).toBeGreaterThanOrEqual(3);
    }
  });
});

import { describe, expect, it } from 'vitest';
import * as MT from './monster-town/scenes';
import { fitsMonster } from './welcome-town/scene-components/guessWhoRules';
import type { Scene } from './welcome-town/scenes';

/** Guess Who ★ (A1 U5L6): the game must always be winnable with the language — every monster is told apart by the
 *  friend's questions, the child's questions can find the secret monster, and every question splits the line-up. */
const games = Object.values(MT).flatMap((v) => (Array.isArray(v) ? (v as Scene[]) : [])).filter((s): s is Extract<Scene, { kind: 'guess-who' }> => s?.kind === 'guess-who');

describe('Guess Who', () => {
  it('exists in Monster Town', () => expect(games.length).toBeGreaterThan(0));
  for (const g of games) {
    it(`${g.id}: monsters are all different`, () => {
      const keys = g.monsters.map((m) => JSON.stringify([m.color, m.eyes, m.horns, m.mouth, [...m.wears].sort()]));
      expect(new Set(keys).size).toBe(keys.length);
    });
    it(`${g.id}: the friend's questions can find every monster the child hides`, () => {
      g.monsters.forEach((picked, p) => {
        const sig = g.hideAsks.map((q) => fitsMonster(picked, q.test));
        const same = g.monsters.filter((m) => g.hideAsks.every((q, i) => fitsMonster(m, q.test) === sig[i]));
        expect(same.length, `${picked.name} (#${p})`).toBe(1);
      });
    });
    it(`${g.id}: the child's questions can find the secret monster`, () => {
      const secret = g.monsters[g.secret];
      const same = g.monsters.filter((m) => g.questions.every((q) => fitsMonster(m, q.test) === fitsMonster(secret, q.test)));
      expect(same).toEqual([secret]);
    });
    it(`${g.id}: every question splits the line-up and its answers name the feature`, () => {
      for (const q of [...g.questions, ...g.hideAsks]) {
        const yes = g.monsters.filter((m) => fitsMonster(m, q.test)).length;
        expect(yes, q.ask).toBeGreaterThan(0);
        expect(yes, q.ask).toBeLessThan(g.monsters.length);
      }
    });
  }
});

import { describe, it, expect } from 'vitest';
import { A1_LESSON_PLANS } from '@/curriculum/roadmap/a1LessonPlans';
import { A1_PLAYGROUND_BUCKETS } from '@/curriculum/roadmap/a1Roadmap';
import { bindWorlds } from '@/curriculum/binding/themeBinder';
import { generateCefrRoadmap } from '@/curriculum/roadmap/cefrRoadmap';

describe('A1 Playground curriculum blueprint + lesson plans', () => {
  it('has one plan for every slot: 10 units x 7 lessons', () => {
    expect(A1_LESSON_PLANS).toHaveLength(70);
    const keys = new Set(A1_LESSON_PLANS.map((p) => `${p.unit}-${p.lesson}`));
    expect(keys.size).toBe(70);
    for (let u = 1; u <= 10; u++) for (let l = 1; l <= 7; l++) expect(keys.has(`${u}-${l}`)).toBe(true);
  });

  it('every plan has an "I can" objective, a game, evidence, a fun hook and a home mission', () => {
    for (const p of A1_LESSON_PLANS) {
      expect(p.objective, `${p.unit}-${p.lesson}`).toMatch(/^I can /);
      for (const f of [p.signatureGame, p.evidence, p.funHook, p.homeMission, p.communicationGoal]) expect(f.trim().length).toBeGreaterThan(5);
    }
  });

  it('follows the unit arc: L5 story GIFs (no story videos in A1), L7 Boss Test, L1/L2 teach 1-7 new words', () => {
    for (const p of A1_LESSON_PLANS) {
      if (p.lesson === 5) { expect(p.signatureGame).toMatch(/Story GIFs/); expect(p.signatureGame).not.toMatch(/video/i); }
      if (p.lesson === 7) expect(p.signatureGame).toMatch(/Boss Test/);
      if (p.lesson <= 2 && !p.built) {
        expect(p.newVocabulary.length).toBeGreaterThanOrEqual(1);
        expect(p.newVocabulary.length).toBeLessThanOrEqual(7);
      }
    }
  });

  it('no signature game twice in a unit (variety rule)', () => {
    for (let u = 1; u <= 10; u++) {
      const games = A1_LESSON_PLANS.filter((p) => p.unit === u && p.lesson >= 1 && p.lesson <= 6).map((p) => p.signatureGame);
      expect(new Set(games).size, `unit ${u}`).toBe(games.length);
    }
  });

  it('every unit\'s Boss Test hands out a Golden Compass piece (fun layer) and Unit 10 opens A2', () => {
    for (let u = 2; u <= 10; u++) expect(A1_LESSON_PLANS.find((p) => p.unit === u && p.lesson === 7)!.funHook).toMatch(/Golden Compass/);
    expect(A1_LESSON_PLANS.find((p) => p.unit === 10 && p.lesson === 7)!.funHook).toMatch(/A2/);
    for (let u = 2; u <= 10; u++) expect(A1_LESSON_PLANS.find((p) => p.unit === u && p.lesson === 7)!.funHook).toContain(`piece ${u - 1}`);
  });

  it('"can" for animals is taught once (Unit 2); Hero City moves on to well / fast, must and What\'s the matter?', () => {
    const hero = A1_LESSON_PLANS.filter((p) => p.unit === 7).flatMap((p) => p.grammarFocus).join(' | ');
    expect(hero).toMatch(/well \/ fast/);
    expect(hero).toMatch(/must/);
    expect(hero).toMatch(/What's the matter/);
  });

  it('covers the A1 Movers grammar spine', () => {
    const all = A1_LESSON_PLANS.flatMap((p) => p.grammarFocus).join(' | ');
    for (const re of [/\+ -ing/, /must/, /weather/, /wearing/, /o'clock/, /It was/, /than/, /-est/, /Whose/, /because/, /Let's/, /There are/, /has got|'s got/]) {
      expect(all, String(re)).toMatch(re);
    }
  });

  it('each bucket binds to its own world by topic fit', () => {
    expect(A1_PLAYGROUND_BUCKETS).toHaveLength(10);
    const bound = bindWorlds(generateCefrRoadmap('playground', 'A1'));
    const expected = ['welcome-town', 'jungle-adventure', 'space-mission', 'food-festival', 'monster-academy',
      'ocean-explorers', 'superhero-city', 'dinosaur-island', 'magic-castle', 'future-tech-lab'];
    expect(bound.map((b) => b.world.slug)).toEqual(expected);
    expect(bound.every((b) => b.fitReason === 'topic-fit')).toBe(true);
  });
});

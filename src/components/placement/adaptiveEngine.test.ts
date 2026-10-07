import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  applyAdaptiveAnswer,
  configFor,
  initAdaptiveState,
  itemTheta,
  nextAdaptiveItem,
  shouldStopAdaptive,
  summarizeAdaptive,
  shuffledOrder,
  thetaToCefr,
  type AdaptiveState,
} from './adaptiveEngine';
import { getHubPool, type Hub } from './questionBanks';

const HUBS: Hub[] = ['playground', 'academy', 'professional'];
/** The two hubs with a full reviewed bank and a 20-36 question test. */
const FULL_HUBS: Hub[] = ['academy', 'professional'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;

describe('placement test starts low and climbs, never at B1', () => {
  it.each(HUBS)('%s: the first question is A1 or A2 and among the easiest', (hub) => {
    const pool = getHubPool(hub);
    const first = nextAdaptiveItem(pool, hub, initAdaptiveState(hub));
    expect(first).not.toBeNull();
    expect(['A1', 'A2']).toContain(first!.item.targetLevel);
    expect(first!.item.difficulty).toBeLessThanOrEqual(0.45);
  });

  it('Academy starts at A1; the Success Hub (working adults) starts at A2', () => {
    const ac = nextAdaptiveItem(getHubPool('academy'), 'academy', initAdaptiveState('academy'));
    const su = nextAdaptiveItem(getHubPool('professional'), 'professional', initAdaptiveState('professional'));
    expect(ac!.item.targetLevel).toBe('A1');
    expect(su!.item.targetLevel).toBe('A2');
  });

  it.each(FULL_HUBS)('%s: a student who keeps answering correctly climbs through the levels in order', (hub) => {
    const pool = getHubPool(hub);
    let state = initAdaptiveState(hub);
    const seen: string[] = [];
    for (let i = 0; i < 16; i++) {
      const next = nextAdaptiveItem(pool, hub, state);
      if (!next) break;
      seen.push(next.item.targetLevel);
      state = applyAdaptiveAnswer(state, next.item, next.index, hub, true);
    }
    expect(seen).toContain('A2');
    expect(seen).toContain('B1');
    expect(seen.indexOf('A2')).toBeLessThan(seen.indexOf('B1'));
    expect(LEVELS.indexOf(seen[seen.length - 1] as (typeof LEVELS)[number])).toBeGreaterThanOrEqual(LEVELS.indexOf('B2'));
  });
});

describe('answers are weighed honestly', () => {
  const hub: Hub = 'academy';
  const pool = getHubPool(hub);
  const b2 = pool.findIndex((q) => q.targetLevel === 'B2');

  it('"I am not sure" counts as wrong even if the option behind it happened to be right', () => {
    const base = initAdaptiveState(hub);
    const wrong = applyAdaptiveAnswer(base, pool[b2], b2, hub, false);
    const unsureButRight = applyAdaptiveAnswer(base, pool[b2], b2, hub, true, { unsure: true });
    expect(unsureButRight.theta).toBeCloseTo(wrong.theta, 6);
    expect(unsureButRight.hasIncorrect).toBe(true);
  });

  it('a lucky correct answer on a far-too-hard item moves the estimate only a little', () => {
    const base = initAdaptiveState(hub);
    const lucky = applyAdaptiveAnswer(base, pool[b2], b2, hub, true);
    expect(lucky.theta).toBeLessThan(0.6);
    expect(thetaToCefr(lucky.theta)).not.toBe('B2');
  });

  it('a fast correct answer earns less credit than a normal one', () => {
    const base = initAdaptiveState(hub);
    const normal = applyAdaptiveAnswer(base, pool[b2], b2, hub, true);
    const fast = applyAdaptiveAnswer(base, pool[b2], b2, hub, true, { fast: true });
    expect(fast.theta).toBeLessThan(normal.theta);
  });
});

describe.each(FULL_HUBS)('%s question bank', (hub) => {
  const pool = getHubPool(hub);
  it('is big enough for a 20-36 question test with fresh draws', () => {
    expect(pool.length).toBeGreaterThanOrEqual(70);
  });
  it('has items at every level', () => {
    const min: Record<string, number> = { A1: 3, A2: 6, B1: 6, B2: 6, C1: 6 };
    for (const lv of LEVELS) expect(pool.filter((q) => q.targetLevel === lv).length, lv).toBeGreaterThanOrEqual(min[lv]);
  });
  it('every item is well formed and its difficulty agrees with its level tag', () => {
    const band: Record<string, [number, number]> = { A1: [0.05, 0.27], A2: [0.27, 0.5], B1: [0.48, 0.68], B2: [0.66, 0.86], C1: [0.85, 1] };
    for (const q of pool) {
      expect(q.options.length, q.question).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(new Set(q.options).size, q.question).toBe(4);
      const [lo, hi] = band[q.targetLevel];
      expect(q.difficulty, q.question).toBeGreaterThanOrEqual(lo);
      expect(q.difficulty, q.question).toBeLessThanOrEqual(hi);
    }
  });
  it('every item has a unique id', () => {
    const ids = pool.map((q) => q.id);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(pool.length);
  });
  it('is written in American English (no British spellings or words)', () => {
    const banned = /(grey|cinema|colour|favourite|neighbour|neighbouring|\bmum\b|\bfilm\b|football|\bmaths\b|whilst|autumn|centre|realise|organise|car park|\btender\b|shall I|take a decision)/i;
    for (const q of pool) {
      const text = [q.question, ...q.options, q.readingPassage ?? '', q.audio_script ?? ''].join(' ');
      expect(text, q.id).not.toMatch(banned);
    }
  });
  it('listening items have a script and reading items have a passage', () => {
    for (const q of pool) {
      if (q.type === 'listening_match') expect(q.audio_script, q.id).toBeTruthy();
      if (q.skill === 'reading') expect(q.readingPassage, q.id).toBeTruthy();
    }
  });
  it('covers listening, reading and the skills the hub reports', () => {
    const skills = new Set(pool.map((q) => q.skill));
    for (const s of ['listening', 'reading']) expect(skills.has(s as never), s).toBe(true);
    expect(pool.filter((q) => q.skill === 'listening').length).toBeGreaterThanOrEqual(8);
    expect(pool.filter((q) => q.skill === 'reading').length).toBeGreaterThanOrEqual(8);
  });
  it('fixed-order items (times, numbers) are listed in their natural order', () => {
    for (const q of pool.filter((x) => x.fixedOrder)) {
      const nums = q.options.map((o) => Number(o.replace(':', '.')));
      if (nums.every((n) => !Number.isNaN(n))) expect(nums, q.id).toEqual([...nums].sort((a, b) => a - b));
    }
  });
});

describe('options are shown in a shuffled order', () => {
  it('the position of the right answer cannot be learned', () => {
    const rand = mulberry32(7);
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < 4000; i++) counts[shuffledOrder(4, rand).indexOf(1)]++;
    for (const c of counts) expect(c / 4000).toBeGreaterThan(0.2);
    expect([...shuffledOrder(4)].sort()).toEqual([0, 1, 2, 3]);
  });
});

// ---- Simulation: how accurate is the placement on made-up students whose true level we know?
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  return Math.sqrt(-2 * Math.log(Math.max(1e-9, rand()))) * Math.cos(2 * Math.PI * rand());
}

function simulate(hub: Hub, trueTheta: number, rand: () => number, opts: { tagNoise: number; slip: number }) {
  const pool = getHubPool(hub);
  // The true difficulty of each item differs from its author's tag (hand tagging is imperfect).
  const trueD = pool.map((q) => itemTheta(q) + gauss(rand) * opts.tagNoise);
  let state: AdaptiveState = initAdaptiveState(hub);
  let n = 0;
  for (;;) {
    const next = nextAdaptiveItem(pool, hub, state);
    if (!next) break;
    // 20% chance of guessing right, plus the ability curve; and a careless slip some of the time.
    const p = 0.2 + 0.8 / (1 + Math.exp(-(trueTheta - trueD[next.index])));
    let correct = rand() < p;
    if (correct && rand() < opts.slip) correct = false;
    state = applyAdaptiveAnswer(state, next.item, next.index, hub, correct);
    n++;
    if (shouldStopAdaptive(state, hub)) break;
  }
  return { n, summary: summarizeAdaptive(state, hub) };
}

describe.each(FULL_HUBS)('%s placement accuracy (simulated students, imperfect item tags)', (hub) => {
  const rand = mulberry32(20261007);
  // True ability at the middle of each level's band.
  const centres: Record<string, number> = { A1: -2.4, A2: -0.75, B1: 0.55, B2: 1.6, C1: 2.6 };
  const runs = 60;
  const results: Record<string, { exact: number; within1: number; avgItems: number; maxItems: number }> = {};

  for (const lv of LEVELS) {
    it(`places simulated ${lv} students correctly or one level off at most`, () => {
      let exact = 0;
      let within1 = 0;
      let items = 0;
      let maxItems = 0;
      for (let i = 0; i < runs; i++) {
        const trueTheta = centres[lv] + gauss(rand) * 0.35;
        const { summary, n } = simulate(hub, trueTheta, rand, { tagNoise: 0.5, slip: 0.05 });
        const placed = LEVELS.indexOf(summary.cefr);
        const truth = LEVELS.indexOf(thetaToCefr(trueTheta));
        if (placed === truth) exact++;
        if (Math.abs(placed - truth) <= 1) within1++;
        items += n;
        maxItems = Math.max(maxItems, n);
      }
      results[lv] = { exact: exact / runs, within1: within1 / runs, avgItems: Math.round((items / runs) * 10) / 10, maxItems };
      // The Success bank has only a few A1 items (it places A2-C1 adults; below A2 is a teacher conversation).
      expect(within1 / runs).toBeGreaterThanOrEqual(hub === 'professional' && lv === 'A1' ? 0.7 : 0.9);
      expect(exact / runs).toBeGreaterThanOrEqual(hub === 'professional' && lv === 'A1' ? 0.3 : 0.45);
      expect(maxItems).toBeLessThanOrEqual(configFor(hub).maxItems);
      expect(items / runs).toBeGreaterThanOrEqual(configFor(hub).minItems);
    });
  }

  it('reports the numbers', () => {
    if (process.env.SIM_OUT) fs.writeFileSync(`${process.env.SIM_OUT}.${hub}.json`, JSON.stringify(results, null, 1));
    expect(Object.keys(results).length).toBe(5);
  });
});

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { KIDS_BANK, KIDS_LISTEN, KIDS_LITERACY, KIDS_PRACTICE, KIDS_LITERACY_PRACTICE, KIDS_SCRIPT, type KidsItem, type KidsOption } from './kidsBank';
import {
  applyAnswer, initStage, listenBandOf, literacyStageOf, nextItem, placeChild, shouldStopStage, summarizeKids, toTheta,
  LISTEN_CUTS, LITERACY_CUTS, STAGE_CONFIG, type StageState,
} from './kidsEngine';

const ROOT = process.cwd();
const sources = (o: KidsOption): string[] => {
  if (o.kind === 'img' || o.kind === 'count') return [o.src];
  if (o.kind === 'pair') return [...o.srcs];
  if (o.kind === 'scene') return [o.scene.subject, ...(o.scene.extra ? [o.scene.extra.src] : [])];
  return [];
};

describe('Playground placement bank (ages 4-9)', () => {
  const all: KidsItem[] = [...KIDS_PRACTICE, KIDS_LITERACY_PRACTICE, ...KIDS_BANK];

  it('is big enough for two adaptive ladders', () => {
    expect(KIDS_LISTEN.length).toBeGreaterThanOrEqual(35);
    expect(KIDS_LITERACY.length).toBeGreaterThanOrEqual(20);
  });
  it('has unique ids', () => {
    const ids = all.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every item has a spoken line, 2-3 options and a valid key', () => {
    for (const q of all) {
      expect(q.line.length, q.id).toBeGreaterThan(5);
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(2);
      expect(q.options.length, q.id).toBeLessThanOrEqual(3);
      expect(q.correct, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correct, q.id).toBeLessThan(q.options.length);
    }
  });
  it('the listening section needs NO reading: no words, sentences or letters on screen', () => {
    for (const q of KIDS_LISTEN) {
      expect(q.shown === undefined || q.shown.kind === 'picture' || q.shown.kind === 'scene', q.id).toBe(true);
      expect(q.options.some((o) => o.kind === 'letter'), q.id).toBe(false);
    }
  });
  it('the literacy section never reads the answer aloud (words and sentences are only shown)', () => {
    for (const q of KIDS_LITERACY.filter((x) => x.shown && (x.shown.kind === 'word' || x.shown.kind === 'sentence'))) {
      const text = (q.shown as { text: string }).text.toLowerCase().replace(/[.]/g, '');
      expect(q.line.toLowerCase(), q.id).not.toContain(text);
    }
  });
  it('letter items use the real recorded letter clips', () => {
    for (const q of KIDS_LITERACY.filter((x) => x.clip)) expect(/^[a-z]$/.test(q.clip!.letter), q.id).toBe(true);
  });
  it('every picture exists as a saved file (nothing is generated)', () => {
    const missing: string[] = [];
    for (const q of all) {
      const srcs = [...q.options.flatMap(sources), ...(q.shown && q.shown.kind === 'picture' ? [q.shown.src] : []), ...(q.shown && q.shown.kind === 'scene' ? [q.shown.scene.subject] : [])];
      for (const s of srcs) if (!fs.existsSync(path.join(ROOT, 'public', s))) missing.push(`${q.id}: ${s}`);
    }
    expect(missing).toEqual([]);
  });
  it('difficulty agrees with the level and section', () => {
    const band: Record<string, [number, number]> = { 'Pre-A1': [0.04, 0.32], A1: [0.3, 0.56], A2: [0.55, 0.82] };
    for (const q of KIDS_BANK) {
      const [lo, hi] = band[q.level];
      expect(q.difficulty, q.id).toBeGreaterThanOrEqual(lo);
      expect(q.difficulty, q.id).toBeLessThanOrEqual(hi);
    }
  });
  it('spread of levels: each listening level and each literacy step has items', () => {
    for (const lv of ['Pre-A1', 'A1', 'A2']) expect(KIDS_LISTEN.filter((q) => q.level === lv).length, lv).toBeGreaterThanOrEqual(6);
    expect(KIDS_LITERACY.filter((q) => q.topic.startsWith('letter')).length).toBeGreaterThanOrEqual(6);
    expect(KIDS_LITERACY.filter((q) => q.topic === 'read a word').length).toBeGreaterThanOrEqual(6);
    expect(KIDS_LITERACY.filter((q) => q.topic === 'read a sentence').length).toBeGreaterThanOrEqual(5);
  });
  it('the right answer position is spread out', () => {
    const counts = [0, 0, 0];
    for (const q of KIDS_BANK.filter((x) => x.options.length === 3)) counts[q.correct]++;
    for (const c of counts) expect(c).toBeGreaterThanOrEqual(8);
  });
  it('has the spoken script lines', () => {
    expect(Object.values(KIDS_SCRIPT).every((t) => t.length > 10)).toBe(true);
  });
});

describe('placement rule', () => {
  it('A1 needs understanding AND first reading; A2 needs sentences too', () => {
    expect(placeChild('Pre-A1', 'none')).toBe('Pre-A1');
    expect(placeChild('A1', 'letters')).toBe('Pre-A1');
    expect(placeChild('A1', 'words')).toBe('A1');
    expect(placeChild('A2', 'words')).toBe('A1');
    expect(placeChild('A2', 'sentences')).toBe('A2');
    expect(placeChild('Pre-A1', 'sentences')).toBe('Pre-A1');
  });
  it('band edges follow the item scale', () => {
    expect(listenBandOf(LISTEN_CUTS[0] - 0.1)).toBe('Pre-A1');
    expect(listenBandOf(LISTEN_CUTS[0] + 0.1)).toBe('A1');
    expect(listenBandOf(LISTEN_CUTS[1] + 0.1)).toBe('A2');
    expect(literacyStageOf(LITERACY_CUTS[0] - 0.1)).toBe('none');
    expect(literacyStageOf(LITERACY_CUTS[2] + 0.1)).toBe('sentences');
  });
});

// ---- Simulation: made-up children whose true listening and literacy ability we know
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(2 * Math.PI * r());

function runStage(stage: 'listen' | 'literacy', ability: number, rand: () => number, noise: number, listenTheta?: number): StageState {
  let st = initStage(stage, listenTheta);
  const trueD = new Map(KIDS_BANK.map((q) => [q.id, toTheta(q.difficulty) + gauss(rand) * noise]));
  for (;;) {
    const item = nextItem(KIDS_BANK, st);
    if (!item) break;
    const floor = item.options.length <= 2 ? 0.5 : 1 / 3;
    const p = floor + (1 - floor) / (1 + Math.exp(-(ability - trueD.get(item.id)!)));
    let correct = rand() < p;
    if (correct && rand() < 0.04) correct = false; // a careless slip
    st = applyAnswer(st, item, correct);
    if (shouldStopStage(st, KIDS_BANK)) break;
  }
  return st;
}

describe('placement accuracy on simulated children (imperfect item difficulties, guessing, slips)', () => {
  // [name, true listening theta, true literacy theta, expected level]
  const profiles: [string, number, number, 'Pre-A1' | 'A1' | 'A2'][] = [
    ['knows almost no English', -2.6, -2.6, 'Pre-A1'],
    ['knows words, no letters yet', -1.8, -2.4, 'Pre-A1'],
    ['understands phrases, knows letters', -0.5, -1.0, 'Pre-A1'],
    ['A1: understands, reads words', -0.45, -0.05, 'A1'],
    ['A1: understands more, reads words', -0.2, 0.2, 'A1'],
    ['A2: understands and reads sentences', 1.2, 1.2, 'A2'],
  ];
  const runs = 50;
  const report: Record<string, unknown> = {};
  for (const [name, tl, tr, expected] of profiles) {
    it(`places "${name}" as ${expected} (mostly) and never two levels away`, () => {
      const rand = mulberry32(31415 + Math.round(tl * 100));
      let exact = 0, off2 = 0, items = 0, maxItems = 0, wrongUnflagged = 0;
      const rank = { 'Pre-A1': 0, A1: 1, A2: 2 } as const;
      for (let i = 0; i < runs; i++) {
        const l = runStage('listen', tl + gauss(rand) * 0.25, rand, 0.4);
        const r = runStage('literacy', tr + gauss(rand) * 0.25, rand, 0.4, l.theta);
        const sum = summarizeKids(l, r);
        if (sum.cefr === expected) exact++;
        else if (!sum.borderline) wrongUnflagged++;
        if (Math.abs(rank[sum.cefr] - rank[expected]) >= 2) off2++;
        const n = l.answeredIds.length + r.answeredIds.length;
        items += n; maxItems = Math.max(maxItems, n);
      }
      report[name] = { exact: exact / runs, off2: off2 / runs, wrongAndNotFlagged: wrongUnflagged / runs, avgItems: Math.round((items / runs) * 10) / 10, maxItems };
      // children near a level boundary are the hard cases: they are flagged 'borderline' for the teacher to confirm in lesson 1
      expect(off2 / runs).toBeLessThanOrEqual(0.08);
      expect(exact / runs).toBeGreaterThanOrEqual(expected === 'Pre-A1' ? 0.75 : 0.4);
      expect(wrongUnflagged / runs).toBeLessThanOrEqual(0.3);
      expect(maxItems).toBeLessThanOrEqual(STAGE_CONFIG.listen.maxItems + STAGE_CONFIG.literacy.maxItems);
    });
  }
  it('reports the numbers', () => {
    if (process.env.SIM_OUT) fs.writeFileSync(`${process.env.SIM_OUT}.kids.json`, JSON.stringify(report, null, 1));
    expect(Object.keys(report).length).toBe(profiles.length);
  });
});

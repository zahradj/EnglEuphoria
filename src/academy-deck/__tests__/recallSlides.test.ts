import { describe, expect, it } from 'vitest';
import { ACADEMY_RECALL_NODES, PRE_A1_RECALL_NODES, recallPlan } from '../../curriculum/academy';
import { dueItems, recallRounds } from '../recallSlides';

describe('recallSlides: the Remember? game is built from the recall plan', () => {
  it('takes one item from each earlier lesson in turn, so every gap is represented', () => {
    const plan = recallPlan(PRE_A1_RECALL_NODES, 'PA1-S02-E1', 8)!;
    const items = dueItems(PRE_A1_RECALL_NODES, 'PA1-S02-E1', 3, 8);
    expect(items).toEqual(plan.due.slice(0, 3).map((d) => d.items[0]));
  });
  it('builds rounds whose options contain the answer and never repeat an option', () => {
    const id = ACADEMY_RECALL_NODES[40].id;
    const rounds = recallRounds(ACADEMY_RECALL_NODES, id, 6);
    expect(rounds.length).toBeGreaterThanOrEqual(4);
    rounds.forEach((r) => { expect(r.options).toContain(r.answer); expect(new Set(r.options).size).toBe(r.options.length); });
  });
  it('the first lesson of a track has nothing to remember', () => {
    expect(recallRounds(ACADEMY_RECALL_NODES, ACADEMY_RECALL_NODES[0].id, 5)).toEqual([]);
    expect(dueItems(ACADEMY_RECALL_NODES, 'no-such-lesson', 5)).toEqual([]);
  });
});

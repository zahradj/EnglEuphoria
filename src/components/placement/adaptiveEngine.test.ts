import { describe, expect, it } from 'vitest';
import { applyAdaptiveAnswer, initAdaptiveState, nextAdaptiveItem, START_THETA } from './adaptiveEngine';
import { getHubPool, type Hub } from './questionBanks';

const HUBS: Hub[] = ['playground', 'academy', 'professional'];

describe('placement test starts at the bottom, not at B1', () => {
  it.each(HUBS)('%s: the first question is among the easiest in the pool', (hub) => {
    const pool = getHubPool(hub);
    const first = nextAdaptiveItem(pool, hub, initAdaptiveState());
    expect(first).not.toBeNull();
    const easiest = Math.min(...pool.map((q) => q.difficulty));
    expect(first!.item.difficulty).toBeLessThanOrEqual(easiest + 0.15);
    expect(['A1', 'A2']).toContain(first!.item.targetLevel);
  });

  it('Academy: a student who keeps answering correctly climbs A1 -> A2 -> B1 and beyond', () => {
    const hub: Hub = 'academy';
    const pool = getHubPool(hub);
    let state = initAdaptiveState();
    expect(state.theta).toBe(START_THETA);
    const seen: string[] = [];
    for (let i = 0; i < 12; i++) {
      const next = nextAdaptiveItem(pool, hub, state);
      if (!next) break;
      seen.push(next.item.targetLevel);
      state = applyAdaptiveAnswer(state, next.item, next.index, hub, true);
    }
    expect(seen[0]).toBe('A1');
    expect(seen).toContain('A2');
    expect(seen).toContain('B1');
    expect(seen.indexOf('A1')).toBeLessThan(seen.indexOf('B1'));
  });
});

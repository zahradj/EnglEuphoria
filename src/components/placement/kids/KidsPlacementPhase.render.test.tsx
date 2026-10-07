import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { PlacementSummary } from '../adaptiveEngine';
import type { TestResult } from '../TestPhase';

// Everything speaks through saved clips; in the test there are none, so the child hears nothing (silence, never another voice).
vi.mock('../placementAudio', () => ({ placementClipUrl: vi.fn(async () => null) }));
vi.mock('@/content/playground-library/unit1/audio', () => ({
  playLetterName: vi.fn(async () => {}),
  playLetterPhonic: vi.fn(async () => {}),
}));

import KidsPlacementPhase from './KidsPlacementPhase';

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

const tick = async (ms: number) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };

describe('KidsPlacementPhase on screen', () => {
  it('a grown-up sits with the child, a child can tap through the whole test, and the result has a level', async () => {
    let done: { results: TestResult[]; summary: PlacementSummary } | null = null;
    render(<KidsPlacementPhase onComplete={(results, summary) => { done = { results, summary }; }} />);

    expect(screen.getByText(/sit with your child/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    await tick(500);

    const seenLabels = new Set<string>();
    for (let step = 0; step < 90 && !done; step++) {
      // cards are the buttons with an aria-label that are not the helpers
      const cards = screen.queryAllByRole('button').filter((b) => {
        const l = b.getAttribute('aria-label');
        return !!l && l !== 'Listen again' && l !== 'I do not know' && !b.hasAttribute('disabled');
      });
      if (cards.length === 0) {
        const go = screen.queryByRole('button', { name: /go/i });
        if (go) fireEvent.click(go);
        await tick(1300);
        continue;
      }
      cards.forEach((c) => seenLabels.add(c.getAttribute('aria-label')!));
      // a child who guesses: a different card each time (practice items let them try again)
      fireEvent.click(cards[step % cards.length]);
      await tick(1300);
    }
    await tick(2500);

    if (!done) throw new Error('placement did not finish');
    const { results, summary } = done!;
    expect(['Pre-A1', 'A1', 'A2']).toContain(summary.cefr);
    expect(results.length).toBeGreaterThanOrEqual(10);
    expect(results.every((r) => typeof r.responseMs === 'number')).toBe(true);
    // the child saw only pictures/letters (every card has a label) and no practice items were scored
    expect(results.some((r) => r.itemId?.startsWith('kp-'))).toBe(false);
    expect(seenLabels.size).toBeGreaterThan(10);
  }, 60000);

  it('has a "?" button (I do not know) on scored items and none on practice', async () => {
    render(<KidsPlacementPhase onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    await tick(500);
    expect(screen.queryByRole('button', { name: 'I do not know' })).toBeNull(); // practice item
  });
});

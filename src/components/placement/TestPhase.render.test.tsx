import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import type { PlacementSummary } from './adaptiveEngine';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, d?: unknown) => (typeof d === 'string' ? d : k) }),
}));
vi.mock('sonner', () => ({ toast: { message: vi.fn(), error: vi.fn(), success: vi.fn() } }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {}, supabaseUrl: '', supabaseAnonKey: '' }));
vi.mock('@/components/ui/VocabularyImage', () => ({ VocabularyImage: () => null }));
vi.mock('./placementAudio', () => ({ placementClipUrl: vi.fn(async () => null) }));
// The typewriter is cosmetic: finish instantly so the test is fast.
vi.mock('./TypewriterText', async () => {
  const React = await import('react');
  return {
    default: ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
      React.useEffect(() => { onComplete?.(); }, []);
      return React.createElement('span', null, text);
    },
  };
});

import TestPhase, { type TestResult } from './TestPhase';

// jsdom has no element scrolling.
(Element.prototype as unknown as { scrollTo: () => void }).scrollTo = () => {};

async function playThrough(hub: 'academy' | 'playground') {
  let done: { results: TestResult[]; summary: PlacementSummary } | null = null;
  render(<TestPhase age={hub === 'academy' ? 14 : 7} hub={hub} onComplete={(results, summary) => { done = { results, summary }; }} />);

  for (let step = 0; step < 80 && !done; step++) {
    await waitFor(() => {
      if (done) return;
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
    }, { timeout: 4000 });
    if (done) break;
    const listen = screen.queryByLabelText('Play listening prompt');
    if (listen) fireEvent.click(listen);
    const options = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-label') !== 'Play listening prompt' && !/not sure/i.test(b.textContent ?? '') && !b.hasAttribute('disabled'));
    if (options.length === 0) { await new Promise((r) => setTimeout(r, 50)); continue; }
    fireEvent.click(options[0]);
    await new Promise((r) => setTimeout(r, 30));
  }
  await waitFor(() => expect(done).not.toBeNull(), { timeout: 5000 });
  return done!;
}

describe('TestPhase (Academy) on screen', () => {
  it('offers "I\'m not sure", hides the level badge, and finishes with a summary', async () => {
    const { results, summary } = await playThrough('academy');
    expect(screen.queryByText('A1')).toBeNull();
    expect(results.length).toBeGreaterThanOrEqual(20);
    expect(results.length).toBeLessThanOrEqual(36);
    expect(summary.itemsAnswered).toBe(results.length);
    expect(['A1', 'A2', 'B1', 'B2', 'C1']).toContain(summary.cefr);
    expect(results.every((r) => typeof r.responseMs === 'number')).toBe(true);
  }, 120000);
});

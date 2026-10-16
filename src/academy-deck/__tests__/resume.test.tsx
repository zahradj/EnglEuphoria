// Resume (2026-10-16): a student working alone can pick the lesson up after a reload; a teacher preview or live class never saves or asks.
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Deck } from '../Deck';
import { B1_S01_E1 } from '../lessons/b1s01e1';

const script = B1_S01_E1;
const key = `academy-deck-progress-v1:${script.lessonId}`;

describe('Deck resume', () => {
  it('offers to continue after a reload and restores the slide', () => {
    window.localStorage.setItem(key, JSON.stringify({ index: 3, slideId: script.slides[3].id, solved: {}, vars: {}, stamps: [], stats: { right: 2, wrong: 0, hints: 0, skipped: [] } }));
    render(<Deck script={script} />);
    expect(screen.getByRole('dialog', { name: /continue the lesson/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/^4\/\d+$/)).toBeInTheDocument();
  });
  it('Start over forgets it, and a changed lesson is not resumed', () => {
    window.localStorage.setItem(key, JSON.stringify({ index: 3, slideId: script.slides[3].id, solved: {}, vars: {}, stamps: [], stats: { right: 0, wrong: 0, hints: 0, skipped: [] } }));
    render(<Deck script={script} />);
    fireEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(window.localStorage.getItem(key)).toBeNull();
    window.localStorage.setItem(key, JSON.stringify({ index: 3, slideId: 'not-a-slide', solved: {}, vars: {}, stamps: [], stats: { right: 0, wrong: 0, hints: 0, skipped: [] } }));
    render(<Deck script={script} />);
    expect(screen.queryByRole('dialog', { name: /continue the lesson/i })).toBeNull();
  });
  it('a teacher preview never asks', () => {
    window.localStorage.setItem(key, JSON.stringify({ index: 3, slideId: script.slides[3].id, solved: {}, vars: {}, stamps: [], stats: { right: 0, wrong: 0, hints: 0, skipped: [] } }));
    render(<Deck script={script} teacher />);
    expect(screen.queryByRole('dialog', { name: /continue the lesson/i })).toBeNull();
  });
});

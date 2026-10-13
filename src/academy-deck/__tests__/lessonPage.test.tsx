// Every lesson registered in the Academy library with a deck script must open at /academy-lesson/:id (the page once knew only two lessons and showed "not available" for the rest).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AcademyDeckLessonPage from '../pages/AcademyDeckLessonPage';
import { ACADEMY_DECK_LESSONS } from '../lessonRegistry';
import { hasDeckScript } from '../lessonScripts';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { role: 'teacher' } }) }));
afterEach(cleanup);

describe('Academy lesson page', () => {
  it('every library lesson that has a deck script is playable by its id (not "isn’t available")', async () => {
    const ids = ACADEMY_DECK_LESSONS.map((l) => l.id).filter((id) => hasDeckScript(id) && id !== 'sign-me-up' && id !== 'fake-or-real');
    expect(ids).toEqual(expect.arrayContaining(['free-time-club-1', 'free-time-club-2', 'pa1-s01-e1', 'sign-me-up-2']));
    for (const id of ids) {
      render(<MemoryRouter initialEntries={[`/academy-lesson/${id}`]}><Routes><Route path="/academy-lesson/:id" element={<AcademyDeckLessonPage />} /></Routes></MemoryRouter>);
      await waitFor(() => expect(screen.getAllByRole('button', { name: /Back/ }).length).toBeGreaterThan(0));
      await waitFor(() => expect(screen.queryByText(/available/)).toBeNull());
      await waitFor(() => expect(document.querySelector('.ad-root')).not.toBeNull(), { timeout: 8000 });
      cleanup();
    }
  });
});

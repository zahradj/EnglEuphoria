import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/services/lessonLibraryService', () => ({
  extractClassroomSlides: vi.fn(() => []),
  getLibraryLessonSlides: vi.fn(() => []),
  getLibraryLessons: vi.fn().mockResolvedValue([]),
  getLessonById: vi.fn(),
  toLibraryLessonCard: vi.fn((x: unknown) => x),
}));

import LibraryDrawer from '../LibraryDrawer';
import { ACADEMY_GAMES } from '@/academy-games/academyGamesCatalog';

describe('Classroom Lesson Library: Academy Game Library', () => {
  it('Academy hub with a game handler: a Games tab lists every Academy game and picking one calls the handler', async () => {
    const onSelectAcademyGame = vi.fn();
    const onSelectLesson = vi.fn();
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={onSelectLesson} onSelectAcademyGame={onSelectAcademyGame} hubFilter="academy" />);
    fireEvent.click(await screen.findByRole('tab', { name: new RegExp(`^Games · ${ACADEMY_GAMES.length}`) }));
    for (const g of ACADEMY_GAMES) expect(await screen.findByText(g.title)).toBeTruthy();
    fireEvent.click(screen.getByText('Time Hop'));
    expect(onSelectAcademyGame).toHaveBeenCalledWith('time-hop', 'Time Hop');
    expect(onSelectLesson).not.toHaveBeenCalled();
  });

  it('search narrows the games', async () => {
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={vi.fn()} onSelectAcademyGame={vi.fn()} hubFilter="academy" />);
    fireEvent.click(await screen.findByRole('tab', { name: /^Games/ }));
    fireEvent.change(await screen.findByPlaceholderText(/Search lessons/i), { target: { value: 'twister' } });
    expect(await screen.findByText('Twister Lab')).toBeTruthy();
    expect(screen.queryByText('Time Hop')).toBeNull();
  });

  it('without the handler (or in another hub) there is no Academy Games tab', async () => {
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={vi.fn()} hubFilter="academy" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('tab', { name: /^Games/ })).toBeNull();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// The classroom Lesson Library: a teacher can open a Playground game from it.
vi.mock('@/services/lessonLibraryService', () => ({
  extractClassroomSlides: vi.fn(() => []),
  getLibraryLessonSlides: vi.fn(() => []),
  getLibraryLessons: vi.fn().mockResolvedValue([]),
  getLessonById: vi.fn(),
  toLibraryLessonCard: vi.fn((x: unknown) => x),
}));

import LibraryDrawer from '../LibraryDrawer';
import { GAME_LESSON_FORMAT, gameLessonNumber } from '@/content/playground-library/gameLessons';
import { LIBRARY_GAMES } from '@/content/playground-library/gamesCatalog';

describe('Classroom Lesson Library: Games', () => {
  it('lists the games for the Playground hub and opens one as a synced scene lesson', async () => {
    const onSelectLesson = vi.fn();
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={onSelectLesson} hubFilter="playground" />);

    fireEvent.click(await screen.findByRole('tab', { name: /Games/i }));
    for (const g of LIBRARY_GAMES) expect(await screen.findByText(g.title)).toBeTruthy();

    const magic = LIBRARY_GAMES.find((g) => g.id === 'magic-show')!;
    fireEvent.click(screen.getByText(magic.title));
    expect(onSelectLesson).toHaveBeenCalledWith([], magic.title, {
      contentFormat: GAME_LESSON_FORMAT,
      unitNumber: 0,
      lessonNumber: gameLessonNumber(magic.id),
    });
  });

  it('search narrows the games list', async () => {
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={vi.fn()} hubFilter="playground" />);
    fireEvent.click(await screen.findByRole('tab', { name: /Games/i }));
    fireEvent.change(screen.getByPlaceholderText(/Search lessons/i), { target: { value: 'alphabet' } });
    await waitFor(() => expect(screen.queryByText('Magic Show')).toBeNull());
    expect(screen.getByText('Alphabet Express')).toBeTruthy();
  });

  it('does not offer Playground games in the Academy / Professional libraries', async () => {
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={vi.fn()} hubFilter="academy" />);
    await waitFor(() => expect(screen.getByText('Lesson Library')).toBeTruthy());
    expect(screen.queryByRole('tab', { name: /Games/i })).toBeNull();
  });
});

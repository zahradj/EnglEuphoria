import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// The classroom Lesson Library for the Academy hub is the new Academy library: no database (old) Academy list.
const getLibraryLessons = vi.fn().mockResolvedValue([{ id: 'old-1', title: 'OLD DATABASE ACADEMY LESSON', hub: 'academy', cefr_level: 'A1', unit_number: 1, lesson_number: 1, isReady: true, slide_count: 3 }]);
vi.mock('@/services/lessonLibraryService', () => ({
  extractClassroomSlides: vi.fn(() => []),
  getLibraryLessonSlides: vi.fn(() => []),
  getLibraryLessons: (...a: unknown[]) => getLibraryLessons(...a),
  getLessonById: vi.fn(),
  toLibraryLessonCard: vi.fn((x: unknown) => x),
}));

import LibraryDrawer from '../LibraryDrawer';
import { ACADEMY_DECK_LESSONS } from '@/academy-deck/lessonRegistry';

describe('Classroom Lesson Library: Academy hub', () => {
  it('reads the new Academy library, never the old database list', async () => {
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={vi.fn()} hubFilter="academy" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(getLibraryLessons).not.toHaveBeenCalled();
    expect(screen.queryByText('OLD DATABASE ACADEMY LESSON')).toBeNull();
    // the registry is empty during the player v2 rebuild: no lesson card is offered
    expect(ACADEMY_DECK_LESSONS).toHaveLength(0);
  });

  it('the Playground hub still reads the database list', async () => {
    getLibraryLessons.mockClear();
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={vi.fn()} hubFilter="playground" />);
    await waitFor(() => expect(getLibraryLessons).toHaveBeenCalled());
  });
});

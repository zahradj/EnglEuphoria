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
  it('lists the new Academy library lessons, never the old database list, and opens one as a deck lesson', async () => {
    const onSelectLesson = vi.fn();
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={onSelectLesson} hubFilter="academy" />);
    // the first level with lessons (A1) opens by itself; its first season opens by itself, later seasons open from their header
    for (const l of ACADEMY_DECK_LESSONS.filter((x) => x.level === 'A1' && x.season === 1)) expect(await screen.findByText(l.title)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Free Time Club/ }));
    for (const l of ACADEMY_DECK_LESSONS.filter((x) => x.level === 'A1' && x.season === 3)) expect(await screen.findByText(l.title)).toBeTruthy();
    // B1 lessons sit on the B1 tab (the teacher opens the tab to find them)
    fireEvent.click(screen.getByRole('tab', { name: /^B1/ }));
    for (const l of ACADEMY_DECK_LESSONS.filter((x) => x.level === 'B1')) expect(await screen.findByText(l.title)).toBeTruthy();
    // Pre-A1 lessons sit on their own step tab (teachers see the ladder)
    fireEvent.click(screen.getByRole('tab', { name: /^Pre-A1/ }));
    for (const l of ACADEMY_DECK_LESSONS.filter((x) => x.level === 'Pre-A1' && x.season === 1)) expect(await screen.findByText(l.title)).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: /^A1(?! Upper)/ }));
    expect(getLibraryLessons).not.toHaveBeenCalled();
    expect(screen.queryByText('OLD DATABASE ACADEMY LESSON')).toBeNull();
    fireEvent.click(screen.getByText('Fake or Real?'));
    expect(onSelectLesson).toHaveBeenCalledWith([], 'Fake or Real?', undefined, { lessonId: 'fake-or-real' });
  });

  it('search narrows the Academy library', async () => {
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={vi.fn()} hubFilter="academy" />);
    fireEvent.change(await screen.findByPlaceholderText(/Search lessons/i), { target: { value: 'profile' } });
    await waitFor(() => expect(screen.queryByText('Sign Me Up')).toBeNull());
    expect(screen.getByText('Fake or Real?')).toBeTruthy();
  });

  it('the Playground hub still reads the database list', async () => {
    getLibraryLessons.mockClear();
    render(<LibraryDrawer open onClose={() => {}} onSelectLesson={vi.fn()} hubFilter="playground" />);
    await waitFor(() => expect(getLibraryLessons).toHaveBeenCalled());
  });
});

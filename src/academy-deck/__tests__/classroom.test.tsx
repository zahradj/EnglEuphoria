// The live-classroom bridge: the teacher moves the deck lesson and saves the slide; the student follows and cannot move it.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EmbeddedAcademyDeckLesson } from '../classroom/EmbeddedAcademyDeckLesson';
import { hasDeckScript } from '../lessonScripts';
import { ACADEMY_DECK_LESSONS } from '../lessonRegistry';

afterEach(cleanup);

describe('Academy library in the classroom', () => {
  it('every library lesson has a script the classroom can load', () => {
    ACADEMY_DECK_LESSONS.forEach((l) => expect(hasDeckScript(l.id), l.id).toBe(true));
    expect(hasDeckScript('nope')).toBe(false);
  });

  it('TEACHER: opens at the saved slide, Next moves the lesson and saves the index for the student', async () => {
    const persist = vi.fn();
    render(<EmbeddedAcademyDeckLesson lessonId="fake-or-real" roomId="r1" role="teacher" persistedSceneIdx={1} onSceneIdxPersist={persist} />);
    await waitFor(() => expect(screen.getByTestId('academy-deck-embed')).toBeTruthy());
    await screen.findByRole('button', { name: 'Next', exact: true });
    expect(screen.getByText('2/27')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));
    expect(persist).toHaveBeenCalledWith(2);
    expect(screen.getByText('3/27')).toBeTruthy();
  });

  it('STUDENT: follows the saved slide, has no Back / Next, and the strip does not navigate', async () => {
    const { rerender } = render(<EmbeddedAcademyDeckLesson lessonId="fake-or-real" roomId="r1" role="student" persistedSceneIdx={4} />);
    await screen.findByText('5/27');
    expect(screen.queryByRole('button', { name: 'Next', exact: true })).toBeNull();
    expect(screen.queryByRole('button', { name: '◀ Back', exact: true })).toBeNull();
    expect(screen.getByText(/Your teacher moves the lesson/)).toBeTruthy();
    expect((screen.getByRole('button', { name: /^Slide 9/ }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<EmbeddedAcademyDeckLesson lessonId="fake-or-real" roomId="r1" role="student" persistedSceneIdx={5} />);
    await screen.findByText('6/27');
  });

  it('an unknown lesson shows a friendly message instead of crashing', async () => {
    render(<EmbeddedAcademyDeckLesson lessonId="nope" roomId="r1" role="student" />);
    await waitFor(() => expect(screen.getByText(/isn’t available/)).toBeTruthy());
  });
});

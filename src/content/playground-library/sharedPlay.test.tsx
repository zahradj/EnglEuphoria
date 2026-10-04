import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

vi.mock('./unit1/audio', () => ({ safeSpeak: vi.fn().mockResolvedValue(undefined) }));
vi.mock('./unit1/sfx', () => ({ match: () => {}, wrong: () => {}, whoop: () => {}, gem: () => {}, pop: () => {}, reveal: () => {} }));

import { SortBasketScene, type SortBasketSceneData } from './SortBasketScene';
import { GrammarGapScene, type GrammarGapSceneData } from './GrammarGapScene';
import { SHARED_PLAY_KINDS, type ActivitySync } from './sceneActivitySync';
import { LIBRARY_GAMES } from './gamesCatalog';

/**
 * Shared play: in a live class the teacher AND the unlocked student play the SAME game at once.
 * Two copies of a scene are wired together the way the lesson players wire the two screens
 * (each side publishes its writes; the other side receives them as `sync.state`).
 */
function TwoScreens({ render: draw }: { render: (side: 'teacher' | 'student', sync: ActivitySync) => JSX.Element }) {
  const [teacherState, setTeacherState] = useState<unknown>(null);
  const [studentState, setStudentState] = useState<unknown>(null);
  const teacher: ActivitySync = {
    isSynced: true, isAuthority: true, shared: true, leader: true, state: teacherState,
    setState: (n) => { setTeacherState(n); setStudentState(n); },
  };
  const student: ActivitySync = {
    isSynced: true, isAuthority: true, shared: true, leader: false, state: studentState,
    setState: (n) => { setStudentState(n); setTeacherState(n); },
  };
  return (
    <>
      <section aria-label="teacher">{draw('teacher', teacher)}</section>
      <section aria-label="student">{draw('student', student)}</section>
    </>
  );
}

const sortScene: SortBasketSceneData = {
  id: 'sp-sort', kind: 'sort-basket', teacher: '', intro: false,
  baskets: [{ label: 'toys' }, { label: 'food' }],
  items: [{ word: 'ball', basket: 0 }, { word: 'apple', basket: 1 }, { word: 'doll', basket: 0 }],
};

const grammarScene: GrammarGapSceneData = {
  id: 'sp-gap', kind: 'grammar-gap', teacher: '',
  rounds: [
    { before: 'This is', after: 'ball.', choices: ['a', 'an'], answer: 'a' },
    { before: 'This is', after: 'apple.', choices: ['a', 'an'], answer: 'an' },
  ],
};

describe('shared play (teacher + student, one game)', () => {
  it('covers every game scene kind', () => {
    for (const g of LIBRARY_GAMES) for (const s of g.stages) expect(SHARED_PLAY_KINDS.has(s.scene.kind), `${g.id}/${s.id}: ${s.scene.kind}`).toBe(true);
  });

  it('the student can answer and the teacher sees it at once; then the teacher answers and the student sees it', async () => {
    render(<TwoScreens render={(side, sync) => <SortBasketScene key={side} scene={sortScene} onNext={() => {}} onWin={() => {}} sync={sync} />} />);
    const teacher = within(screen.getByLabelText('teacher'));
    const student = within(screen.getByLabelText('student'));

    await waitFor(() => expect(student.getByText(/Where does the ball go/)).toBeTruthy());
    // the student taps the right basket for the ball…
    fireEvent.click(student.getByRole('button', { name: 'toys' }));
    // …and BOTH screens move on to the apple
    await waitFor(() => expect(teacher.getByText(/Where does the apple go/)).toBeTruthy(), { timeout: 3000 });
    await waitFor(() => expect(student.getByText(/Where does the apple go/)).toBeTruthy(), { timeout: 3000 });

    // now the teacher answers the apple on their own screen: the student's screen follows
    fireEvent.click(teacher.getByRole('button', { name: 'food' }));
    await waitFor(() => expect(student.getByText(/Where does the doll go/)).toBeTruthy(), { timeout: 3000 });
    await waitFor(() => expect(teacher.getByText(/Where does the doll go/)).toBeTruthy(), { timeout: 3000 });
  });

  it('a wrong tap by one player is shown on both screens', async () => {
    render(<TwoScreens render={(side, sync) => <GrammarGapScene key={side} scene={grammarScene} onNext={() => {}} onWin={() => {}} sync={sync} />} />);
    const teacher = within(screen.getByLabelText('teacher'));
    const student = within(screen.getByLabelText('student'));
    await waitFor(() => expect(student.getByRole('button', { name: 'an' })).toBeTruthy());

    fireEvent.click(student.getByRole('button', { name: 'an' })); // wrong for "a ball"
    await waitFor(() => expect((teacher.getByRole('button', { name: 'an' }) as HTMLButtonElement).disabled).toBe(true));
    expect((teacher.getByRole('button', { name: 'a' }) as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(teacher.getByRole('button', { name: 'a' })); // right
    await waitFor(() => expect(student.getByText('apple.')).toBeTruthy(), { timeout: 4000 });
  });

  it('a paused student (mirror) still cannot play', async () => {
    const mirror: ActivitySync = { isSynced: true, isAuthority: false, state: null, setState: vi.fn() };
    render(<SortBasketScene scene={sortScene} onNext={() => {}} onWin={() => {}} sync={mirror} />);
    expect((screen.getByRole('button', { name: 'toys' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

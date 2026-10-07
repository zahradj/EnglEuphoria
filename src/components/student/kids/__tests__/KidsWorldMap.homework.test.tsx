import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.mock('../JungleTheme', () => ({ JungleTheme: () => null }));
vi.mock('../SpaceTheme', () => ({ SpaceTheme: () => null }));
vi.mock('../UnderwaterTheme', () => ({ UnderwaterTheme: () => null }));
vi.mock('../LevelNode', () => ({ LevelNode: () => null }));
vi.mock('../WindingPath', () => ({ WindingPath: () => null }));
vi.mock('../FloatingBackpack', () => ({ FloatingBackpack: () => null }));
vi.mock('../GiantGoButton', () => ({ GiantGoButton: () => null }));
vi.mock('../CreditCoin', () => ({ CreditCoin: () => null }));
vi.mock('../LessonPlayerModal', () => ({ LessonPlayerModal: () => null }));
vi.mock('../SceneLessonPlayerModal', () => ({ SceneLessonPlayerModal: () => null }));
vi.mock('@/components/student/RecentLessonReports', () => ({ RecentLessonReports: () => null }));

import { KidsWorldMap } from '../KidsWorldMap';
import { buildQuestCards, readyQuestForLesson } from '@/lib/homeworkQuestCards';

const lesson = (over: Record<string, unknown>) => ({
  id: 'L', number: 1, title: 'T', type: 'slide', status: 'locked', position: { x: 10, y: 10 },
  content: { vocabulary: [], sentence: '', quizQuestion: '', quizOptions: [], quizAnswer: '' },
  ...over,
}) as any;

// Magic Castle U9 L1 has a Homework Quest (key castle-rich-9-1)
const castle = (status: string) => lesson({ id: 'castle1', contentFormat: 'castle-rich', unitNumber: 9, lessonNumber: 1, status });

function Where() { return <div data-testid="where">{useLocation().pathname}</div>; }
const renderMap = (lessons: any[]) =>
  render(
    <MemoryRouter>
      <Routes><Route path="*" element={<><KidsWorldMap lessons={lessons} studentName="Tima" /><Where /></>} /></Routes>
    </MemoryRouter>,
  );

describe('adventure map shows homework in the forest', () => {
  it('a finished lesson with a quest lights up the Homework button and lists the quest', () => {
    renderMap([castle('completed')]);
    const pill = screen.getByRole('button', { name: /Homework, 1 ready/i });
    expect(pill).toBeTruthy();
    fireEvent.click(pill);
    expect(screen.getByRole('dialog', { name: /Homework/i })).toBeTruthy();
    const cards = document.querySelectorAll('[data-homework-card="ready"]');
    expect(cards.length).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: /Start quest/i }));
    expect(screen.getByTestId('where').textContent).toMatch(/^\/homework-quest\//);
  });

  it('with nothing finished it still shows the button, and says how homework appears', () => {
    renderMap([castle('current')]);
    const pill = screen.getByRole('button', { name: /^Homework$/i });
    fireEvent.click(pill);
    expect(screen.getByText(/Finish a lesson and its homework quest appears here/i)).toBeTruthy();
    expect(document.querySelectorAll('[data-homework-card]').length).toBe(0);
  });
});

describe('homework quest cards', () => {
  it('only a finished lesson unlocks its quest', () => {
    expect(readyQuestForLesson(castle('completed'))?.lessonKey).toBe('castle-rich-9-1');
    expect(readyQuestForLesson(castle('current'))).toBeNull();
    expect(buildQuestCards([castle('completed')]).filter((c) => c.ready).length).toBe(1);
    expect(buildQuestCards([castle('locked')]).filter((c) => c.ready).length).toBe(0);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import type { PlaygroundLesson } from '@/hooks/usePlaygroundLessons';

const lesson = (over: Partial<PlaygroundLesson>): PlaygroundLesson => ({
  id: 'row-u2l1', number: 1, title: 'Red, Blue, Yellow!', type: 'slide', status: 'locked',
  position: { x: 0, y: 0 },
  content: { vocabulary: [], sentence: '', quizQuestion: '', quizOptions: [], quizAnswer: '' },
  contentFormat: 'lep1-rich', unitNumber: 2, lessonNumber: 1, ...over,
});

let mockLessons: PlaygroundLesson[] = [];
vi.mock('@/hooks/usePlaygroundLessons', () => ({ usePlaygroundLessons: () => ({ lessons: mockLessons, loading: false }) }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'student-1' } }) }));
vi.mock('@/hooks/useStudentLevel', () => ({ useStudentLevel: () => ({ studentLevel: 'playground' }) }));
vi.mock('@/hooks/useThemeMode', () => ({ useThemeMode: () => ({ resolvedTheme: 'light' }) }));
vi.mock('@/hooks/useStudentHubTheme', () => ({ useStudentHubTheme: () => ({ accentText: '', chipBg: '', chipText: '', panelBorder: '' }) }));
vi.mock('@/services/studentGames', () => ({ listAssignments: async () => [], recordPlay: async () => {}, recordCompletion: async () => {} }));
vi.mock('@/components/student/kids/HomeworkForestWidget', () => ({ HomeworkForestWidget: () => null }));
vi.mock('@/components/student/common/HubBackButton', () => ({ HubBackButton: () => null }));
vi.mock('@/components/games/GamePlayer', () => ({ default: () => null }));

import { HomeworkTab } from '../HomeworkTab';
import { MyLessonsTab } from '../MyLessonsTab';

function Where() { return <div data-testid="where">{useLocation().pathname}</div>; }
const mount = (ui: React.ReactElement) =>
  render(
    <MemoryRouter initialEntries={['/dash']}>
      <Routes><Route path="/dash" element={ui} /><Route path="*" element={<Where />} /></Routes>
    </MemoryRouter>,
  );

describe('student tabs link the real content', () => {
  beforeEach(() => { mockLessons = []; });

  it('Homework: a finished lesson unlocks its Homework Quest, which opens the quest player', () => {
    mockLessons = [lesson({ status: 'completed' })];
    mount(<HomeworkTab />);
    expect(screen.getByText('Pip’s Carnival Quest')).toBeTruthy();
    fireEvent.click(screen.getAllByText('Start quest')[0]);
    expect(screen.getByTestId('where').textContent).toBe('/homework-quest/color-carnival-u2l1');
  });

  it('Homework: a lesson not finished yet shows no quest at all (homework appears after the lesson)', () => {
    mockLessons = [lesson({ status: 'current' })];
    mount(<HomeworkTab />);
    expect(screen.queryByText('Start quest')).toBeNull();
    expect(screen.queryByText('Finish the lesson to unlock')).toBeNull();
    expect(screen.getByText(/Finish a lesson on the map/)).toBeTruthy();
  });

  it('My Lessons: lists the built lesson, hides unbuilt slots, links the quest once finished', () => {
    mockLessons = [lesson({ status: 'completed' }), lesson({ id: 'empty', title: 'Empty slot', contentFormat: undefined, lessonNumber: 2 })];
    mount(<MyLessonsTab />);
    expect(screen.getByText('Red, Blue, Yellow!')).toBeTruthy();
    expect(screen.queryByText('Empty slot')).toBeNull();
    fireEvent.click(screen.getByText(/Homework quest/));
    expect(screen.getByTestId('where').textContent).toBe('/homework-quest/color-carnival-u2l1');
  });

  it('My Lessons: Play opens the lesson route', () => {
    mockLessons = [lesson({ status: 'current' })];
    mount(<MyLessonsTab />);
    fireEvent.click(screen.getByText('Play'));
    expect(screen.getByTestId('where').textContent).toBe('/playground-scene/unit-2-lesson-1');
  });
});

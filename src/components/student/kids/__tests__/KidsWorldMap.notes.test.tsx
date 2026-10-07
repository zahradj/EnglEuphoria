import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Heavy visual children are irrelevant here; we only test the Teacher's notes button + panel.
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
vi.mock('@/components/student/RecentLessonReports', () => ({
  RecentLessonReports: () => <div data-testid="reports">reports list</div>,
}));

import { KidsWorldMap } from '../KidsWorldMap';

describe('Quest map: Teacher\'s notes', () => {
  it('keeps the lesson reports inside the quest map, opened on demand', () => {
    render(
      <MemoryRouter>
        <KidsWorldMap lessons={[]} studentName="Tima" />
      </MemoryRouter>,
    );
    // Not mounted (so nothing fetched) until the student opens it.
    expect(screen.queryByTestId('reports')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Teacher's notes/i }));
    expect(screen.getByRole('dialog', { name: /Teacher's notes/i })).toBeTruthy();
    expect(screen.getByTestId('reports')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Close teacher's notes/i }));
    expect(screen.queryByTestId('reports')).toBeNull();
  });
});

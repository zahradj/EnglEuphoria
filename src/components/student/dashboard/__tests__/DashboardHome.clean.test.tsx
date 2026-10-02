import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// The dashboard FIRST page must stay short: today's class, progress, jump back in.
// Homework Forest, Lesson Reports and Games each live in their own sidebar tab.
vi.mock('@/components/student/JoinLessonHero', () => ({ JoinLessonHero: () => <div data-testid="join" /> }));
vi.mock('../ProgressStrip', () => ({ ProgressStrip: () => <div data-testid="progress" /> }));
vi.mock('../JumpBackInCard', () => ({ JumpBackInCard: () => <div data-testid="jump" /> }));
vi.mock('@/components/student/kids/HomeworkForestWidget', () => ({ HomeworkForestWidget: () => <div data-testid="forest" /> }));
vi.mock('@/components/student/RecentLessonReports', () => ({ RecentLessonReports: () => <div data-testid="reports" /> }));
vi.mock('@/components/student/hub/SkillsRadarChart', () => ({ SkillsRadarChart: () => <div data-testid="radar" /> }));
vi.mock('@/components/student/hub/AcademyJourneyHub', () => ({ AcademyJourneyHub: () => <div data-testid="journey" /> }));
vi.mock('@/hooks/useThemeMode', () => ({ useThemeMode: () => ({ resolvedTheme: 'light' }) }));
vi.mock('@/hooks/useStudentSkills', () => ({ useStudentSkills: () => ({ overallCefr: 'A1', percentToNext: 40, loading: false }) }));

import { DashboardHome } from '../DashboardHome';

describe('Dashboard home page stays clean', () => {
  for (const hub of ['playground', 'academy', 'professional'] as const) {
    it(`${hub}: shows the essentials and none of the cards that moved to sidebar tabs`, () => {
      render(<DashboardHome hub={hub} studentName="Tima" />);
      expect(screen.getByTestId('join')).toBeTruthy();
      expect(screen.getByTestId('progress')).toBeTruthy();
      expect(screen.getByTestId('jump')).toBeTruthy();
      expect(screen.queryByTestId('forest')).toBeNull();
      expect(screen.queryByTestId('reports')).toBeNull();
    });
  }
});

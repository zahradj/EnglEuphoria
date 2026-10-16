import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let hub: 'playground' | 'academy' = 'academy';
vi.mock('@/hooks/useStudentLevel', () => ({ useStudentLevel: () => ({ studentLevel: hub }) }));
vi.mock('@/hooks/useSmartSkillMap', () => ({
  useSmartSkillMap: () => ({
    data: { tree: { roots: [
      { domain: 'vocabulary', masteryPct: 82, children: [{}, {}] },
      { domain: 'grammar', masteryPct: 30, children: [{}] },
    ] } },
  }),
}));
vi.mock('@/hooks/useStudentStreak', () => ({ useStudentStreak: () => ({ data: { current_streak: 4, longest_streak: 9 } }) }));
vi.mock('@/hooks/useResumeTarget', () => ({ useResumeTarget: () => ({ data: { kind: 'resume', lessonId: 'L1', lessonTitle: 'Hello Friends' } }) }));
vi.mock('@/hooks/useMyProgress', () => ({
  useMyProgress: () => ({ data: { lessonsThisWeek: 1, goalText: 'Complete 3 lessons 🎯', recent: [{ lessonId: 'a', title: 'Colors', completedAt: '2026-10-12T10:00:00Z' }] } }),
}));

import i18n from '@/lib/i18n';
import { MyProgressTab } from '../MyProgressTab';

const open = () => render(<MemoryRouter><MyProgressTab /></MemoryRouter>);

describe('My Progress page', () => {
  beforeEach(() => { hub = 'academy'; });
  afterEach(async () => { await i18n.changeLanguage('en'); });

  it('shows this week, the next step, skills with levels and recent wins', () => {
    open();
    expect(screen.getByText('My Progress')).toBeTruthy();
    expect(screen.getByText('1/3')).toBeTruthy();
    expect(screen.getByText('Lessons to go this week: 2')).toBeTruthy();
    expect(screen.getByText('Day streak: 4')).toBeTruthy();
    expect(screen.getByText('Hello Friends')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Resume/ }).getAttribute('href')).toBe('/lesson/L1');
    expect(screen.getByText(/Practice Grammar next/)).toBeTruthy(); // the weakest skill the student has met
    expect(screen.getByText('Proficient · 82%')).toBeTruthy();
    expect(screen.getByText('Familiar · 30%'.replace('Familiar', 'Learning'))).toBeTruthy();
    expect(screen.getByText('Colors')).toBeTruthy();
    expect(screen.getByRole('img', { name: /Skill profile: Vocabulary 82%/ })).toBeTruthy();
  });

  it('uses stars instead of the radar for Playground', () => {
    hub = 'playground';
    open();
    expect(screen.queryByRole('img', { name: /Skill profile/ })).toBeNull();
    expect(screen.getByLabelText('5 of 5 stars')).toBeTruthy();
  });

  it('follows the chosen language', async () => {
    await i18n.changeLanguage('es');
    open();
    expect(screen.getByText('Mi progreso')).toBeTruthy();
    expect(screen.getByText('Racha de días: 4')).toBeTruthy();
    expect(screen.getByText('Competente · 82%')).toBeTruthy();
  });
});

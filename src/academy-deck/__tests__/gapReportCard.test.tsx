import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { addLessonItems, gapReport, plusDays } from '../../curriculum/academy';
import { GapReportCard } from '../teacher/GapReportCard';

afterEach(cleanup);
describe('GapReportCard', () => {
  it('shows the traffic light, the numbers and the actions', () => {
    const T0 = '2026-10-14';
    const report = gapReport({ level: 'A1', today: plusDays(T0, 20), lastLessonOn: T0, daily10Scheduled: 6, daily10Done: 0, items: addLessonItems([], ['pin'], T0), spokenLastLesson: 5 });
    render(<GapReportCard name="Lina" report={report} />);
    expect(screen.getByRole('region', { name: 'Practice report for Lina' })).toBeTruthy();
    expect(screen.getByText('Needs a restart plan').getAttribute('data-risk')).toBe('red');
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText(/Next lesson: rewind/)).toBeTruthy();
  });
});

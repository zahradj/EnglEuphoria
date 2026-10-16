import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { addLessonItems, plusDays } from '../../curriculum/academy';
import type { PracticeData } from '../practiceStore';

const T0 = new Date().toISOString().slice(0, 10);
const records: Record<string, PracticeData | null> = {
  a: { items: addLessonItems([], ['pin'], plusDays(T0, -20)), lessons: [{ id: 'x', on: plusDays(T0, -20), spoken: 2 }], daily10Days: [] },
  b: { items: addLessonItems([], ['tin'], plusDays(T0, -1)), lessons: [{ id: 'y', on: plusDays(T0, -1), spoken: 30 }], daily10Days: [] },
  c: null,
};
vi.mock('@/hooks/useTeacherStudents', () => ({ useTeacherStudents: () => ({ loading: false, students: [{ id: 'b', name: 'Bea', level: 'A1' }, { id: 'a', name: 'Adam', level: 'A2' }, { id: 'c', name: 'Cem', level: undefined }] }) }));
vi.mock('@/services/academyPracticeService', () => ({ loadRemotePractice: async (id: string) => records[id] }));
import AcademyPracticeReportsPage, { toLevel } from '../pages/AcademyPracticeReportsPage';

afterEach(cleanup);
describe('Practice reports page (teacher)', () => {
  it('maps a student level to an Academy level', () => {
    expect(toLevel('a2')).toBe('A2');
    expect(toLevel('B1+')).toBe('B1');
    expect(toLevel(undefined)).toBe('A1');
    expect(toLevel('Pre-A1')).toBe('Pre-A1');
  });
  it('lists one card per student, the student who needs a restart plan first, and says when there is no record', async () => {
    render(<MemoryRouter><AcademyPracticeReportsPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getAllByRole('region').length).toBe(3));
    const names = screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'));
    expect(names).toEqual(['Practice report for Adam', 'Practice report for Bea', 'Practice report for Cem']);
    expect(screen.getByText('Needs a restart plan')).toBeTruthy();
    expect(screen.getByText(/No practice record yet/)).toBeTruthy();
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { AcademyChecklistSummary } from '../teacher/AcademyChecklistSummary';

afterEach(cleanup);
describe('AcademyChecklistSummary (inside the lesson report)', () => {
  it('shows nothing without data', () => {
    const { container } = render(<AcademyChecklistSummary data={null} />);
    expect(container.firstChild).toBeNull();
  });
  it('shows the goals with their marks, the errors to keep practising, and the unit result', () => {
    render(<AcademyChecklistSummary audience="teacher" data={{
      lesson: { lessonId: 'A1-S03-E8', studentId: 's', on: '2026-10-15', level: 'A1', speakingStep: 'guided', comfort: 'ok', notes: '', errors: ['pronunciation'], criteria: [{ text: 'I said what I like.', mark: 'nailed' }, { text: 'I asked a question.', mark: 'not-yet' }] },
      unit: { seasonId: 'A1-S03', studentId: 's', on: '2026-10-15', levelCheck: false, notes: '', strands: { listening: 90, speaking: 40, reading: 85, writing: 80, vocabulary: 88, grammar: 75 }, release: { accuracy: 3, range: 3, fluency: 3, interaction: 3, independence: 3 } },
    }} />);
    expect(screen.getByText(/Lesson goals · Replay this lesson/)).toBeTruthy();
    expect(screen.getByText(/Nailed it:/)).toBeTruthy();
    expect(screen.getByText(/Needs more practice:/, { selector: 'b' })).toBeTruthy();
    expect(screen.getByText(/Keep practising: pronunciation/)).toBeTruthy();
    expect(screen.getByText(/Unit result · Needs more practice, then move on/)).toBeTruthy();
  });

  it('families see kind wording and not the practice plan', () => {
    render(<AcademyChecklistSummary data={{
      lesson: { lessonId: 'L', studentId: 's', on: '2026-10-15', level: 'A1', speakingStep: 'guided', comfort: 'ok', notes: '', errors: [], criteria: [{ text: 'A', mark: 'not-yet' }, { text: 'B', mark: 'not-yet' }] },
      unit: { seasonId: 'A1-S03', studentId: 's', on: '2026-10-15', levelCheck: false, notes: '', strands: { listening: 30, speaking: 30, reading: 30, writing: 80, vocabulary: 80, grammar: 80 }, release: { accuracy: 3, range: 3, fluency: 3, interaction: 3, independence: 3 } },
    }} />);
    expect(screen.getByText(/Lesson goals · Needs more practice/)).toBeTruthy();
    expect(screen.queryByText(/Replay/)).toBeNull();
    expect(screen.getByText(/Unit result · Needs more practice, then move on/)).toBeTruthy();
    expect(screen.queryByText(/Repeat the unit/)).toBeNull();
    expect(screen.queryByText(/Replay lesson/)).toBeNull();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { LessonChecklistPanel } from '../teacher/LessonChecklistPanel';
import { UnitAssessmentPanel } from '../teacher/UnitAssessmentPanel';

afterEach(cleanup);
const GOALS = ['I blended in, it, pin and tin.', 'I read two short lines.', 'I said “This is a ___.”'];

describe('LessonChecklistPanel', () => {
  it('starts from the suggested marks and updates the verdict live', () => {
    render(<LessonChecklistPanel lessonId="PA1-S02-E1" studentId="s1" level="Pre-A1" criteria={GOALS} suggested={['nailed', 'nailed', 'nailed']} onSave={() => {}} />);
    expect(screen.getByRole('status', { name: 'Verdict' }).getAttribute('data-verdict')).toBe('practise'); // no speaking step yet
    fireEvent.click(screen.getByRole('button', { name: 'controlled' }));
    expect(screen.getByRole('status', { name: 'Verdict' }).getAttribute('data-verdict')).toBe('nailed');
    fireEvent.click(within(screen.getByRole('group', { name: /Mark for: I read two/ })).getByRole('button', { name: /Needs more practice/ }));
    expect(screen.getByRole('status', { name: 'Verdict' }).getAttribute('data-verdict')).toBe('practise');
    expect(screen.getByText(/Practise next lesson: I read two short lines/)).toBeTruthy();
  });
  it('limits the error log to three and saves the whole checklist', () => {
    const onSave = vi.fn();
    render(<LessonChecklistPanel lessonId="L" studentId="s1" level="A1" criteria={GOALS} suggested={['nailed', 'almost', 'not-yet']} sayIt={21} onSave={onSave} />);
    ['pronunciation', 'grammar', 'spelling', 'fluency'].forEach((e) => fireEvent.click(screen.getByRole('button', { name: e })));
    expect(screen.getByRole('button', { name: 'fluency' }).getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Save checklist' }));
    const saved = onSave.mock.calls[0][0];
    expect(saved.errors).toEqual(['pronunciation', 'grammar', 'spelling']);
    expect(saved.criteria.map((c: { mark: string }) => c.mark)).toEqual(['nailed', 'almost', 'not-yet']);
    expect(saved.sayIt).toBe(21);
  });
});

describe('UnitAssessmentPanel', () => {
  it('shows each strand mark and a verdict with a practice plan; weak strands name lessons', () => {
    const onSave = vi.fn();
    render(<UnitAssessmentPanel seasonId="A1-S03" studentId="s1" onSave={onSave} />);
    fireEvent.change(screen.getByLabelText('Score for speaking'), { target: { value: '40' } });
    expect(screen.getByRole('status', { name: 'Verdict' }).getAttribute('data-verdict')).toBe('practise');
    expect(screen.getByText(/speaking: needs more practice. Replay lesson E4 \/ E6/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Save assessment' }));
    expect(onSave.mock.calls[0][0]).toMatchObject({ seasonId: 'A1-S03', studentId: 's1', strands: { speaking: 40 } });
  });
  it('all strong scores and a strong Release give "Nailed the unit"', () => {
    render(<UnitAssessmentPanel seasonId="A1-S03" studentId="s1" onSave={() => {}} />);
    ['listening', 'speaking', 'reading', 'writing', 'vocabulary', 'grammar'].forEach((s) => fireEvent.change(screen.getByLabelText(`Score for ${s}`), { target: { value: '90' } }));
    ['accuracy', 'range', 'fluency', 'interaction', 'independence'].forEach((c) => fireEvent.change(screen.getByLabelText(`Release ${c}`), { target: { value: '4' } }));
    expect(screen.getByText('Nailed the unit')).toBeTruthy();
  });
});

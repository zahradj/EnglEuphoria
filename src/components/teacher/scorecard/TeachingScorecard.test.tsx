import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScorecardView, buildGoals } from './TeachingScorecard';
import type { Scorecard } from '@/hooks/useTeacherScorecard';

const base: Scorecard = {
  window_days: 90,
  on_time: { n: 10, pct: 95 },
  delivered: { n: 10, pct: 100 },
  full_length: { n: 10, pct: 100 },
  reports: { n: 10, pct: 92 },
  cancellations: { by_you: 0, short_notice: 0 },
  feedback: { n: 6, energy: 4.5, relevance: 4.4, confident_pct: 90 },
  talk: { n: 8, student_pct: 44, by_hub: [{ hub: 'playground', n: 8, student_pct: 44 }], recent: [] },
  excluded: { platform_faults: 1, student_side: 2 },
};

describe('talk-time goal follows the age group', () => {
  it('44% student talk is on track for a Playground teacher (goal 40%)', () => {
    const talk = buildGoals(base).find((g) => g.id === 'talk')!;
    expect(talk.target).toBe(40);
    expect(talk.status).toBe('good');
  });
  it('the same 44% needs a little attention for an Academy teacher (goal 50%)', () => {
    const talk = buildGoals({ ...base, talk: { ...base.talk, by_hub: [{ hub: 'academy', n: 8, student_pct: 44 }] } }).find((g) => g.id === 'talk')!;
    expect(talk.target).toBe(50);
    expect(talk.status).toBe('almost');
  });
  it('older scorecards without a per-hub split still use the 50% default', () => {
    const { by_hub: _drop, ...talk } = base.talk;
    expect(buildGoals({ ...base, talk }).find((g) => g.id === 'talk')!.target).toBe(50);
  });
  it('says what the goal is, and that left-out lessons were not counted against the teacher', () => {
    render(<ScorecardView data={base} />);
    expect(screen.getByText(/Aim for 40% or more/)).toBeTruthy();
    expect(screen.getByText(/3 lessons were left out for that reason/)).toBeTruthy();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

const state = vi.hoisted(() => ({ available: 10, loading: false, family: false }));

vi.mock('@/hooks/useStudentCredits', () => ({
  useStudentCredits: () => ({ availableCredits: state.available, loading: state.loading }),
}));
vi.mock('@/hooks/useFamilyMembership', () => ({ useFamilyMembership: () => state.family }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'S1', email: 'kid@example.com' } }) }));
vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

import { CreditBalance } from '../CreditBalance';

beforeEach(() => { state.available = 10; state.loading = false; state.family = false; });

describe('credit balance on the student dashboard', () => {
  it('shows the number of lesson credits and the hours they cover', () => {
    render(<CreditBalance />);
    expect(screen.getByText('10 lesson credits')).toBeTruthy();
    expect(screen.getByText(/5 hours of lessons/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /buy more/i }).getAttribute('href')).toBe('/pricing');
  });

  it('stays quiet when credits are low or gone (the alert banner covers those) and while loading', () => {
    state.available = 2;
    expect(render(<CreditBalance />).container.firstChild).toBeNull();
    state.available = 0;
    expect(render(<CreditBalance />).container.firstChild).toBeNull();
    state.available = 10; state.loading = true;
    expect(render(<CreditBalance />).container.firstChild).toBeNull();
  });

  it('for a learner in a family account, shows the family-dashboard note instead of a buy button', () => {
    state.family = true;
    render(<CreditBalance />);
    expect(screen.getByText(/family dashboard/i)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /buy more/i })).toBeNull();
  });
});

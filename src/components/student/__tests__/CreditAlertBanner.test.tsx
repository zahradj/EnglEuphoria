import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

const state = vi.hoisted(() => ({ available: 5, loading: false }));

vi.mock('@/hooks/useStudentCredits', () => ({
  useStudentCredits: () => ({ availableCredits: state.available, loading: state.loading }),
}));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'S1', email: 'kid@example.com' } }) }));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));

import { CreditAlertBanner, creditAlertLevel } from '../CreditAlertBanner';
import { contactToBuyHref } from '@/config/payments';

beforeEach(() => { state.available = 5; state.loading = false; });

describe('credit alert on every student dashboard', () => {
  it('levels: plenty → none, 1–2 left → low, 0 → empty', () => {
    expect(creditAlertLevel(5)).toBe('none');
    expect(creditAlertLevel(3)).toBe('none');
    expect(creditAlertLevel(2)).toBe('low');
    expect(creditAlertLevel(1)).toBe('low');
    expect(creditAlertLevel(0)).toBe('empty');
  });

  it('shows nothing while the student has plenty of credits (or while loading)', () => {
    const { container } = render(<CreditAlertBanner />);
    expect(container.firstChild).toBeNull();
    state.available = 0; state.loading = true;
    const again = render(<CreditAlertBanner />);
    expect(again.container.firstChild).toBeNull();
  });

  it('at 0 credits tells the student they cannot book until they buy, with a contact-to-buy link', () => {
    state.available = 0;
    render(<CreditAlertBanner />);
    const alert = screen.getByRole('alert');
    expect(alert.getAttribute('data-credit-alert')).toBe('empty');
    expect(screen.getByText('You have used all your credits')).toBeTruthy();
    const link = screen.getByRole('link', { name: /contact us to buy/i });
    expect(link.getAttribute('href')).toMatch(/^mailto:hello@engleuphoria\.com\?subject=/);
    expect(decodeURIComponent(link.getAttribute('href')!)).toContain('kid@example.com');
  });

  it('with the last credit or two left it warns early', () => {
    state.available = 1;
    render(<CreditAlertBanner />);
    expect(screen.getByRole('alert').getAttribute('data-credit-alert')).toBe('low');
    expect(screen.getByText('Only 1 credit left')).toBeTruthy();
  });
});

describe('contact-to-buy link', () => {
  it('names the pack and its credits', () => {
    const href = decodeURIComponent(contactToBuyHref({ packName: 'Starter', credits: 5 }));
    expect(href).toContain('the Starter (5 credits)');
  });
});

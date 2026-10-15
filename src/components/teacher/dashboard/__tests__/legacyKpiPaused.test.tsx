import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// If the old KPI code ran while paused it would call these; make that fail loudly.
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => { throw new Error('legacy KPI query ran while the KPI is paused'); } },
}));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'T1' } }) }));

import { LEGACY_KPI_PAUSED } from '@/lib/legacyKpiPause';
import { KpiPulseCard } from '../KpiPulseCard';
import HowWeMeasure from '@/pages/teacher/HowWeMeasure';

describe('old overall KPI is paused by default', () => {
  it('the switch is on unless VITE_LEGACY_KPI=on', () => {
    expect(LEGACY_KPI_PAUSED).toBe(true);
  });

  it('the dashboard card shows "My teaching" instead of a score, tier or bonus, and runs no legacy query', () => {
    render(<MemoryRouter><KpiPulseCard /></MemoryRouter>);
    expect(screen.getByText('My teaching')).toBeTruthy();
    expect(screen.getByRole('link', { name: /See my goals/ }).getAttribute('href')).toBe('/teacher/kpi');
    expect(screen.queryByText(/At Risk/i)).toBeNull();
    expect(screen.queryByText(/bonus/i)).toBeNull();
  });

  it('the "How we measure" page says what is left out and what is paused', () => {
    render(<MemoryRouter><HowWeMeasure /></MemoryRouter>);
    expect(screen.getByText('The five goals')).toBeTruthy();
    expect(screen.getByText('What we are not using')).toBeTruthy();
    expect(screen.getByText(/Star ratings\./)).toBeTruthy();
    expect(screen.getByText(/paused/i)).toBeTruthy();
  });
});

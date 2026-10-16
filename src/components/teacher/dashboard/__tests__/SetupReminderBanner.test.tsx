import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let lessons: unknown[] = [];
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'T1' } }) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { rpc: () => Promise.resolve({ data: lessons, error: null }) },
}));
vi.mock('../AVTestDialog', () => ({ AVTestDialog: ({ open }: { open: boolean }) => (open ? <div>AV dialog open</div> : null) }));
vi.mock('../SpeedTestDialog', () => ({ SpeedTestDialog: ({ open }: { open: boolean }) => (open ? <div>Speed dialog open</div> : null) }));

import { SetupReminderBanner } from '../SetupReminderBanner';

const mount = () => render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <SetupReminderBanner />
  </QueryClientProvider>,
);
const soon = (mins: number) => new Date(Date.now() + mins * 60000).toISOString();

describe('pre-lesson setup reminder', () => {
  beforeEach(() => { window.localStorage.clear(); });

  it('nudges shortly before a lesson and opens the existing camera/mic check', async () => {
    lessons = [{ id: 'L1', scheduled_at: soon(30), student_name: 'Mia' }];
    mount();
    expect(await screen.findByText(/with Mia starts in/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Check camera/ }));
    expect(screen.getByText('AV dialog open')).toBeTruthy();
    expect(window.localStorage.getItem('ee-setup-checked-on')).toBeTruthy();
  });

  it('does not appear when the lesson is hours away', async () => {
    lessons = [{ id: 'L1', scheduled_at: soon(300), student_name: 'Mia' }];
    mount();
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(/starts in/)).toBeNull();
  });

  it('goes away for that lesson after "Not now"', async () => {
    lessons = [{ id: 'L9', scheduled_at: soon(20), student_name: 'Leo' }];
    mount();
    fireEvent.click(await screen.findByRole('button', { name: /Not now/ }));
    expect(screen.queryByText(/starts in/)).toBeNull();
    expect(window.localStorage.getItem('ee-setup-dismissed-lesson')).toBe('L9');
  });
});

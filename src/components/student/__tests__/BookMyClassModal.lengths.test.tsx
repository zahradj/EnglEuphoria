import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

/**
 * Every hub's dashboard books through BookMyClassModal: the student must be able to
 * choose a 30-minute lesson (1 credit) or a 60-minute lesson (2 credits), and the
 * booking call must carry the right duration and slots.
 */
const state = vi.hoisted(() => ({
  slots: [] as any[],
  calls: [] as any[],
  hubRole: 'academy_mentor',
  credits: 10,
}));

vi.mock('@/integrations/supabase/client', () => {
  const chain = (rows: () => any[]) => {
    const c: any = {};
    for (const m of ['select', 'in', 'eq', 'gte', 'lte', 'order', 'limit']) c[m] = () => c;
    c.then = (res: any) => Promise.resolve({ data: rows(), error: null }).then(res);
    return c;
  };
  return {
    supabase: {
      rpc: (name: string, payload: any) => {
        if (name === 'get_approved_teachers') return Promise.resolve({ data: [{ user_id: 'T1', hub_role: state.hubRole }], error: null });
        if (name === 'get_teacher_hub_map') return Promise.resolve({ data: [], error: null });
        state.calls.push({ name, payload });
        return Promise.resolve({ data: { classroom_id: 'room-1' }, error: null });
      },
      from: (table: string) => chain(() => (table === 'teacher_availability' ? state.slots : [{ id: 'T1', full_name: 'Teacher One' }])),
    },
  };
});
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'S1' } }) }));
vi.mock('@/hooks/usePackageValidation', () => ({ usePackageValidation: () => ({ totalCredits: state.credits, trialAvailable: false, loading: false }) }));
vi.mock('@/hooks/useThemeMode', () => ({ useThemeMode: () => ({ resolvedTheme: 'light' }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => ({ children, ...rest }: any) => React.createElement('div', null, children) }),
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));
vi.mock('../StudentBookingCalendar', () => ({
  StudentBookingCalendar: ({ availableSlots, onBookLesson }: any) =>
    React.createElement('div', null, availableSlots.map((s: any) =>
      React.createElement('button', { key: s.id, 'data-testid': 'slot', onClick: () => onBookLesson(s) }, `${s.duration}:${s.sourceSlotIds?.join('+')}`))),
}));

import { BookMyClassModal } from '../BookMyClassModal';

const future = (h: number, m = 0) => new Date(Date.now() + 3 * 86_400_000 + h * 3_600_000 + m * 60_000);
const row = (id: string, start: Date, duration: 30 | 60) => ({
  id, teacher_id: 'T1', start_time: start.toISOString(), end_time: new Date(start.getTime() + duration * 60_000).toISOString(),
  duration, is_available: true, is_booked: false, hub_specialty: null,
});

const open = (level: 'playground' | 'academy' | 'professional') =>
  render(<BookMyClassModal isOpen onClose={() => {}} studentLevel={level} />);

beforeEach(() => {
  state.calls = [];
  state.credits = 10;
  const a = future(1), b = future(1, 30), c = future(5);
  state.slots = [row('half-1', a, 30), row('half-2', b, 30), row('whole', c, 60)];
});

describe.each([
  ['playground', 'playground_specialist'],
  ['academy', 'academy_mentor'],
  ['professional', 'success_mentor'],
] as const)('%s dashboard booking', (level, role) => {
  it('offers a 30-minute lesson (1 credit) and a 1-hour lesson (2 credits)', async () => {
    state.hubRole = role;
    open(level);
    expect(await screen.findByText('30 min · 1 credit')).toBeTruthy();
    expect(screen.getByText('1 hour · 2 credits')).toBeTruthy();
  });

  it('books a 30-minute lesson from one 30-minute slot', async () => {
    state.hubRole = role;
    open(level);
    const slots = await screen.findAllByTestId('slot');
    expect(slots.map((s) => s.textContent)).toEqual(['30:half-1', '30:half-2']);
    fireEvent.click(slots[0]);
    await waitFor(() => expect(state.calls.length).toBe(1));
    expect(state.calls[0].payload.p_duration).toBe(30);
    expect(state.calls[0].payload.p_slot_ids).toEqual(['half-1']);
  });

  it('books a 60-minute lesson from two back-to-back 30s or one 60-minute slot', async () => {
    state.hubRole = role;
    open(level);
    fireEvent.click(await screen.findByText('1 hour · 2 credits'));
    const slots = await screen.findAllByTestId('slot');
    expect(slots.map((s) => s.textContent)).toEqual(['60:half-1+half-2', '60:whole']);
    fireEvent.click(slots[1]);
    await waitFor(() => expect(state.calls.length).toBe(1));
    expect(state.calls[0].payload.p_duration).toBe(60);
    expect(state.calls[0].payload.p_slot_ids).toEqual(['whole']);
  });
});

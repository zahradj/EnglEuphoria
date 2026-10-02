import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';

// ---- controllable fake of the bits of supabase the lobby uses ----------------
const h = vi.hoisted(() => ({
  row: null as null | { booking_id: string },
  session: null as null | { student_joined_at: string | null },
  selectError: null as null | { message: string },
  insertError: null as null | { code?: string; message: string },
  inserted: [] as any[],
  channels: [] as any[],
}));

vi.mock('@/integrations/supabase/client', () => {
  const makeChannel = (name: string, opts?: any) => {
    const ch: any = {
      name, opts, handlers: [] as any[], presence: {} as Record<string, any[]>,
      on(type: string, filter: any, cb: any) { ch.handlers.push({ type, filter, cb }); return ch; },
      subscribe(cb?: any) { cb?.('SUBSCRIBED'); return ch; },
      track: vi.fn(async () => 'ok'),
      presenceState() { return ch.presence; },
    };
    h.channels.push(ch);
    return ch;
  };
  return {
    supabase: {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () =>
              table === 'classroom_sessions'
                ? { data: h.session, error: null }
                : { data: h.selectError ? null : h.row, error: h.selectError },
          }),
        }),
        insert: async (v: any) => {
          h.inserted.push(v);
          if (!h.insertError) h.row = { booking_id: v.booking_id };
          return { error: h.insertError };
        },
      }),
      channel: makeChannel,
      removeChannel: vi.fn(),
    },
  };
});

import { StudentLobbyGate } from './StudentLobbyGate';
import { TeacherStartBar } from './TeacherStartBar';

const lobbyChannel = () => h.channels.filter((c) => c.name.startsWith('classroom-lobby:')).at(-1);
const stateChannel = () => h.channels.filter((c) => c.name.startsWith('classroom-lobby-state:')).at(-1);

beforeEach(() => {
  h.row = null; h.session = null; h.selectError = null; h.insertError = null; h.inserted = []; h.channels = [];
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('student waiting room', () => {
  const mount = () => render(
    <StudentLobbyGate bookingId="b1" studentId="s1" teacherName="Miss Zahra">
      <div>THE CLASSROOM</div>
    </StudentLobbyGate>,
  );

  it('keeps the student out until the teacher starts, then opens the classroom by itself', async () => {
    mount();
    expect(await screen.findByText('Waiting for your teacher')).toBeTruthy();
    expect(screen.queryByText('THE CLASSROOM')).toBeNull();

    // the teacher presses Start → realtime INSERT arrives
    act(() => { stateChannel().handlers.find((x: any) => x.type === 'postgres_changes').cb({}); });
    expect(await screen.findByText('THE CLASSROOM')).toBeTruthy();
  });

  it('lets the student straight in when the class was already started (e.g. after a reload)', async () => {
    h.row = { booking_id: 'b1' };
    mount();
    expect(await screen.findByText('THE CLASSROOM')).toBeTruthy();
  });

  it('a class already under way (student was in before) is treated as started — no waiting room after a mid-class reload', async () => {
    h.session = { student_joined_at: '2026-10-02T16:10:00Z' };
    mount();
    expect(await screen.findByText('THE CLASSROOM')).toBeTruthy();
  });

  it('shows whether the teacher has arrived', async () => {
    mount();
    await screen.findByText('Waiting for your teacher');
    expect(screen.getByText(/hasn.t arrived yet/)).toBeTruthy();
    act(() => {
      const ch = lobbyChannel();
      ch.presence = { 'teacher:t1': [{ role: 'teacher' }] };
      ch.handlers.find((x: any) => x.type === 'presence').cb();
    });
    expect(await screen.findByText('Your teacher is here')).toBeTruthy();
  });

  it('never strands the student: if the check fails, they are let in', async () => {
    h.selectError = { message: 'permission denied' };
    mount();
    expect(await screen.findByText('THE CLASSROOM')).toBeTruthy();
  });
});

describe('teacher start bar', () => {
  const mount = () => render(<TeacherStartBar bookingId="b1" teacherId="t1" studentName="Viktor" />);

  it('says the student is not here yet, then that they are, and Start hides the bar', async () => {
    mount();
    expect(await screen.findByText(/Waiting for Viktor to join/)).toBeTruthy();

    act(() => {
      const ch = lobbyChannel();
      ch.presence = { 'student:s1': [{ role: 'student' }] };
      ch.handlers.find((x: any) => x.type === 'presence').cb();
    });
    expect(await screen.findByText('Viktor is here')).toBeTruthy();

    fireEvent.click(screen.getByText('Start classroom'));
    await waitFor(() => expect(h.inserted).toEqual([{ booking_id: 'b1' }]));
    await waitFor(() => expect(screen.queryByText('Start classroom')).toBeNull());
  });

  it('can start the class even when the student has not arrived', async () => {
    mount();
    fireEvent.click(await screen.findByText('Start classroom'));
    await waitFor(() => expect(h.inserted.length).toBe(1));
  });

  it('a second press / another device that already started is not an error', async () => {
    h.insertError = { code: '23505', message: 'duplicate key' };
    mount();
    fireEvent.click(await screen.findByText('Start classroom'));
    await waitFor(() => expect(screen.queryByText('Start classroom')).toBeNull());
  });

  it('shows a clear message and stays usable if starting fails', async () => {
    h.insertError = { code: '42501', message: 'permission denied' };
    mount();
    fireEvent.click(await screen.findByText('Start classroom'));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText('Start classroom')).toBeTruthy();
  });

  it('is already hidden when the class was started before (reload)', async () => {
    h.row = { booking_id: 'b1' };
    mount();
    await waitFor(() => expect(screen.queryByText('Start classroom')).toBeNull());
    expect(screen.queryByText(/Waiting for Viktor/)).toBeNull();
  });
});

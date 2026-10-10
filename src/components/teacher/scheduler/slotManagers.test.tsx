import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const svc = vi.hoisted(() => ({
  removeOpenSlot: vi.fn(),
  cancelBookedSeries: vi.fn(),
  cancelBookedSlot: vi.fn(),
  cancelAndRemoveBookedSlot: vi.fn(),
  moveBookedLesson: vi.fn(),
  loadMoveContext: vi.fn(),
}));

vi.mock('@/services/cancelSlotService', async () => {
  const actual = await vi.importActual<typeof import('@/services/cancelSlotService')>('@/services/cancelSlotService');
  return { ...actual, ...svc };
});
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn(), useToast: () => ({ toast: vi.fn() }) }));

import { OpenSlotManager } from './OpenSlotManager';
import { BookedSlotManager } from './BookedSlotManager';

const future = (days: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(h, m, 0, 0);
  return d;
};

beforeEach(() => {
  Object.values(svc).forEach((f) => f.mockReset());
});

describe('OpenSlotManager — remove an open slot', () => {
  const slot = (isRecurring: boolean) => ({ slotId: 's1', startTime: future(3, 10), duration: 30, hub: 'playground' as const, isRecurring });

  it('removes just this slot', async () => {
    svc.removeOpenSlot.mockResolvedValue(undefined);
    const onChanged = vi.fn();
    render(<OpenSlotManager open onOpenChange={() => {}} slot={slot(false)} teacherId="T" onChanged={onChanged} />);
    expect(screen.queryByText(/all later weekly slots/i)).toBeNull(); // a single slot has no series option
    fireEvent.click(screen.getByRole('button', { name: /remove this slot/i }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(svc.removeOpenSlot).toHaveBeenCalledWith({ slotId: 's1', teacherId: 'T' });
    expect(svc.cancelBookedSeries).not.toHaveBeenCalled();
  });

  it('removes a weekly series only after a second tap, and never cancels booked lessons', async () => {
    svc.cancelBookedSeries.mockResolvedValue({ cancelledBookings: 0, removedSlots: 11, keptBooked: 1 });
    const onChanged = vi.fn();
    const s = slot(true);
    render(<OpenSlotManager open onOpenChange={() => {}} slot={s} teacherId="T" onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button', { name: /remove this and all later weekly slots/i }));
    expect(svc.cancelBookedSeries).not.toHaveBeenCalled(); // first tap only arms it
    fireEvent.click(screen.getByRole('button', { name: /tap again to remove them all/i }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(svc.cancelBookedSeries).toHaveBeenCalledWith({ slotId: 's1', fromStart: s.startTime, keepBooked: true });
  });
});

describe('BookedSlotManager — edit (move) and remove a booked slot', () => {
  const start = future(4, 9);
  const slot = (isRecurring = false) => ({
    slotId: 'b1', studentId: 'S', studentName: 'Mia', hub: 'academy' as const, startTime: start, duration: 60, isRecurring,
  });
  const iso = (d: Date) => d.toISOString();
  const context = {
    bookingId: 'cb1',
    scheduledAt: iso(start),
    minutes: 60 as const,
    ownRows: [{ id: 'own', start_time: iso(start), duration: 60, hub_specialty: 'Academy' }],
    openRows: [
      { id: 'o1', start_time: iso(future(5, 11)), duration: 60, hub_specialty: 'Academy' },
      { id: 'o2', start_time: iso(future(5, 14)), duration: 30, hub_specialty: 'Academy' }, // wrong length: not offered
    ],
  };

  it('moves the lesson to one of the open slots', async () => {
    svc.loadMoveContext.mockResolvedValue(context);
    svc.moveBookedLesson.mockResolvedValue({ oldScheduledAt: '', newScheduledAt: '' });
    const onMoved = vi.fn();
    render(<BookedSlotManager open onOpenChange={() => {}} slot={slot()} teacherId="T" onMoved={onMoved} />);

    const moveBtn = await screen.findByRole('button', { name: /move to another time/i });
    await waitFor(() => expect(moveBtn).not.toBeDisabled());
    fireEvent.click(moveBtn);

    // Exactly one fitting time is offered (the 60-minute open slot, not the 30-minute one).
    const timeChips = screen.getAllByRole('button', { pressed: false });
    expect(timeChips).toHaveLength(1);
    fireEvent.click(timeChips[0]);
    fireEvent.click(screen.getByRole('button', { name: /^move to /i }));

    await waitFor(() => expect(onMoved).toHaveBeenCalled());
    expect(svc.moveBookedLesson).toHaveBeenCalledWith({ slotId: 'b1', newStart: iso(future(5, 11)), reason: '' });
  });

  it('says so when there is nowhere to move to', async () => {
    svc.loadMoveContext.mockResolvedValue({ ...context, openRows: [] });
    render(<BookedSlotManager open onOpenChange={() => {}} slot={slot()} teacherId="T" />);
    const moveBtn = await screen.findByRole('button', { name: /move to another time/i });
    await waitFor(() => expect(moveBtn).not.toBeDisabled());
    fireEvent.click(moveBtn);
    expect(screen.getByText(/no open 60-minute slots/i)).toBeTruthy();
  });

  it('cancels and takes the time off the schedule when asked', async () => {
    svc.loadMoveContext.mockResolvedValue(context);
    svc.cancelAndRemoveBookedSlot.mockResolvedValue({ refunded: true, penalized: false, penaltyAmount: 0, removedSlots: 1 });
    const onCancelled = vi.fn();
    render(<BookedSlotManager open onOpenChange={() => {}} slot={slot()} teacherId="T" onCancelled={onCancelled} />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /cancel this lesson/i }));
    await waitFor(() => expect(onCancelled).toHaveBeenCalled());
    expect(svc.cancelAndRemoveBookedSlot).toHaveBeenCalled();
    expect(svc.cancelBookedSlot).not.toHaveBeenCalled();
  });

  it('a plain cancel still just re-opens the slot', async () => {
    svc.loadMoveContext.mockResolvedValue(context);
    svc.cancelBookedSlot.mockResolvedValue({ refunded: true, penalized: false, penaltyAmount: 0 });
    const onCancelled = vi.fn();
    render(<BookedSlotManager open onOpenChange={() => {}} slot={slot()} teacherId="T" onCancelled={onCancelled} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel this lesson/i }));
    await waitFor(() => expect(onCancelled).toHaveBeenCalled());
    expect(svc.cancelBookedSlot).toHaveBeenCalled();
    expect(svc.cancelAndRemoveBookedSlot).not.toHaveBeenCalled();
  });

  it('cancels a weekly series from this lesson onward, after a second tap', async () => {
    svc.loadMoveContext.mockResolvedValue(context);
    svc.cancelBookedSeries.mockResolvedValue({ cancelledBookings: 3, removedSlots: 4, keptBooked: 0 });
    const onCancelled = vi.fn();
    render(<BookedSlotManager open onOpenChange={() => {}} slot={slot(true)} teacherId="T" onCancelled={onCancelled} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel this and all later weekly lessons/i }));
    expect(svc.cancelBookedSeries).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /tap again to cancel them all/i }));
    await waitFor(() => expect(onCancelled).toHaveBeenCalled());
    expect(svc.cancelBookedSeries).toHaveBeenCalledWith(expect.objectContaining({ slotId: 'b1' }));
  });
});

import { describe, it, expect } from 'vitest';
import { isBookingJoinable, pickJoinableBooking } from './joinableBooking';

const at = (iso: string) => new Date(iso);
const academy60 = { id: 'academy', scheduled_at: '2026-10-02T16:00:00Z', duration: 60, hub_type: 'academy' };
const playground30 = { id: 'play', scheduled_at: '2026-10-02T15:30:00Z', duration: 30, hub_type: 'playground' };

describe('which class a student can still join', () => {
  it('lets a student in 20 minutes after the start (the case that was blocked)', () => {
    expect(isBookingJoinable(academy60, at('2026-10-02T16:20:00Z'))).toBe(true);
  });

  it('stays open until the booked end plus the 5-minute grace, then closes', () => {
    expect(isBookingJoinable(academy60, at('2026-10-02T17:05:00Z'))).toBe(true);
    expect(isBookingJoinable(academy60, at('2026-10-02T17:06:00Z'))).toBe(false);
  });

  it('uses the Playground 30-minute length when no duration is stored', () => {
    const p = { id: 'p', scheduled_at: '2026-10-02T15:30:00Z', hub_type: 'playground' };
    expect(isBookingJoinable(p, at('2026-10-02T16:05:00Z'))).toBe(true);
    expect(isBookingJoinable(p, at('2026-10-02T16:06:00Z'))).toBe(false);
  });

  it('never offers a class the teacher has already ended', () => {
    expect(isBookingJoinable({ ...playground30, ended_at: '2026-10-02T16:02:27Z' }, at('2026-10-02T16:03:00Z'))).toBe(false);
  });

  it('back-to-back classes: picks the one that is current, not the older overlapping one', () => {
    const now = at('2026-10-02T16:03:00Z'); // 15:30 class still inside its grace, 16:00 class just started
    expect(pickJoinableBooking([playground30, academy60], now)?.id).toBe('academy');
  });

  it('before a class starts it is offered (opens early), and nothing is returned when nothing is open', () => {
    expect(pickJoinableBooking([academy60], at('2026-10-02T15:40:00Z'))?.id).toBe('academy');
    expect(pickJoinableBooking([academy60], at('2026-10-02T18:00:00Z'))).toBeNull();
    expect(pickJoinableBooking([], at('2026-10-02T16:00:00Z'))).toBeNull();
  });
});

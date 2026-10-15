import { describe, expect, it } from 'vitest';
import { REMIND_WITHIN_MINUTES, localDateKey, minutesUntil, shouldShowSetupReminder } from './setupReminder';

const NOW = new Date(2026, 9, 15, 10, 0, 0);
const at = (minsFromNow: number) => new Date(NOW.getTime() + minsFromNow * 60000);
const base = { now: NOW, lessonId: 'L1', checkedOn: null as string | null, dismissedLessonId: null as string | null };

describe('shouldShowSetupReminder', () => {
  it('shows within 90 minutes before a lesson', () => {
    expect(shouldShowSetupReminder({ ...base, scheduledAt: at(30) })).toBe(true);
    expect(shouldShowSetupReminder({ ...base, scheduledAt: at(REMIND_WITHIN_MINUTES) })).toBe(true);
  });
  it('stays quiet when it is too early or the lesson has started', () => {
    expect(shouldShowSetupReminder({ ...base, scheduledAt: at(REMIND_WITHIN_MINUTES + 1) })).toBe(false);
    expect(shouldShowSetupReminder({ ...base, scheduledAt: at(0) })).toBe(false);
    expect(shouldShowSetupReminder({ ...base, scheduledAt: at(-5) })).toBe(false);
  });
  it('stays quiet when there is no lesson', () => {
    expect(shouldShowSetupReminder({ ...base, scheduledAt: null })).toBe(false);
    expect(shouldShowSetupReminder({ ...base, lessonId: null, scheduledAt: at(20) })).toBe(false);
  });
  it('stays quiet once the teacher has checked today, but not on another day', () => {
    expect(shouldShowSetupReminder({ ...base, scheduledAt: at(20), checkedOn: localDateKey(NOW) })).toBe(false);
    expect(shouldShowSetupReminder({ ...base, scheduledAt: at(20), checkedOn: '2026-10-14' })).toBe(true);
  });
  it('respects "not now" for that lesson only', () => {
    expect(shouldShowSetupReminder({ ...base, scheduledAt: at(20), dismissedLessonId: 'L1' })).toBe(false);
    expect(shouldShowSetupReminder({ ...base, scheduledAt: at(20), dismissedLessonId: 'OTHER' })).toBe(true);
  });
});

describe('helpers', () => {
  it('formats the local day and counts minutes', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(minutesUntil(NOW, at(25))).toBe(25);
  });
});

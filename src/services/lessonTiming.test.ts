import { describe, it, expect } from 'vitest';
import { actualLessonMinutes, isLiveNow, sessionTimesFromRow, windowCloseMs } from './lessonTiming';

const t = (iso: string) => new Date(iso).getTime();
// The 2026-10-02 60-minute Playground lesson (booked 19:30 UTC).
const session = {
  teacher_joined_at: '2026-10-02T19:11:24Z',
  student_joined_at: '2026-10-02T19:12:52Z',
  teacher_last_ping_at: '2026-10-02T20:51:50Z',
  student_last_ping_at: '2026-10-02T21:08:02Z',
  ended_at: null,
};

describe('lessonTiming', () => {
  it('keeps the classroom open while the class is still live (refresh at 20:50)', () => {
    const now = t('2026-10-02T20:50:00Z');
    const live = { ...session, teacher_last_ping_at: '2026-10-02T20:49:30Z' };
    expect(now > windowCloseMs(t('2026-10-02T19:30:00Z'), 60, 5, live)).toBe(true);
    expect(isLiveNow(live, now)).toBe(true);
  });
  it('closes once nobody is connected any more', () => {
    expect(isLiveNow(session, t('2026-10-02T21:30:00Z'))).toBe(false);
  });
  it('counts the booked hour from a late start', () => {
    const late = { teacher_joined_at: '2026-10-02T19:40:00Z', student_joined_at: '2026-10-02T19:45:00Z' };
    expect(windowCloseMs(t('2026-10-02T19:30:00Z'), 60, 5, late)).toBe(t('2026-10-02T20:50:00Z'));
  });
  it('lesson time runs from the booked start (joining early to set up does not count) to when both were last in', () => {
    expect(actualLessonMinutes(session, '2026-10-02T19:30:00Z', null, t('2026-10-02T22:00:00Z'))).toBe(82);
  });
  it('uses the explicit end when there is one', () => {
    expect(actualLessonMinutes(session, '2026-10-02T19:30:00Z', '2026-10-02T20:28:00Z')).toBe(58);
  });
  it('is null when the class never had both sides', () => {
    expect(actualLessonMinutes({ teacher_joined_at: '2026-10-02T19:11:24Z' }, '2026-10-02T19:30:00Z', null, t('2026-10-02T22:00:00Z'))).toBe(null);
  });
  it('counts from the Start Lesson press when the student was late (owner, 2026-10-07)', () => {
    const row = { teacher_joined_at: '2026-10-07T09:28:00Z', student_joined_at: '2026-10-07T09:39:00Z', session_context: { startedAt: '2026-10-07T09:40:00Z' } };
    expect(actualLessonMinutes(sessionTimesFromRow(row), '2026-10-07T09:30:00Z', '2026-10-07T10:05:00Z')).toBe(25);
    expect(actualLessonMinutes(sessionTimesFromRow(row), '2026-10-07T09:30:00Z', '2026-10-07T10:00:00Z')).toBe(20);
  });
});

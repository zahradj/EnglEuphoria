/**
 * Real lesson timing from the classroom session row (classroom_sessions).
 *
 * The live classroom stamps who joined when (teacher_joined_at /
 * student_joined_at) and keeps a heartbeat (teacher_last_ping_at /
 * student_last_ping_at). It does NOT reliably write started_at / ended_at,
 * so durations are worked out from joins + heartbeats instead.
 */

export interface SessionTimes {
  teacher_joined_at?: string | null;
  student_joined_at?: string | null;
  teacher_last_ping_at?: string | null;
  student_last_ping_at?: string | null;
  ended_at?: string | null;
  /** When the teacher pressed Start Lesson (classroom_sessions.session_context.startedAt).
   *  Start needs the student in the room, so this is when the lesson with the
   *  student really began — late student or not (owner, 2026-10-07). */
  lesson_started_at?: string | null;
}

/** SessionTimes from a classroom_sessions row, including the Start Lesson time from session_context. */
export function sessionTimesFromRow(row: Record<string, any> | null | undefined): SessionTimes | null {
  if (!row) return null;
  const startedAt = row.session_context?.startedAt;
  return { ...row, lesson_started_at: typeof startedAt === 'string' ? startedAt : null } as SessionTimes;
}

/** A class is live while someone's heartbeat is this fresh. */
export const LIVE_PING_MS = 3 * 60_000;

const ms = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
};

/** Latest heartbeat from either side (ms), or null. */
export function lastPingMs(s: SessionTimes | null | undefined): number | null {
  if (!s) return null;
  const a = ms(s.teacher_last_ping_at);
  const b = ms(s.student_last_ping_at);
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}

/** True while the teacher or student is still in the room. */
export function isLiveNow(s: SessionTimes | null | undefined, nowMs = Date.now()): boolean {
  const last = lastPingMs(s);
  return last !== null && nowMs - last <= LIVE_PING_MS;
}

/** When the lesson really started: the teacher's Start Lesson press when known; otherwise once both
 *  were in the room, never before the booked start (joining early to set up doesn't count). */
export function actualStartMs(s: SessionTimes | null | undefined, scheduledMs: number | null): number | null {
  // The teacher's Start Lesson press is the real start of the lesson with the student.
  const pressed = ms(s?.lesson_started_at);
  if (pressed !== null) return pressed;
  const t = ms(s?.teacher_joined_at);
  const st = ms(s?.student_joined_at);
  const both = t !== null && st !== null ? Math.max(t, st) : null;
  if (both === null) return scheduledMs;
  return scheduledMs === null ? both : Math.max(both, scheduledMs);
}

/** When the lesson ended: the explicit end, else the end event, else the
 *  last moment both were still connected. */
export function actualEndMs(s: SessionTimes | null | undefined, endedEventIso?: string | null, nowMs = Date.now()): number | null {
  const explicit = ms(s?.ended_at) ?? ms(endedEventIso);
  if (explicit !== null) return explicit;
  const t = ms(s?.teacher_last_ping_at);
  const st = ms(s?.student_last_ping_at);
  const both = t !== null && st !== null ? Math.min(t, st) : (t ?? st);
  if (both === null) return null;
  // Still going: the lesson so far.
  return isLiveNow(s, nowMs) ? nowMs : both;
}

/** Minutes the class actually ran, or null when it can't be told. */
export function actualLessonMinutes(
  s: SessionTimes | null | undefined,
  scheduledAt: string | null | undefined,
  endedEventIso?: string | null,
  nowMs = Date.now(),
): number | null {
  const start = actualStartMs(s, ms(scheduledAt));
  const end = actualEndMs(s, endedEventIso, nowMs);
  if (start === null || end === null || end <= start) return null;
  return Math.max(1, Math.round((end - start) / 60_000));
}

/** When the classroom closes: booked length (+ bonus) counted from the real
 *  start if the lesson began late. */
export function windowCloseMs(scheduledMs: number, bookedMinutes: number, bonusMinutes: number, s?: SessionTimes | null): number {
  const start = actualStartMs(s, scheduledMs) ?? scheduledMs;
  return start + (bookedMinutes + bonusMinutes) * 60_000;
}

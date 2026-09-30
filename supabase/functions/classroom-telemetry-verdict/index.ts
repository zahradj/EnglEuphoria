// classroom-telemetry-verdict: scan stale / overdue sessions and stamp an AI verdict
// (teacher_absent / student_absent / teacher_tech_drop / student_tech_drop).
// Designed to be invoked by pg_cron every minute OR on demand.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const STALE_MS = 60_000; // ping older than 60s = drop

type Sess = {
  id: string;
  room_id: string | null;
  teacher_joined_at: string | null;
  student_joined_at: string | null;
  teacher_last_ping_at: string | null;
  student_last_ping_at: string | null;
  scheduled_at: string | null;
  duration_minutes: number | null;
  fault_type: string | null;
  disconnect_reason: string | null;
  session_status: string;
  lesson_type: string | null;
  started_at: string | null;
  created_at: string;
};

// Grace before the booked end within which a "both left" still counts as
// having finished the lesson (teachers often wrap up a few minutes early).
const FINISHED_GRACE_MS = 5 * 60_000;

type Verdict = { fault: string; verdict: string; status: 'incomplete' | 'ended' };

function classify(s: Sess, bookedEndMs: number | null): Verdict | null {
  if (s.disconnect_reason === 'platform_crash') {
    return { fault: 'platform_crash', verdict: 'Platform crash recorded by Sentinel', status: 'incomplete' };
  }
  const tJoined = !!s.teacher_joined_at;
  const sJoined = !!s.student_joined_at;
  if (!tJoined && !sJoined) {
    return { fault: 'student_absent', verdict: 'Neither participant joined; defaulting to student no-show', status: 'incomplete' };
  }
  if (tJoined && !sJoined) {
    return { fault: 'student_absent', verdict: 'Teacher present; student never joined', status: 'incomplete' };
  }
  if (!tJoined && sJoined) {
    return { fault: 'teacher_absent', verdict: 'Student present; teacher never joined', status: 'incomplete' };
  }
  // Both joined — check pings for stale drop
  const now = Date.now();
  const tPing = s.teacher_last_ping_at ? new Date(s.teacher_last_ping_at).getTime() : 0;
  const sPing = s.student_last_ping_at ? new Date(s.student_last_ping_at).getTime() : 0;
  const tStale = now - tPing > STALE_MS;
  const sStale = now - sPing > STALE_MS;

  const start = s.started_at ?? s.teacher_joined_at ?? s.created_at;
  const elapsedMin = Math.round((now - new Date(start).getTime()) / 60_000);

  if (tStale && !sStale) {
    return { fault: 'teacher_tech_drop', verdict: `Teacher ping lost at minute ${elapsedMin}`, status: 'incomplete' };
  }
  if (sStale && !tStale) {
    return { fault: 'student_tech_drop', verdict: `Student ping lost at minute ${elapsedMin}`, status: 'incomplete' };
  }
  if (tStale && sStale) {
    // Both tabs closing AFTER the booked lesson time is a normal finish where
    // nobody pressed "End Class" — not a crash. This used to be stamped
    // platform_crash/incomplete (e.g. a 30-min lesson closed at minute 44,
    // or a room left open for 108 min), polluting incident audits and
    // resolution/refund flows with false platform faults.
    const lastPing = Math.max(tPing, sPing);
    if (bookedEndMs !== null && lastPing >= bookedEndMs - FINISHED_GRACE_MS) {
      return {
        fault: 'ended_without_end_class',
        verdict: `Lesson ran its booked time; both left at minute ${elapsedMin} without pressing End Class`,
        status: 'ended',
      };
    }
    return { fault: 'platform_crash', verdict: `Both sides lost ping at minute ${elapsedMin}`, status: 'incomplete' };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Candidates: active sessions where (a) scheduled end + 2 min passed, or (b) both pings stale > 60s
  const { data, error } = await supabase
    .from('classroom_sessions')
    .select(
      'id, room_id, teacher_joined_at, student_joined_at, teacher_last_ping_at, student_last_ping_at, scheduled_at, duration_minutes, fault_type, disconnect_reason, session_status, lesson_type, started_at, created_at',
    )
    .in('session_status', ['active', 'waiting'])
    .is('fault_type', null)
    .limit(200);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // classroom_sessions.scheduled_at / duration_minutes are never populated by
  // the client, so read the booked window from the booking itself (room_id is
  // the class_bookings id for booked lessons). Service role, read-only.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const roomIds = [...new Set(((data ?? []) as Sess[]).map((s) => s.room_id).filter((r): r is string => !!r && UUID_RE.test(r)))];
  const bookedEndByRoom = new Map<string, number>();
  if (roomIds.length > 0) {
    const { data: bookings, error: bookingsError } = await supabase
      .from('class_bookings')
      .select('id, scheduled_at, duration')
      .in('id', roomIds);
    if (bookingsError) {
      console.error('[classroom-telemetry-verdict] booking lookup failed:', bookingsError.message);
    }
    for (const b of (bookings ?? []) as { id: string; scheduled_at: string | null; duration: number | null }[]) {
      if (b.scheduled_at && b.duration) {
        bookedEndByRoom.set(b.id, new Date(b.scheduled_at).getTime() + b.duration * 60_000);
      }
    }
  }

  const now = Date.now();
  let processed = 0;
  const failures: { id: string; error: string }[] = [];
  for (const s of (data ?? []) as Sess[]) {
    const overdue =
      s.scheduled_at && s.duration_minutes
        ? now >
          new Date(s.scheduled_at).getTime() + (s.duration_minutes + 2) * 60_000
        : false;
    const tPing = s.teacher_last_ping_at ? new Date(s.teacher_last_ping_at).getTime() : 0;
    const sPing = s.student_last_ping_at ? new Date(s.student_last_ping_at).getTime() : 0;
    const bothStale =
      s.teacher_joined_at && s.student_joined_at && now - tPing > STALE_MS && now - sPing > STALE_MS;
    const oneSideMissingAndOverdue =
      overdue && (!s.teacher_joined_at || !s.student_joined_at);

    if (!overdue && !bothStale && !oneSideMissingAndOverdue) continue;

    const bookedEndMs =
      s.scheduled_at && s.duration_minutes
        ? new Date(s.scheduled_at).getTime() + s.duration_minutes * 60_000
        : (s.room_id ? bookedEndByRoom.get(s.room_id) ?? null : null);
    const verdict = classify(s, bookedEndMs);
    if (!verdict) continue;

    const { error: updateError } = await supabase
      .from('classroom_sessions')
      .update({
        fault_type: verdict.fault,
        disconnect_reason: verdict.fault,
        ai_verdict: verdict.verdict,
        ai_verdict_at: new Date().toISOString(),
        session_status: verdict.status,
        ended_at: s.session_status === 'active' ? new Date().toISOString() : undefined,
      })
      .eq('id', s.id);

    if (updateError) {
      // Previously unchecked -- a write that silently failed every run
      // (e.g. a CHECK constraint rejecting 'incomplete') looked identical
      // to a successful one from this function's own response, since
      // `processed` incremented regardless. Now a real failure is both
      // visible in function logs and reflected in the response body.
      console.error(`[classroom-telemetry-verdict] update failed for session ${s.id}:`, updateError.message);
      failures.push({ id: s.id, error: updateError.message });
      continue;
    }
    processed++;
  }

  return new Response(JSON.stringify({ processed, scanned: data?.length ?? 0, failures }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

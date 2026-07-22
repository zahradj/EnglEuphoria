// classroom-telemetry-verdict: scan stale / overdue sessions and stamp an AI verdict
// (teacher_absent / student_absent / teacher_tech_drop / student_tech_drop).
// Designed to be invoked by pg_cron every minute OR on demand.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const STALE_MS = 60_000; // ping older than 60s = drop

type Sess = {
  id: string;
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

function classify(s: Sess): { fault: string; verdict: string } | null {
  if (s.disconnect_reason === 'platform_crash') {
    return { fault: 'platform_crash', verdict: 'Platform crash recorded by Sentinel' };
  }
  const tJoined = !!s.teacher_joined_at;
  const sJoined = !!s.student_joined_at;
  if (!tJoined && !sJoined) {
    return { fault: 'student_absent', verdict: 'Neither participant joined; defaulting to student no-show' };
  }
  if (tJoined && !sJoined) {
    return { fault: 'student_absent', verdict: 'Teacher present; student never joined' };
  }
  if (!tJoined && sJoined) {
    return { fault: 'teacher_absent', verdict: 'Student present; teacher never joined' };
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
    return { fault: 'teacher_tech_drop', verdict: `Teacher ping lost at minute ${elapsedMin}` };
  }
  if (sStale && !tStale) {
    return { fault: 'student_tech_drop', verdict: `Student ping lost at minute ${elapsedMin}` };
  }
  if (tStale && sStale) {
    return { fault: 'platform_crash', verdict: `Both sides lost ping at minute ${elapsedMin}` };
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
      'id, teacher_joined_at, student_joined_at, teacher_last_ping_at, student_last_ping_at, scheduled_at, duration_minutes, fault_type, disconnect_reason, session_status, lesson_type, started_at, created_at',
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

  const now = Date.now();
  let processed = 0;
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

    const verdict = classify(s);
    if (!verdict) continue;

    await supabase
      .from('classroom_sessions')
      .update({
        fault_type: verdict.fault,
        disconnect_reason: verdict.fault,
        ai_verdict: verdict.verdict,
        ai_verdict_at: new Date().toISOString(),
        session_status: 'incomplete',
        ended_at: s.session_status === 'active' ? new Date().toISOString() : undefined,
      })
      .eq('id', s.id);
    processed++;
  }

  return new Response(JSON.stringify({ processed, scanned: data?.length ?? 0 }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

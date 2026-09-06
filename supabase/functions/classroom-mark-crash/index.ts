// classroom-mark-crash: two related, unauthenticated, service-role actions
// that need to land reliably even when the caller's own tab/session is
// unreliable (a frontend crash, or a tab closing right after End Class).
//
// 1. Original action — stamp platform_crash on a live session when Sentinel
//    catches a frontend crash. Body: { session_id | room_id, message }.
//
// 2. finalize-class-end action (merged in here rather than as its own new
//    function — this project is on Supabase's Free plan, already past its
//    100-function cap, so a brand-new function slug can't be created right
//    now; updating an EXISTING one, like this deploy, works fine). Records
//    the class_ended/trial_ended audit row server-side so the refund +
//    rusher-alert triggers still fire even if the teacher's tab freezes or
//    closes right after End Class (this fetch uses keepalive:true with the
//    anon key, not a real user session, specifically so it survives that —
//    see TeacherClassroom.tsx's handleEndClass). Body: { bookingId, ... }.
//    Discriminated from action 1 purely by which fields are present — the
//    two payload shapes never overlap.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const FinalizeClassEndSchema = z.object({
  bookingId: z.string().uuid(),
  isTrial: z.boolean().default(false),
  endedAtMinutes: z.number().nonnegative(),
  mandatoryMinutes: z.number().nonnegative(),
  totalMinutes: z.number().nonnegative(),
  phase: z.string().max(64).optional().nullable(),
  leftEarly: z.boolean(),
  hubType: z.string().max(64).optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
  teacherId: z.string().uuid().optional().nullable(),
});

async function handleFinalizeClassEnd(admin: ReturnType<typeof createClient>, raw: unknown) {
  const parsed = FinalizeClassEndSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const p = parsed.data;
  const action = p.isTrial ? 'trial_ended' : 'class_ended';

  // Idempotent: skip if an equivalent audit row already exists for this booking.
  const { data: existing } = await admin
    .from('audit_logs')
    .select('id')
    .eq('action', action)
    .eq('resource_id', p.bookingId)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return new Response(JSON.stringify({ ok: true, deduped: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const newValues: Record<string, unknown> = {
    mandatory_minutes: p.mandatoryMinutes,
    total_minutes: p.totalMinutes,
    phase: p.phase ?? null,
    left_early: p.leftEarly,
    hub_type: p.hubType ?? null,
    student_id: p.studentId ?? null,
    source: 'finalize-class-end',
  };
  newValues[p.isTrial ? 'trial_ended_at_minutes' : 'ended_at_minutes'] = p.endedAtMinutes;

  const { error } = await admin.from('audit_logs').insert({
    user_id: p.teacherId ?? null,
    action,
    resource_type: 'class_booking',
    resource_id: p.bookingId,
    new_values: newValues,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Guarantee the booking always reaches a terminal status when the
  // teacher's own tab SKIPPED the wrap-up dialog (left-early exit —
  // TeacherClassroom.tsx never opens LessonWrapUpDialog in that case, so
  // end_lesson would otherwise never run and the booking sits at
  // 'scheduled' forever). Deliberately status-only (mark_booking_ended_status,
  // not end_lesson_service): a left-early session already has its own
  // distinct handling (the student is refunded via
  // refund_credit_on_left_early) and this must NOT start crediting teacher
  // earnings for a session that was cut short — it only records
  // 'failed_technical' (with fault_party) when the heartbeat log shows real
  // disconnects, otherwise 'ended_early'.
  if (p.leftEarly) {
    try {
      const { error: statusErr } = await admin.rpc('mark_booking_ended_status', { p_booking_id: p.bookingId });
      if (statusErr) console.error('mark_booking_ended_status failed:', statusErr);
    } catch (e) {
      console.error('mark_booking_ended_status threw:', e);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleMarkCrash(admin: ReturnType<typeof createClient>, body: any) {
  const { session_id, room_id, message } = body;
  const filter = session_id
    ? { col: 'id', val: session_id }
    : room_id
    ? { col: 'room_id', val: room_id }
    : null;
  if (!filter) {
    return new Response(JSON.stringify({ error: 'session_id or room_id required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { error } = await admin
    .from('classroom_sessions')
    .update({
      disconnect_reason: 'platform_crash',
      fault_type: 'platform_crash',
      ai_verdict: `Frontend crash captured by Sentinel: ${String(message ?? 'unknown').slice(0, 240)}`,
      ai_verdict_at: new Date().toISOString(),
      session_status: 'incomplete',
      ended_at: new Date().toISOString(),
    })
    .eq(filter.col, filter.val);

  if (error) throw error;
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    if (body && typeof body === 'object' && 'bookingId' in body) {
      return await handleFinalizeClassEnd(admin, body);
    }
    return await handleMarkCrash(admin, body ?? {});
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

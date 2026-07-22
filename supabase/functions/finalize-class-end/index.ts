// Tab-independent handoff: records the class_ended / trial_ended audit row
// server-side so the refund + rusher-alert triggers still fire even if the
// teacher's tab freezes or closes right after End Class.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const p = parsed.data;

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

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

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

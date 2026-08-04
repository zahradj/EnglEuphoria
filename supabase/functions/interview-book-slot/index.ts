/**
 * interview-book-slot
 *
 * Public (verify_jwt = false). Token-gated. Writes scheduled_at on the
 * interview row matching the token and flips status to `scheduled`.
 * Enforces: token valid, status in (awaiting_booking, scheduled), no
 * collision with an existing booked interview.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { internalAuthHeaders } from '../_shared/internalAuth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

type CanonicalHub = 'playground' | 'academy' | 'success'

function normalizeHub(value: unknown): CanonicalHub | null {
  const v = String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ')
  if (!v) return null
  if (v.includes('playground') || v.includes('kid') || v.includes('child')) return 'playground'
  if (v.includes('success') || v.includes('professional') || v.includes('adult') || v === 'hub') return 'success'
  if (v.includes('academy') || v.includes('teen')) return 'academy'
  return null
}

function samplerForHub(hub: CanonicalHub): string {
  return hub === 'playground'
    ? 'playground_sampler'
    : hub === 'success'
      ? 'success_sampler'
      : 'academy_sampler'
}

function durationForHub(hub: CanonicalHub): number {
  return hub === 'playground' ? 30 : 60
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method' }, 405)

  try {
    const body = await req.json().catch(() => ({}))
    const token = String(body?.token ?? '').trim()
    const startsAt = String(body?.starts_at ?? '').trim()
    const hubChoice = normalizeHub(body?.hub_type)
    if (!token || !startsAt) return json({ error: 'token and starts_at required' }, 400)

    const startTs = Date.parse(startsAt)
    if (Number.isNaN(startTs)) return json({ error: 'invalid_starts_at' }, 400)
    // Relaxed lead-time: 15 minutes (matches what the slot picker exposes).
    if (startTs < Date.now() + 15 * 60_000) {
      console.warn('[interview-book-slot] slot_too_soon', {
        token: token.slice(0, 8),
        startsAt,
        nowIso: new Date().toISOString(),
      })
      return json({ error: 'slot_too_soon' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error('[interview-book-slot] missing env', {
        hasUrl: Boolean(supabaseUrl),
        hasServiceKey: Boolean(serviceKey),
        hasAnonKey: Boolean(anonKey),
      })
      return json({ error: 'server_configuration_error' }, 500)
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    // Stamp the chosen hub BEFORE the row-locked booking RPC so collision checks
    // use the correct 30/60-minute duration instead of the old 25-minute default.
    if (hubChoice) {
      await admin
        .from('interviews')
        .update({
          hub_type: hubChoice,
          hub: hubChoice,
          mock_lesson_key: samplerForHub(hubChoice),
          duration_minutes: durationForHub(hubChoice),
        } as any)
        .eq('room_token', token)
        .eq('status', 'awaiting_booking')
        .is('scheduled_at', null)
    }

    // Atomic, row-locked booking — one invitation can only ever claim one slot.
    const { data: bookingRows, error: bookErr } = await admin.rpc('book_interview_slot', {
      p_token: token,
      p_starts_at: new Date(startTs).toISOString(),
    })
    if (bookErr) {
      const msg = String(bookErr.message ?? '').toLowerCase()
      const code =
        msg.includes('already_booked') ? 'already_booked' :
        msg.includes('slot_taken') ? 'slot_taken' :
        msg.includes('booking_expired') ? 'booking_expired' :
        msg.includes('interview_cancelled') ? 'interview_cancelled' :
        msg.includes('invalid_token') ? 'invalid_token' :
        msg.includes('slot_too_soon') ? 'slot_too_soon' :
        'booking_failed'
      const status =
        code === 'already_booked' || code === 'slot_taken' ? 409 :
        code === 'booking_expired' || code === 'interview_cancelled' ? 410 :
        code === 'invalid_token' ? 404 : 400
      console.warn('[interview-book-slot] rpc error', { code, raw: bookErr.message })
      return json({ error: code }, status)
    }
    const interview = Array.isArray(bookingRows) ? bookingRows[0] : bookingRows
    if (!interview) return json({ error: 'booking_failed' }, 500)

    const scheduledAtIso = new Date(interview.scheduled_at).toISOString()

    // Persist the applicant's chosen hub. We previously guarded this with
    // `.is('hub_type', null)`, but that left stale/legacy values in place and
    // caused the classroom to theme as Playground for Academy applicants.
    // The applicant's explicit pick always wins.
    const { data: freshInterview } = await admin
      .from('interviews')
      .select('id, hub, hub_type, mock_lesson_key, classroom_session_id')
      .eq('id', interview.id)
      .maybeSingle()

    const canonicalHub = hubChoice ?? normalizeHub((freshInterview as any)?.hub_type) ?? normalizeHub((freshInterview as any)?.hub)
    if (canonicalHub) {
      const hubSampler = samplerForHub(canonicalHub)
      const hubDuration = durationForHub(canonicalHub)
      await admin
        .from('interviews')
        .update({
          hub_type: canonicalHub,
          hub: canonicalHub,
          mock_lesson_key: hubSampler,
          duration_minutes: hubDuration,
        } as any)
        .eq('id', interview.id)
      // Heal any pre-bootstrapped classroom row so the next entry themes correctly.
      const sessionId = (freshInterview as any)?.classroom_session_id || (interview as any).classroom_session_id || `interview-${interview.id}`
      await admin
        .from('classroom_states')
        .update({ mock_lesson_key: hubSampler, is_interview: true } as any)
        .eq('session_id', sessionId)
    }



    // Flip parent application to interview_scheduled (best-effort).
    if (interview.application_id) {
      await admin
        .from('teacher_applications')
        .update({ status: 'interview_scheduled' })
        .eq('id', interview.application_id)
    }

    // Send branded "Interview Confirmed" email with the magic link.
    if (interview.teacher_email) {
      const SITE_URL = 'https://engleuphoria.com'
      const meetingLink = `${SITE_URL}/interview/${interview.room_token}`
      const d = new Date(startTs)
      const interviewDate = d.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
      const interviewTime = d.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false,
      })
      const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          // Internal function-to-function calls must use a real JWT-bearing
          // service key; publishable anon keys are rejected by the Edge gateway.
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'Content-Type': 'application/json',
          ...internalAuthHeaders(),
        },
        body: JSON.stringify({
          templateName: 'interview-confirmed',
          recipientEmail: interview.teacher_email,
          idempotencyKey: `interview-confirmed-${interview.id}-${startTs}`,
          templateData: {
            candidateName: interview.teacher_name ?? 'Applicant',
            interviewDate,
            interviewTime,
            meetingLink,
          },
        }),
      })
      if (!emailRes.ok) {
        const detail = await emailRes.text().catch(() => '')
        // Don't fail the booking on email failure — log and continue.
        console.error('[interview-book-slot] confirmation email', {
          status: emailRes.status,
          detail,
        })
      }
    }

    const finalHub = canonicalHub ?? normalizeHub((freshInterview as any)?.hub_type) ?? normalizeHub((freshInterview as any)?.hub)
    return json({
      ok: true,
      scheduled_at: scheduledAtIso,
      interview: {
        id: interview.id,
        hub_type: finalHub,
        mock_lesson_key: finalHub ? samplerForHub(finalHub) : (freshInterview as any)?.mock_lesson_key,
        duration_minutes: finalHub ? durationForHub(finalHub) : ((interview as any).duration_minutes ?? null),
        classroom_session_id: (freshInterview as any)?.classroom_session_id ?? (interview as any).classroom_session_id ?? null,
      },
    })
  } catch (e: any) {
    console.error('[interview-book-slot]', e)
    return json({ error: e?.message ?? 'internal_error' }, 500)
  }
})

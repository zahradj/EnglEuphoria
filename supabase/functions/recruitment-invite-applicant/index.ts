/**
 * recruitment-invite-applicant
 *
 * Admin-gated. For a given teacher_application:
 *   1. Ensures an `interviews` row exists with `scheduled_at=null,
 *      status='awaiting_booking'` (creates one if missing). The row's
 *      auto-generated `room_token` is the applicant's magic credential.
 *   2. Flips `teacher_applications.status` to `invited`.
 *   3. Sends the branded "Pick your interview time" email pointing to
 *      `${SITE_URL}/interview/<room_token>` — the same magic link the
 *      applicant later uses to enter the live classroom.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { internalAuthHeaders } from '../_shared/internalAuth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SITE_URL = 'https://engleuphoria.com'

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

function normalizeAgeGroups(value: unknown): CanonicalHub | null {
  const items = Array.isArray(value) ? value.map(String) : [String(value ?? '')]
  const normalized = items.map((item) => item.toLowerCase())
  const hasAdult = normalized.some((item) => item.includes('adult'))
  const hasTeen = normalized.some((item) => item.includes('teen'))
  const hasKid = normalized.some((item) => item.includes('kid') || item.includes('child'))
  const count = Number(hasAdult) + Number(hasTeen) + Number(hasKid)
  if (count !== 1) return null
  if (hasAdult) return 'success'
  if (hasTeen) return 'academy'
  if (hasKid) return 'playground'
  return null
}

function samplerForHub(hub: CanonicalHub): string {
  return hub === 'playground' ? 'playground_sampler' : hub === 'success' ? 'success_sampler' : 'academy_sampler'
}

function durationForHub(hub: CanonicalHub): number {
  return hub === 'playground' ? 30 : 60
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error('[recruitment-invite-applicant] missing env', {
        hasUrl: Boolean(supabaseUrl),
        hasServiceKey: Boolean(serviceKey),
        hasAnonKey: Boolean(anonKey),
      })
      return json({ error: 'server_configuration_error' }, 500)
    }

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await caller.auth.getUser()
    if (!user) return json({ error: 'unauthorized' }, 401)

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    const { data: role } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()
    if (!role) return json({ error: 'forbidden' }, 403)

    const body = await req.json().catch(() => ({}))
    const applicationId = String(body?.applicationId ?? '').trim()
    if (!applicationId) return json({ error: 'applicationId required' }, 400)

    const { data: app, error: appErr } = await admin
      .from('teacher_applications')
      .select('id, email, first_name, last_name, hub_preference, preferred_age_groups, status, current_stage')
      .eq('id', applicationId)
      .maybeSingle()
    if (appErr || !app) {
      console.error('[recruitment-invite-applicant] application lookup', appErr)
      return json({ error: 'application_not_found', details: appErr?.message }, 404)
    }

    const candidateName = `${app.first_name ?? ''} ${app.last_name ?? ''}`.trim() || 'Applicant'
    const canonicalHub = normalizeHub(app.hub_preference) ?? normalizeAgeGroups((app as any).preferred_age_groups)
    const hubPatch = canonicalHub
      ? {
          hub: canonicalHub,
          hub_type: canonicalHub,
          mock_lesson_key: samplerForHub(canonicalHub),
          duration_minutes: durationForHub(canonicalHub),
        }
      : { duration_minutes: 60 }

    // 1) Decide booking row:
    //    - Latest 'awaiting_booking' row -> refresh its 48h window, reuse token.
    //    - Otherwise -> create a brand-new interview row with a fresh token.
    //      We never reset a scheduled/in-progress/completed row back to unbooked,
    //      because that would silently let a teacher re-book a different slot
    //      from the same invitation.
    let { data: latest } = await admin
      .from('interviews')
      .select('id, room_token, scheduled_at, status, booking_token_expires_at')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const expiresAtIso = new Date(Date.now() + 48 * 60 * 60_000).toISOString()
    let iv: any = null

    const reusable = latest && latest.status === 'awaiting_booking' && !latest.scheduled_at

    if (reusable) {
      const { data: refreshed, error: refreshErr } = await admin
        .from('interviews')
        .update({
          booking_token_expires_at: expiresAtIso,
          ...hubPatch,
        })
        .eq('id', latest!.id)
        .select('id, room_token, scheduled_at, status, booking_token_expires_at')
        .single()
      if (refreshErr || !refreshed) {
        console.error('[recruitment-invite-applicant] refresh window', refreshErr)
        return json({ error: 'could_not_prepare_booking', details: refreshErr?.message }, 500)
      }
      iv = refreshed
    } else {
      const { data: created, error: createErr } = await admin
        .from('interviews')
        .insert({
          application_id: applicationId,
          admin_id: user.id,
          teacher_email: app.email,
          teacher_name: candidateName,
            ...hubPatch,
          status: 'awaiting_booking',
          booking_token_expires_at: expiresAtIso,
        })
        .select('id, room_token, scheduled_at, status, booking_token_expires_at')
        .single()
      if (createErr || !created) {
        console.error('[recruitment-invite-applicant] insert interview', createErr)
        return json({ error: 'could_not_create_interview', details: createErr?.message }, 500)
      }
      iv = created
    }

    const bookingLink = `${SITE_URL}/interview/${iv.room_token}`
    const expiresAtLabel = new Date(expiresAtIso).toLocaleString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC',
    }) + ' UTC'

    // 2) Flip application status to `invited` (unless already further along).
    if (!['accepted', 'rejected'].includes(app.status)) {
      await admin
        .from('teacher_applications')
        .update({ status: 'invited', current_stage: 'interview_pending' })
        .eq('id', applicationId)
    }

    // 3) Send booking-invitation email via the email function.
    // Internal function-to-function calls must use a real JWT-bearing service
    // key. Some Supabase projects expose SUPABASE_ANON_KEY as a publishable
    // key, which the Edge gateway rejects as UNAUTHORIZED_INVALID_JWT_FORMAT.
    const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
        ...internalAuthHeaders(),
      },
      body: JSON.stringify({
        templateName: 'booking-invitation',
        recipientEmail: app.email,
        idempotencyKey: `recruitment-invite-${iv.id}-${Date.now()}`,
        templateData: { candidateName, bookingLink, expiresAtLabel },
      }),
    })
    const emailBodyText = await emailRes.text()
    if (!emailRes.ok) {
      console.error('[recruitment-invite-applicant] email enqueue', {
        status: emailRes.status,
        detail: emailBodyText,
      })
      return json({ error: 'email_failed', details: emailBodyText || `HTTP ${emailRes.status}` }, 500)
    }
    // Capture resend_id so resend-webhook can later match this row and update
    // it with the real delivered/bounced/complained status -- without it this
    // row is stuck showing "sent" forever regardless of what actually happens.
    let resendId: string | null = null
    try {
      resendId = JSON.parse(emailBodyText)?.resend_id ?? null
    } catch {
      // non-JSON body — leave resendId null
    }

    await admin.from('system_emails').insert({
      email_type: 'recruitment_booking_invite',
      recipient_email: app.email,
      recipient_name: candidateName,
      subject: 'Pick your interview time — EnglEuphoria',
      delivery_status: 'sent',
      sent_at: new Date().toISOString(),
      related_entity_id: iv.id,
      related_entity_type: 'interview',
      metadata: { bookingLink, applicationId, expiresAt: expiresAtIso, ...(resendId ? { resend_id: resendId } : {}) },
    })

    return json({ ok: true, bookingLink, interviewId: iv.id, expiresAt: expiresAtIso })
  } catch (e: any) {
    console.error('[recruitment-invite-applicant]', e)
    return json({ error: e?.message ?? 'internal_error' }, 500)
  }
})

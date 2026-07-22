/**
 * interview-token-auth
 *
 * Public (verify_jwt = false) edge function. Validates a room_token against
 * public.interviews using the service role and returns sanitized metadata.
 *
 * Cycle 5 changes:
 *  - Removed the `too_early` lockout. Applicants can enter the room any time
 *    so they can test equipment and prepare the demo lesson. We instead
 *    return `pre_open: true, opens_at` as a soft advisory.
 *  - Added `bootstrap_room` action so the client can upsert the
 *    classroom_states row entirely server-side.
 *  - Added `create_guest_session` because hosted anonymous auth is disabled;
 *    the token-auth function now creates a scoped temporary interview user.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

type CanonicalHub = 'playground' | 'academy' | 'success'
type TokenAction = 'lookup' | 'bind_session' | 'bootstrap_room' | 'create_guest_session' | 'set_hub'

function normalizeHub(value: unknown): CanonicalHub | null {
  const v = String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ')
  if (!v) return null
  if (v.includes('playground') || v.includes('kid') || v.includes('child')) return 'playground'
  if (v.includes('success') || v.includes('professional') || v.includes('adult') || v === 'hub') return 'success'
  if (v.includes('academy') || v.includes('teen')) return 'academy'
  if (v.includes('playground sampler')) return 'playground'
  if (v.includes('academy sampler')) return 'academy'
  if (v.includes('success sampler')) return 'success'
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
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const body = await req.json().catch(() => ({}))
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const action = (typeof body?.action === 'string' ? body.action : 'lookup') as TokenAction
    const requestedHub = normalizeHub(body?.hub_type)

    if (!token || token.length < 8) {
      return json({ error: 'token required' }, 400)
    }
    if (!['lookup', 'bind_session', 'bootstrap_room', 'create_guest_session', 'set_hub'].includes(action)) {
      return json({ error: 'invalid_action' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { data: interview, error } = await admin
      .from('interviews')
      .select(
        'id, application_id, admin_id, applicant_user_id, teacher_email, teacher_name, mock_lesson_key, hub, hub_type, status, classroom_session_id, scheduled_at, duration_minutes, room_token, booking_token_expires_at, reschedule_count',
      )
      .eq('room_token', token)
      .maybeSingle()

    if (error) {
      console.error('[interview-token-auth] lookup error', error)
      return json({ error: 'lookup failed' }, 500)
    }
    if (!interview) return json({ error: 'invalid_token' }, 404)

    let applicationHub: CanonicalHub | null = null
    if (interview.application_id) {
      const { data: appHubRow } = await admin
        .from('teacher_applications')
        .select('hub_preference, preferred_age_groups')
        .eq('id', interview.application_id)
        .maybeSingle()
      applicationHub = normalizeHub((appHubRow as any)?.hub_preference) ?? normalizeAgeGroups((appHubRow as any)?.preferred_age_groups)
    }

    // Source of truth order:
    // 1) explicit interview hub/hub_type (set by booking/admin)
    // 2) application hub preference (set during application)
    // 3) legacy mock_lesson_key fallback only for old rows with no hub data
    const explicitHub = requestedHub ?? normalizeHub((interview as any).hub_type) ?? normalizeHub((interview as any).hub) ?? applicationHub
    const legacyHub = explicitHub ?? normalizeHub((interview as any).mock_lesson_key)
    if (explicitHub) {
      const desiredLessonKey = samplerForHub(explicitHub)
      const desiredDuration = durationForHub(explicitHub)
      if (
        (interview as any).hub_type !== explicitHub ||
        (interview as any).hub !== explicitHub ||
        interview.mock_lesson_key !== desiredLessonKey ||
        interview.duration_minutes !== desiredDuration
      ) {
        await admin
          .from('interviews')
          .update({
            hub_type: explicitHub,
            hub: explicitHub,
            mock_lesson_key: desiredLessonKey,
            duration_minutes: desiredDuration,
          } as any)
          .eq('id', interview.id)
        ;(interview as any).hub_type = explicitHub
        ;(interview as any).hub = explicitHub
        interview.mock_lesson_key = desiredLessonKey
        interview.duration_minutes = desiredDuration
      }
    }

    if (interview.status === 'cancelled') {
      return json({ error: 'interview_cancelled' }, 410)
    }

    if (action === 'set_hub') {
      if (!requestedHub) return json({ error: 'hub_type_required' }, 400)
      if (interview.status === 'completed') return json({ error: 'room_closed' }, 410)

      const desiredLessonKey = samplerForHub(requestedHub)
      const desiredDuration = durationForHub(requestedHub)
      const sessionId = interview.classroom_session_id || `interview-${interview.id}`

      await admin
        .from('interviews')
        .update({
          hub_type: requestedHub,
          hub: requestedHub,
          mock_lesson_key: desiredLessonKey,
          duration_minutes: desiredDuration,
        } as any)
        .eq('id', interview.id)

      await admin
        .from('classroom_states')
        .update({
          is_interview: true,
          mock_lesson_key: desiredLessonKey,
        } as any)
        .eq('session_id', sessionId)

      ;(interview as any).hub_type = requestedHub
      ;(interview as any).hub = requestedHub
      interview.mock_lesson_key = desiredLessonKey
      interview.duration_minutes = desiredDuration

      return json({
        interview: {
          id: interview.id,
          application_id: interview.application_id,
          admin_id: interview.admin_id,
          applicant_user_id: interview.applicant_user_id,
          teacher_email: interview.teacher_email,
          teacher_name: interview.teacher_name,
          mock_lesson_key: interview.mock_lesson_key,
          hub: (interview as any).hub,
          hub_type: (interview as any).hub_type,
          status: interview.status,
          classroom_session_id: interview.classroom_session_id,
          scheduled_at: interview.scheduled_at,
          duration_minutes: interview.duration_minutes,
          reschedule_count: (interview as any).reschedule_count ?? 0,
          remaining_reschedules: Math.max(0, 2 - ((interview as any).reschedule_count ?? 0)),
        },
        pre_open: false,
        opens_at: null,
      })
    }

    // Booking-window expiry: applicants have 48h from the invitation email
    // to pick a slot. Once expired, the magic link no longer opens the
    // calendar — admin must resend to start a fresh window.
    if (
      !interview.scheduled_at &&
      interview.booking_token_expires_at &&
      Date.now() > new Date(interview.booking_token_expires_at).getTime()
    ) {
      return json({ error: 'booking_expired' }, 410)
    }

    // Compute pre_open / closed advisories.
    // Access is allowed from the moment the interview is created (so the
    // applicant can prepare equipment) and stays open until 30 minutes after
    // the scheduled end OR until the room is explicitly ended.
    let pre_open = false
    let opens_at: string | null = null
    let expired = false
    if (interview.scheduled_at) {
      const start = new Date(interview.scheduled_at).getTime()
      const dur = (interview.duration_minutes ?? 25) * 60_000
      const now = Date.now()
      opens_at = new Date(start - 15 * 60_000).toISOString()
      pre_open = now < start - 15 * 60_000
      // Room auto-closes 30 minutes after the scheduled end time.
      expired = now > start + dur + 30 * 60_000
    }

    // Hard-close once the classroom row has been explicitly ended by the
    // teacher (interview applicant) or admin.
    if (interview.classroom_session_id) {
      const { data: roomRow } = await admin
        .from('classroom_states')
        .select('ended_at, status')
        .eq('session_id', interview.classroom_session_id)
        .maybeSingle()
      if (roomRow?.ended_at || roomRow?.status === 'ended') {
        return json({ error: 'room_closed' }, 410)
      }
    }
    if (expired) return json({ error: 'room_closed' }, 410)

    if (action === 'bind_session') {
      const sessionId = typeof body?.session_id === 'string' ? body.session_id : ''
      if (sessionId && !interview.classroom_session_id) {
        await admin
          .from('interviews')
          .update({ classroom_session_id: sessionId })
          .eq('id', interview.id)
        interview.classroom_session_id = sessionId
      }
    }

    if (action === 'create_guest_session') {
      const guestPassword = crypto.randomUUID() + crypto.randomUUID()
      // Use an RFC 2606 reserved test domain — always passes Auth email
      // validation. The previous `guest.engleuphoria.com` occasionally
      // tripped gotrue's DNS-check heuristics.
      const guestEmail = `interview-${interview.id}-${Date.now()}@interview.example.com`

      // If this interview already has a linked applicant user, rotate its
      // password instead of creating a brand-new user. Avoids piling up
      // orphan users on every retry and dodges createUser transient failures.
      let guestUserId: string | null = null
      if (interview.applicant_user_id) {
        const { data: updated, error: updateErr } = await admin.auth.admin.updateUserById(
          interview.applicant_user_id,
          { password: guestPassword, email: guestEmail, email_confirm: true },
        )
        if (!updateErr && updated?.user?.id) {
          guestUserId = updated.user.id
        } else {
          console.warn('[interview-token-auth] update existing guest failed, will create new', updateErr)
        }
      }

      if (!guestUserId) {
        // Retry createUser up to 3× with exponential backoff — gotrue occasionally
        // returns AuthRetryableFetchError from within the edge runtime and a
        // single failure leaves the applicant stranded on the entry page.
        let lastErr: unknown = null
        for (let attempt = 0; attempt < 3 && !guestUserId; attempt++) {
          if (attempt > 0) {
            await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt - 1)))
          }
          const { data: guest, error: guestErr } = await admin.auth.admin.createUser({
            email: guestEmail,
            password: guestPassword,
            email_confirm: true,
            // NOTE: do NOT set role:'applicant' — public.users_role_check
            // only allows student|teacher|parent|admin|content_creator, and
            // handle_new_user() would fail the auth.users insert, surfacing
            // as an opaque AuthRetryableFetchError 500 to the client.
            user_metadata: {
              full_name: interview.teacher_name ?? 'Interview Guest',
              interview_id: interview.id,
              interview_guest: true,
            },
          })
          if (!guestErr && guest?.user?.id) {
            guestUserId = guest.user.id
            break
          }
          lastErr = guestErr
          console.warn(`[interview-token-auth] createUser attempt ${attempt + 1} failed`, guestErr)
        }

        if (!guestUserId) {
          console.error('[interview-token-auth] guest auth create failed after retries', lastErr)
          return json(
            { error: 'guest_session_failed', details: (lastErr as any)?.message ?? 'auth_unreachable' },
            503,
          )
        }
      }

      const guest = { user: { id: guestUserId } }


      await admin
        .from('interviews')
        .update({ applicant_user_id: guest.user.id })
        .eq('id', interview.id)
      interview.applicant_user_id = guest.user.id

      return json({
        guest_session: {
          email: guestEmail,
          password: guestPassword,
          user_id: guest.user.id,
        },
        interview: {
          id: interview.id,
          application_id: interview.application_id,
          admin_id: interview.admin_id,
          applicant_user_id: interview.applicant_user_id,
          teacher_email: interview.teacher_email,
          teacher_name: interview.teacher_name,
          mock_lesson_key: interview.mock_lesson_key,
          hub_type: (interview as any).hub_type,
          status: interview.status,
          classroom_session_id: interview.classroom_session_id,
          scheduled_at: interview.scheduled_at,
          duration_minutes: interview.duration_minutes,
          reschedule_count: (interview as any).reschedule_count ?? 0,
          remaining_reschedules: Math.max(0, 2 - ((interview as any).reschedule_count ?? 0)),
        },
        pre_open,
        opens_at,
      })
    }

    if (action === 'bootstrap_room') {
      const participantUserId =
        typeof body?.participant_user_id === 'string' && body.participant_user_id.length > 20
          ? body.participant_user_id
          : null
      // Server-side upsert of classroom_states so the client never needs an
      // authenticated session for this step. The applicant's user (whether
      // anonymous or a future logged-in teacher) joins read-only via realtime.
      const sessionId =
        interview.classroom_session_id || `interview-${interview.id}`

      // Never let the bound admin claim the applicant slot — that breaks
      // role detection in the classroom and locks the real applicant out.
      const isAdminUser = !!interview.admin_id && participantUserId === interview.admin_id
      if (participantUserId && !interview.applicant_user_id && !isAdminUser) {
        await admin
          .from('interviews')
          .update({ applicant_user_id: participantUserId })
          .eq('id', interview.id)
        interview.applicant_user_id = participantUserId
      }

      const { data: existingRow } = await admin
        .from('classroom_states')
        .select('id, teacher_id, is_interview, mock_lesson_key')
        .eq('session_id', sessionId)
        .maybeSingle()

      // Derive a hub-correct sampler when the interview doesn't carry an
      // explicit mock_lesson_key. The previous fallback was always
      // 'magic_link_default' which the classroom rendered as Playground.
      const hubKey = explicitHub ?? legacyHub
      const hubSampler = hubKey ? samplerForHub(hubKey) : null
      // hub_type is the source of truth — stored mock_lesson_key is only a
      // legacy fallback for rows that pre-date hub_type. Otherwise an Academy
      // applicant whose row still carries 'playground_sampler' would theme
      // wrong forever.
      const desiredLessonKey =
        hubSampler ?? interview.mock_lesson_key ?? 'magic_link_default'
      const desiredDuration = hubKey ? durationForHub(hubKey) : (interview.duration_minutes ?? 60)

      if (!existingRow) {
        await admin.from('classroom_states').insert({
          session_id: sessionId,
          teacher_id: participantUserId ?? interview.applicant_user_id ?? interview.admin_id,
          lesson_id: null,
          current_slide_index: 0,
          is_interview: true,
          mock_lesson_key: desiredLessonKey,
        } as any)
      } else {
        // Heal whenever the stored key drifts from the hub-derived key, or
        // the row isn't flagged as an interview, or the participant changed.
        const needsHeal =
          !existingRow.is_interview ||
          (participantUserId && existingRow.teacher_id !== participantUserId) ||
          existingRow.mock_lesson_key !== desiredLessonKey
        if (needsHeal) {
          await admin
            .from('classroom_states')
            .update({
              ...(participantUserId ? { teacher_id: participantUserId } : {}),
              is_interview: true,
              mock_lesson_key: desiredLessonKey,
            } as any)
            .eq('session_id', sessionId)
        }
      }

      // Also heal the parent interview row so future lookups are consistent.
      if (hubSampler && interview.mock_lesson_key !== hubSampler) {
        await admin
          .from('interviews')
          .update({
            hub_type: hubKey,
            hub: hubKey,
            mock_lesson_key: hubSampler,
            duration_minutes: desiredDuration,
          } as any)
          .eq('id', interview.id)
        ;(interview as any).hub_type = hubKey
        ;(interview as any).hub = hubKey
        interview.mock_lesson_key = hubSampler
        interview.duration_minutes = desiredDuration
      }



      if (!interview.classroom_session_id) {
        await admin
          .from('interviews')
          .update({ classroom_session_id: sessionId })
          .eq('id', interview.id)
        interview.classroom_session_id = sessionId
      }
    }

    const sanitized = {
      id: interview.id,
      application_id: interview.application_id,
      admin_id: interview.admin_id,
      applicant_user_id: interview.applicant_user_id,
      teacher_email: interview.teacher_email,
      teacher_name: interview.teacher_name,
      mock_lesson_key: interview.mock_lesson_key,
      hub_type: (interview as any).hub_type,
      status: interview.status,
      classroom_session_id: interview.classroom_session_id,
      scheduled_at: interview.scheduled_at,
      duration_minutes: interview.duration_minutes,
      reschedule_count: (interview as any).reschedule_count ?? 0,
      remaining_reschedules: Math.max(0, 2 - ((interview as any).reschedule_count ?? 0)),
    }

    return json({ interview: sanitized, pre_open, opens_at })
  } catch (e: any) {
    console.error('[interview-token-auth] unexpected', e)
    return json({ error: e?.message ?? 'internal_error' }, 500)
  }
})

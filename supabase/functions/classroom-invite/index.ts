import { createClient } from 'npm:@supabase/supabase-js@2'
import { requireAuth } from '../_shared/authGuard.ts'
import { renderClassroomInviteHtml, renderClassroomInviteText, type Hub } from './emailHtml.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = 'https://engleuphoria.com'

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Cryptographically random 32-byte hex token, same convention used by
// send-transactional-email's own token generator and interview-token-auth's
// room_token.
function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Sends the classroom-invite email directly through Resend, mirroring
// send-transactional-email's suppression check and email_send_log
// bookkeeping without depending on (or redeploying) that shared function.
async function sendClassroomInviteEmail(
  adminClient: ReturnType<typeof createClient>,
  props: {
    recipientEmail: string
    studentName: string
    teacherName: string
    lessonDateLabel: string
    lessonTimeLabel: string
    joinLink: string
    hub: Hub
  },
): Promise<boolean> {
  const messageId = crypto.randomUUID()
  const templateName = 'classroom-invitation'

  const { data: suppressed } = await adminClient
    .from('suppressed_emails')
    .select('id')
    .eq('email', props.recipientEmail)
    .maybeSingle()

  if (suppressed) {
    await adminClient.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: props.recipientEmail,
      status: 'suppressed',
    })
    console.log('[CLASSROOM-INVITE] email suppressed', { recipientEmail: props.recipientEmail })
    return false
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    console.error('[CLASSROOM-INVITE] RESEND_API_KEY is not configured')
    await adminClient.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: props.recipientEmail,
      status: 'failed',
      error_message: 'RESEND_API_KEY not configured',
    })
    return false
  }

  await adminClient.from('email_send_log').insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: props.recipientEmail,
    status: 'pending',
  })

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': messageId,
      },
      body: JSON.stringify({
        from: 'EngleEuphoria <noreply@engleuphoria.com>',
        to: [props.recipientEmail],
        subject: `Your lesson with ${props.teacherName} — join here`,
        html: renderClassroomInviteHtml(props),
        text: renderClassroomInviteText(props),
      }),
    })
    const resendBody = await resendRes.json().catch(() => ({}))

    if (!resendRes.ok) {
      const errMsg = `Resend ${resendRes.status}: ${resendBody?.message || JSON.stringify(resendBody)}`
      console.error('[CLASSROOM-INVITE] Resend send failed', errMsg)
      await adminClient.from('email_send_log').insert({
        message_id: messageId,
        template_name: templateName,
        recipient_email: props.recipientEmail,
        status: 'failed',
        error_message: errMsg,
      })
      return false
    }

    await adminClient.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: props.recipientEmail,
      status: 'sent',
      metadata: { resend_id: resendBody?.id },
    })
    return true
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e)
    console.error('[CLASSROOM-INVITE] Resend send threw', errMsg)
    await adminClient.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: props.recipientEmail,
      status: 'failed',
      error_message: errMsg,
    })
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  try {
    const body = await req.json()
    const action = body?.action

    // ── Teacher-only: create a booking for a student (found by email, or
    // created as a real new account) and email them a one-lesson join link.
    if (action === 'create_booking_and_invite') {
      const auth = await requireAuth(req, { allowedRoles: ['teacher', 'admin'] })
      if (!auth.ok) return json(auth.body, auth.status)

      const { studentEmail, studentName, scheduledAt, duration, lessonId, hub } = body
      if (!studentEmail || typeof studentEmail !== 'string') {
        return json({ error: 'studentEmail is required' }, 400)
      }
      if (!scheduledAt || Number.isNaN(new Date(scheduledAt).getTime())) {
        return json({ error: 'A valid scheduledAt is required' }, 400)
      }
      // teacher_availability has a CHECK constraint restricting duration to
      // exactly 30 or 60 -- clamp here so the calendar-grid insert below
      // never violates it, regardless of what the caller sent.
      const durationMinutes = Number(duration) >= 45 ? 60 : 30
      const normalizedEmail = studentEmail.trim().toLowerCase()
      const hubType = hub === 'playground' || hub === 'success' ? hub : 'academy'
      const hubSpecialty = hubType === 'playground' ? 'Playground' : hubType === 'success' ? 'Professional' : 'Academy'

      // Find-or-create the real student account. handle_new_user() (the
      // on_auth_user_created trigger) populates public.users automatically
      // from raw_user_meta_data, so no manual insert is needed here.
      let studentId: string
      const { data: existingUser } = await adminClient
        .from('users')
        .select('id')
        .ilike('email', normalizedEmail)
        .maybeSingle()

      if (existingUser) {
        studentId = existingUser.id
      } else {
        const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
          email: normalizedEmail,
          email_confirm: true,
          user_metadata: { full_name: studentName || normalizedEmail, role: 'student' },
        })
        if (createErr || !created?.user) {
          return json({ error: `Could not create student account: ${createErr?.message || 'unknown error'}` }, 500)
        }
        studentId = created.user.id
      }

      const { data: booking, error: bookingErr } = await adminClient
        .from('class_bookings')
        .insert({
          student_id: studentId,
          teacher_id: auth.userId,
          lesson_id: lessonId || null,
          scheduled_at: scheduledAt,
          duration: durationMinutes,
          status: 'scheduled',
          booking_type: 'regular',
          hub_type: hubType,
        })
        .select('id, scheduled_at, duration')
        .single()
      if (bookingErr || !booking) {
        return json({ error: `Could not create booking: ${bookingErr?.message || 'unknown error'}` }, 500)
      }

      // The teacher's calendar grid (ClassScheduler/useAvailabilityManager)
      // reads booked slots from teacher_availability, not class_bookings --
      // insert the matching already-booked row so this lesson shows up on
      // the calendar exactly like a normal booking would. 'direct_booking'
      // is an existing, real value in this table's lesson_type CHECK
      // constraint, distinct from the open-slot 'free_slot' default.
      const startTime = new Date(scheduledAt)
      const endTime = new Date(startTime.getTime() + durationMinutes * 60_000)
      const { error: availabilityErr } = await adminClient.from('teacher_availability').insert({
        teacher_id: auth.userId,
        student_id: studentId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: durationMinutes,
        is_available: false,
        is_booked: true,
        lesson_type: 'direct_booking',
        lesson_id: lessonId || null,
        lesson_title: studentName ? `Lesson with ${studentName}` : null,
        hub_specialty: hubSpecialty,
      })
      if (availabilityErr) {
        // Non-fatal: the booking + invite are already valid and the student
        // can still join. Only the teacher's calendar-grid display degrades.
        console.error('[CLASSROOM-INVITE] teacher_availability insert failed', availabilityErr)
      }

      // Invite window: the lesson's own duration plus an hour of grace on
      // either side, so a student running a little early or late can still
      // use the same link.
      const token = generateToken()
      const startMs = new Date(booking.scheduled_at).getTime()
      const expiresAt = new Date(startMs + (booking.duration + 60) * 60_000).toISOString()

      const { error: inviteErr } = await adminClient.from('class_booking_invites').insert({
        booking_id: booking.id,
        token,
        student_email: normalizedEmail,
        student_name: studentName || null,
        created_by: auth.userId,
        expires_at: expiresAt,
      })
      if (inviteErr) {
        return json({ error: `Could not create invite: ${inviteErr.message}` }, 500)
      }

      const joinLink = `${SITE_URL}/join-classroom/${token}`

      const { data: teacherRow } = await adminClient
        .from('users')
        .select('full_name')
        .eq('id', auth.userId)
        .maybeSingle()

      const scheduledDate = new Date(booking.scheduled_at)
      const lessonDateLabel = scheduledDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      const lessonTimeLabel = scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

      const emailSent = await sendClassroomInviteEmail(adminClient, {
        recipientEmail: normalizedEmail,
        studentName: studentName || normalizedEmail,
        teacherName: teacherRow?.full_name || 'your teacher',
        lessonDateLabel,
        lessonTimeLabel,
        joinLink,
        hub: hubType as Hub,
      })

      return json({ success: true, bookingId: booking.id, joinLink, emailSent })
    }

    // ── Public: redeem an invite token for a one-time sign-in credential.
    // No JWT — this is reached by an unauthenticated student who just
    // clicked a link in their email.
    if (action === 'enter') {
      const { token } = body
      if (!token || typeof token !== 'string') {
        return json({ error: 'token is required' }, 400)
      }

      const { data: invite, error: inviteErr } = await adminClient
        .from('class_booking_invites')
        .select('id, booking_id, student_email, revoked_at, expires_at')
        .eq('token', token)
        .maybeSingle()

      if (inviteErr || !invite) {
        return json({ error: 'This invite link is invalid.' }, 404)
      }
      if (invite.revoked_at) {
        return json({ error: 'This invite link has been cancelled.' }, 410)
      }
      if (new Date(invite.expires_at).getTime() < Date.now()) {
        return json({ error: 'This invite link has expired. Ask your teacher to send a new one.' }, 410)
      }

      const { data: booking } = await adminClient
        .from('class_bookings')
        .select('id, status')
        .eq('id', invite.booking_id)
        .maybeSingle()
      if (!booking) {
        return json({ error: 'The lesson for this invite no longer exists.' }, 404)
      }
      if (booking.status === 'cancelled') {
        return json({ error: 'This lesson was cancelled.' }, 410)
      }

      // generateLink's returned hashed_token is verified client-side via
      // supabase.auth.verifyOtp({ token_hash, type: 'magiclink' }) -- this
      // sets the session directly without relying on Supabase's hosted
      // redirect flow, so it needs no entry in the Auth redirect-URL
      // allowlist.
      const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: invite.student_email,
      })
      if (linkErr || !linkData?.properties?.hashed_token) {
        console.error('[CLASSROOM-INVITE] generateLink failed', linkErr)
        return json({ error: 'Could not create your sign-in link. Please ask your teacher to resend the invite.' }, 500)
      }

      await adminClient
        .from('class_booking_invites')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', invite.id)

      return json({ tokenHash: linkData.properties.hashed_token, bookingId: booking.id })
    }

    return json({ error: 'Unknown action' }, 400)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[CLASSROOM-INVITE] ERROR', errorMessage)
    return json({ error: errorMessage }, 500)
  }
})

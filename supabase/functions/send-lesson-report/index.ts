import { createClient } from 'npm:@supabase/supabase-js@2'
import { requireAuth } from '../_shared/authGuard.ts'
import {
  renderLessonReportHtml,
  renderLessonReportText,
  reportSubject,
  LANGS,
  LANG_NAME,
  LANG_LOCALE,
  type Hub,
  type Lang,
  type LessonReportEmailProps,
} from './emailHtml.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

const clip = (v: unknown, max = 2000): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const maskEmail = (e: string) => e.replace(/^(.).*(@.*)$/, '$1***$2')

/** What the teacher wrote, as plain strings, so one AI call can translate it all. */
interface Translatable {
  message: string
  homework: string
  lessonTitle: string
  goal: string
  englishToday: string
  confidence: string
  skillLabels: string[]
}

// Translates only the teacher's own words. Returns null on any failure so the
// caller can fall back to sending the English original (never blocks the email).
async function translateReport(t: Translatable, lang: Lang): Promise<Translatable | null> {
  const key = Deno.env.get('GEMINI_API_KEY')
  if (!key) return null
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You translate an English teacher's lesson report for a student's family into ${LANG_NAME[lang]}. ` +
                'Translate every string value naturally and warmly. Keep emojis, bullet characters (•), line breaks and ' +
                'proper nouns (names, "EnglEuphoria") exactly as they are. Do not add, remove or explain anything. ' +
                'Return ONLY JSON with exactly the same keys and array lengths as the input; empty strings stay empty.',
            }],
          },
          contents: [{ role: 'user', parts: [{ text: JSON.stringify(t) }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 4096, responseMimeType: 'application/json' },
        }),
      },
    )
    if (!res.ok) {
      console.error('[SEND-LESSON-REPORT] translate failed', res.status, await res.text())
      return null
    }
    const data = await res.json()
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
    const out = JSON.parse(raw)
    const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback)
    return {
      message: str(out.message, t.message),
      homework: str(out.homework, t.homework),
      lessonTitle: str(out.lessonTitle, t.lessonTitle),
      goal: str(out.goal, t.goal),
      englishToday: str(out.englishToday, t.englishToday),
      confidence: str(out.confidence, t.confidence),
      skillLabels: t.skillLabels.map((l, i) => (Array.isArray(out.skillLabels) ? str(out.skillLabels[i], l) : l)),
    }
  } catch (e) {
    console.error('[SEND-LESSON-REPORT] translate threw', e)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const adminClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  try {
    const auth = await requireAuth(req, { allowedRoles: ['teacher', 'admin'] })
    if (!auth.ok) return json(auth.body, auth.status)

    const body = await req.json()
    const bookingId = body?.booking_id
    const report = body?.report ?? {}
    if (!bookingId || typeof bookingId !== 'string') return json({ error: 'booking_id is required' }, 400)

    const { data: booking } = await adminClient
      .from('class_bookings')
      .select('id, teacher_id, student_id, booking_type, hub_type, scheduled_at')
      .eq('id', bookingId)
      .maybeSingle()
    if (!booking) return json({ error: 'Booking not found' }, 404)
    if (booking.teacher_id !== auth.userId && !auth.roles.includes('admin')) {
      return json({ error: 'Only the lesson’s teacher can email its report' }, 403)
    }

    // Only lessons the teacher created through "Invite a Student" can be emailed.
    // The recipient is decided HERE, never taken from the request: it is the
    // address the teacher invited the student with. (Otherwise this would be an
    // open mail relay for any logged-in teacher.)
    const { data: invite } = await adminClient
      .from('class_booking_invites')
      .select('student_email')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    // action "check": lets the report form ask "can this lesson be emailed, and to whom?"
    // without needing read access to the invites table itself.
    if (body?.action === 'check') {
      return json({ can_email: !!invite?.student_email, to: invite?.student_email ?? null })
    }
    if (!invite?.student_email) {
      return json({ error: 'Reports can only be emailed for lessons created with “Invite a Student”.' }, 403)
    }
    const recipient = invite.student_email.trim().toLowerCase()

    const [{ data: teacher }, { data: student }] = await Promise.all([
      adminClient.from('users').select('full_name').eq('id', booking.teacher_id).maybeSingle(),
      booking.student_id
        ? adminClient.from('users').select('full_name').eq('id', booking.student_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ])

    const hubRaw = String(booking.hub_type ?? '').toLowerCase()
    const hub: Hub = hubRaw === 'playground' || hubRaw === 'kids' ? 'playground'
      : ['success', 'professional', 'adult', 'adults'].includes(hubRaw) ? 'success' : 'academy'

    const isTrial = String(booking.booking_type ?? '').toLowerCase() === 'trial'
    const progress = ['finished', 'most', 'early'].includes(report.progress) ? report.progress : 'finished'
    const skills = (Array.isArray(report.skills) ? report.skills : [])
      .slice(0, 12)
      .filter((s: any) => s && ['low', 'mid', 'good'].includes(s.level))
      .map((s: any) => ({ label: clip(s.label, 60), level: s.level }))

    const t = report.trial ?? {}
    const lessonsPerWeek = Number(t.lessonsPerWeek)

    // Language: the teacher's choice, else the student's saved preference, else English.
    let lang: Lang = 'en'
    if (LANGS.includes(report.language)) {
      lang = report.language
    } else if (booking.student_id) {
      const { data: pref } = await adminClient.from('users').select('preferred_language').eq('id', booking.student_id).maybeSingle()
      if (pref?.preferred_language && LANGS.includes(pref.preferred_language)) lang = pref.preferred_language
    }

    const original: Translatable = {
      message: clip(report.message, 4000),
      homework: clip(report.homework, 400),
      lessonTitle: clip(report.lessonTitle, 120),
      goal: isTrial ? clip(t.goal, 400) : '',
      englishToday: isTrial ? clip(t.englishToday, 120) : '',
      confidence: isTrial ? clip(t.confidence, 120) : '',
      skillLabels: skills.map((sk: { label: string }) => sk.label),
    }
    let translated = false
    let text: Translatable = original
    if (lang !== 'en') {
      const out = await translateReport(original, lang)
      if (out) { text = out; translated = true } else { lang = 'en' } // fall back to English
    }

    const props: LessonReportEmailProps = {
      hub,
      lang,
      isTrial,
      studentName: clip(report.studentName, 80) || student?.full_name || 'there',
      teacherName: teacher?.full_name || 'Your teacher',
      lessonTitle: text.lessonTitle,
      lessonDateLabel: booking.scheduled_at
        ? new Date(booking.scheduled_at).toLocaleDateString(LANG_LOCALE[lang], { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
        : '',
      progress,
      skills: skills.map((sk: { level: 'low' | 'mid' | 'good' }, i: number) => ({ label: text.skillLabels[i] ?? '', level: sk.level })),
      message: text.message,
      homework: text.homework || undefined,
      trial: isTrial ? {
        level: clip(t.level, 20) || undefined,
        englishToday: text.englishToday || undefined,
        confidence: text.confidence || undefined,
        lessonsPerWeek: [1, 2, 3, 4, 5].includes(lessonsPerWeek) ? lessonsPerWeek : undefined,
        goal: text.goal || undefined,
      } : undefined,
    }

    const messageId = crypto.randomUUID()
    const templateName = isTrial ? 'trial-lesson-report' : 'lesson-report'

    const { data: suppressed } = await adminClient.from('suppressed_emails').select('id').eq('email', recipient).maybeSingle()
    if (suppressed) {
      await adminClient.from('email_send_log').insert({ message_id: messageId, template_name: templateName, recipient_email: recipient, status: 'suppressed' })
      return json({ sent: false, reason: 'This address has unsubscribed from emails', to: maskEmail(recipient) })
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      await adminClient.from('email_send_log').insert({ message_id: messageId, template_name: templateName, recipient_email: recipient, status: 'failed', error_message: 'RESEND_API_KEY not configured' })
      return json({ sent: false, reason: 'Email is not configured', to: maskEmail(recipient) })
    }

    await adminClient.from('email_send_log').insert({ message_id: messageId, template_name: templateName, recipient_email: recipient, status: 'pending' })

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': messageId },
      body: JSON.stringify({
        from: 'EngleEuphoria <noreply@engleuphoria.com>',
        to: [recipient],
        subject: reportSubject(props),
        html: renderLessonReportHtml(props),
        text: renderLessonReportText(props),
      }),
    })
    const resendBody = await resendRes.json().catch(() => ({}))
    if (!resendRes.ok) {
      const errMsg = `Resend ${resendRes.status}: ${resendBody?.message || JSON.stringify(resendBody)}`
      console.error('[SEND-LESSON-REPORT]', errMsg)
      await adminClient.from('email_send_log').insert({ message_id: messageId, template_name: templateName, recipient_email: recipient, status: 'failed', error_message: errMsg })
      return json({ sent: false, reason: 'The email service rejected the message', to: maskEmail(recipient) })
    }

    await adminClient.from('email_send_log').insert({ message_id: messageId, template_name: templateName, recipient_email: recipient, status: 'sent', metadata: { resend_id: resendBody?.id, booking_id: bookingId } })
    return json({ sent: true, to: maskEmail(recipient), kind: isTrial ? 'trial' : 'regular', language: lang, translated })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[SEND-LESSON-REPORT] ERROR', errorMessage)
    return json({ error: errorMessage }, 500)
  }
})

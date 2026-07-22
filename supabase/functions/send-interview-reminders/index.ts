import { createClient } from 'npm:@supabase/supabase-js@2'
import { internalAuthHeaders, requireInternalSecret } from '../_shared/internalAuth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = 'https://engleuphoria.com'

// Resolve the magic-link URL from the canonical `interviews` table by application_id.
async function resolveMagicLink(supabase: any, applicationId: string): Promise<string | null> {
  const { data } = await supabase
    .from('interviews')
    .select('room_token')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.room_token ? `${SITE_URL}/interview/${data.room_token}` : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const authError = requireInternalSecret(req, corsHeaders)
  if (authError) return authError

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    return new Response(JSON.stringify({ error: 'Server config error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const now = new Date()

  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const oneDayPlusHour = new Date(now.getTime() + 25 * 60 * 60 * 1000)
  const thirtyMinFromNow = new Date(now.getTime() + 25 * 60 * 1000)
  const thirtyFiveMinFromNow = new Date(now.getTime() + 35 * 60 * 1000)

  console.log('🔔 Checking interview reminders at:', now.toISOString())

  // Get interviews needing 1-day reminder
  const { data: oneDayInterviews, error: err1 } = await supabase
    .from('teacher_interviews')
    .select('*, teacher_applications!inner(email, first_name, last_name)')
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_at', oneDayFromNow.toISOString())
    .lte('scheduled_at', oneDayPlusHour.toISOString())

  if (err1) console.error('Error fetching 1-day reminders:', err1)

  // Get interviews needing 30-min reminder
  const { data: thirtyMinInterviews, error: err2 } = await supabase
    .from('teacher_interviews')
    .select('*, teacher_applications!inner(email, first_name, last_name)')
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_at', thirtyMinFromNow.toISOString())
    .lte('scheduled_at', thirtyFiveMinFromNow.toISOString())

  if (err2) console.error('Error fetching 30-min reminders:', err2)

  let sentCount = 0

  // Send 1-day reminders
  for (const interview of oneDayInterviews || []) {
    const app = (interview as any).teacher_applications
    if (!app?.email) continue

    const scheduledDate = new Date(interview.scheduled_at)
    const candidateName = `${app.first_name} ${app.last_name}`.trim()

    const magicLink = await resolveMagicLink(supabase, interview.application_id)
    if (!magicLink) {
      console.warn(`⚠️ 1-day reminder skipped — no magic-link interviews row for application ${interview.application_id}`)
      continue
    }

    try {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'interview-invitation',
          recipientEmail: app.email,
          idempotencyKey: `interview-reminder-1day-${interview.id}`,
          templateData: {
            name: candidateName,
            interviewDate: scheduledDate.toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            }),
            interviewTime: scheduledDate.toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit', hour12: false,
            }),
            interviewLink: magicLink,
            reminderType: 'Your interview is tomorrow',
          },
        },
        headers: internalAuthHeaders(),
      })

      // Log to system_emails
      await supabase.from('system_emails').insert({
        email_type: 'interview_reminder_1day',
        recipient_email: app.email,
        recipient_name: candidateName,
        subject: `Reminder: EnglEuphoria Interview — ${candidateName}`,
        delivery_status: 'sent',
        sent_at: new Date().toISOString(),
        related_entity_id: interview.id,
        related_entity_type: 'teacher_interview',
      })

      sentCount++
      console.log(`✅ 1-day reminder sent to ${app.email}`)
    } catch (error) {
      console.error(`❌ Failed to send 1-day reminder to ${app.email}:`, error)
      await supabase.from('system_emails').insert({
        email_type: 'interview_reminder_1day',
        recipient_email: app.email,
        recipient_name: candidateName,
        delivery_status: 'failed',
        error_message: String(error),
        related_entity_id: interview.id,
        related_entity_type: 'teacher_interview',
      })
    }
  }

  // Send 30-min reminders
  for (const interview of thirtyMinInterviews || []) {
    const app = (interview as any).teacher_applications
    if (!app?.email) continue

    const scheduledDate = new Date(interview.scheduled_at)
    const candidateName = `${app.first_name} ${app.last_name}`.trim()

    const magicLink = await resolveMagicLink(supabase, interview.application_id)
    if (!magicLink) {
      console.warn(`⚠️ 30-min reminder skipped — no magic-link interviews row for application ${interview.application_id}`)
      continue
    }

    try {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'interview-invitation',
          recipientEmail: app.email,
          idempotencyKey: `interview-reminder-30min-${interview.id}`,
          templateData: {
            name: candidateName,
            interviewDate: scheduledDate.toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            }),
            interviewTime: scheduledDate.toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit', hour12: false,
            }),
            interviewLink: magicLink,
            reminderType: 'Your interview starts in 30 minutes',
          },
        },
        headers: internalAuthHeaders(),
      })

      await supabase.from('system_emails').insert({
        email_type: 'interview_reminder_30min',
        recipient_email: app.email,
        recipient_name: candidateName,
        subject: `Reminder: EnglEuphoria Interview — ${candidateName}`,
        delivery_status: 'sent',
        sent_at: new Date().toISOString(),
        related_entity_id: interview.id,
        related_entity_type: 'teacher_interview',
      })

      sentCount++
      console.log(`✅ 30-min reminder sent to ${app.email}`)
    } catch (error) {
      console.error(`❌ Failed to send 30-min reminder to ${app.email}:`, error)
      await supabase.from('system_emails').insert({
        email_type: 'interview_reminder_30min',
        recipient_email: app.email,
        recipient_name: candidateName,
        delivery_status: 'failed',
        error_message: String(error),
        related_entity_id: interview.id,
        related_entity_type: 'teacher_interview',
      })
    }
  }

  console.log(`📧 Interview reminders complete: ${sentCount} sent`)

  return new Response(
    JSON.stringify({
      success: true,
      reminders_sent: sentCount,
      one_day_count: oneDayInterviews?.length || 0,
      thirty_min_count: thirtyMinInterviews?.length || 0,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})

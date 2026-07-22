import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const interviewId = url.searchParams.get('id')

    if (!interviewId) {
      return new Response(
        '<html><body><h1>Invalid confirmation link</h1><p>Please contact support.</p></body></html>',
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Update interview status to confirmed
    const { data, error } = await adminClient
      .from('teacher_interviews')
      .update({ status: 'confirmed' })
      .eq('id', interviewId)
      .eq('status', 'scheduled')
      .select('*, teacher_applications!inner(first_name, last_name, email)')
      .single()

    if (error || !data) {
      console.error('Confirmation error:', error)
      return new Response(
        `<html>
          <head><style>
            body { font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f4f5f7; margin: 0; }
            .card { background: white; border-radius: 16px; padding: 48px; text-align: center; max-width: 500px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            h1 { color: #6B21A8; font-size: 24px; }
            p { color: #455A64; font-size: 16px; line-height: 1.6; }
          </style></head>
          <body>
            <div class="card">
              <h1>⚠️ Already Confirmed</h1>
              <p>This interview has already been confirmed or the link has expired. If you need to make changes, please contact our team.</p>
            </div>
          </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      )
    }

    const app = (data as any).teacher_applications
    const candidateName = `${app.first_name || ''} ${app.last_name || ''}`.trim()

    // Log confirmation to system_emails
    await adminClient.from('system_emails').insert({
      email_type: 'interview_confirmed',
      recipient_email: app.email,
      recipient_name: candidateName,
      subject: 'Interview Attendance Confirmed',
      delivery_status: 'sent',
      sent_at: new Date().toISOString(),
      related_entity_id: interviewId,
      related_entity_type: 'teacher_interview',
      metadata: { action: 'candidate_confirmed_attendance' },
    })

    console.log(`✅ Interview ${interviewId} confirmed by ${candidateName}`)

    // Return a beautiful confirmation page
    return new Response(
      `<html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500&display=swap');
            body { font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f4f5f7; margin: 0; }
            .card { background: white; border-radius: 16px; padding: 48px; text-align: center; max-width: 520px; box-shadow: 0 8px 32px rgba(26,35,126,0.12); }
            .seal { font-size: 64px; margin-bottom: 16px; }
            h1 { color: #6B21A8; font-size: 28px; font-family: 'Sora', sans-serif; margin: 0 0 12px; }
            .subtitle { color: #2E7D32; font-size: 16px; font-weight: 600; margin: 0 0 24px; }
            p { color: #455A64; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
            .footer { color: #78909C; font-size: 12px; font-style: italic; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="seal">✅</div>
            <h1>Attendance Confirmed!</h1>
            <p class="subtitle">Thank you, ${candidateName || 'Candidate'}!</p>
            <p>Your interview with <strong>Engleuphoria Academy</strong> has been confirmed. We look forward to meeting you!</p>
            <p>Please ensure you have a stable internet connection and a quiet environment for the interview.</p>
            <p class="footer">"Precision in Phonics. Excellence in Education."</p>
          </div>
        </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  } catch (error: any) {
    console.error('Confirm interview error:', error)
    return new Response(
      `<html><body><h1>Error</h1><p>${error.message}</p></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }
})

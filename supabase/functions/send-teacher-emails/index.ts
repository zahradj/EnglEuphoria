import { createClient } from 'npm:@supabase/supabase-js@2'
import { internalAuthHeaders } from '../_shared/internalAuth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { type, teacherName, teacherEmail, interviewDate, interviewTime, rejectionReason } = await req.json()

    console.log(`Processing teacher email type '${type}' to ${teacherEmail}`)

    let templateName: string
    const templateData: Record<string, any> = { name: teacherName }

    switch (type) {
      case 'approval':
        templateName = 'final-welcome'
        break
      case 'rejection':
        templateName = 'application-rejected'
        templateData.rejectionReason = rejectionReason
        break
      case 'interview_invite':
        templateName = 'interview-invitation'
        templateData.interviewDate = interviewDate
        templateData.interviewTime = interviewTime
        break
      case 'video_rejection':
        templateName = 'video-rejected'
        templateData.rejectionReason = rejectionReason
        break
      case 'video_approved':
        templateName = 'video-approved'
        break
      default:
        throw new Error(`Invalid email type: ${type}`)
    }

    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName,
        recipientEmail: teacherEmail,
        idempotencyKey: `teacher-${type}-${teacherEmail}-${Date.now()}`,
        templateData,
      },
      headers: internalAuthHeaders(),
    })

    // Log to system_emails for tracking
    await supabase.from('system_emails').insert({
      email_type: `teacher_${type}`,
      recipient_email: teacherEmail,
      recipient_name: teacherName,
      subject: `EnglEuphoria: ${type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}`,
      delivery_status: error ? 'failed' : 'sent',
      error_message: error?.message || null,
      sent_at: error ? null : new Date().toISOString(),
      metadata: { templateName, templateData },
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    console.error('Error in send-teacher-emails:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})

// Send unit progress report to a student's linked parents.
// Called by the client after a share link is created.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { internalAuthHeaders } from '../_shared/internalAuth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface Payload {
  share_token: string
  student_name?: string
  unit_title?: string
  stars?: number
  accuracy?: number       // 0..1
  mastered_count?: number
  report_base_url?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userRes } = await userClient.auth.getUser()
    const studentUserId = userRes?.user?.id
    if (!studentUserId) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = (await req.json()) as Payload
    if (!body?.share_token) {
      return new Response(JSON.stringify({ error: 'share_token required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const admin = createClient(supabaseUrl, serviceKey)

    // Find linked, approved parents that can view progress.
    const { data: links } = await admin
      .from('student_parent_relationships')
      .select('parent_id, can_view_progress, approved_at')
      .eq('student_id', studentUserId)

    const parentIds = (links ?? [])
      .filter((l) => l.can_view_progress !== false && l.approved_at)
      .map((l) => l.parent_id)

    if (parentIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no_linked_parents' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Resolve emails via auth admin
    const emails: string[] = []
    for (const pid of parentIds) {
      try {
        const { data } = await admin.auth.admin.getUserById(pid)
        const email = data?.user?.email
        if (email) emails.push(email)
      } catch { /* ignore */ }
    }
    if (emails.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no_emails' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const base = body.report_base_url || 'https://engleuphoria.lovable.app'
    const reportUrl = `${base.replace(/\/$/, '')}/reports/${body.share_token}`
    const accuracyPct = typeof body.accuracy === 'number' ? Math.round(body.accuracy * 100) : undefined

    let sent = 0
    for (const to of emails) {
      const { error } = await admin.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'parent-unit-report',
          recipientEmail: to,
          idempotencyKey: `parent-unit-report-${body.share_token}-${to}`,
          templateData: {
            studentName: body.student_name,
            unitTitle: body.unit_title,
            stars: body.stars,
            accuracyPct,
            masteredCount: body.mastered_count,
            reportUrl,
          },
        },
        headers: internalAuthHeaders(),
      })
      if (error) console.error(`[send-parent-unit-report] failed to send to ${to}:`, error);
      else sent++
    }

    return new Response(JSON.stringify({ sent }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

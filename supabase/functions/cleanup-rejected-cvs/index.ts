/**
 * cleanup-rejected-cvs
 *
 * Cron-triggered (see supabase/migrations/20260725100000_teacher_cv_retention.sql,
 * daily at 04:00 UTC). CV retention policy for the recruitment pipeline:
 *
 *   - Rejected applicants: the CV is deleted from storage 90 days after the
 *     application's status last changed to a rejected state, and cv_url is
 *     nulled out on teacher_applications.
 *   - Hired applicants are never touched here — their CV is copied onto
 *     teacher_profiles.cv_url at approval time (see approve-teacher) and is
 *     treated as a permanent part of the employment record.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const INTERNAL_SECRET_HEADER = 'x-internal-secret'

// Mirrors supabase/functions/_shared/internalAuth.ts's requireInternalSecret —
// inlined because the deploy bundler doesn't resolve the shared module's
// `../_shared/...` relative import outside this function's own root.
function requireInternalSecret(req: Request): Response | null {
  const expected = Deno.env.get('INTERNAL_FUNCTION_SECRET')
  const provided = req.headers.get(INTERNAL_SECRET_HEADER)
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  return null
}

const BUCKET = 'teacher-applications'
const RETENTION_DAYS = 90
const REJECTED_STATUSES = ['rejected', 'rejected_grammar']

function cvPathFromUrl(cvUrl: string): string | null {
  if (!cvUrl) return null
  let m = cvUrl.match(/\/object\/public\/teacher-applications\/([^?]+)/)
  if (m) return decodeURIComponent(m[1])
  m = cvUrl.match(/\/object\/sign\/teacher-applications\/([^?]+)/)
  if (m) return decodeURIComponent(m[1])
  if (!/^https?:\/\//i.test(cvUrl)) return cvUrl.replace(/^\/+/, '')
  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const authError = requireInternalSecret(req)
  if (authError) return authError

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server config error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data: rows, error } = await admin
    .from('teacher_applications')
    .select('id, cv_url, status, updated_at')
    .in('status', REJECTED_STATUSES)
    .not('cv_url', 'is', null)
    .lt('updated_at', cutoff)

  if (error) {
    console.error('[cleanup-rejected-cvs] lookup error', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let deleted = 0
  let failed = 0
  const details: { id: string; ok: boolean; reason?: string }[] = []

  for (const row of rows ?? []) {
    const path = cvPathFromUrl(row.cv_url as string)
    if (!path) {
      failed++
      details.push({ id: row.id, ok: false, reason: 'unparseable cv_url' })
      continue
    }

    const { error: removeError } = await admin.storage.from(BUCKET).remove([path])
    if (removeError) {
      failed++
      details.push({ id: row.id, ok: false, reason: removeError.message })
      console.error('[cleanup-rejected-cvs] storage remove failed', row.id, removeError)
      continue
    }

    const { error: updateError } = await admin
      .from('teacher_applications')
      .update({ cv_url: null })
      .eq('id', row.id)

    if (updateError) {
      failed++
      details.push({ id: row.id, ok: false, reason: updateError.message })
      console.error('[cleanup-rejected-cvs] db update failed', row.id, updateError)
      continue
    }

    deleted++
    details.push({ id: row.id, ok: true })
  }

  console.log(`[cleanup-rejected-cvs] checked=${rows?.length ?? 0} deleted=${deleted} failed=${failed}`)

  return new Response(JSON.stringify({ checked: rows?.length ?? 0, deleted, failed, details }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

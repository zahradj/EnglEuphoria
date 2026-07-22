/**
 * interview-cancel-slot
 *
 * Public (verify_jwt = false). Token-gated. Atomically releases a booked
 * interview slot back into availability and increments reschedule_count.
 * Caps at 2 reschedules per invitation. After that, only a fresh
 * invitation from the super admin opens a new booking window.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method' }, 405)

  try {
    const body = await req.json().catch(() => ({}))
    const token = String(body?.token ?? '').trim()
    if (!token) return json({ error: 'token required' }, 400)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) return json({ error: 'server_configuration_error' }, 500)

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    const { data, error } = await admin.rpc('cancel_interview_slot', { p_token: token })
    if (error) {
      const msg = String(error.message ?? '').toLowerCase()
      const code =
        msg.includes('reschedule_limit_reached') ? 'reschedule_limit_reached' :
        msg.includes('too_close_to_start') ? 'too_close_to_start' :
        msg.includes('not_scheduled') ? 'not_scheduled' :
        msg.includes('interview_cancelled') ? 'interview_cancelled' :
        msg.includes('interview_completed') ? 'interview_completed' :
        msg.includes('invalid_token') ? 'invalid_token' :
        'cancel_failed'
      const status =
        code === 'reschedule_limit_reached' ? 409 :
        code === 'too_close_to_start' ? 409 :
        code === 'not_scheduled' ? 409 :
        code === 'invalid_token' ? 404 :
        code === 'interview_cancelled' || code === 'interview_completed' ? 410 :
        400
      console.warn('[interview-cancel-slot] rpc error', { code, raw: error.message })
      return json({ error: code }, status)
    }

    const row = Array.isArray(data) ? data[0] : data
    return json({
      ok: true,
      remaining_reschedules: row?.remaining_reschedules ?? 0,
      reschedule_count: row?.reschedule_count ?? 0,
    })
  } catch (e: any) {
    console.error('[interview-cancel-slot]', e)
    return json({ error: e?.message ?? 'internal_error' }, 500)
  }
})

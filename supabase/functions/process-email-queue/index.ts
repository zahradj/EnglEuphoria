import { createClient } from 'npm:@supabase/supabase-js@2'
import { requireInternalSecret } from '../_shared/internalAuth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

class ResendAPIError extends Error {
  status: number
  retryAfterSeconds?: number
  retryable: boolean

  constructor(status: number, message: string, retryAfterSeconds?: number) {
    super(message)
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
    // 429/5xx are transient; other 4xx (bad request, invalid recipient, etc.) are not.
    this.retryable = status === 429 || status >= 500
  }
}

async function sendViaResend(payload: QueueMessage['payload']): Promise<{ id?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': payload.idempotency_key,
    },
    body: JSON.stringify({
      from: payload.from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 429) {
      const retryAfterHeader = res.headers.get('retry-after')
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : 60
      throw new ResendAPIError(429, 'Rate limited by Resend', Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : 60)
    }
    throw new ResendAPIError(res.status, body?.message || `Resend ${res.status}: ${JSON.stringify(body)}`)
  }

  return body
}

interface QueueMessage {
  id: number
  payload: {
    to: string
    from: string
    sender_domain: string
    subject: string
    html: string
    text: string
    purpose: string
    label: string
    idempotency_key: string
    unsubscribe_token?: string
    message_id?: string
    run_id?: string
    api_base_url?: string
    queued_at: string
  }
  attempts: number
  expires_at: string
  created_at: string
}

async function releaseClaim(
  supabase: any,
  messageId: number,
  visibleAt: string,
) {
  const { error } = await supabase
    .from('email_queue_messages')
    .update({ claimed_at: null, visible_at: visibleAt })
    .eq('id', messageId)

  if (error) {
    console.error('Failed to release claimed message', { error, messageId })
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const authError = requireInternalSecret(req, corsHeaders)
  if (authError) return authError

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  if (!supabaseUrl || !supabaseServiceKey || !RESEND_API_KEY) {
    console.error('Missing required environment variables')
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Check rate-limit backoff
  const { data: state } = await supabase
    .from('email_send_state')
    .select('retry_after_until, send_delay_ms, batch_size')
    .eq('id', 1)
    .single()

  if (state?.retry_after_until && new Date(state.retry_after_until) > new Date()) {
    console.log('Rate-limited, skipping cycle until', state.retry_after_until)
    return new Response(JSON.stringify({ skipped: true, reason: 'rate_limited' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sendDelayMs = state?.send_delay_ms ?? 200
  const batchSize = state?.batch_size ?? 10
  let totalSent = 0
  let totalFailed = 0

  // Process auth_emails queue first (higher priority)
  for (const queueName of ['auth_emails', 'transactional_emails']) {
    const nowIso = new Date().toISOString()
    const { data: messages, error: readError } = await supabase
      .from('email_queue_messages')
      .select('id, payload, attempts, expires_at, created_at')
      .eq('queue_name', queueName)
      .is('claimed_at', null)
      .lte('visible_at', nowIso)
      .order('created_at', { ascending: true })
      .limit(batchSize)

    if (readError) {
      console.error(`Failed to read ${queueName} queue`, readError)
      continue
    }

    if (!messages || messages.length === 0) continue

    console.log(`Processing ${messages.length} messages from ${queueName}`)

    for (const candidate of messages as QueueMessage[]) {
      const claimVisibleAt = new Date(Date.now() + 30_000).toISOString()
      const { data: msg, error: claimError } = await supabase
        .from('email_queue_messages')
        .update({
          attempts: candidate.attempts + 1,
          claimed_at: new Date().toISOString(),
          visible_at: claimVisibleAt,
        })
        .eq('id', candidate.id)
        .eq('attempts', candidate.attempts)
        .is('claimed_at', null)
        .select('id, payload, attempts, expires_at, created_at')
        .maybeSingle()

      if (claimError) {
        console.error('Failed to claim queued email', {
          error: claimError,
          queueName,
          message_id: candidate.id,
        })
        continue
      }

      if (!msg) {
        continue
      }

      const payload = (msg as QueueMessage).payload

      // Check TTL expiry
      if (new Date(msg.expires_at) < new Date()) {
        console.warn('Message expired, moving to DLQ', { id: msg.id, message_id: payload.message_id })
        await supabase.rpc('move_to_dlq', {
          _queue_name: queueName,
          _message_id: msg.id,
          _error_message: 'Message expired (TTL exceeded)',
        })
        await supabase.from('email_send_log').insert({
          message_id: payload.message_id,
          template_name: payload.label || queueName,
          recipient_email: payload.to,
          status: 'dlq',
          error_message: 'Message expired (TTL exceeded)',
        })
        totalFailed++
        continue
      }

      // Send via Resend
      try {
        const resendResult = await sendViaResend(payload)

        await supabase.rpc('delete_email', {
          _queue_name: queueName,
          _message_id: msg.id,
        })
        await supabase.from('email_send_log').insert({
          message_id: payload.message_id,
          template_name: payload.label || queueName,
          recipient_email: payload.to,
          status: 'sent',
          metadata: { resend_id: resendResult?.id },
        })
        totalSent++
      } catch (err) {
        if (err instanceof ResendAPIError && err.status === 429) {
          const retryAfter = err.retryAfterSeconds ?? 60
          const retryUntil = new Date(Date.now() + retryAfter * 1000).toISOString()
          console.warn('Rate limited, backing off until', retryUntil)
          await releaseClaim(supabase, msg.id, retryUntil)
          await supabase
            .from('email_send_state')
            .update({
              retry_after_until: retryUntil,
              last_rate_limit_reason: `429 from email API at ${new Date().toISOString()}`,
            })
            .eq('id', 1)

          return new Response(
            JSON.stringify({ sent: totalSent, failed: totalFailed, rate_limited: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.error('Unexpected error sending email', {
          error: String(err),
          message_id: payload.message_id,
        })

        const errorMessage = err instanceof Error ? err.message : String(err)
        const shouldMoveToDlq =
          msg.attempts >= 5 ||
          (err instanceof ResendAPIError && !err.retryable)

        if (shouldMoveToDlq) {
          await supabase.rpc('move_to_dlq', {
            _queue_name: queueName,
            _message_id: msg.id,
            _error_message: `Failed after ${msg.attempts} attempts: ${errorMessage}`,
          })
          await supabase.from('email_send_log').insert({
            message_id: payload.message_id,
            template_name: payload.label || queueName,
            recipient_email: payload.to,
            status: 'dlq',
            error_message: errorMessage,
          })
          totalFailed++
        } else {
          await releaseClaim(
            supabase,
            msg.id,
            new Date(Date.now() + 30_000).toISOString(),
          )
        }
      }

      // Small delay between sends to avoid bursting
      if (sendDelayMs > 0) {
        await new Promise((r) => setTimeout(r, sendDelayMs))
      }
    }
  }

  console.log(`Queue processing complete: ${totalSent} sent, ${totalFailed} failed`)

  return new Response(
    JSON.stringify({ sent: totalSent, failed: totalFailed }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
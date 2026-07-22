// Public webhook endpoint for Resend delivery events.
// Verifies the Svix signature using RESEND_WEBHOOK_SECRET, then updates the
// matching row in public.system_emails (by resend_id stored in metadata) and
// appends the raw event to metadata.events[].
//
// verify_jwt = false (see supabase/config.toml) so Resend can POST without a
// Supabase JWT. Signature verification is what authenticates the caller.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { Webhook } from 'npm:svix@1.24.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_STATUS_MAP: Record<string, string> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.delivery_delayed': 'delayed',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.failed': 'failed',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!secret || !supabaseUrl || !serviceKey) {
    console.error('resend-webhook: missing env');
    return new Response(JSON.stringify({ error: 'server_misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const raw = await req.text();
  const svixId = req.headers.get('svix-id') ?? '';
  const svixTimestamp = req.headers.get('svix-timestamp') ?? '';
  const svixSignature = req.headers.get('svix-signature') ?? '';

  let event: any;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(raw, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.warn('resend-webhook: signature verification failed', err);
    return new Response(JSON.stringify({ error: 'invalid_signature' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const type: string = event?.type ?? 'unknown';
  const data: any = event?.data ?? {};
  const resendId: string | null = data?.email_id ?? data?.id ?? null;
  const status = RESEND_STATUS_MAP[type] ?? type;

  console.log(`resend-webhook: ${type} for resend_id=${resendId}`);

  const admin = createClient(supabaseUrl, serviceKey);

  if (resendId) {
    // Find the row by metadata->>'resend_id'
    const { data: rows, error: findErr } = await admin
      .from('system_emails')
      .select('id, metadata')
      .eq('metadata->>resend_id', resendId)
      .limit(1);

    if (findErr) {
      console.error('resend-webhook: lookup error', findErr);
    } else if (rows && rows.length > 0) {
      const row = rows[0] as { id: string; metadata: any };
      const meta = (row.metadata ?? {}) as Record<string, any>;
      const events = Array.isArray(meta.events) ? meta.events : [];
      events.push({ type, at: new Date().toISOString(), data });

      const patch: Record<string, any> = {
        delivery_status: status,
        metadata: { ...meta, events, last_event: type, last_event_at: new Date().toISOString() },
      };
      if (type === 'email.delivered') patch.delivered_at = new Date().toISOString();
      if (type === 'email.bounced' || type === 'email.complained' || type === 'email.failed') {
        patch.error_message =
          data?.bounce?.message ?? data?.reason ?? data?.error ?? `Resend ${type}`;
      }

      const { error: updErr } = await admin.from('system_emails').update(patch).eq('id', row.id);
      if (updErr) console.error('resend-webhook: update error', updErr);
    } else {
      console.warn(`resend-webhook: no system_emails row for resend_id=${resendId}`);
    }
  }

  return new Response(JSON.stringify({ ok: true, type, status }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

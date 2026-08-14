// Public webhook endpoint for Resend delivery events.
// Verifies the Svix signature using RESEND_WEBHOOK_SECRET, then updates the
// matching row(s) by resend_id stored in metadata, in BOTH:
//   - public.email_send_log -- populated with resend_id on every single send,
//     since send-transactional-email (the shared sender every caller goes
//     through) always writes it there. This is the reliable match target.
//   - public.system_emails -- only some callers populate resend_id here, so
//     this match is best-effort and will miss rows until each caller is
//     updated to capture and store it too.
// Appends the raw event to metadata.events[] on whichever row(s) match.
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

  // Builds the metadata patch shared by both tables. Neither table has a
  // top-level delivered_at column, so that timestamp lives in metadata too.
  const buildPatchMeta = (existing: Record<string, any>) => {
    const events = Array.isArray(existing.events) ? existing.events : [];
    events.push({ type, at: new Date().toISOString(), data });
    const nowIso = new Date().toISOString();
    const patchMeta: Record<string, any> = { ...existing, events, last_event: type, last_event_at: nowIso };
    if (type === 'email.delivered') patchMeta.delivered_at = nowIso;
    return patchMeta;
  };
  const errorMessage = () =>
    data?.bounce?.message ?? data?.reason ?? data?.error ?? `Resend ${type}`;

  if (resendId) {
    // email_send_log: reliable match -- send-transactional-email always
    // stores resend_id here for every send, regardless of caller.
    const { data: logRows, error: logFindErr } = await admin
      .from('email_send_log')
      .select('id, metadata')
      .eq('metadata->>resend_id', resendId)
      .limit(1);

    if (logFindErr) {
      console.error('resend-webhook: email_send_log lookup error', logFindErr);
    } else if (logRows && logRows.length > 0) {
      const row = logRows[0] as { id: string; metadata: any };
      const patch: Record<string, any> = {
        status,
        metadata: buildPatchMeta((row.metadata ?? {}) as Record<string, any>),
      };
      if (type === 'email.bounced' || type === 'email.complained' || type === 'email.failed') {
        patch.error_message = errorMessage();
      }
      const { error: updErr } = await admin.from('email_send_log').update(patch).eq('id', row.id);
      if (updErr) console.error('resend-webhook: email_send_log update error', updErr);
    } else {
      console.warn(`resend-webhook: no email_send_log row for resend_id=${resendId}`);
    }

    // system_emails: best-effort -- only some callers store resend_id here yet.
    const { data: sysRows, error: sysFindErr } = await admin
      .from('system_emails')
      .select('id, metadata')
      .eq('metadata->>resend_id', resendId)
      .limit(1);

    if (sysFindErr) {
      console.error('resend-webhook: system_emails lookup error', sysFindErr);
    } else if (sysRows && sysRows.length > 0) {
      const row = sysRows[0] as { id: string; metadata: any };
      const patch: Record<string, any> = {
        delivery_status: status,
        metadata: buildPatchMeta((row.metadata ?? {}) as Record<string, any>),
      };
      if (type === 'email.bounced' || type === 'email.complained' || type === 'email.failed') {
        patch.error_message = errorMessage();
      }
      const { error: updErr } = await admin.from('system_emails').update(patch).eq('id', row.id);
      if (updErr) console.error('resend-webhook: system_emails update error', updErr);
    }
  }

  return new Response(JSON.stringify({ ok: true, type, status }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

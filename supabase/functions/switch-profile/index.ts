// Family profile switching ("Who's learning today?").
//
// One device, one parent account, several managed children. Managed children have no password
// anyone knows, so switching is done by minting a short-lived sign-in token for the target:
//   * parent  -> any approved child ............ allowed (the parent is already authenticated)
//   * child   -> a sibling ..................... allowed (same family, managed profiles only)
//   * child   -> the parent .................... requires the FAMILY PIN (rate limited, locked
//                                                 after repeated failures)
// The client exchanges the returned token_hash with supabase.auth.verifyOtp() to get a session.
//
// Actions (POST JSON):
//   { action: 'list' }                       -> { role, parentId, hasPin, profiles[] }
//   { action: 'set-pin', pin }               -> parent only; 4 digits
//   { action: 'switch', targetId, pin? }     -> { tokenHash, role, hub }   (targetId: child id | 'parent')
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHILD_EMAIL_DOMAIN = '@children.engleuphoria.invalid';
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const PBKDF2_ITERATIONS = 100_000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const b64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf instanceof Uint8Array ? buf : new Uint8Array(buf))));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function hashPin(pin: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return b64(bits);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Missing Authorization header' }, 401);

    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !caller) return json({ error: 'Invalid session' }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    // ---- Who is the caller within a family? -------------------------------------------------
    const callerIsManagedChild = (caller.email ?? '').endsWith(CHILD_EMAIL_DOMAIN);

    let parentId: string | null = null;
    if (callerIsManagedChild) {
      const { data: link } = await admin
        .from('student_parent_relationships')
        .select('parent_id')
        .eq('student_id', caller.id)
        .not('approved_at', 'is', null)
        .limit(1)
        .maybeSingle();
      parentId = link?.parent_id ?? null;
    } else {
      const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', caller.id);
      if ((roles ?? []).some((r: any) => r.role === 'parent')) parentId = caller.id;
    }
    if (!parentId) return json({ error: 'No family found for this account' }, 403);
    const callerRole: 'parent' | 'child' = callerIsManagedChild ? 'child' : 'parent';

    // Approved, managed children of this family.
    const loadChildren = async () => {
      const { data: links, error } = await admin
        .from('student_parent_relationships')
        .select('student_id')
        .eq('parent_id', parentId)
        .not('approved_at', 'is', null);
      if (error) throw error;
      const ids = (links ?? []).map((l: any) => l.student_id);
      if (ids.length === 0) return [];
      const [{ data: users }, { data: profiles }] = await Promise.all([
        admin.from('users').select('id, full_name, email').in('id', ids),
        admin.from('student_profiles').select('user_id, hub_type, age, companion_id').in('user_id', ids),
      ]);
      const profileById = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
      return (users ?? [])
        .filter((u: any) => (u.email ?? '').endsWith(CHILD_EMAIL_DOMAIN))
        .map((u: any) => {
          const p: any = profileById.get(u.id) ?? {};
          return { id: u.id, name: u.full_name, hub: p.hub_type ?? 'playground', age: p.age ?? null, companionId: p.companion_id ?? null };
        })
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
    };

    const mint = async (userId: string) => {
      const { data: target, error: tErr } = await admin.auth.admin.getUserById(userId);
      if (tErr || !target?.user?.email) throw new Error('Target account not found');
      const { data: link, error: lErr } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: target.user.email,
      });
      const tokenHash = link?.properties?.hashed_token;
      if (lErr || !tokenHash) throw new Error(lErr?.message ?? 'Could not create session');
      return tokenHash as string;
    };

    // ---- list --------------------------------------------------------------------------------
    if (action === 'list') {
      const { data: pinRow } = await admin.from('family_pins').select('parent_id').eq('parent_id', parentId).maybeSingle();
      return json({ role: callerRole, parentId, hasPin: !!pinRow, selfId: caller.id, profiles: await loadChildren() });
    }

    // ---- set-pin (parent only) ---------------------------------------------------------------
    if (action === 'set-pin') {
      if (callerRole !== 'parent') return json({ error: 'Only the parent can set the family PIN' }, 403);
      const pin = String(body?.pin ?? '');
      if (!/^\d{4}$/.test(pin)) return json({ error: 'The PIN must be exactly 4 digits' }, 400);
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const { error } = await admin.from('family_pins').upsert({
        parent_id: parentId,
        salt: b64(salt),
        pin_hash: await hashPin(pin, salt),
        failed_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'parent_id' });
      if (error) return json({ error: 'Could not save the PIN' }, 500);
      return json({ success: true });
    }

    // ---- switch ------------------------------------------------------------------------------
    if (action === 'switch') {
      const targetId = String(body?.targetId ?? '');
      if (!targetId) return json({ error: 'targetId is required' }, 400);

      if (targetId === 'parent' || targetId === parentId) {
        if (callerRole === 'parent') return json({ error: 'You are already signed in as the parent' }, 400);

        // Child -> parent: family PIN required.
        const pin = String(body?.pin ?? '');
        const { data: pinRow } = await admin.from('family_pins').select('*').eq('parent_id', parentId).maybeSingle();
        if (!pinRow) return json({ error: 'no_pin', message: 'The parent has not set a family PIN yet.' }, 403);

        if (pinRow.locked_until && new Date(pinRow.locked_until) > new Date()) {
          return json({ error: 'locked', message: 'Too many wrong tries. Please wait a few minutes.' }, 429);
        }
        if (!/^\d{4}$/.test(pin)) return json({ error: 'bad_pin', message: 'Enter the 4-digit PIN.' }, 400);

        const candidate = await hashPin(pin, unb64(pinRow.salt));
        if (!timingSafeEqual(candidate, pinRow.pin_hash)) {
          const attempts = (pinRow.failed_attempts ?? 0) + 1;
          const lock = attempts >= MAX_FAILED_ATTEMPTS
            ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString()
            : null;
          await admin.from('family_pins').update({
            failed_attempts: lock ? 0 : attempts,
            locked_until: lock,
          }).eq('parent_id', parentId);
          return json({
            error: lock ? 'locked' : 'wrong_pin',
            message: lock ? 'Too many wrong tries. Please wait a few minutes.' : 'That PIN is not right.',
            triesLeft: lock ? 0 : MAX_FAILED_ATTEMPTS - attempts,
          }, lock ? 429 : 403);
        }

        await admin.from('family_pins').update({ failed_attempts: 0, locked_until: null }).eq('parent_id', parentId);
        return json({ tokenHash: await mint(parentId), role: 'parent', hub: null });
      }

      // -> a child of this family (from the parent, or from a sibling)
      const children = await loadChildren();
      const target = children.find((c: any) => c.id === targetId);
      if (!target) return json({ error: 'That profile is not part of your family' }, 403);
      if (target.id === caller.id) return json({ error: 'You are already in this profile' }, 400);

      return json({ tokenHash: await mint(target.id), role: 'child', hub: target.hub });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e: any) {
    console.error('[switch-profile] unexpected error', e);
    return json({ error: e?.message ?? 'Unknown error' }, 500);
  }
});

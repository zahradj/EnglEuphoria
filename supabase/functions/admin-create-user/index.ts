// Admin-only edge function to create a staff account (admin, marketing,
// teacher, content_creator, or parent) with a system-generated password.
// Verifies the caller is already an authenticated admin via their JWT
// (same pattern as admin-create / admin-delete-user) before minting a new
// account. The caller never chooses or sees a password they typed — it's
// generated here and returned once so the admin can hand it to the new
// user, who can change it via the existing "Forgot password" flow.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASSIGNABLE_ROLES = ['admin', 'marketing', 'teacher', 'content_creator', 'parent'] as const;
type AssignableRole = typeof ASSIGNABLE_ROLES[number];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Cryptographically random password: uppercase, lowercase, digit, symbol
 *  guaranteed, 16 chars total. */
function generatePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*-_+=';
  const all = upper + lower + digits + symbols;

  const randomFrom = (charset: string) => {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    return charset[bytes[0] % charset.length];
  };

  const required = [randomFrom(upper), randomFrom(lower), randomFrom(digits), randomFrom(symbols)];
  const remaining = Array.from({ length: 12 }, () => randomFrom(all));
  const chars = [...required, ...remaining];

  // Fisher-Yates shuffle so the guaranteed chars aren't always in the same position.
  for (let i = chars.length - 1; i > 0; i--) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const j = bytes[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Missing Authorization header' }, 401);
    }

    // Resolve caller from their JWT.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !caller) return json({ error: 'Invalid session' }, 401);

    // Admin check via user_roles using the service-role client (RLS-bypassing).
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roles, error: rolesErr } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id);
    if (rolesErr) return json({ error: rolesErr.message }, 500);

    const isAdmin = (roles ?? []).some((r: any) => r.role === 'admin');
    if (!isAdmin) return json({ error: 'Admin role required' }, 403);

    const { fullName, email, role } = await req.json().catch(() => ({}));

    if (!fullName || typeof fullName !== 'string') {
      return json({ error: 'fullName is required' }, 400);
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'A valid email is required' }, 400);
    }
    if (!ASSIGNABLE_ROLES.includes(role)) {
      return json({ error: `role must be one of: ${ASSIGNABLE_ROLES.join(', ')}` }, 400);
    }
    const assignedRole = role as AssignableRole;

    const generatedPassword = generatePassword();

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: generatedPassword,
      user_metadata: { full_name: fullName, role: assignedRole },
      email_confirm: true,
    });
    if (authError || !authData?.user) {
      return json({ error: authError?.message ?? 'Failed to create auth user' }, 400);
    }

    const { error: profileError } = await admin.from('users').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: assignedRole,
    });
    if (profileError) {
      console.error('[admin-create-user] profile insert failed', profileError);
      await admin.auth.admin.deleteUser(authData.user.id);
      return json({ error: 'Failed to create user profile' }, 500);
    }

    const { error: roleError } = await admin.from('user_roles').insert({
      user_id: authData.user.id,
      role: assignedRole,
      assigned_by: caller.id,
    });
    if (roleError) {
      console.error('[admin-create-user] role insert failed', roleError);
      await admin.from('users').delete().eq('id', authData.user.id);
      await admin.auth.admin.deleteUser(authData.user.id);
      return json({ error: 'Failed to assign role' }, 500);
    }

    return json({
      success: true,
      userId: authData.user.id,
      generatedPassword,
      message: `${assignedRole} account created for ${fullName}`,
    });
  } catch (e: any) {
    console.error('[admin-create-user] unexpected error', e);
    return json({ error: e?.message ?? 'Unknown error' }, 500);
  }
});

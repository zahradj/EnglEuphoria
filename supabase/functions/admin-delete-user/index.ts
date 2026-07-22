// Admin-only edge function to fully delete a user (auth + cascading public rows).
// Verifies the caller is an admin via their JWT, then uses the service role
// key internally to call `auth.admin.deleteUser`.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { userId } = await req.json().catch(() => ({}));
    if (!userId || typeof userId !== 'string') {
      return json({ error: 'userId is required' }, 400);
    }
    if (userId === caller.id) {
      return json({ error: 'You cannot delete your own account from here' }, 400);
    }

    // Best-effort cleanup of profile rows that have no auth-cascade.
    await admin.from('student_profiles').delete().eq('user_id', userId);
    await admin.from('teacher_profiles').delete().eq('user_id', userId);
    await admin.from('user_roles').delete().eq('user_id', userId);
    await admin.from('users').delete().eq('id', userId);

    // Finally, delete the auth user. This cascades to most FKs that reference auth.users.
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      console.error('[admin-delete-user] auth.deleteUser failed', delErr);
      return json({ error: delErr.message }, 500);
    }

    return json({ ok: true });
  } catch (e: any) {
    console.error('[admin-delete-user] unexpected error', e);
    return json({ error: e?.message ?? 'Unknown error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

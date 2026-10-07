// "Switch to a family account": lets someone who signed up as a student become a parent.
//
// A student-only account cannot add children (create-family-children refuses anyone without the
// 'parent' role), and the parent sign-up form cannot reuse an email that already has a student
// account. This function closes that gap: the signed-in student asks for it, and the role is
// granted HERE with the service role, never from the browser.
//
// Rules, each one a refusal with a plain message:
//   - the email address must be confirmed (the new role unlocks a family dashboard);
//   - only a plain student account may switch: not staff, not a family member's managed profile;
//   - no upcoming lessons: after the switch the account lands on the family dashboard, so a lesson
//     booked on it would have no student page to join from.
//
// The account keeps its student role, lessons and progress (nothing is deleted). It gets what a
// normal parent sign-up gets: the 'parent' role, a parent_profiles row and notification settings.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STAFF_ROLES = ['admin', 'marketing', 'content_creator', 'teacher'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Missing Authorization header' }, 401);

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !caller) return json({ error: 'Invalid session' }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: roleRows, error: rolesErr } = await admin
      .from('user_roles').select('role').eq('user_id', caller.id);
    if (rolesErr) return json({ error: rolesErr.message }, 500);
    const roles = (roleRows ?? []).map((r: { role: string }) => r.role);

    // Asking twice is harmless.
    if (roles.includes('parent')) return json({ success: true, alreadyFamily: true });

    if (!caller.email_confirmed_at) {
      return json({ error: 'Please confirm your email address first, then try again.' }, 403);
    }
    if (!roles.includes('student') || roles.some((r) => STAFF_ROLES.includes(r))) {
      return json({ error: 'Only student accounts can switch to a family account.' }, 403);
    }

    // A family member's own profile is managed by their parent and has no login of its own.
    const { count: linkedAsChild } = await admin
      .from('student_parent_relationships')
      .select('student_id', { count: 'exact', head: true })
      .eq('student_id', caller.id);
    if (linkedAsChild) {
      return json({ error: 'This profile belongs to a family. Ask the parent to manage it from their family account.' }, 403);
    }

    const { count: upcoming } = await admin
      .from('class_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', caller.id)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString());
    if (upcoming) {
      return json({
        error: `You have ${upcoming} upcoming ${upcoming === 1 ? 'lesson' : 'lessons'}. Finish or cancel ${upcoming === 1 ? 'it' : 'them'} first, then switch.`,
        upcomingLessons: upcoming,
      }, 409);
    }

    const { data: userRow } = await admin
      .from('users').select('full_name, email').eq('id', caller.id).maybeSingle();
    const fullName =
      userRow?.full_name || (caller.user_metadata as { full_name?: string } | null)?.full_name ||
      (userRow?.email ?? caller.email ?? '').split('@')[0] || 'Parent';

    // Same rows handle_new_user() creates for a parent sign-up.
    const { error: roleErr } = await admin
      .from('user_roles')
      .upsert({ user_id: caller.id, role: 'parent' }, { onConflict: 'user_id,role', ignoreDuplicates: true });
    if (roleErr) return json({ error: `Could not switch your account: ${roleErr.message}` }, 500);

    const { error: profileErr } = await admin
      .from('parent_profiles')
      .upsert({ user_id: caller.id, full_name: fullName }, { onConflict: 'user_id', ignoreDuplicates: true });
    if (profileErr) console.error('[become-family-account] parent_profiles upsert failed', profileErr);

    const { error: prefsErr } = await admin
      .from('parent_notification_preferences')
      .upsert({ parent_id: caller.id }, { onConflict: 'parent_id', ignoreDuplicates: true });
    if (prefsErr) console.error('[become-family-account] notification preferences upsert failed', prefsErr);

    return json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[become-family-account] ERROR', message);
    return json({ error: message }, 500);
  }
});

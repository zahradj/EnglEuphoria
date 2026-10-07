// Parent-driven child profile creation ("family accounts").
//
// A parent (authenticated, role 'parent') sends a list of children; for each one this function
// creates a managed student account that the child never logs into directly (random password
// nobody sees, placeholder address on a reserved domain), lets the handle_new_user trigger build
// users / user_roles / student_profiles, then links the child to the parent with an APPROVED
// student_parent_relationships row.
//
// Linking happens ONLY here, with the service role, after checking the caller's own role - the
// client can no longer insert into student_parent_relationships.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_CHILDREN_PER_FAMILY = 8;
const MIN_AGE = 4;
const MAX_AGE = 90; // adults the parent manages too (the parent learning alongside their children, a partner...)
const CHILD_EMAIL_DOMAIN = 'children.engleuphoria.invalid';
const RELATIONSHIPS = ['mother', 'father', 'guardian', 'other'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function randomPassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('') + 'Aa1!';
}

function ageFromDob(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return age;
}

// Mirrors src/lib/hubAssignment.ts and handle_new_user(): 4-9 playground, 10-17 academy, 18+ success (professional).
function hubForAge(age: number) {
  // users.current_system has a CHECK constraint on these exact lowercase values.
  if (age < 10) return { hub: 'playground', duration: 30, goal: '3 lessons/week', system: 'kids' };
  if (age >= 18) return { hub: 'professional', duration: 55, goal: 'Flexible', system: 'adult' };
  return { hub: 'academy', duration: 55, goal: '2 hours/week', system: 'teen' };
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

    const { data: roles, error: rolesErr } = await admin
      .from('user_roles').select('role').eq('user_id', caller.id);
    if (rolesErr) return json({ error: rolesErr.message }, 500);
    if (!(roles ?? []).some((r: any) => r.role === 'parent')) {
      return json({ error: 'Only parent accounts can add children' }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const children = Array.isArray(body?.children) ? body.children : [];
    const relationshipType = RELATIONSHIPS.includes(body?.relationshipType) ? body.relationshipType : 'guardian';
    if (children.length < 1) return json({ error: 'Add at least one child' }, 400);

    const { count: existing, error: countErr } = await admin
      .from('student_parent_relationships')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', caller.id);
    if (countErr) return json({ error: countErr.message }, 500);
    if ((existing ?? 0) + children.length > MAX_CHILDREN_PER_FAMILY) {
      return json({ error: `A family can have up to ${MAX_CHILDREN_PER_FAMILY} children` }, 400);
    }

    // Validate everything before creating anything so a typo in child #3 doesn't leave 2 orphans.
    const cleaned: { fullName: string; dateOfBirth: string; age: number; companionId: string | null }[] = [];
    for (const [i, c] of children.entries()) {
      const fullName = typeof c?.fullName === 'string' ? c.fullName.trim().slice(0, 80) : '';
      const dateOfBirth = typeof c?.dateOfBirth === 'string' ? c.dateOfBirth : '';
      if (fullName.length < 1) return json({ error: `Child ${i + 1}: name is required` }, 400);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) || Number.isNaN(new Date(dateOfBirth).getTime())) {
        return json({ error: `Child ${i + 1}: a valid date of birth is required` }, 400);
      }
      const age = ageFromDob(dateOfBirth);
      if (age < MIN_AGE || age > MAX_AGE) {
        return json({ error: `Child ${i + 1}: age must be between ${MIN_AGE} and ${MAX_AGE}` }, 400);
      }
      const companionId = typeof c?.companionId === 'string' ? c.companionId.slice(0, 40) : null;
      cleaned.push({ fullName, dateOfBirth, age, companionId });
    }

    const created: { id: string; fullName: string; hub: string; age: number; companionId: string | null }[] = [];

    const rollback = async () => {
      for (const c of created) {
        await admin.from('student_parent_relationships').delete().eq('student_id', c.id);
        await admin.from('users').delete().eq('id', c.id);
        await admin.auth.admin.deleteUser(c.id);
      }
    };

    for (const c of cleaned) {
      const { hub, duration, goal, system } = hubForAge(c.age);

      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: `child.${crypto.randomUUID()}@${CHILD_EMAIL_DOMAIN}`,
        password: randomPassword(),
        email_confirm: true,
        user_metadata: { full_name: c.fullName, role: 'student', age: c.age, hub_type: hub, managed_child: true },
      });
      if (authError || !authData?.user) {
        await rollback();
        return json({ error: authError?.message ?? 'Could not create child profile' }, 500);
      }
      const childId = authData.user.id;
      created.push({ id: childId, fullName: c.fullName, hub, age: c.age, companionId: c.companionId });

      // The trigger created users/user_roles/student_profiles; fill in the rest of the wizard's fields.
      const { error: profileErr } = await admin.from('student_profiles').upsert({
        user_id: childId,
        student_level: hub,
        hub_type: hub,
        lesson_duration: duration,
        weekly_goal: goal,
        weekly_goal_set_at: new Date().toISOString(),
        date_of_birth: c.dateOfBirth,
        age: c.age,
        companion_id: c.companionId,
        onboarding_completed: false,
      }, { onConflict: 'user_id' });
      if (profileErr) {
        console.error('[create-family-children] student_profiles upsert failed', profileErr);
        await rollback();
        return json({ error: 'Could not save child profile' }, 500);
      }

      const { error: systemErr } = await admin.from('users').update({ current_system: system }).eq('id', childId);
      if (systemErr) console.error('[create-family-children] current_system update failed', systemErr);

      const { error: linkErr } = await admin.from('student_parent_relationships').insert({
        student_id: childId,
        parent_id: caller.id,
        relationship_type: relationshipType,
        is_primary_contact: true,
        can_view_progress: true,
        can_book_lessons: true,
        can_communicate_teachers: true,
        approved_at: new Date().toISOString(),
      });
      if (linkErr) {
        console.error('[create-family-children] link failed', linkErr);
        await rollback();
        return json({ error: 'Could not link child to your account' }, 500);
      }
    }

    return json({ success: true, children: created });
  } catch (e: any) {
    console.error('[create-family-children] unexpected error', e);
    return json({ error: e?.message ?? 'Unknown error' }, 500);
  }
});

// Shared hub resolver for edge functions.
// Canonical hubs: 'playground' | 'academy' | 'success'.
// Order of precedence: explicit input → student_profiles.hub_type
// → users.current_system (kids|teen|adult) → student_profiles.age → null.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export type Hub = 'playground' | 'academy' | 'success';

const LEGACY_MAP: Record<string, Hub> = {
  playground: 'playground',
  kids: 'playground',
  academy: 'academy',
  teen: 'academy',
  teens: 'academy',
  success: 'success',
  adult: 'success',
  adults: 'success',
  professional: 'success', // legacy alias
};

export function normalizeHub(value?: string | null): Hub | null {
  if (!value) return null;
  return LEGACY_MAP[String(value).trim().toLowerCase()] ?? null;
}

export function hubFromAge(age?: number | null): Hub | null {
  if (typeof age !== 'number' || !Number.isFinite(age)) return null;
  if (age <= 9) return 'playground';
  if (age <= 17) return 'academy';
  return 'success';
}

function getServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

export interface ResolveHubInput {
  hub?: string | null;
  studentLevel?: string | null;
  userId?: string | null;
  email?: string | null;
  client?: SupabaseClient;
}

/**
 * Resolve a canonical hub for a student. Returns null if no signal is found
 * — callers should render a neutral fallback rather than guess "academy".
 */
export async function resolveStudentHub(input: ResolveHubInput): Promise<Hub | null> {
  const explicit = normalizeHub(input.hub) ?? normalizeHub(input.studentLevel);
  if (explicit) return explicit;

  const client = input.client ?? getServiceClient();
  let userId = input.userId ?? null;
  let cachedSystem: string | null = null;

  // Look up user_id by email if needed. Do NOT early-return on current_system —
  // student_profiles.hub_type / student_level is the source of truth.
  if (!userId && input.email) {
    const { data } = await client
      .from('users')
      .select('id, current_system')
      .eq('email', input.email)
      .maybeSingle();
    if (data) {
      userId = data.id;
      cachedSystem = data.current_system ?? null;
    }
  }

  if (!userId) return null;

  // Priority: student_profiles.hub_type → student_profiles.student_level
  //         → users.current_system → derived from age.
  const { data: profile } = await client
    .from('student_profiles')
    .select('hub_type, student_level, age')
    .eq('user_id', userId)
    .maybeSingle();

  const fromHubType = normalizeHub(profile?.hub_type);
  if (fromHubType) return fromHubType;

  const fromLevel = normalizeHub(profile?.student_level);
  if (fromLevel) return fromLevel;

  if (cachedSystem === null) {
    const { data: user } = await client
      .from('users')
      .select('current_system')
      .eq('id', userId)
      .maybeSingle();
    cachedSystem = user?.current_system ?? null;
  }
  const fromSystem = normalizeHub(cachedSystem);
  if (fromSystem) return fromSystem;

  return hubFromAge(profile?.age ?? null);
}

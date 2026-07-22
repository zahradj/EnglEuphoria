// Shared auth guard for Edge Functions.
// Verifies a JWT and (optionally) checks that the user has one of the allowed roles.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type AppRole =
  | 'admin'
  | 'content_creator'
  | 'teacher'
  | 'student'
  | 'moderator';

export interface AuthSuccess {
  ok: true;
  userId: string;
  email?: string;
  roles: string[];
}
export interface AuthFailure {
  ok: false;
  status: number;
  body: { error: string };
}
export type AuthResult = AuthSuccess | AuthFailure;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export async function requireAuth(
  req: Request,
  opts: { allowedRoles?: AppRole[] } = {},
): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, status: 401, body: { error: 'Unauthorized' } };
  }
  const token = authHeader.replace('Bearer ', '');

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: claimsData, error: claimsError } =
    await authClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return { ok: false, status: 401, body: { error: 'Unauthorized' } };
  }

  const userId = claimsData.claims.sub as string;
  const email = (claimsData.claims as any).email as string | undefined;

  let roles: string[] = [];
  if (opts.allowedRoles && opts.allowedRoles.length > 0) {
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roleRows } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    roles = (roleRows || []).map((r: any) => r.role);
    const allowed = roles.some((r) =>
      (opts.allowedRoles as string[]).includes(r),
    );
    if (!allowed) {
      return {
        ok: false,
        status: 403,
        body: {
          error: `Forbidden: requires one of [${opts.allowedRoles.join(', ')}]`,
        },
      };
    }
  }

  return { ok: true, userId, email, roles };
}

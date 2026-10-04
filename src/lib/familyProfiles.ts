import { supabase } from '@/integrations/supabase/client';
import { hubToDashboardRoute, type HubType } from '@/lib/hubAssignment';

export interface FamilyProfile {
  id: string;
  name: string;
  hub: HubType | string;
  age: number | null;
  companionId: string | null;
}

export interface FamilyList {
  /** What the signed-in account is: the parent, or one of the managed children. */
  role: 'parent' | 'child';
  parentId: string;
  selfId: string;
  hasPin: boolean;
  profiles: FamilyProfile[];
}

export class FamilyError extends Error {
  constructor(message: string, public code?: string, public triesLeft?: number) {
    super(message);
  }
}

async function callSwitchProfile<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('switch-profile', { body });
  if (error) {
    // supabase-js hides non-2xx bodies behind error.context; the function's own message is the useful one.
    let payload: any = null;
    try { payload = await (error as any).context?.json?.(); } catch { /* generic message below */ }
    throw new FamilyError(payload?.message ?? payload?.error ?? error.message, payload?.error, payload?.triesLeft);
  }
  if (data?.error) throw new FamilyError(data.message ?? data.error, data.error, data.triesLeft);
  return data as T;
}

export const listFamily = () => callSwitchProfile<FamilyList>({ action: 'list' });

export const setFamilyPin = (pin: string) => callSwitchProfile<{ success: true }>({ action: 'set-pin', pin });

/** AuthContext and the route guards cache the resolved role; a profile switch must start clean. */
function clearAuthCaches() {
  for (const store of [sessionStorage, localStorage]) {
    try {
      store.removeItem('auth_resolved_role');
      store.removeItem('auth_redirect_done');
    } catch { /* storage unavailable */ }
  }
}

/**
 * Signs in as another member of the family and returns the route to land on. The caller should do a
 * full page load to that route (window.location.assign) so no state from the previous profile survives.
 */
export async function switchProfile(targetId: 'parent' | string, pin?: string): Promise<string> {
  const result = await callSwitchProfile<{ tokenHash: string; role: 'parent' | 'child'; hub: string | null }>({
    action: 'switch',
    targetId,
    pin,
  });

  clearAuthCaches();
  const { error } = await supabase.auth.verifyOtp({ token_hash: result.tokenHash, type: 'magiclink' });
  if (error) throw new FamilyError(error.message);

  return result.role === 'parent' ? '/parent' : hubToDashboardRoute((result.hub ?? 'playground') as HubType);
}

import { getCompanionById, getDefaultCompanionForHub, type Companion } from '@/constants/companions';

export interface FamilyChildProfile {
  hub: string | null;
  age: number | null;
  companionId: string | null;
}

/** The child's chosen buddy (or their hub's default) plus whether it has real artwork to show. */
export function childBuddy(profile: FamilyChildProfile | undefined): { companion: Companion; art: string | null } {
  const hub = profile?.hub === 'academy' ? 'academy' : 'playground';
  const companion = getCompanionById(profile?.companionId) ?? getDefaultCompanionForHub(hub);
  const art = companion.avatar_url.includes('placeholder') ? null : companion.avatar_url;
  return { companion, art };
}

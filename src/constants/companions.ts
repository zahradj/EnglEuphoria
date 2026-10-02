export type CompanionHub = 'playground' | 'academy';

export interface Companion {
  id: string;
  name: string;
  hub: CompanionHub;
  description: string;
  avatar_url: string;
}

// Learning buddies are the hub's own recurring characters - the same faces students meet in
// their lessons - not a separate set of generic mascots.
export const COMPANIONS: Companion[] = [
  // Playground (Kids) - the lesson cast (art in /lep1/characters)
  {
    id: 'pg-pip',
    name: 'Pip the Fox',
    hub: 'playground',
    description: 'Curious and cheeky — loves new words and big adventures.',
    avatar_url: '/lep1/characters/pip-happy.png',
  },
  {
    id: 'pg-bella',
    name: 'Bella the Bunny',
    hub: 'playground',
    description: 'Sweet and kind — the gentle storyteller of the Playground.',
    avatar_url: '/lep1/characters/bella-happy.png',
  },
  {
    id: 'pg-mia',
    name: 'Mia',
    hub: 'playground',
    description: 'Cheerful and bold — always first to try a new word.',
    avatar_url: '/lep1/characters/mia-happy.png',
  },
  // Academy (Teens) - the Academy cast vault (shared characters)
  {
    id: 'ac-ava',
    name: 'Ava',
    hub: 'academy',
    description: 'Conversation lead — keeps every chat moving.',
    // No individual portrait yet (the cast vault image is a shared sheet); picker shows the name.
    avatar_url: '/placeholder.svg',
  },
  {
    id: 'ac-theo',
    name: 'Theo',
    hub: 'academy',
    description: 'Relaxed and curious — loves a good debate.',
    avatar_url: '/placeholder.svg',
  },
  {
    id: 'ac-vee',
    name: 'Vee',
    hub: 'academy',
    description: 'Your Academy mentor — plans your week and keeps you focused.',
    avatar_url:
      'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-cast-vault/ai-image-vee-avatar-1787676635290.png',
  },
];

// Ids saved before the switch to hub characters keep resolving to a sensible buddy.
const LEGACY_COMPANION_IDS: Record<string, string> = {
  'pg-fox': 'pg-pip',
  'pg-rabbit': 'pg-bella',
  'pg-bear': 'pg-mia',
  'ac-nova': 'ac-ava',
  'ac-kai': 'ac-theo',
  'ac-zara': 'ac-vee',
};

export function getCompanionsForHub(hub: CompanionHub | string | undefined | null): Companion[] {
  if (hub === 'playground' || hub === 'academy') {
    return COMPANIONS.filter((c) => c.hub === hub);
  }
  return [];
}

export function getCompanionById(id?: string | null): Companion | undefined {
  if (!id) return undefined;
  const resolved = LEGACY_COMPANION_IDS[id] ?? id;
  return COMPANIONS.find((c) => c.id === resolved);
}

export function getDefaultCompanionForHub(hub: CompanionHub | string | undefined | null): Companion {
  const list = getCompanionsForHub(hub as CompanionHub);
  return list[0] ?? COMPANIONS[0];
}

export type CompanionHub = 'playground' | 'academy';

export interface Companion {
  id: string;
  name: string;
  hub: CompanionHub;
  description: string;
  avatar_url: string;
}

export const COMPANIONS: Companion[] = [
  // Playground (Kids) — cute animals
  {
    id: 'pg-fox',
    name: 'Finn the Fox',
    hub: 'playground',
    description: 'Curious and quick — loves new words and big adventures.',
    avatar_url: '/avatars/fox.svg',
  },
  {
    id: 'pg-rabbit',
    name: 'Rosie the Rabbit',
    hub: 'playground',
    description: 'Cheerful and bouncy — perfect for cheering you on.',
    avatar_url: '/avatars/rabbit.svg',
  },
  {
    id: 'pg-bear',
    name: 'Benny the Bear',
    hub: 'playground',
    description: 'Calm and brave — your cozy buddy for tough words.',
    avatar_url: '/avatars/bear.svg',
  },
  // Academy (Teens) — cool modern human/avatars
  {
    id: 'ac-nova',
    name: 'Nova',
    hub: 'academy',
    description: 'Bold creator — keeps your study sessions on fire.',
    avatar_url: '/placeholder.svg',
  },
  {
    id: 'ac-kai',
    name: 'Kai',
    hub: 'academy',
    description: 'Chill strategist — plans your week and keeps you focused.',
    avatar_url: '/placeholder.svg',
  },
  {
    id: 'ac-zara',
    name: 'Zara',
    hub: 'academy',
    description: 'Energetic explorer — loves vocab challenges and quizzes.',
    avatar_url: '/placeholder.svg',
  },
];

export function getCompanionsForHub(hub: CompanionHub | string | undefined | null): Companion[] {
  if (hub === 'playground' || hub === 'academy') {
    return COMPANIONS.filter((c) => c.hub === hub);
  }
  return [];
}

export function getCompanionById(id?: string | null): Companion | undefined {
  if (!id) return undefined;
  return COMPANIONS.find((c) => c.id === id);
}

export function getDefaultCompanionForHub(hub: CompanionHub | string | undefined | null): Companion {
  const list = getCompanionsForHub(hub as CompanionHub);
  return list[0] ?? COMPANIONS[0];
}

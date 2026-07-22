import type { World } from './types';
import { A1_PLAYGROUND_WORLDS } from './a1Worlds';

// Hub × CEFR keyed registry. A2/B1/B2/C1 libraries land in future passes;
// the architecture supports them as soon as their world arrays are added.
const REGISTRY: Record<string, World[]> = {
  'playground:A1': A1_PLAYGROUND_WORLDS,
};

export function getWorlds(hub: string, cefrBand: string): World[] {
  return REGISTRY[`${hub}:${cefrBand}`] ?? [];
}

export function getAllWorlds(): World[] {
  return Object.values(REGISTRY).flat();
}

export function findWorldBySlug(slug: string): World | undefined {
  return getAllWorlds().find((w) => w.slug === slug);
}

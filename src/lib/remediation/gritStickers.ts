/**
 * Cycle 3 — Playground "Grit" sticker catalog.
 *
 * Small curated set surfaced ONLY when a Playground student passes a
 * remedial/Confidence Builder block. Picked deterministically from the failed
 * skill tag so the same skill always unlocks the same sticker (no duplicates).
 */
export interface GritSticker {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
}

export const GRIT_STICKERS: GritSticker[] = [
  { id: 'grit_fox_brave',     name: 'Brave Fox',    emoji: '🦊', tagline: 'You stayed brave!' },
  { id: 'grit_star_comeback', name: 'Comeback Star', emoji: '🌟', tagline: 'You bounced right back!' },
  { id: 'grit_rocket_grit',   name: 'Grit Rocket',  emoji: '🚀', tagline: 'You kept on going!' },
  { id: 'grit_heart_warrior', name: 'Heart Warrior', emoji: '💖', tagline: 'You showed real heart!' },
  { id: 'grit_lion_courage',  name: 'Courage Lion', emoji: '🦁', tagline: 'You roared through it!' },
  { id: 'grit_seed_growing',  name: 'Growing Seed', emoji: '🌱', tagline: 'You grew today!' },
];

/** Deterministic FNV-1a style hash → sticker. Same tag always → same sticker. */
export function pickGritSticker(failedTag?: string | null): GritSticker {
  const key = (failedTag ?? 'default').toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return GRIT_STICKERS[hash % GRIT_STICKERS.length];
}

/**
 * World registry — 6 painterly worlds. Each defines a parallax palette
 * and atmosphere. Worlds are picked from lesson theme keywords; fallback meadow.
 */

export type WorldId = 'meadow' | 'sky' | 'ocean' | 'forest' | 'town' | 'desert';

export interface WorldPalette {
  skyTop: number;
  skyBottom: number;
  sunOrMoon: number;
  hillsFar: number;
  hillsMid: number;
  ground: number;
  groundLine: number;
  accent: number;
  /** Color used for floating motes (butterflies / petals / bubbles). */
  mote: number;
}

export interface WorldDef {
  id: WorldId;
  label: string;
  palette: WorldPalette;
  motesKind: 'butterfly' | 'cloud' | 'bubble' | 'leaf' | 'bird' | 'sand';
}

export const WORLDS: Record<WorldId, WorldDef> = {
  meadow: {
    id: 'meadow',
    label: 'Meadow',
    palette: {
      skyTop: 0xfde9a6, skyBottom: 0xffe6c2,
      sunOrMoon: 0xfff5b6,
      hillsFar: 0xc8d99a, hillsMid: 0x9bbf6e,
      ground: 0x82b85b, groundLine: 0x5a8a3c,
      accent: 0xfb923c, mote: 0xfacc15,
    },
    motesKind: 'butterfly',
  },
  sky: {
    id: 'sky',
    label: 'Sky',
    palette: {
      skyTop: 0xa6d8ff, skyBottom: 0xe0f0ff,
      sunOrMoon: 0xfff5b6,
      hillsFar: 0xd9e7f5, hillsMid: 0xb9d3ee,
      ground: 0xe6f1fb, groundLine: 0xa6c8e6,
      accent: 0xfb923c, mote: 0xffffff,
    },
    motesKind: 'cloud',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    palette: {
      skyTop: 0xb2e0f2, skyBottom: 0xdef6fb,
      sunOrMoon: 0xfff5b6,
      hillsFar: 0x6bb5d1, hillsMid: 0x3f8fb3,
      ground: 0x2a6f96, groundLine: 0x1b4f6e,
      accent: 0xfb923c, mote: 0x99e6f7,
    },
    motesKind: 'bubble',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    palette: {
      skyTop: 0xd6e9b8, skyBottom: 0xeef5d9,
      sunOrMoon: 0xfff5b6,
      hillsFar: 0x8aaf6a, hillsMid: 0x5a8a3c,
      ground: 0x3d6a25, groundLine: 0x274515,
      accent: 0xfb923c, mote: 0xb5e26a,
    },
    motesKind: 'leaf',
  },
  town: {
    id: 'town',
    label: 'Town',
    palette: {
      skyTop: 0xffd9b8, skyBottom: 0xfff0dd,
      sunOrMoon: 0xfff5b6,
      hillsFar: 0xd4b89c, hillsMid: 0xb89878,
      ground: 0xe8d5b8, groundLine: 0x8a6f55,
      accent: 0xea580c, mote: 0xfb923c,
    },
    motesKind: 'bird',
  },
  desert: {
    id: 'desert',
    label: 'Desert',
    palette: {
      skyTop: 0xffd29a, skyBottom: 0xffe8c2,
      sunOrMoon: 0xfff5b6,
      hillsFar: 0xe3b97a, hillsMid: 0xc99560,
      ground: 0xe8c890, groundLine: 0xa57338,
      accent: 0xea580c, mote: 0xfde68a,
    },
    motesKind: 'sand',
  },
};

const KEYWORDS: { id: WorldId; words: string[] }[] = [
  { id: 'sky',    words: ['sky', 'fly', 'cloud', 'plane', 'bird', 'kite', 'rainbow', 'wind'] },
  { id: 'ocean',  words: ['ocean', 'sea', 'fish', 'water', 'boat', 'beach', 'wave', 'swim'] },
  { id: 'forest', words: ['forest', 'tree', 'wood', 'jungle', 'leaf', 'animal'] },
  { id: 'town',   words: ['town', 'city', 'street', 'shop', 'home', 'house', 'school'] },
  { id: 'desert', words: ['desert', 'sand', 'camel', 'sun', 'hot'] },
  { id: 'meadow', words: ['meadow', 'farm', 'grass', 'flower', 'garden', 'play'] },
];

export function pickWorld(...hints: (string | undefined)[]): WorldDef {
  const hay = hints.filter(Boolean).join(' ').toLowerCase();
  for (const k of KEYWORDS) {
    if (k.words.some((w) => hay.includes(w))) return WORLDS[k.id];
  }
  return WORLDS.meadow;
}

/** Deterministic FNV-1a hash → world id. Used for unit continuity fallback. */
function hashToWorld(seed: string): WorldDef {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const ids: WorldId[] = ['meadow', 'sky', 'ocean', 'forest', 'town', 'desert'];
  return WORLDS[ids[Math.abs(h) % ids.length]];
}

/** Extract a stable "unit key" from a lessonId (e.g. "unit-3-lesson-2" → "unit-3"). */
export function unitKeyOf(lessonId: string | undefined): string {
  if (!lessonId) return 'default';
  const m = lessonId.toLowerCase().match(/^(.*?unit[-_ ]?\d+)/);
  if (m) return m[1];
  // Fallback: strip trailing "-lesson-N" / "-l\d+" if present
  return lessonId.toLowerCase().replace(/[-_ ]?(lesson|l)[-_ ]?\d+.*$/, '') || lessonId;
}

/**
 * Pick a world for a whole lesson. Prefers topic keywords harvested from
 * title + scene text. If no keyword matches, falls back to a deterministic
 * world derived from the lesson's unit key so all lessons in a unit share
 * the same world for narrative continuity.
 */
export function pickWorldForLesson(args: {
  lessonId?: string;
  title?: string;
  extraText?: string;
}): WorldDef {
  const hay = [args.title, args.extraText].filter(Boolean).join(' ').toLowerCase();
  for (const k of KEYWORDS) {
    if (k.words.some((w) => hay.includes(w))) return WORLDS[k.id];
  }
  return hashToWorld(unitKeyOf(args.lessonId));
}

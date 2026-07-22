export type OceanAnimal = {
  name: string;
  image: string;
  letters: string[];
  size: "big" | "small";
  color: string;
  colors: string[];
};

/**
 * Lesson 3 vocab is supplied by the AI unit. Bundled placeholder data
 * removed from the creator hub — structure preserved for type safety.
 */
export const OCEAN_ANIMALS: OceanAnimal[] = [];

export const OCEAN_COLORS: { name: string; hex: string }[] = [];

export const SIZES: { name: "big" | "small"; label: string }[] = [
  { name: "big", label: "Big" },
  { name: "small", label: "Small" },
];

/** "a" vs "an" for the article in front of a color word. */
export function article(word: string): "a" | "an" {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

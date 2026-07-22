export type Animal = {
  name: string;
  image: string;
  letters: string[];
};

/**
 * Example vocabulary lives in the AI-generated unit (PlaygroundUnitContext).
 * The bundled fallback is intentionally empty — the creator hub no longer
 * ships placeholder animals/words. Structure, types and the spelling/blending
 * pipeline still rely on this shape.
 */
export const ANIMALS: Animal[] = [];

export const PHONIC_C_WORDS: { name: string; image: string }[] = [];

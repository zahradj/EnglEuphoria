/**
 * Default fallback characters per Hub.
 *
 * If a teacher does NOT pick a custom Cast Vault character before generating a
 * lesson or story, the frontend injects one of these so the AI ALWAYS has a
 * named protagonist to feature in vocabulary, activities, and image prompts.
 */
import type { StarringCharacterPayload } from '@/types/character';
import type { CharacterHub } from '@/types/character';

export const DEFAULT_CHARACTERS: Record<CharacterHub, StarringCharacterPayload> = {
  playground: {
    name: 'Pip the Fox',
    personality_traits:
      'Curious, brave, and kind-hearted. Loves discovering new words and turning every lesson into a tiny adventure. Speaks with simple, joyful, encouraging language.',
    visual_blueprint:
      'A small bright-orange cartoon fox with a fluffy white-tipped tail, big round friendly eyes, a tiny green explorer backpack, flat 2D vector style, child-friendly proportions, soft outlines.',
  },
  academy: {
    name: 'Leo',
    personality_traits:
      'A 14-year-old teen who is creative, witty, and a little nerdy. Loves music, sci-fi, and skateboarding. Speaks in modern, natural everyday English with gentle humor.',
    visual_blueprint:
      'A teenage boy with messy dark-brown hair, warm brown eyes, light-tan skin, wearing a purple hoodie over a white t-shirt, dark jeans, and white sneakers. Slim athletic build. Modern slice-of-life webcomic style.',
  },
  success: {
    name: 'Elena',
    personality_traits:
      'A confident young professional in her late 20s. Warm, articulate, and goal-oriented. Communicates clearly in polished business English with a friendly, approachable tone.',
    visual_blueprint:
      'A young professional woman with shoulder-length dark hair, warm hazel eyes, light-olive skin, wearing a tailored emerald-green blazer over a white blouse and dark trousers. Modern editorial photography style, clean office or city background.',
  },
};

export function getDefaultCharacterForHub(
  hub: CharacterHub | string | undefined | null,
): StarringCharacterPayload {
  const key = (hub === 'playground' || hub === 'academy' || hub === 'success')
    ? hub
    : 'academy';
  return DEFAULT_CHARACTERS[key];
}

/**
 * Always-on resolver: returns the teacher's selected character when present,
 * otherwise the Hub's default fallback. The generation payload is GUARANTEED
 * to contain a character context.
 */
export function resolveStarringCharacter(
  selected: StarringCharacterPayload | null | undefined,
  hub: CharacterHub | string | undefined | null,
): StarringCharacterPayload {
  if (selected && selected.name && selected.visual_blueprint) return selected;
  return getDefaultCharacterForHub(hub);
}

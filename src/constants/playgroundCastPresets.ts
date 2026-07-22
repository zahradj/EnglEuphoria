/**
 * Playground Cast Presets — one-click seed of the Playground hub's
 * signature mascots. Each maps to a real ElevenLabs voice id from
 * VOICES_BY_HUB.playground, so saved characters have a consistent voice
 * already pinned for every narration / storybook page.
 */
export interface PlaygroundCastPreset {
  name: string;
  personality_traits: string;
  visual_blueprint: string;
  voice_id: string;
  voice_name: string;
  /** Image-gen prompt seed (Flat 2D cartoon, no text). */
  image_prompt: string;
}

const KIWI_CHIBI_BASE =
  'Kiwi Chibi art style: ultra-cute chibi mascot with an oversized round head, tiny stubby body, huge sparkling eyes with two highlights, soft rosy blush cheeks, glossy smooth shading, pastel candy colors with a soft cel-shaded gradient, clean thin black outlines, kawaii expression, centered on a plain pure white background, full body, no text, no letters, no watermark.';

export const PLAYGROUND_CAST_PRESETS: PlaygroundCastPreset[] = [
  {
    name: 'Pip the Fox',
    personality_traits: 'Curious, cheeky little fox cub. Brave but clumsy, loves new words, asks lots of questions. The Playground signature mascot.',
    visual_blueprint: 'Kiwi Chibi fox cub: oversized round head, tiny body, fluffy white belly, huge sparkling amber eyes, oversized ears, tiny red scarf. Pastel orange fur with soft cel-shading.',
    voice_id: 'kPtEHAvRnjUJFv7SK9WI',
    voice_name: 'Pip the Fox — Playground Mascot',
    image_prompt: `${KIWI_CHIBI_BASE} Subject: a tiny chibi fox cub with pastel orange fur, fluffy white belly and chest, oversized fluffy ears, huge sparkling amber eyes, a tiny red scarf around the neck, sweet shy smile.`,
  },
  {
    name: 'Bella the Bunny',
    personality_traits: 'Sweet, soft-spoken, and kind. Loves storytime, hugs, and matching games. The gentle storyteller of the Playground.',
    visual_blueprint: 'Kiwi Chibi bunny: huge round head, tiny body, floppy ears, yellow daisy behind one ear, enormous sparkling eyes, soft pastel pink fur.',
    voice_id: 'XB0fDUnXU5powFXDhCwa',
    voice_name: 'Charlotte — Sweet & Young',
    image_prompt: `${KIWI_CHIBI_BASE} Subject: a tiny chibi bunny with pastel pink fur, long floppy ears, a tiny yellow daisy tucked behind one ear, huge sparkling eyes, soft rosy cheeks, gentle smile.`,
  },
  {
    name: 'Charlie the Chick',
    personality_traits: 'Brave little adventure buddy. Energetic, bold, always ready to try a new word or sing a new song.',
    visual_blueprint: 'Kiwi Chibi baby chick: round fluffy body, oversized head, huge shiny eyes, tiny blue explorer cap, red bandana, pastel yellow plumage.',
    voice_id: 'TX3LPaxmHKxFdv7VOQHJ',
    voice_name: 'Liam — Adventure Buddy',
    image_prompt: `${KIWI_CHIBI_BASE} Subject: a tiny chibi baby chick with pastel yellow plumage, round fluffy body, oversized head, huge shiny eyes, tiny orange beak and feet, wearing a small blue explorer cap and a red bandana, brave excited smile.`,
  },
  {
    name: 'Daisy the Duckling',
    personality_traits: 'Happy, silly, and curious. Loves splashing in puddles and copying every new sound she hears.',
    visual_blueprint: 'Kiwi Chibi duckling: plump round body, oversized head, big shiny black-dot eyes, pastel teal raincoat with tiny matching boots.',
    voice_id: 'pFZP5JQG7iQjIQuC4Bku',
    voice_name: 'Lily — Playful Kid',
    image_prompt: `${KIWI_CHIBI_BASE} Subject: a tiny chibi duckling with pastel yellow feathers, plump round body, oversized head, huge shiny black-dot eyes, rosy cheeks, wearing a soft pastel teal raincoat and matching tiny boots, giggly happy smile.`,
  },
  {
    name: 'Hoot the Owl',
    personality_traits: 'Wise magical guide who introduces new sounds and grammar. Mysterious storybook lilt, never bossy.',
    visual_blueprint: 'Kiwi Chibi owl: huge round head, tiny body, enormous sparkling green eyes, pastel lavender feathers, tiny gold wizard hat with stars, round glasses on the beak.',
    voice_id: 'XrExE9yKIg1WjnnlVkGX',
    voice_name: 'Matilda — Magical Guide',
    image_prompt: `${KIWI_CHIBI_BASE} Subject: a tiny chibi owl with soft pastel lavender feathers, huge round head, tiny body, soft white belly, enormous sparkling green eyes, small round glasses on the beak, wearing a tiny gold wizard hat with stars, wise gentle smile.`,
  },
];

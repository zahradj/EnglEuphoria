/**
 * Curated ElevenLabs voice catalog per Hub.
 *
 * Each voice maps to a stable ElevenLabs voice id. The Cast Vault UI lets
 * teachers preview them and assign one to a character. The assigned
 * voice_id is then injected into every narration generation for that
 * character so identity stays consistent across lessons + storybooks.
 *
 * `pickVoiceForCharacter()` auto-selects the best voice for a new
 * character based on its hub + personality + visual description, so
 * Playground kids characters always end up with a childish/cartoon
 * voice, Academy teens with a peer-like voice, etc.
 */
import type { CharacterHub } from '@/types/character';

export interface VoiceOption {
  id: string;            // ElevenLabs voice id
  label: string;         // Friendly display name
  description: string;   // Vibe / when to use
  tags: string[];        // Personality keywords used by the auto-picker
}

export const VOICES_BY_HUB: Record<CharacterHub, VoiceOption[]> = {
  playground: [
    { id: 'kPtEHAvRnjUJFv7SK9WI', label: 'Pip the Fox — Playground Mascot', description: 'Curious, cheeky fox cub — the Playground signature voice (matches the placement test)', tags: ['pip','fox','mascot','playground','curious','cheeky','cub','kid','child','animal','friendly','playful'] },
    { id: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily — Playful Kid', description: 'Bright, energetic, child-friendly cartoon voice', tags: ['playful','energetic','kid','child','girl','silly','funny','happy','bright','cheerful','curious'] },
    { id: 'XB0fDUnXU5powFXDhCwa', label: 'Charlotte — Sweet & Young', description: 'Soft, warm, storytime cartoon voice', tags: ['sweet','soft','warm','shy','kind','gentle','young','girl','calm','dreamy','bunny','rabbit'] },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', label: 'Liam — Adventure Buddy', description: 'Energetic, fun, young hero cartoon voice', tags: ['brave','adventure','hero','boy','energetic','bold','strong','explorer','active','chick','duck'] },
    { id: 'XrExE9yKIg1WjnnlVkGX', label: 'Matilda — Magical Guide', description: 'Mysterious, wise mentor with a storybook lilt', tags: ['magic','wise','mentor','mysterious','fairy','witch','wizard','old','teacher','guide','owl'] },
    { id: 'SAz9YHcvj6GT2YYXdXww', label: 'River — Quirky Creature', description: 'Distinctive cartoon creature / animal voice', tags: ['creature','animal','monster','robot','quirky','silly','funny','weird','dragon','alien','pet'] },
    { id: 'FGY2WhTYpPnrIDTdsKH5', label: 'Laura — Gentle Teacher', description: 'Clear, patient, instructional kid-friendly voice', tags: ['teacher','clear','patient','kind','helper','calm','gentle','instructional'] },
  ],
  academy: [
    { id: 'IKne3meq5aSn9XLyUdCD', label: 'Charlie — Cool Teen', description: 'Encouraging, casual, peer-like teen voice', tags: ['cool','teen','casual','chill','friend','peer','relaxed','skater','sporty','boy'] },
    { id: 'Xb7hH8MSUJpSbSDYk0k2', label: 'Alice — Smart Friend', description: 'Clear, articulate, witty teen voice', tags: ['smart','nerd','witty','clever','studious','curious','girl','articulate','bookish','science'] },
    { id: 'cgSgspJ2msm6clMCkdW9', label: 'Jessica — Bestie', description: 'Friendly, modern, expressive teen voice', tags: ['friendly','expressive','social','bestie','girl','warm','outgoing','popular','fashion','creative'] },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', label: 'Liam — Gamer Energy', description: 'Hyped, fun, motivating teen voice', tags: ['gamer','hype','energetic','funny','competitive','sporty','adventure','boy','bold'] },
    { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah — Story Narrator', description: 'Clear, cinematic teen storytelling voice', tags: ['narrator','story','cinematic','calm','thoughtful','reflective','wise','clear'] },
    { id: 'bIHbv24MWmeRgasZH58o', label: 'Will — Chill Mentor', description: 'Calm teen-coach vibe', tags: ['mentor','coach','calm','chill','supportive','older','brother','helpful','steady','quiet'] },
  ],
  success: [
    { id: 'JBFqnCBsd6RMkjVDRZzb', label: 'George — Executive', description: 'Confident, polished, authoritative business voice', tags: ['executive','ceo','confident','authoritative','leader','boss','polished','formal','man'] },
    { id: 'cgSgspJ2msm6clMCkdW9', label: 'Jessica — Professional', description: 'Warm corporate, articulate professional voice', tags: ['professional','warm','articulate','manager','woman','corporate','consultant','mentor','friendly'] },
    { id: 'onwK4e9ZLuTAKqWW03F9', label: 'Daniel — Consultant', description: 'Crisp British business voice', tags: ['consultant','british','crisp','formal','analyst','strategist','expert','academic','man'] },
    { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah — Anchor', description: 'Clear, news-anchor clarity', tags: ['news','anchor','clear','journalist','reporter','presenter','woman','neutral'] },
    { id: 'cjVigY5qzO86Huf0OWal', label: 'Eric — Speaker', description: 'Warm presenter, conference vibe', tags: ['speaker','presenter','warm','coach','motivator','public','keynote','man','enthusiastic'] },
    { id: 'nPczCjzI2devNBz1zQrb', label: 'Brian — Mentor', description: 'Deep, reassuring coach voice', tags: ['mentor','coach','deep','reassuring','wise','calm','older','therapist','man','supportive'] },
  ],
};

export function findVoiceById(id: string | null | undefined): VoiceOption | null {
  if (!id) return null;
  for (const hub of Object.keys(VOICES_BY_HUB) as CharacterHub[]) {
    const hit = VOICES_BY_HUB[hub].find((v) => v.id === id);
    if (hit) return hit;
  }
  return null;
}

/**
 * Auto-pick the best-fit voice for a character.
 *
 * Strategy:
 *  1. Restrict to the hub's curated catalog (Playground only ever gets
 *     childish cartoon voices, Success only gets adult professional
 *     voices, etc.) — this is the hard rule.
 *  2. Score each voice by counting tag hits inside the character's
 *     name + personality + visual blueprint.
 *  3. Apply a tiny deterministic tiebreaker so the same input always
 *     yields the same voice (avoids re-roll surprises).
 */
export function pickVoiceForCharacter(
  hub: CharacterHub,
  opts: { name?: string; personality?: string; visual?: string } = {},
): VoiceOption {
  const pool = VOICES_BY_HUB[hub];
  const haystack = `${opts.name ?? ''} ${opts.personality ?? ''} ${opts.visual ?? ''}`.toLowerCase();

  let best = pool[0];
  let bestScore = -1;

  pool.forEach((voice, idx) => {
    let score = 0;
    for (const tag of voice.tags) {
      if (haystack.includes(tag)) score += 2;
    }
    // Deterministic tiebreaker from name hash so identical inputs are stable
    const hash = [...haystack].reduce((a, c) => a + c.charCodeAt(0), 0);
    const tiebreak = ((hash + idx) % pool.length) * 0.01;
    const total = score + tiebreak;
    if (total > bestScore) {
      bestScore = total;
      best = voice;
    }
  });

  return best;
}

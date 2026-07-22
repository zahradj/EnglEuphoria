export type CharacterHub = 'playground' | 'academy' | 'success';

export interface CustomCharacter {
  id: string;
  name: string;
  hub: CharacterHub;
  personality_traits: string;
  visual_blueprint: string;
  avatar_url: string | null;
  voice_id?: string | null;
  voice_name?: string | null;
  voice_preview_url?: string | null;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

/** Compact payload sent to AI generation edge functions. */
export interface StarringCharacterPayload {
  id?: string;
  name: string;
  personality_traits: string;
  visual_blueprint: string;
  avatar_url?: string | null;
  voice_id?: string | null;
  voice_name?: string | null;
}

export const toStarringPayload = (c: CustomCharacter): StarringCharacterPayload => ({
  id: c.id,
  name: c.name,
  personality_traits: c.personality_traits,
  visual_blueprint: c.visual_blueprint,
  avatar_url: c.avatar_url ?? undefined,
  voice_id: c.voice_id ?? undefined,
  voice_name: c.voice_name ?? undefined,
});

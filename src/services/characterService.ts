import { supabase } from '@/integrations/supabase/client';
import type { CustomCharacter, CharacterHub } from '@/types/character';

const TABLE = 'custom_characters' as const;

export async function listCharactersForHub(hub: CharacterHub): Promise<CustomCharacter[]> {
  const { data, error } = await supabase
    .from(TABLE as any)
    .select('*')
    .eq('hub', hub)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CustomCharacter[];
}

export interface SaveCharacterInput {
  id?: string;
  name: string;
  hub: CharacterHub;
  personality_traits: string;
  visual_blueprint: string;
  avatar_url?: string | null;
  voice_id?: string | null;
  voice_name?: string | null;
  voice_preview_url?: string | null;
}

export async function saveCharacter(input: SaveCharacterInput): Promise<CustomCharacter> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('You must be signed in to save a character.');

  const row = {
    name: input.name.trim(),
    hub: input.hub,
    personality_traits: input.personality_traits.trim(),
    visual_blueprint: input.visual_blueprint.trim(),
    avatar_url: input.avatar_url ?? null,
    voice_id: input.voice_id ?? null,
    voice_name: input.voice_name ?? null,
    voice_preview_url: input.voice_preview_url ?? null,
    created_by: userId,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from(TABLE as any)
      .update(row)
      .eq('id', input.id)
      .select('*')
      .single();
    if (error) throw error;
    return data as unknown as CustomCharacter;
  }

  const { data, error } = await supabase
    .from(TABLE as any)
    .insert(row)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as CustomCharacter;
}

export async function deleteCharacter(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE as any).delete().eq('id', id);
  if (error) throw error;
}

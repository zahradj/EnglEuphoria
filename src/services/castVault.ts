// Cast Vault — recurring characters used across all storybooks.
// Characters are hub-scoped. Each creator can build their own private cast
// (default) OR mark a character `is_shared = true` to publish into the hub's
// shared pool. Visual blueprint + voice id MUST be injected into every
// generated illustration / narration so identity stays consistent.

import { supabase } from '@/integrations/supabase/client';
import type { CastVaultCharacter, VisualBlueprint } from '@/storybook/types';
import type { Hub } from '@/governance/types';

export interface CastVaultUpsertInput {
  id?: string;
  hub: Hub;
  name: string;
  role: string;
  personality_traits?: Record<string, unknown>;
  visual_blueprint: VisualBlueprint;
  voice_id?: string | null;
  avatar_url?: string | null;
  signature_traits?: string[];
  is_shared?: boolean;
}

const TABLE = 'cast_vault_characters' as const;

export async function listCastForHub(hub: Hub, opts?: { includeShared?: boolean; mineOnly?: boolean }): Promise<CastVaultCharacter[]> {
  const includeShared = opts?.includeShared !== false;
  const mineOnly = opts?.mineOnly === true;

  let query = (supabase as any).from(TABLE).select('*').eq('hub', hub).order('created_at', { ascending: false });
  if (mineOnly) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) query = query.eq('created_by', authData.user.id);
  } else if (!includeShared) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) query = query.eq('created_by', authData.user.id);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CastVaultCharacter[];
}

export async function getCharacter(id: string): Promise<CastVaultCharacter | null> {
  const { data, error } = await (supabase as any).from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as CastVaultCharacter | null;
}

export async function upsertCharacter(input: CastVaultUpsertInput): Promise<CastVaultCharacter> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error('Must be signed in to manage cast');

  const row = {
    id: input.id,
    hub: input.hub,
    name: input.name,
    role: input.role,
    personality_traits: input.personality_traits ?? {},
    visual_blueprint: input.visual_blueprint,
    voice_id: input.voice_id ?? null,
    avatar_url: input.avatar_url ?? null,
    signature_traits: input.signature_traits ?? [],
    is_shared: input.is_shared ?? false,
    created_by: userId,
  };

  const { data, error } = await (supabase as any).from(TABLE).upsert(row).select().single();
  if (error) throw error;
  return data as CastVaultCharacter;
}

export async function deleteCharacter(id: string): Promise<void> {
  const { error } = await (supabase as any).from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

/** Compact payload for prompts — keeps identity tight without dumping the row. */
export function characterPromptCard(c: Pick<CastVaultCharacter, 'name' | 'role' | 'personality_traits' | 'visual_blueprint' | 'signature_traits'>): string {
  const vb = c.visual_blueprint || {};
  const visual = [vb.appearance, vb.outfit, vb.species, vb.age_range].filter(Boolean).join(' • ');
  const palette = vb.palette?.length ? `palette: ${vb.palette.join(', ')}` : '';
  const traits = (c.signature_traits ?? []).join(', ');
  return [
    `• ${c.name} (${c.role}).`,
    visual ? `  visuals: ${visual}.` : '',
    palette ? `  ${palette}.` : '',
    traits ? `  signature: ${traits}.` : '',
  ].filter(Boolean).join('\n');
}

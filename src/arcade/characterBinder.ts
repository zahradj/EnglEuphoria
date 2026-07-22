// Binds Cast Vault characters from NarrativeState to game roles.
import type { LearnerIntelligence } from '@/intelligence/types';
import type { CharacterBinding } from './types';

export function bindCharacters(
  intel: LearnerIntelligence | undefined,
  slots: number,
): CharacterBinding[] {
  if (!intel || slots <= 0) return [];
  const cast = intel.narrative_state.active_characters ?? [];
  const roles: CharacterBinding['role'][] = ['host', 'narrator', 'celebrant', 'mentor'];
  return cast.slice(0, slots).map((c, i) => ({
    character_id: c.id,
    name: c.name,
    role: roles[i] ?? 'host',
  }));
}

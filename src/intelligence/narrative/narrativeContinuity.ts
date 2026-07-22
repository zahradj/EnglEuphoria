// Narrative Continuity Engine — persists characters/arcs across lessons.

import { supabase } from '@/integrations/supabase/client';
import type { Hub } from '@/governance/types';
import type { NarrativeCharacter, NarrativeState } from '../types';

export async function getActiveNarrative(studentId: string, hub: Hub): Promise<NarrativeState> {
  try {
    const { data } = await (supabase as any)
      .from('narrative_state')
      .select('*')
      .eq('student_id', studentId)
      .eq('hub', hub)
      .maybeSingle();
    if (!data) return { active_characters: [], current_arc: undefined, last_beat: undefined };
    return {
      active_characters: Array.isArray(data.active_characters) ? data.active_characters : [],
      current_arc: data.current_arc && Object.keys(data.current_arc).length ? data.current_arc : undefined,
      last_beat: data.last_beat && Object.keys(data.last_beat).length ? data.last_beat : undefined,
    };
  } catch {
    return { active_characters: [], current_arc: undefined, last_beat: undefined };
  }
}

export async function upsertNarrativeBeat(
  studentId: string,
  hub: Hub,
  beat: { summary: string; emotion: string; arc?: NarrativeState['current_arc']; addCharacters?: NarrativeCharacter[] },
): Promise<void> {
  try {
    const current = await getActiveNarrative(studentId, hub);
    const merged: NarrativeCharacter[] = mergeCharacters(current.active_characters, beat.addCharacters ?? []);
    await (supabase as any).from('narrative_state').upsert({
      student_id: studentId,
      hub,
      active_characters: merged,
      current_arc: beat.arc ?? current.current_arc ?? {},
      last_beat: { summary: beat.summary, emotion: beat.emotion, at: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    });
  } catch {
    // best-effort: continuity is soft
  }
}

function mergeCharacters(a: NarrativeCharacter[], b: NarrativeCharacter[]): NarrativeCharacter[] {
  const byId = new Map<string, NarrativeCharacter>();
  for (const c of [...a, ...b]) byId.set(c.id, c);
  return Array.from(byId.values()).slice(0, 8);
}

/** Hint text injected into planner/activity prompts. */
export function buildNarrativeContinuityHint(state: NarrativeState): string {
  if (!state.active_characters.length && !state.current_arc && !state.last_beat) {
    return '';
  }
  const chars = state.active_characters.map(c => `${c.name} (${c.role})`).join(', ');
  const arc = state.current_arc
    ? `Arc: "${state.current_arc.title}" (${state.current_arc.beats_completed}/${state.current_arc.beats_total})`
    : '';
  const beat = state.last_beat ? `Last beat: ${state.last_beat.summary} [${state.last_beat.emotion}]` : '';
  return [
    'NARRATIVE CONTINUITY (carry forward across lessons):',
    chars ? `- Recurring characters: ${chars}` : '',
    arc ? `- ${arc}` : '',
    beat ? `- ${beat}` : '',
    'Use the same characters and pick up emotionally from the last beat. Do not reset the world.',
  ].filter(Boolean).join('\n');
}

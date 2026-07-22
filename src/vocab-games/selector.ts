/**
 * Vocab Games — deterministic archetype selector.
 *
 * Never Math.random for pedagogical choices. Selection is a stable hash of
 * (lessonId + hub + cefr + target words) so the same lesson always shows the
 * same game sequence — critical for A/B analysis, telemetry stability, and
 * teacher trust ("my class played MeaningMaze yesterday").
 *
 * Hub caps enforced here so the host never has to know them.
 */

import type { Cefr, Hub, VocabGameId } from './types';

const CAP_BY_HUB: Record<Hub, number> = {
  playground: 3,
  academy: 4,
  success: 3,
};

/**
 * Games allowed at each hub × CEFR combo. Playground avoids typing; Success
 * skips childish memory-match at B2+ (retrieval MCQ + sound_match preferred).
 */
function eligibleGames(hub: Hub, cefr: Cefr): VocabGameId[] {
  if (hub === 'playground') {
    // No typing games at Playground. Rescue Round is the compassionate default;
    // Boss Round available for variety.
    return ['memory_grid', 'word_rush', 'sound_match', 'rescue_round', 'boss_round'];
  }
  if (hub === 'academy') {
    if (cefr === 'Pre-A1' || cefr === 'A1') {
      return ['memory_grid', 'word_rush', 'meaning_maze', 'sound_match', 'rescue_round', 'boss_round'];
    }
    if (cefr === 'A2') {
      return ['meaning_maze', 'memory_grid', 'sound_match', 'word_rush', 'rescue_round', 'boss_round'];
    }
    // B1+ Academy unlocks typing-light retrieval.
    return ['meaning_maze', 'definition_sprint', 'memory_grid', 'sound_match', 'boss_round', 'rescue_round'];
  }
  // success
  if (cefr === 'A2') return ['meaning_maze', 'memory_grid', 'sound_match', 'boss_round', 'rescue_round'];
  return ['meaning_maze', 'definition_sprint', 'sound_match', 'memory_grid', 'boss_round', 'rescue_round'];
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export interface SelectionInput {
  hub: Hub;
  cefr: Cefr;
  lessonId?: string;
  words: string[];
  maxGames?: number;
}

export function selectGames(input: SelectionInput): VocabGameId[] {
  const cap = Math.min(
    input.maxGames ?? CAP_BY_HUB[input.hub] ?? 3,
    CAP_BY_HUB[input.hub] ?? 3,
  );
  const pool = eligibleGames(input.hub, input.cefr);
  const seed = hashString(
    `${input.lessonId ?? ''}|${input.hub}|${input.cefr}|${input.words.join(',')}`,
  );

  // Deterministic rotation: start at seed % pool.length, walk unique.
  const start = pool.length > 0 ? seed % pool.length : 0;
  const chosen: VocabGameId[] = [];
  for (let i = 0; i < pool.length && chosen.length < cap; i++) {
    const g = pool[(start + i) % pool.length];
    if (!chosen.includes(g)) chosen.push(g);
  }
  return chosen;
}

export const hubCap = (hub: Hub) => CAP_BY_HUB[hub] ?? 3;

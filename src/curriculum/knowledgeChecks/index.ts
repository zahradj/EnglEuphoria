import { PLAYGROUND_KNOWLEDGE_CHECKS, type UnitKnowledgeCheck } from './playground';

export type { KnowledgeProbe, UnitKnowledgeCheck, LevelKnowledgeChecks } from './playground';

/** The knowledge check for a hub / level / unit, if one is written yet.
 *  Academy and Success checks come later. */
export function getKnowledgeCheck(hub: string, level: string, unit: number): UnitKnowledgeCheck | null {
  if (hub !== 'playground') return null;
  return PLAYGROUND_KNOWLEDGE_CHECKS[level]?.[unit] ?? null;
}

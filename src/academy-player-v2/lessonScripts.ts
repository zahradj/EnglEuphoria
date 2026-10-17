// Loads the script of an Academy lesson by its library id (code-split: a script is fetched only when the lesson is opened).
// Library ids are blueprint ids ('B1-S01-E1'). New lessons register here (docs/academy-player-v2-plan.md).
import type { LessonScript } from './types';

const LOADERS: Record<string, () => Promise<LessonScript>> = {};

export const hasScript = (id: string): boolean => id in LOADERS;
export const loadScript = (id: string): Promise<LessonScript> | null => (LOADERS[id] ? LOADERS[id]() : null);
export const scriptIds = (): string[] => Object.keys(LOADERS);

/** 'B1-S01-E3' -> 'B1' ('PA1-...' -> 'Pre-A1') */
export function levelOfBlueprint(blueprintId: string): 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' {
  const l = blueprintId.split('-')[0];
  return l === 'PA1' ? 'Pre-A1' : (l as 'A1' | 'A2' | 'B1' | 'B2' | 'C1');
}

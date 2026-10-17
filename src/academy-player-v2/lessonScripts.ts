// Loads the script of an Academy lesson by its library id (code-split: a script is fetched only when the lesson is opened).
// Library ids are blueprint ids ('B1-S01-E1'). New lessons register here (docs/academy-player-v2-plan.md).
import type { LessonScript } from './types';

const LOADERS: Record<string, () => Promise<LessonScript>> = {
  'B1-S01-E1': () => import('./lessons/b1s01e1').then((m) => m.B1_S01_E1),
  'B1-S01-E2': () => import('./lessons/b1s01e2').then((m) => m.B1_S01_E2),
  'B1-S01-E3': () => import('./lessons/b1s01e3').then((m) => m.B1_S01_E3),
  'B1-S01-E4': () => import('./lessons/b1s01e4').then((m) => m.B1_S01_E4),
  // 'B1-S01-E5' is written (lessons/b1s01e5.ts) but registered only when its Canva art, voices and tests are in
};

export const hasScript = (id: string): boolean => id in LOADERS;
export const loadScript = (id: string): Promise<LessonScript> | null => (LOADERS[id] ? LOADERS[id]() : null);
export const scriptIds = (): string[] => Object.keys(LOADERS);

/** 'B1-S01-E3' -> 'B1' ('PA1-...' -> 'Pre-A1') */
export function levelOfBlueprint(blueprintId: string): 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' {
  const l = blueprintId.split('-')[0];
  return l === 'PA1' ? 'Pre-A1' : (l as 'A1' | 'A2' | 'B1' | 'B2' | 'C1');
}

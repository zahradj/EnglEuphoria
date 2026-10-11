// Academy lessons the live classroom / solo launcher can open by id. Add a lesson here when its script is built and tested.
import type { SceneScript } from './scriptTypes';

const LOADERS: Record<string, () => Promise<SceneScript>> = {
  'A1-S01-E1': async () => (await import('./samples/a1s01e1')).A1S01E1,
  'A1-S01-E2': async () => (await import('./samples/a1s01e2')).A1S01E2,
};

export const hasAcademyLesson = (id: string) => id in LOADERS;
export const loadAcademyLesson = (id: string): Promise<SceneScript> | null => (LOADERS[id] ? LOADERS[id]() : null);

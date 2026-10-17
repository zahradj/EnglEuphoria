// The order of the quest cinematics (pure, testable): a new stage plays the map (between stages) and then its title card; an encounter scene
// (boss, forge, rapport, sort, hunt) plays a short stinger the first time it opens. Each plays once per run; going Back never replays them.
import { isEncounter, type EncounterKind } from '../engine/quest';
import type { SceneBase } from '../types';

export type Cine =
  | { type: 'map'; from: number; to: number }
  | { type: 'stage'; part: number }
  | { type: 'stinger'; sceneId: string; kind: EncounterKind };

export interface Flow { sceneId: string | null; queue: Cine[]; seenParts: number[]; seenStingers: string[] }
export const initialFlow = (seenParts: number[] = []): Flow => ({ sceneId: null, queue: [], seenParts, seenStingers: [] });

/** the flow for a newly shown scene (returns the same object while the scene does not change) */
export function advanceFlow(f: Flow, scene: SceneBase | undefined, enabled: boolean, doneIds: string[]): Flow {
  if (!scene || f.sceneId === scene.id) return f;
  const next: Flow = { ...f, sceneId: scene.id, queue: [] };
  if (!enabled || scene.kind === 'lobby') return next;
  if (!f.seenParts.includes(scene.part)) {
    const from = f.seenParts.length ? Math.max(...f.seenParts) : null;
    if (from !== null && from < scene.part) next.queue.push({ type: 'map', from, to: scene.part });
    next.queue.push({ type: 'stage', part: scene.part });
    next.seenParts = [...f.seenParts, scene.part];
  }
  if (isEncounter(scene.kind) && !f.seenStingers.includes(scene.id) && !doneIds.includes(scene.id)) {
    next.queue.push({ type: 'stinger', sceneId: scene.id, kind: scene.kind });
    next.seenStingers = [...f.seenStingers, scene.id];
  }
  return next;
}

export const dismissCine = (f: Flow): Flow => (f.queue.length ? { ...f, queue: f.queue.slice(1) } : f);

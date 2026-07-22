/**
 * Minimal typed event emitter — used to bridge Phaser → React without
 * exposing Phaser internals.
 */
import type { MomentKind, SceneResult } from './types';

export type EngineEventMap = {
  sceneStart: { index: number };
  sceneComplete: SceneResult;
  momentStart: { index: number; total: number; kind: MomentKind; id: string };
  momentComplete: { index: number; kind: MomentKind; id: string };
  lessonComplete: { results: SceneResult[] };
  error: { message: string };
};

type Handler<K extends keyof EngineEventMap> = (payload: EngineEventMap[K]) => void;

export class EngineEvents {
  private handlers = new Map<keyof EngineEventMap, Set<Handler<keyof EngineEventMap>>>();

  on<K extends keyof EngineEventMap>(event: K, fn: Handler<K>): () => void {
    const set = (this.handlers.get(event) ?? new Set()) as Set<Handler<K>>;
    set.add(fn);
    this.handlers.set(event, set as Set<Handler<keyof EngineEventMap>>);
    return () => set.delete(fn);
  }

  emit<K extends keyof EngineEventMap>(event: K, payload: EngineEventMap[K]): void {
    const set = this.handlers.get(event) as Set<Handler<K>> | undefined;
    if (!set) return;
    set.forEach((fn) => {
      try { fn(payload); } catch (err) { console.error('[EngineEvents]', event, err); }
    });
  }

  clear(): void {
    this.handlers.clear();
  }
}

/**
 * Lightweight pub/sub bridge between the Teacher Control Dock and the active
 * MultiplayerWebStage instance. The stage subscribes when it mounts; the dock
 * publishes nav commands. This avoids prop-drilling refs through MainStage.
 */

export type CoBrowserNavCommand = 'back' | 'forward' | 'reload' | 'home';

type Listener = (cmd: CoBrowserNavCommand, payload?: unknown) => void;

class CoBrowserController {
  private listeners = new Set<Listener>();
  /** Home URL the teacher chose (last URL submitted via the dock). */
  homeUrl: string | null = null;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(cmd: CoBrowserNavCommand, payload?: unknown): void {
    this.listeners.forEach((fn) => {
      try { fn(cmd, payload); } catch (err) { console.warn('[CoBrowserController] listener failed', err); }
    });
  }
}

export const coBrowserController = new CoBrowserController();

import { useSyncExternalStore } from 'react';

/**
 * A tiny shared store so the classroom's media state (camera problem, link quality) reaches the heartbeat hook (which lives in
 * ClassroomLifecycle) and the peer's status reaches the classroom UI, without threading props through the whole tree.
 * One classroom is on screen at a time, so a module-level store is enough.
 */
interface State { own: string; peer: string | null }

let state: State = { own: 'ok', peer: null };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const mediaStatusStore = {
  getOwn: () => state.own,
  getPeer: () => state.peer,
  setOwn(own: string) {
    if (own === state.own) return;
    state = { ...state, own };
    emit();
  },
  setPeer(peer: string | null) {
    if (peer === state.peer) return;
    state = { ...state, peer };
    emit();
  },
  reset() {
    state = { own: 'ok', peer: null };
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
};

export const usePeerMediaStatus = (): string | null =>
  useSyncExternalStore(mediaStatusStore.subscribe, mediaStatusStore.getPeer, mediaStatusStore.getPeer);

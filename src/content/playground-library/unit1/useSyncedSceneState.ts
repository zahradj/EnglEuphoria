import { useCallback, useEffect, useState } from 'react';
import { whiteboardService } from '@/services/whiteboardService';

interface UseSyncedSceneStateOptions {
  /** Stable id for this scene instance — pass scene.id. Broadcasts for a different sceneId are ignored. */
  sceneId: string;
  roomId?: string;
  role?: 'teacher' | 'student';
  /** Ignored for teacher/solo play. Gates student writes. */
  activityUnlocked?: boolean;
}

/**
 * Solo play (no roomId/role): behaves like plain useState, zero broadcast overhead.
 * Synced play: the teacher can always act; the student can act only when
 * activityUnlocked. Whichever side is authorized broadcasts the FULL new state
 * object on every update() call; the other side overwrites its local state
 * wholesale on receipt (last-write-wins, no merge — same contract as the
 * existing NativeGameMemory/game_state channel this mirrors).
 */
export function useSyncedSceneState<T extends Record<string, any>>(
  initialState: T,
  { sceneId, roomId, role, activityUnlocked }: UseSyncedSceneStateOptions,
): [T, (next: T) => void, boolean] {
  const [state, setState] = useState<T>(initialState);
  const isSynced = !!roomId && !!role;
  const canAct = !isSynced || role === 'teacher' || (role === 'student' && !!activityUnlocked);

  useEffect(() => {
    if (!isSynced || !roomId) return;
    const unsub = whiteboardService.subscribeToSceneInteractionState(roomId, (payload) => {
      if (payload.sceneId !== sceneId) return;
      setState(payload.state as T);
    });
    return unsub;
  }, [isSynced, roomId, sceneId]);

  const update = useCallback((next: T) => {
    if (!canAct) return;
    setState(next);
    if (isSynced && roomId) {
      void whiteboardService.sendSceneInteractionState(roomId, { sceneId, state: next, senderId: role! });
    }
  }, [canAct, isSynced, roomId, sceneId, role]);

  return [state, update, canAct];
}

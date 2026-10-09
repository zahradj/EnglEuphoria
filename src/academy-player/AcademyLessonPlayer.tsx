// Academy lesson player for the LIVE CLASSROOM (and solo). Same contract as the Playground's `PlayUnitLesson`, so the classroom
// can mount it in the same place: `role`, `roomId`, `hideInternalNav`, `onNavState`, persisted position and interaction lock,
// and a ref handle (goNext / goBack / goToIndex / setInteractionUnlocked) driven by the classroom's own nav bar.
//
// Sharing: ONE lesson stage seen by both people. The lesson state (engine.ts `PlayerState`) is the shared object.
//  - Teacher = authority: events change the state, and each new state is broadcast on the classroom's activity-state channel
//    (whiteboardService.sendSceneActivityState). The teacher alone moves the story on, goes back and jumps.
//  - Student = mirror: renders the latest snapshot. While the teacher has interaction ON (the classroom default after "Start
//    Class") the student also does the activities (choose / answer / fill); both screens are then authorities and the state
//    with the higher `rev` wins. Teacher pauses interaction -> the student's screen is read-only.
//  - Late join / reconnect: the student asks for the state (scene_state_request); the teacher answers, and also re-broadcasts
//    every 5 s. A saved position (`persistedSceneIdx`) is replayed with `replayTo`.
// Not shared yet (stays on each screen): what is half-typed or half-built inside one activity. Wrong tries and answers are in the state.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { AcademyPlayer } from './AcademyPlayer';
import { autoEvent, initState, replayTo, step, type PlayerEvent, type PlayerState } from './engine';
import { academySyncId, reconcilePlayerState, shareable } from './liveSync';
import type { SceneScript } from './scriptTypes';
import { whiteboardService } from '@/services/whiteboardService';

export interface AcademyLessonHandle {
  goNext: () => void;
  goBack: () => void;
  goToIndex: (idx: number) => void;
  /** teacher only: pause (false) or allow (true) the student's interaction */
  setInteractionUnlocked: (unlocked: boolean) => void;
}

export interface AcademyLessonPlayerProps {
  script: SceneScript;
  sessionKey: string;
  embedded?: boolean;
  role?: 'teacher' | 'student';
  roomId?: string;
  /** whether the student may do the activities (default true while the class runs; the teacher's pause overrides it) */
  activityUnlocked?: boolean;
  hideInternalNav?: boolean;
  onNavState?: (state: { sceneIdx: number; total: number; canNavigate: boolean; interactionUnlocked: boolean; lockToggleApplicable: boolean }) => void;
  persistedSceneIdx?: number | null;
  onSceneIdxPersist?: (idx: number) => void;
  persistedInteractionUnlocked?: boolean | null;
  onInteractionUnlockedPersist?: (unlocked: boolean) => void;
  artBase?: string;
  theme?: 'explorer' | 'studio';
  seed?: number;
}

const STUDENT_EVENTS: ReadonlySet<PlayerEvent['type']> = new Set(['choose', 'answer', 'fill', 'next']);

const AcademyLessonPlayer = forwardRef<AcademyLessonHandle, AcademyLessonPlayerProps>(function AcademyLessonPlayer(
  { script, sessionKey, role, roomId, activityUnlocked, hideInternalNav = false, onNavState, persistedSceneIdx, onSceneIdxPersist, persistedInteractionUnlocked, onInteractionUnlockedPersist, artBase, theme = 'studio', seed = 1 },
  ref,
) {
  const isSynced = role != null && !!roomId;
  const canNavigate = !isSynced || role === 'teacher';
  const syncId = academySyncId(script);

  // ── the lesson state (one shared JSON object) ──
  const [state, setStateRaw] = useState<PlayerState>(() => {
    try {
      const saved = window.sessionStorage.getItem(sessionKey);
      if (saved) {
        const ok = reconcilePlayerState(JSON.parse(saved), script);
        if (ok) return ok;
      }
    } catch { /* storage can be unavailable */ }
    if (persistedSceneIdx != null && persistedSceneIdx > 0) return replayTo(script, seed, persistedSceneIdx);
    return initState(script, seed);
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── interaction lock: the teacher's pause (student default: ON while the class runs) ──
  const [unlocked, setUnlocked] = useState<boolean>(persistedInteractionUnlocked ?? activityUnlocked ?? true);
  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;
  const lastLiveUnlockAt = useRef(0);
  const effectiveUnlocked = role === 'student' ? unlocked : true;
  const hasAuthority = !isSynced || role === 'teacher' || effectiveUnlocked;
  const authorityRef = useRef(hasAuthority);
  authorityRef.current = hasAuthority;

  const broadcast = useCallback(
    (s: PlayerState) => {
      if (!isSynced || !roomId || !role || !authorityRef.current) return;
      void whiteboardService.sendSceneActivityState(roomId, { state: shareable(s), senderId: role, sceneId: syncId }).catch(() => {});
    },
    [isSynced, roomId, role, syncId],
  );

  const commit = useCallback(
    (next: PlayerState) => {
      stateRef.current = next;
      setStateRaw(next);
      try { window.sessionStorage.setItem(sessionKey, JSON.stringify(shareable(next))); } catch { /* ignore */ }
      broadcast(next);
    },
    [broadcast, sessionKey],
  );

  /** an event from the lesson screen (a person did something) */
  const onEvent = useCallback(
    (e: PlayerEvent) => {
      if (role === 'student' && (!effectiveUnlocked || !STUDENT_EVENTS.has(e.type))) return;
      const next = step(script, stateRef.current, e);
      if (next !== stateRef.current) commit(next);
    },
    [script, role, effectiveUnlocked, commit],
  );

  // ── receive the other screen's snapshots ──
  useEffect(() => {
    if (!isSynced || !roomId) return;
    return whiteboardService.subscribeToSceneActivityState(roomId, (payload) => {
      if (payload.sceneId !== syncId || payload.senderId === role) return;
      const incoming = reconcilePlayerState(payload.state, script);
      if (!incoming) return;
      const cur = stateRef.current;
      // a mirror always follows; two authorities (teacher + unlocked student): the higher rev wins
      if (authorityRef.current && incoming.rev <= cur.rev) return;
      stateRef.current = { ...incoming, history: role === 'teacher' ? cur.history : [] };
      setStateRaw(stateRef.current);
    });
  }, [isSynced, roomId, role, script, syncId]);

  // ── late join: ask for the state; the teacher answers and also repeats it every 5 s ──
  useEffect(() => {
    if (!isSynced || !roomId || !role) return;
    void whiteboardService.sendSceneStateRequest(roomId, { senderRole: role }).catch(() => {});
    if (role !== 'teacher') return;
    const unsub = whiteboardService.subscribeToSceneStateRequest(roomId, () => broadcast(stateRef.current));
    const iv = window.setInterval(() => broadcast(stateRef.current), 5000);
    return () => {
      unsub();
      window.clearInterval(iv);
    };
  }, [isSynced, roomId, role, broadcast]);

  // ── the lock travels on the classroom's permission channel ──
  useEffect(() => {
    if (!isSynced || role !== 'student' || !roomId) return;
    return whiteboardService.subscribeToSceneInteractionPermission(roomId, (p) => {
      lastLiveUnlockAt.current = Date.now();
      setUnlocked(p.unlocked);
    });
  }, [isSynced, role, roomId]);
  useEffect(() => {
    if (!isSynced || role !== 'teacher' || !roomId) return;
    const iv = window.setInterval(() => void whiteboardService.sendSceneInteractionPermission(roomId, { unlocked: unlockedRef.current, senderId: 'teacher' }).catch(() => {}), 3000);
    return () => window.clearInterval(iv);
  }, [isSynced, role, roomId]);

  const setInteractionUnlocked = useCallback(
    (next: boolean) => {
      setUnlocked(next);
      if (isSynced && role === 'teacher' && roomId) void whiteboardService.sendSceneInteractionPermission(roomId, { unlocked: next, senderId: 'teacher' }).catch(() => {});
      onInteractionUnlockedPersist?.(next);
    },
    [isSynced, role, roomId, onInteractionUnlockedPersist],
  );

  // ── the classroom's own nav bar ──
  const goNext = useCallback(() => {
    if (!canNavigate) return;
    const b = script.beats[stateRef.current.beatIndex];
    if (b) onEvent(autoEvent(b));
  }, [canNavigate, script, onEvent]);
  const goBack = useCallback(() => {
    if (canNavigate) onEvent({ type: 'back' });
  }, [canNavigate, onEvent]);
  const goToIndex = useCallback(
    (idx: number) => {
      if (!canNavigate) return;
      const next = replayTo(script, stateRef.current.seed, Math.max(0, Math.min(script.beats.length - 1, idx)));
      commit({ ...next, rev: stateRef.current.rev + 1 });
    },
    [canNavigate, script, commit],
  );
  useImperativeHandle(ref, () => ({ goNext, goBack, goToIndex, setInteractionUnlocked }), [goNext, goBack, goToIndex, setInteractionUnlocked]);

  useEffect(() => {
    onNavState?.({ sceneIdx: state.beatIndex, total: script.beats.length, canNavigate, interactionUnlocked: effectiveUnlocked, lockToggleApplicable: isSynced && role === 'teacher' });
  }, [state.beatIndex, script.beats.length, canNavigate, effectiveUnlocked, isSynced, role, onNavState]);
  const lastPersisted = useRef(-1);
  useEffect(() => {
    if (role !== 'teacher' || lastPersisted.current === state.beatIndex) return;
    lastPersisted.current = state.beatIndex;
    onSceneIdxPersist?.(state.beatIndex);
  }, [role, state.beatIndex, onSceneIdxPersist]);

  const readOnly = role === 'student' && !effectiveUnlocked;
  const lockLines = role === 'student';
  const showBack = canNavigate && !hideInternalNav;
  const memoScript = useMemo(() => script, [script]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <AcademyPlayer script={memoScript} theme={theme} artBase={artBase} autoStart state={state} onEvent={onEvent} readOnly={readOnly} lockLines={lockLines} showBack={showBack} />
    </div>
  );
});

export default AcademyLessonPlayer;

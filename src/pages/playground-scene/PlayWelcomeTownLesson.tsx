import { useSceneScopedState } from '@/content/playground-library/sceneActivitySync';
import { SceneCrashGuard } from '@/content/playground-library/SceneCrashGuard';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { Scene } from '@/content/playground-library/welcome-town/scenes';
import { VOICE_KEY } from '@/content/playground-library/welcome-town/scenes';
import { SceneRenderer, Hearts, MAX_HEARTS, Lep1Keyframes } from '@/content/playground-library/welcome-town/SceneRenderer';
import { stopSpeaking, prefetch, unlockAudio, setSpeechRelay, setSpeechDedupe, playRelayedSpeech, setSpeechRelayLead, collectSceneLines, warmReadyClip } from '@/content/playground-library/unit1/audio';
import { whiteboardService } from '@/services/whiteboardService';
import { getDomPath, getElementAtPath, withPointerCaptureNoop } from '@/content/playground-library/unit1/scenePathSync';

// How long a live broadcast takes precedence over the DB-persisted copy
// of the same classroom state (see teacherChangedUnlockRef).
const LIVE_OVER_DB_MS = 4000;

/** On-screen px per layout px of `el` (the classroom scales the lesson to
 *  fit each screen). Drag distances are mirrored in layout px so a drag on
 *  a big screen replays the same distance on a small one. */
function renderScale(el: HTMLElement): number {
  const w = el.offsetWidth;
  return w > 0 ? el.getBoundingClientRect().width / w : 1;
}

export interface PlayWelcomeTownLessonHandle {
  goNext: () => void;
  goBack: () => void;
  goToIndex: (idx: number) => void;
  setInteractionUnlocked: (unlocked: boolean) => void;
}

interface PlayWelcomeTownLessonProps {
  scenes: Scene[];
  sessionKey: string;
  embedded?: boolean;
  /** 'quest' = Homework Quest look (gold-framed stage, parchment cards,
   *  quest fonts/HUD); games, pointers and behaviour are unchanged. */
  skin?: 'quest';
  pageTitle?: string;
  pageDescription?: string;
  unitNumber?: number;
  lessonNumber?: number;
  onFinaleReached?: () => void;
  role?: 'teacher' | 'student';
  roomId?: string;
  hideInternalNav?: boolean;
  onNavState?: (state: { sceneIdx: number; total: number; canNavigate: boolean; interactionUnlocked: boolean }) => void;
  persistedSceneIdx?: number | null;
  onSceneIdxPersist?: (idx: number) => void;
  /** Last interaction-unlock state persisted to the classroom session DB row, if any — recovers a refreshed/reconnecting tab instead of resetting to locked. */
  persistedInteractionUnlocked?: boolean | null;
  /** Teacher-only: called whenever the interaction-unlock gate changes, so the caller can persist it (in addition to the instant broadcast this component already sends) for that catch-up path. */
  onInteractionUnlockedPersist?: (unlocked: boolean) => void;
}

/** Gem-eligible scene kinds — every activity kind that ever calls onWin(true)
 *  exactly once when completed. Kept in sync manually with SceneRenderer.tsx
 *  (title-card/cinematic never award a gem; finale is the end screen). */
const GEM_KINDS = new Set<Scene['kind']>(['meet', 'echo', 'memory', 'vocab-spot', 'drag-match', 'drag-sticker', 'choice', 'listen-tap', 'true-false', 'roleplay', 'join-stage', 'hello-doors', 'flipbook', 'song', 'trace', 'word-build', 'sentence-build', 'letter-game', 'jigsaw-puzzle', 'spin-wheel', 'picture-match', 'first-sound', 'letter-match', 'letter-blocks', 'place-it', 'torch-hunt', 'where-castle', 'first-sound', 'letter-match', 'letter-blocks', 'whats-missing', 'welcome-party', 'name-badge']);

/** Scene kinds that own real synced state (see `activityState` below)
 *  instead of relying on the generic scene_tap DOM-click-mirror. Whoever
 *  holds the floor (hasActivityAuthority) pushes its full local state on
 *  every change and the other side renders straight from that snapshot —
 *  no click-replay involved, so an asymmetry between the two sides' DOM
 *  trees (e.g. the student-only "Watching your teacher" lock overlay) can
 *  no longer break it.
 *
 *  Left OUT deliberately, still on the old DOM-mirror:
 *  - title-card, cinematic, finale: no user-driven branching state to
 *    desync in the first place (cinematic's dialogue is a fixed timed
 *    script both sides already run identically).
 *  - song: driven by each side's own <audio> currentTime via
 *    requestAnimationFrame, not a discrete tap — the old click-mirror
 *    re-triggers independent-but-content-matching playback on both
 *    screens, which already works; moving it here would need explicit
 *    cross-device playback-start syncing, a different problem than the
 *    one this channel solves.
 *  - drag-match, pronoun-sort, trace, jigsaw-puzzle: continuous pointer
 *    gestures (live drag position every pointermove), not a snapshot of
 *    discrete state — need per-frame position streaming through this
 *    channel to convert safely, deferred as its own follow-up. */
const REAL_SYNC_KINDS = new Set<Scene['kind']>([
  'vocab-spot', 'meet', 'echo', 'memory', 'choice', 'listen-tap', 'true-false',
  'frequency-ladder', 'roleplay', 'join-stage', 'hello-doors', 'flipbook',
  'sound-model', 'word-build', 'sentence-build', 'letter-game', 'spin-wheel', 'picture-match',
  'first-sound', 'letter-match', 'letter-blocks', 'whats-missing',
  'tongue-twister', 'place-it', 'torch-hunt', 'where-castle', 'welcome-party', 'name-badge',
]);

const PlayWelcomeTownLesson = forwardRef<PlayWelcomeTownLessonHandle, PlayWelcomeTownLessonProps>(function PlayWelcomeTownLesson(
  { scenes, sessionKey, embedded = false, skin, pageTitle, pageDescription, onFinaleReached, unitNumber, lessonNumber, role, roomId, hideInternalNav = false, onNavState, persistedSceneIdx, onSceneIdxPersist, persistedInteractionUnlocked, onInteractionUnlockedPersist },
  ref,
) {
  const navigate = useNavigate();
  const SCENES = scenes;
  const finaleFiredRef = useRef(false);

  const [sceneIdx, setSceneIdx] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const s = window.sessionStorage.getItem(sessionKey);
    const n = s ? Number(s) : 0;
    return Number.isFinite(n) && n >= 0 && n < SCENES.length ? n : 0;
  });
  // Whether this tab already had its own saved position for this lesson
  // (same-tab reload, e.g. Force Refresh). A teacher opening the class in a
  // new tab/device has none, and must adopt the class's saved position
  // instead of announcing scene 0 over it — see the adoption effect below.
  const hadStoredSceneIdxRef = useRef<boolean>(
    typeof window !== 'undefined' && window.sessionStorage.getItem(sessionKey) != null,
  );
  // Teacher: whether sceneIdx reflects the class's real position yet (so a
  // catch-up reply never announces a not-yet-restored scene 0).
  const teacherPositionKnownRef = useRef<boolean>(hadStoredSceneIdxRef.current);
  // Whether interactionUnlocked reflects the class's real lock state yet
  // (restored from the DB, or set by the teacher) — same reason.
  const unlockKnownRef = useRef(false);
  // The DB copies of the unlock gate / scene index are for RECOVERY (a
  // refresh, a late join), not live instructions. Every classroom write
  // echoes the whole session row back over realtime, and the "let student
  // interact" button fires several writes at once — so an echo taken
  // before the unlock write landed still says "locked". The teacher's
  // player used to adopt that stale echo, re-lock, and persist "locked";
  // the next echo said "unlocked", it re-unlocked and persisted that, and
  // so on: a self-sustaining ping-pong that flipped the student's lock
  // overlay and "Your turn" bar on and off (reported live as the lesson
  // flickering and shaking once interaction was granted).
  const teacherChangedUnlockRef = useRef(false);
  const lastLiveUnlockAtRef = useRef(0);
  const lastLiveNavAtRef = useRef(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [gems, setGems] = useState(0);
  const scene = SCENES[sceneIdx] ?? SCENES[0];

  const isSynced = role != null && !!roomId;
  const canNavigate = !isSynced || role === 'teacher';

  const [interactionUnlocked, setInteractionUnlockedState] = useState(false);
  const sceneRootRef = useRef<HTMLDivElement>(null);
  const isApplyingRemoteTapRef = useRef(false);
  // Set synchronously inside the capture-phase click handler right when a
  // student's tap is mirrored to the teacher (sendSceneTap). Replaying that
  // click on the teacher's own DOM independently fires whatever onClick the
  // real element has — including onNext for activities that advance on
  // click — so if goNext() runs as part of the SAME click, sending a
  // second, separate sendSceneAdvanceRequest on top of it double-advances
  // the teacher (confirmed: this was leaving the student's own view stuck
  // one scene behind after their own successful tap).
  const justMirroredTapRef = useRef(false);

  const setInteractionUnlocked = useCallback((next: boolean) => {
    unlockKnownRef.current = true;
    teacherChangedUnlockRef.current = true;
    setInteractionUnlockedState(next);
    if (isSynced && role === 'teacher' && roomId) {
      void whiteboardService.sendSceneInteractionPermission(roomId, { unlocked: next, senderId: 'teacher' });
    }
  }, [isSynced, role, roomId]);

  const prevSceneIdxRef = useRef(sceneIdx);
  // Interaction is NOT re-locked on a scene change any more. The student's
  // drag / tap / draw stays on from "Start Class" to the end of the lesson, and
  // only the teacher's Pause button turns it off (and back on). It used to snap
  // back to locked on every scene, so the teacher had to unlock again each time.

  useEffect(() => {
    if (!isSynced || role !== 'student' || !roomId) return;
    const unsubscribe = whiteboardService.subscribeToSceneInteractionPermission(roomId, (payload) => {
      lastLiveUnlockAtRef.current = Date.now();
      setInteractionUnlockedState(payload.unlocked);
    });
    return unsubscribe;
  }, [isSynced, role, roomId]);

  // Teacher: re-send the current unlock state every few seconds. A single
  // dropped realtime message used to leave the student locked while the
  // teacher's button said "unlocked" (only a re-toggle fixed it); the
  // heartbeat makes the student converge on its own within seconds, and
  // keeps the student's DB-echo guard (LIVE_OVER_DB_MS) fresh.
  const unlockForHeartbeatRef = useRef(interactionUnlocked);
  unlockForHeartbeatRef.current = interactionUnlocked;
  useEffect(() => {
    if (!isSynced || role !== 'teacher' || !roomId) return;
    const iv = window.setInterval(() => {
      if (!unlockKnownRef.current && !unlockForHeartbeatRef.current) return;
      void whiteboardService.sendSceneInteractionPermission(roomId, { unlocked: unlockForHeartbeatRef.current, senderId: 'teacher' });
    }, 3000);
    return () => window.clearInterval(iv);
  }, [isSynced, role, roomId]);

  // Recover the current unlock state from the DB-persisted value on mount
  // or reconnect, for BOTH roles — previously this gate was broadcast-only,
  // so a refreshed tab (teacher or student) always reset to locked/false
  // with no way to learn the real current value.
  useEffect(() => {
    if (!isSynced) return;
    if (persistedInteractionUnlocked == null) return;
    // Teacher: once they've toggled, they are the source of truth — never
    // take an echo of their own (possibly out-of-order) writes back.
    if (role === 'teacher' && teacherChangedUnlockRef.current) return;
    // Student: the teacher's live broadcast wins over a DB echo arriving
    // right behind it (which may predate the change).
    if (role === 'student' && Date.now() - lastLiveUnlockAtRef.current < LIVE_OVER_DB_MS) return;
    unlockKnownRef.current = true;
    setInteractionUnlockedState(persistedInteractionUnlocked);
  }, [isSynced, role, persistedInteractionUnlocked]);

  // Teacher: persist the unlock gate whenever it changes, the same way
  // sceneIdx is persisted below via onSceneIdxPersist.
  // Skips its mount-time run: that would write the initial `false` over the
  // class's saved value before the recovery effect above can apply it.
  const skipFirstUnlockPersistRef = useRef(true);
  useEffect(() => {
    if (!isSynced || role !== 'teacher') return;
    if (skipFirstUnlockPersistRef.current) {
      skipFirstUnlockPersistRef.current = false;
      return;
    }
    onInteractionUnlockedPersist?.(interactionUnlocked);
  }, [isSynced, role, interactionUnlocked, onInteractionUnlockedPersist]);

  // Whichever side currently "has the floor" — the teacher by default, or
  // the student once unlocked. Unlike iCaptureTaps below (which is fine
  // being true on BOTH sides at once, since the DOM-tap mirror is genuinely
  // bidirectional), a single-authority state channel needs EXACTLY ONE side
  // driving state at a time, or both sides would independently compute and
  // broadcast conflicting snapshots. So this must flip, not just extend, for
  // the teacher once the student is unlocked.
  // `studentOnly` scenes (self-check / auto-evaluation slides) give the
  // student the floor outright: no teacher unlock needed, and the teacher's
  // copy is a live, non-interactive view of the student's work.
  const studentDriven = isSynced && (scene as { studentOnly?: boolean }).studentOnly === true;
  const hasActivityAuthority = !isSynced
    ? true
    : studentDriven
      ? role === 'student'
      : role === 'student'
        ? interactionUnlocked
        : !interactionUnlocked;
  const usesRealSync = REAL_SYNC_KINDS.has(scene.kind);

  // Scene-tagged: the render right after a scene change must never see the previous scene's state.
  const [activityState, setActivityStateLocal] = useSceneScopedState(scene.id);

  // A new scene starts with no activity state on both sides — each side
  // resets independently in lockstep as soon as its own (already-synced)
  // sceneIdx changes, so this needs no broadcast of its own.

  const setActivityState = useCallback((next: unknown) => {
    setActivityStateLocal(next);
    if (isSynced && hasActivityAuthority && roomId && role) {
      void whiteboardService.sendSceneActivityState(roomId, { state: next, senderId: role, sceneId: scene.id });
    }
  }, [isSynced, hasActivityAuthority, roomId, role, scene.id]);

  useEffect(() => {
    if (!isSynced || hasActivityAuthority || !roomId) return;
    const unsubscribe = whiteboardService.subscribeToSceneActivityState(roomId, (payload) => {
      // Discard snapshots for any scene other than the one currently on
      // screen — a broadcast sent right as the sender navigates away can
      // otherwise arrive while this side is still on (or has already
      // moved to) a different scene, handing that scene's useSyncedState a
      // wrong-shaped object it then crashes reading a field off of.
      if (payload.sceneId !== scene.id) return;
      setActivityStateLocal(payload.state);
    });
    return unsubscribe;
  }, [isSynced, hasActivityAuthority, roomId, scene.id]);

  // Voices in synced activities: only the driving side runs the scene
  // logic that speaks, so relay each line to the other screen so the
  // student (or the teacher, when the student drives) hears it too.
  useEffect(() => {
    if (!isSynced || !roomId || !role || !usesRealSync) return;
    const sceneId = scene.id;
    if (hasActivityAuthority) {
      setSpeechRelay((event) => { void whiteboardService.sendSceneSpeech(roomId, { event, senderId: role, sceneId }); });
      // Measure the one-way time to the other screen (half the ping round
      // trip, smoothed) and hold our own playback back by that much so both
      // screens start each line together.
      const sentPings = new Map<number, number>();
      let rtt: number | null = null;
      const unsubPong = whiteboardService.subscribeToSceneSpeech(roomId, (payload) => {
        if (payload.senderId === role || payload.event.kind !== 'pong') return;
        const t0 = sentPings.get(payload.event.id);
        if (t0 === undefined) return;
        sentPings.delete(payload.event.id);
        const sample = Date.now() - t0;
        rtt = rtt === null ? sample : rtt * 0.7 + sample * 0.3;
        setSpeechRelayLead(rtt / 2);
      });
      let n = 0;
      const ping = () => { const id = ++n; sentPings.set(id, Date.now()); void whiteboardService.sendSceneSpeech(roomId, { event: { kind: 'ping', id }, senderId: role, sceneId }); };
      ping();
      const iv = window.setInterval(ping, 8000);
      return () => { window.clearInterval(iv); unsubPong(); setSpeechRelay(null); };
    }
    setSpeechDedupe(true);
    const unsubscribe = whiteboardService.subscribeToSceneSpeech(roomId, (payload) => {
      if (payload.senderId === role) return;
      if (payload.event.kind === 'ping') {
        void whiteboardService.sendSceneSpeech(roomId, { event: { kind: 'pong', id: payload.event.id }, senderId: role, sceneId });
        return;
      }
      if (payload.sceneId !== sceneId) return;
      playRelayedSpeech(payload.event);
    });
    return () => { unsubscribe(); setSpeechDedupe(false); };
  }, [isSynced, roomId, role, usesRealSync, hasActivityAuthority, scene.id]);

  const activitySync = usesRealSync
    ? { isSynced, isAuthority: hasActivityAuthority, state: activityState, setState: setActivityState }
    : undefined;

  const iCaptureTaps = isSynced && !!role && !usesRealSync && (role === 'teacher' || (role === 'student' && interactionUnlocked));

  useEffect(() => {
    if (!iCaptureTaps || !roomId || !role) return;
    const rootEl = sceneRootRef.current;
    if (!rootEl) return;

    const clickHandler = (e: MouseEvent) => {
      if (isApplyingRemoteTapRef.current) return;
      const target = e.target as Element | null;
      if (!target) return;
      const path = getDomPath(rootEl, target);
      if (!path) return;
      // This click is about to be mirrored onto the other party's DOM,
      // which independently re-fires whatever onClick the real element has
      // — including a call to goNext() further down in this same
      // synchronous dispatch, if this element is an activity's own
      // advance/continue control. Flag it so goNext() doesn't ALSO send a
      // separate advance request for the same action.
      justMirroredTapRef.current = true;
      setTimeout(() => { justMirroredTapRef.current = false; }, 0);
      void whiteboardService.sendSceneTap(roomId, { path, kind: 'click', senderRole: role, senderId: role });
    };

    const drags = new Map<number, { path: number[]; downX: number; downY: number; lastSent: number }>();
    const MOVE_THROTTLE_MS = 50;

    const downHandler = (e: PointerEvent) => {
      if (isApplyingRemoteTapRef.current) return;
      const target = e.target as Element | null;
      if (!target) return;
      const path = getDomPath(rootEl, target);
      if (!path) return;
      drags.set(e.pointerId, { path, downX: e.clientX, downY: e.clientY, lastSent: 0 });
      void whiteboardService.sendSceneTap(roomId, {
        path, kind: 'pointerdown', dx: 0, dy: 0, pointerId: e.pointerId, senderRole: role, senderId: role,
      });
    };
    const moveHandler = (e: PointerEvent) => {
      if (isApplyingRemoteTapRef.current) return;
      const drag = drags.get(e.pointerId);
      if (!drag) return;
      const now = performance.now();
      if (now - drag.lastSent < MOVE_THROTTLE_MS) return;
      drag.lastSent = now;
      void whiteboardService.sendSceneTap(roomId, {
        path: drag.path, kind: 'pointermove', dx: (e.clientX - drag.downX) / renderScale(rootEl), dy: (e.clientY - drag.downY) / renderScale(rootEl),
        pointerId: e.pointerId, senderRole: role, senderId: role,
      });
    };
    const upHandler = (e: PointerEvent) => {
      if (isApplyingRemoteTapRef.current) return;
      const drag = drags.get(e.pointerId);
      if (!drag) return;
      drags.delete(e.pointerId);
      void whiteboardService.sendSceneTap(roomId, {
        path: drag.path, kind: e.type === 'pointercancel' ? 'pointercancel' : 'pointerup',
        dx: (e.clientX - drag.downX) / renderScale(rootEl), dy: (e.clientY - drag.downY) / renderScale(rootEl),
        pointerId: e.pointerId, senderRole: role, senderId: role,
      });
    };

    rootEl.addEventListener('click', clickHandler, true);
    rootEl.addEventListener('pointerdown', downHandler, true);
    rootEl.addEventListener('pointermove', moveHandler, true);
    rootEl.addEventListener('pointerup', upHandler, true);
    rootEl.addEventListener('pointercancel', upHandler, true);
    return () => {
      rootEl.removeEventListener('click', clickHandler, true);
      rootEl.removeEventListener('pointerdown', downHandler, true);
      rootEl.removeEventListener('pointermove', moveHandler, true);
      rootEl.removeEventListener('pointerup', upHandler, true);
      rootEl.removeEventListener('pointercancel', upHandler, true);
    };
  }, [iCaptureTaps, roomId, role, sceneIdx]);

  // Deliberately NOT gated on interactionUnlocked (there used to be an
  // `iReplayTaps` guard mirroring iCaptureTaps' role/unlock check) — that
  // gate raced against the async round-trip for the teacher's per-scene
  // "reset to locked" (see the sceneIdx effect above): setInteractionUnlocked
  // updates the teacher's own state synchronously, but the STUDENT only
  // learns the new value after a real DB write + realtime round-trip. If
  // the teacher clicked something in a fresh scene before that round-trip
  // landed, the student's still-stale `interactionUnlocked` copy made this
  // effect skip subscribing entirely, silently dropping the tap for good
  // (a broadcast channel has no replay buffer) -- reported live as "teacher
  // clicks the vocabulary, nothing happens on the student's side." The
  // underlying whiteboardService channel is already `broadcast: { self:
  // false } }`, so every scene_tap this side ever receives is guaranteed to
  // be from the OTHER party already -- no local unlock guess is needed to
  // decide whether to trust and replay it.
  useEffect(() => {
    if (!isSynced || !role || !roomId) return;
    const dragTargets = new Map<number, { el: HTMLElement; startX: number; startY: number }>();
    const unsubscribe = whiteboardService.subscribeToSceneTap(roomId, (payload) => {
      const rootEl = sceneRootRef.current;
      if (!rootEl) return;
      const kind = payload.kind ?? 'click';
      const pointerId = payload.pointerId ?? 0;
      isApplyingRemoteTapRef.current = true;
      try {
        if (kind === 'click') {
          getElementAtPath(rootEl, payload.path)?.click();
          return;
        }
        if (kind === 'pointerdown') {
          const el = getElementAtPath(rootEl, payload.path);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const startX = rect.left + rect.width / 2;
          const startY = rect.top + rect.height / 2;
          dragTargets.set(pointerId, { el, startX, startY });
          withPointerCaptureNoop(() => {
            el.dispatchEvent(new PointerEvent('pointerdown', {
              bubbles: true, cancelable: true, pointerId, pointerType: 'mouse', isPrimary: true,
              clientX: startX, clientY: startY,
            }));
          });
          return;
        }
        const drag = dragTargets.get(pointerId);
        if (!drag) return;
        // dx/dy arrive in layout (design-canvas) px — convert to this
        // screen's rendered px, since each side scales the lesson differently.
        const k = renderScale(rootEl);
        const clientX = drag.startX + (payload.dx ?? 0) * k;
        const clientY = drag.startY + (payload.dy ?? 0) * k;
        withPointerCaptureNoop(() => {
          drag.el.dispatchEvent(new PointerEvent(kind, {
            bubbles: true, cancelable: true, pointerId, pointerType: 'mouse', isPrimary: true, clientX, clientY,
          }));
        });
        if (kind !== 'pointermove') dragTargets.delete(pointerId);
      } finally {
        isApplyingRemoteTapRef.current = false;
      }
    });
    return unsubscribe;
  }, [isSynced, role, roomId]);

  useEffect(() => { window.sessionStorage.setItem(sessionKey, String(sceneIdx)); }, [sceneIdx, sessionKey]);

  const skipFirstTeacherNavRef = useRef(!hadStoredSceneIdxRef.current);
  useEffect(() => {
    if (!isSynced || role !== 'teacher' || !roomId) return;
    // New tab/device with no saved position: don't announce/persist scene 0
    // over the class's real position before the adoption effect restores it.
    if (skipFirstTeacherNavRef.current) {
      skipFirstTeacherNavRef.current = false;
      return;
    }
    teacherPositionKnownRef.current = true;
    void whiteboardService.sendSceneLessonNav(roomId, {
      unitNumber: unitNumber ?? 0,
      lessonNumber: lessonNumber ?? 0,
      sceneIdx,
      senderId: 'teacher',
    });
    onSceneIdxPersist?.(sceneIdx);
  }, [isSynced, role, roomId, sceneIdx, unitNumber, lessonNumber, onSceneIdxPersist]);

  useEffect(() => {
    if (!isSynced || role !== 'student' || !roomId) return;
    const unsubscribe = whiteboardService.subscribeToSceneLessonNav(roomId, (payload) => {
      if (unitNumber != null && payload.unitNumber !== unitNumber) return;
      if (lessonNumber != null && payload.lessonNumber !== lessonNumber) return;
      lastLiveNavAtRef.current = Date.now();
      setSceneIdx(Math.max(0, Math.min(SCENES.length - 1, payload.sceneIdx)));
    });
    return unsubscribe;
  }, [isSynced, role, roomId, unitNumber, lessonNumber, SCENES.length]);

  useEffect(() => {
    if (!isSynced || role !== 'student') return;
    if (persistedSceneIdx == null) return;
    // Same rule as the unlock gate: a live nav broadcast beats a DB echo
    // that may be from before it (would bounce the page back and forth).
    if (Date.now() - lastLiveNavAtRef.current < LIVE_OVER_DB_MS) return;
    setSceneIdx(Math.max(0, Math.min(SCENES.length - 1, persistedSceneIdx)));
  }, [isSynced, role, persistedSceneIdx, SCENES.length]);

  // Teacher in a new tab/device: adopt the class's saved scene once, instead
  // of starting everyone over at scene 0.
  const adoptedPersistedIdxRef = useRef(false);
  useEffect(() => {
    if (!isSynced || role !== 'teacher') return;
    if (hadStoredSceneIdxRef.current || adoptedPersistedIdxRef.current) return;
    if (persistedSceneIdx == null) return;
    adoptedPersistedIdxRef.current = true;
    teacherPositionKnownRef.current = true;
    const target = Math.max(0, Math.min(SCENES.length - 1, persistedSceneIdx));
    setSceneIdx((cur) => {
      if (cur !== 0) return cur; // the teacher already moved on their own
      // Restoring position isn't a real scene change — keep the student's
      // current unlock state rather than re-locking it.
      prevSceneIdxRef.current = target;
      return target;
    });
  }, [isSynced, role, persistedSceneIdx, SCENES.length]);

  // Catch-up handshake (see SceneStateRequestPayload): every sync message is
  // a no-replay broadcast, so after joining, reconnecting or returning to
  // the foreground this side asks the other for the current state, and it
  // answers the other side's requests the same way.
  const syncSnapshotRef = useRef({ sceneIdx, interactionUnlocked, activityState, hasActivityAuthority, usesRealSync, sceneId: scene.id });
  syncSnapshotRef.current = { sceneIdx, interactionUnlocked, activityState, hasActivityAuthority, usesRealSync, sceneId: scene.id };
  useEffect(() => {
    if (!isSynced || !role || !roomId) return;
    const unsubscribeRequests = whiteboardService.subscribeToSceneStateRequest(roomId, (payload) => {
      if (payload.senderRole === role) return;
      const snap = syncSnapshotRef.current;
      if (role === 'teacher') {
        if (teacherPositionKnownRef.current) {
          void whiteboardService.sendSceneLessonNav(roomId, {
            unitNumber: unitNumber ?? 0,
            lessonNumber: lessonNumber ?? 0,
            sceneIdx: snap.sceneIdx,
            senderId: 'teacher',
          });
        }
        if (unlockKnownRef.current) {
          void whiteboardService.sendSceneInteractionPermission(roomId, { unlocked: snap.interactionUnlocked, senderId: 'teacher' });
        }
      }
      if (snap.usesRealSync && snap.hasActivityAuthority && snap.activityState != null) {
        // Sent a beat after the scene index, so a requester that first has
        // to move to this scene is already on it (receivers discard
        // snapshots for any other scene).
        const { activityState: state, sceneId } = snap;
        setTimeout(() => {
          void whiteboardService.sendSceneActivityState(roomId, { state, senderId: role, sceneId });
        }, 500);
      }
    });
    const request = () => { void whiteboardService.sendSceneStateRequest(roomId, { senderRole: role }); };
    request();
    let subscribed = true; // the initial request above covers the first SUBSCRIBED
    const unsubscribeStatus = whiteboardService.subscribeToStatus(roomId, (status) => {
      if (status === 'SUBSCRIBED') {
        if (!subscribed) request(); // reconnected after a drop
        subscribed = true;
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        subscribed = false;
      }
    });
    const onVisibility = () => { if (document.visibilityState === 'visible') request(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', request);
    return () => {
      unsubscribeRequests();
      unsubscribeStatus();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', request);
    };
  }, [isSynced, role, roomId, unitNumber, lessonNumber]);

  useEffect(() => {
    let cancelled = false;
    // Warm every voice line of this activity and the next one on BOTH
    // screens, so a line relayed from the other side plays straight away.
    const lines = SCENES.slice(sceneIdx, sceneIdx + 2).flatMap((sc) => collectSceneLines(sc, (w) => (VOICE_KEY as Record<string, Parameters<typeof prefetch>[1]>)[w] ?? (w === 'teacher' || w === 'narrator' ? w : null)));
    (async () => {
      for (const line of lines) {
        if (cancelled) return;
        try { await warmReadyClip(line.text, line.who); } catch { /* noop */ }
        await new Promise((r) => setTimeout(r, 30));
      }
    })();
    return () => { cancelled = true; stopSpeaking(); };
  }, [sceneIdx]);

  const gainHeart = useCallback(() => setHearts((h) => Math.min(MAX_HEARTS, h + 1)), []);
  const loseHeart = useCallback(() => {
    setHearts((h) => {
      const n = h - 1;
      if (n <= 0) { setTimeout(() => setHearts(MAX_HEARTS), 400); return 0; }
      return n;
    });
  }, []);
  const registerWin = useCallback((didGem: boolean) => { if (didGem) setGems((g) => g + 1); }, []);

  const studentCanAdvanceViaActivity = isSynced && role === 'student' && interactionUnlocked;
  const goNext = useCallback(() => {
    if (canNavigate) {
      stopSpeaking(); setSceneIdx((i) => Math.min(SCENES.length - 1, i + 1));
      return;
    }
    if (studentCanAdvanceViaActivity && roomId) {
      stopSpeaking(); setSceneIdx((i) => Math.min(SCENES.length - 1, i + 1));
      // If this goNext() is running as part of a click that was just
      // mirrored to the teacher (justMirroredTapRef), the teacher will
      // independently reach goNext() by replaying that same click — an
      // extra advance request here would double-advance the teacher while
      // this student only advances once. Only send it when goNext() was
      // reached some other way (no click to mirror it through).
      if (justMirroredTapRef.current) {
        justMirroredTapRef.current = false;
      } else {
        void whiteboardService.sendSceneAdvanceRequest(roomId, { senderId: 'student' });
      }
    }
  }, [SCENES.length, canNavigate, studentCanAdvanceViaActivity, roomId]);

  useEffect(() => {
    if (!isSynced || role !== 'teacher' || !roomId) return;
    const unsubscribe = whiteboardService.subscribeToSceneAdvanceRequest(roomId, () => { goNext(); });
    return unsubscribe;
  }, [isSynced, role, roomId, goNext]);
  const goBack = useCallback(() => {
    if (!canNavigate) return;
    stopSpeaking(); setSceneIdx((i) => Math.max(0, i - 1));
  }, [canNavigate]);
  const goToIndex = useCallback((idx: number) => {
    if (!canNavigate) return;
    stopSpeaking(); setSceneIdx(Math.max(0, Math.min(SCENES.length - 1, idx)));
  }, [SCENES.length, canNavigate]);
  const restart = useCallback(() => {
    if (!canNavigate) return;
    stopSpeaking();
    setSceneIdx(0); setHearts(MAX_HEARTS); setGems(0);
    window.sessionStorage.removeItem(sessionKey);
  }, [sessionKey, canNavigate]);

  useImperativeHandle(ref, () => ({ goNext, goBack, goToIndex, setInteractionUnlocked }), [goNext, goBack, goToIndex, setInteractionUnlocked]);

  useEffect(() => {
    onNavState?.({ sceneIdx, total: SCENES.length, canNavigate, interactionUnlocked });
  }, [sceneIdx, SCENES.length, canNavigate, interactionUnlocked, onNavState]);

  const totalGemsPossible = useMemo(() => SCENES.filter((s) => GEM_KINDS.has(s.kind)).length, [SCENES]);

  const isFinale = scene.kind === 'finale';

  useEffect(() => {
    if (isFinale && !finaleFiredRef.current) {
      finaleFiredRef.current = true;
      onFinaleReached?.();
    }
  }, [isFinale, onFinaleReached]);

  return (
    <>
      {!embedded && pageTitle && (
        <Helmet>
          <title>{pageTitle}</title>
          {pageDescription && <meta name="description" content={pageDescription} />}
        </Helmet>
      )}
      {skin === 'quest' && <style>{QUEST_SKIN_CSS}</style>}
      <div
      dir="ltr"
      onPointerDownCapture={unlockAudio}
      className={`relative w-full overflow-hidden transition-[background-image] duration-500 [container-type:size] ${embedded ? 'h-full' : 'min-h-screen'} ${skin === 'quest' ? 'ee-quest' : ''}`}
      style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
      {skin === 'quest' && <div className="ee-quest-frame pointer-events-none absolute inset-2 z-[5] rounded-[26px]" aria-hidden="true" />}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.35)_100%)]" />

      <div className={`relative z-10 mx-auto flex w-full flex-col px-0 pb-6 pt-4 ${embedded ? 'min-h-full' : 'min-h-screen'}`}>
        <div className="flex items-center justify-between px-4">
          {embedded ? (
            <div className="w-16" />
          ) : (
            <button
              onClick={() => { stopSpeaking(); navigate('/playground-library'); }}
              className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold text-orange-700 shadow-lg ring-1 ring-white/60 backdrop-blur"
            >
              ← Map
            </button>
          )}
          <div className="ee-quest-hud flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-lg font-black shadow-lg ring-1 ring-white/60 backdrop-blur">
            <Hearts count={hearts} />
            <span className="mx-1 text-orange-300">·</span>
            <span className="text-orange-700">💎 {gems}/{totalGemsPossible}</span>
          </div>
          <div className="w-16" />
        </div>

        <div key={scene.id} ref={sceneRootRef} className="relative flex-1 animate-[lep1-fade-slide_0.45s_ease-out]">
          <SceneCrashGuard
            sceneId={scene.id}
            sceneKind={scene.kind}
            side={!isSynced ? 'solo' : role === 'teacher' ? 'teacher' : 'student mirror'}
            canSkip={!isSynced || role === 'teacher'}
            onSkip={goNext}
          >
            {({ safeMode }) => (
              <SceneRenderer
                scene={scene}
                onWin={registerWin}
                onLose={loseHeart}
                onNext={goNext}
                onRestart={restart}
                gemsCollected={gems}
                heartsRemaining={hearts}
                // Safe mode: after repeated crashes, run this activity purely on
                // its own data — nothing the other screen sent can break it.
                activitySync={safeMode ? undefined : activitySync}
              />
            )}
          </SceneCrashGuard>
          {isSynced && role === 'student' && !interactionUnlocked && !studentDriven && (
            <div className="absolute inset-0 z-40 cursor-not-allowed" aria-hidden="true">
              <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur">
                ⏸ Your teacher paused this — watch for now
              </div>
            </div>
          )}
          {isSynced && role === 'teacher' && interactionUnlocked && !studentDriven && (
            <div className="pointer-events-none absolute left-1/2 top-3 z-40 -translate-x-1/2 rounded-full bg-emerald-600/80 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur">
              ✋ Student is trying this
            </div>
          )}
          {isSynced && role === 'teacher' && studentDriven && (
            <div className="pointer-events-none absolute left-1/2 top-3 z-40 -translate-x-1/2 rounded-full bg-sky-600/85 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur">
              🧑‍🎓 Student is doing this on their own — you're watching live
            </div>
          )}
        </div>

        {!isFinale && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 px-4">
            {SCENES.map((s, i) => (
              <span key={s.id} className={`ee-dot h-2 rounded-full transition-all ${i === sceneIdx ? 'w-8 bg-white shadow-lg ee-dot-on' : i < sceneIdx ? 'w-2 bg-white/80 ee-dot-done' : 'w-2 bg-white/30'}`} />
            ))}
          </div>
        )}
      </div>

      {!hideInternalNav && (canNavigate ? (
        <div className={`pointer-events-none inset-x-0 bottom-4 z-[80] flex items-center justify-between px-4 ${embedded ? 'absolute' : 'fixed'}`}>
          <button type="button" onClick={goBack} disabled={sceneIdx === 0} aria-label="Previous scene"
            className="ee-back pointer-events-auto flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-base font-bold text-slate-800 shadow-xl backdrop-blur transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100">
            <span aria-hidden>◀</span> Back
          </button>
          <div className="pointer-events-auto flex items-center gap-2">
            {isSynced && (
              <button type="button" onClick={() => setInteractionUnlocked(!interactionUnlocked)}
                className={`rounded-full px-4 py-3 text-sm font-bold shadow-xl backdrop-blur transition hover:scale-105 ${interactionUnlocked ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-800'}`}>
                {interactionUnlocked ? '⏸ Pause student' : '▶ Resume student'}
              </button>
            )}
            <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-800 shadow-xl backdrop-blur tabular-nums">{sceneIdx + 1} / {SCENES.length}</div>
          </div>
          <button type="button" onClick={goNext} disabled={sceneIdx >= SCENES.length - 1} aria-label="Next scene"
            className="ee-next pointer-events-auto flex items-center gap-2 rounded-full bg-[#FE6A2F] px-5 py-3 text-base font-bold text-white shadow-xl backdrop-blur transition hover:scale-105 hover:bg-[#ff7a45] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100">
            Next <span aria-hidden>▶</span>
          </button>
        </div>
      ) : (
        <div className={`pointer-events-none inset-x-0 bottom-4 z-[80] flex items-center justify-center px-4 ${embedded ? 'absolute' : 'fixed'}`}>
          <div className="pointer-events-none flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-800 shadow-xl backdrop-blur tabular-nums">
            {interactionUnlocked ? (
              <><span aria-hidden>✋</span> Your turn! Try the activity</>
            ) : (
              <><span aria-hidden>👩‍🏫</span> Your teacher is guiding this lesson · {sceneIdx + 1} / {SCENES.length}</>
            )}
          </div>
        </div>
      ))}

      <Lep1Keyframes />
      </div>
    </>
  );
});

export default PlayWelcomeTownLesson;

/* Homework Quest skin for the lesson player (opt-in per lesson via
 * `skin: 'quest'`, e.g. Magic Castle Lesson 2). Restyles the shared chrome —
 * gold-framed stage, parchment pills and instruction cards in dark ink,
 * Grandstander/Lexend type, gold progress dots, quest buttons — while every
 * scene's game, pointer arrows and behaviour stay exactly as they are.
 * Scene banners are matched by their shared Tailwind classes, so new scenes
 * pick the skin up without extra wiring. */
const QUEST_SKIN_CSS = `
.ee-quest { font-family: "Lexend", "Fredoka", system-ui, sans-serif; }
.ee-quest h1, .ee-quest h2, .ee-quest [class*="font-black"] { font-family: "Grandstander", "Fredoka", system-ui, sans-serif; }
.ee-quest-frame { border: 4px solid #f5c542; box-shadow: inset 0 0 0 2px rgba(255,255,255,.35), 0 0 0 9999px rgba(20,8,50,.0), inset 0 0 60px rgba(124,58,237,.25); }
.ee-quest [class*="bg-white/85"], .ee-quest [class*="bg-white/90"], .ee-quest [class*="bg-white/95"] { background-color: #fff6df !important; }
.ee-quest [class*="bg-white/85"], .ee-quest [class*="bg-white/90"], .ee-quest [class*="bg-white/95"],
.ee-quest [class*="bg-white/85"] *, .ee-quest [class*="bg-white/90"] *, .ee-quest [class*="bg-white/95"] * { color: #2a1459; }
.ee-quest [class*="ring-orange-2"], .ee-quest [class*="ring-white/6"] { --tw-ring-color: rgba(245,197,66,.85) !important; }
.ee-quest [class*="bg-white/85"], .ee-quest [class*="bg-white/90"], .ee-quest [class*="bg-white/95"] { box-shadow: 0 6px 0 rgba(0,0,0,.22), 0 12px 24px rgba(0,0,0,.25) !important; }
.ee-quest .ee-quest-hud { background: #fff6df !important; border: 2px solid #f5c542; }
.ee-quest .ee-dot { background: rgba(255,255,255,.28); }
.ee-quest .ee-dot-done { background: rgba(245,197,66,.75) !important; }
.ee-quest .ee-dot-on { background: #f5c542 !important; box-shadow: 0 0 10px #f5c542 !important; }
.ee-quest .ee-next { background: #fe6a2f !important; box-shadow: 0 6px 0 #b8410f !important; border-radius: 999px; }
.ee-quest .ee-back { background: #fff6df !important; color: #2a1459 !important; border: 2px solid #f5c542; box-shadow: 0 6px 0 rgba(0,0,0,.2) !important; }
`;


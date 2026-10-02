import { useSceneScopedState } from '@/content/playground-library/sceneActivitySync';
import { SceneCrashGuard } from '@/content/playground-library/SceneCrashGuard';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { Scene } from '@/content/playground-library/unit1/scenes';
import { SceneRenderer, Hearts, MAX_HEARTS, Lep1Keyframes } from '@/content/playground-library/unit1/SceneRenderer';
import { stopSpeaking, unlockAudio, setSpeechRelay, setSpeechDedupe, playRelayedSpeech, setSpeechRelayLead, collectSceneLines, warmReadyClip } from '@/content/playground-library/unit1/audio';
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

/** Scene kinds where the student can always try the activity directly —
 *  hands-on drag/match/trace/guess games work better as free play than as a
 *  teacher-demo-first flow. Everything else (meet-and-greet, narrative
 *  sequences, timed arcade games, etc.) keeps the default locked/watch-only
 *  behavior, teacher-granted per activity via setInteractionUnlocked. */
const ALWAYS_UNLOCKED_SCENE_KINDS = new Set([
  'trace', 'basket', 'sound-sort', 'color-sort', 'memory', 'puzzle', 'word-build', 'hello-doors',
]);

/** Scene kinds moved onto real synced state (see sceneActivitySync.ts)
 *  instead of the generic scene_tap DOM-click-mirror above. Deliberately
 *  EXCLUDES every kind in ALWAYS_UNLOCKED_SCENE_KINDS — those are genuinely
 *  bidirectional (both teacher and student can drive at once), which the
 *  mirror's dual-capture model supports and a single-authority snapshot
 *  channel fundamentally can't represent (both sides would stomp on each
 *  other's state). Also excludes title-card/cinematic/finale (no branching
 *  state) and song (audio-clock-driven, not tap-driven). */
const REAL_SYNC_KINDS = new Set<string>([
  'meet', 'sound-model', 'echo', 'video-check', 'sentence-build', 'who-said-it',
  'listen-repeat-cards', 'roleplay', 'join-stage', 'alphabet-blocks',
  'trophy-chest', 'color-model', 'color-quiz', 'color-spot', 'shape-model', 'toy-model',
  'train-recall', 'color-spy', 'color-simon', 'flipbook',
  'name-gate', 'meet-group', 'friend-pop', 'feelings-tap', 'feelings-wheel',
  'x-is-feeling', 'he-she-model', 'feelings-dice', 'he-she-say', 'i-am-feeling',
  'feeling-quiz', 'feelings-bingo',
  'numbers-learn', 'numbers-review', 'candle-cake', 'count-balloons',
  'age-balloons', 'meet-greet', 'age-quiz', 'spin-wheel', 'picture-match',
  'first-sound', 'letter-match', 'letter-blocks',
  'gather', 'voice-stage',
]);

export interface PlayUnitLessonHandle {
  goNext: () => void;
  goBack: () => void;
  goToIndex: (idx: number) => void;
  /** Teacher-only: grant/revoke the student's ability to tap their own copy
   *  of the current activity directly, instead of just mirroring the
   *  teacher's taps. */
  setInteractionUnlocked: (unlocked: boolean) => void;
}

interface PlayUnitLessonProps {
  scenes: Scene[];
  sessionKey: string;
  embedded?: boolean;
  /** Sets document.title/meta description for this lesson. Ignored when embedded. */
  pageTitle?: string;
  pageDescription?: string;
  /** Only needed by callers that also pass onFinaleReached — lets the
   *  caller identify which lesson just finished. */
  unitNumber?: number;
  lessonNumber?: number;
  /** Fired once when the finale scene is reached. */
  onFinaleReached?: () => void;
  /** Live-classroom leader/follower control: when both `role` and `roomId`
   *  are provided, only the teacher can move scenes forward/back — the
   *  student's view follows the teacher's broadcast and can only interact
   *  with the activity itself. Omitted entirely for solo/self-paced play
   *  (the dashboard launcher), where navigation stays fully local. */
  role?: 'teacher' | 'student';
  roomId?: string;
  /** Whether the student may play the active scene's game (default locked/watch-only). Ignored for teacher/solo play. */
  activityUnlocked?: boolean;
  /** When true, the internal Back/Next/counter bar is not rendered — the
   *  caller renders its own nav bar outside this component's frame instead,
   *  driven by onNavState + the exposed goNext/goBack ref handle. */
  hideInternalNav?: boolean;
  /** Reports scene position/navigability whenever it changes, so a caller
   *  rendering hideInternalNav can show an external nav bar in sync. */
  onNavState?: (state: { sceneIdx: number; total: number; canNavigate: boolean; interactionUnlocked: boolean; lockToggleApplicable: boolean }) => void;
  /** Last scene index persisted to the classroom session DB row, if any —
   *  a reliable (if slightly delayed) catch-up path for a student who
   *  joins late or reconnects and missed the instant broadcast. */
  persistedSceneIdx?: number | null;
  /** Teacher-only: called whenever the scene index changes, so the caller
   *  can persist it (in addition to the instant broadcast this component
   *  already sends) for that catch-up path. */
  onSceneIdxPersist?: (idx: number) => void;
  /** Last interaction-unlock state persisted to the classroom session DB row, if any — recovers a refreshed/reconnecting tab instead of resetting to locked. */
  persistedInteractionUnlocked?: boolean | null;
  /** Teacher-only: called whenever the interaction-unlock gate changes, so the caller can persist it (in addition to the instant broadcast this component already sends) for that catch-up path. */
  onInteractionUnlockedPersist?: (unlocked: boolean) => void;
}

const PlayUnitLesson = forwardRef<PlayUnitLessonHandle, PlayUnitLessonProps>(function PlayUnitLesson(
  { scenes, sessionKey, embedded = false, pageTitle, pageDescription, onFinaleReached, unitNumber, lessonNumber, role, roomId, activityUnlocked, hideInternalNav = false, onNavState, persistedSceneIdx, onSceneIdxPersist, persistedInteractionUnlocked, onInteractionUnlockedPersist },
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

  const isSynced = role != null && !!roomId;
  const canNavigate = !isSynced || role === 'teacher';

  // Whoever currently "has the floor" on the current activity: the teacher
  // by default, or the student once granted interactionUnlocked. Exactly one
  // side captures+broadcasts taps at a time; the other replays them onto its
  // own identical scene — see scenePathSync.ts for why this needs no
  // per-scene-kind code, and SceneTapPayload for why it never touches
  // page-level navigation (that stays on the sceneIdx broadcast above).
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

  // Hands-on activities (drag/match/trace/guess) skip the teacher-grant step
  // entirely — the student can always try them, live-mirrored both ways.
  const skipsLock = ALWAYS_UNLOCKED_SCENE_KINDS.has(SCENES[sceneIdx]?.kind as string);
  const effectiveUnlocked = interactionUnlocked || skipsLock;

  const setInteractionUnlocked = useCallback((next: boolean) => {
    unlockKnownRef.current = true;
    teacherChangedUnlockRef.current = true;
    setInteractionUnlockedState(next);
    if (isSynced && role === 'teacher' && roomId) {
      void whiteboardService.sendSceneInteractionPermission(roomId, { unlocked: next, senderId: 'teacher' });
    }
  }, [isSynced, role, roomId]);

  // Each new activity starts locked — the teacher re-grants per activity
  // rather than an unlock silently carrying over to unrelated content.
  // Only on a real scene change — never on mount. Running on mount made
  // every teacher reload (including Force Refresh) re-lock the student's
  // activity and persist that as the class state, so a student who was
  // mid-activity came back locked out.
  const prevSceneIdxRef = useRef(sceneIdx);
  useEffect(() => {
    if (prevSceneIdxRef.current === sceneIdx) return;
    prevSceneIdxRef.current = sceneIdx;
    if (isSynced && role === 'teacher') setInteractionUnlocked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIdx]);

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

  // Whichever side currently "has the floor" for a REAL_SYNC_KINDS activity
  // — the teacher by default, or the student once unlocked. Must be
  // mutually exclusive (unlike iCaptureTaps below, which the bidirectional
  // DOM-mirror is fine having true on both sides for skipsLock kinds): a
  // single-authority state channel needs exactly one side driving at a
  // time, or both would independently compute and broadcast conflicting
  // snapshots.
  const usesRealSync = REAL_SYNC_KINDS.has(SCENES[sceneIdx]?.kind as string);
  // `studentOnly` scenes (self-check / auto-evaluation slides) give the
  // student the floor outright: no teacher unlock needed, and the teacher's
  // copy is a live, non-interactive view of the student's work.
  const studentDriven = isSynced && (SCENES[sceneIdx] as { studentOnly?: boolean } | undefined)?.studentOnly === true;
  const hasActivityAuthority = !isSynced
    ? true
    : studentDriven
      ? role === 'student'
      : role === 'student'
        ? interactionUnlocked
        : !interactionUnlocked;

  // Scene-tagged: the render right after a scene change must never see the previous scene's state.
  const [activityState, setActivityStateLocal] = useSceneScopedState((SCENES[sceneIdx] ?? SCENES[0])?.id ?? '');

  // A new scene starts with no activity state on both sides — each side
  // resets independently in lockstep as soon as its own (already-synced)
  // sceneIdx changes, so this needs no broadcast of its own.

  const currentSceneId = (SCENES[sceneIdx] ?? SCENES[0])?.id ?? '';

  const setActivityState = useCallback((next: unknown) => {
    setActivityStateLocal(next);
    if (isSynced && hasActivityAuthority && roomId && role) {
      void whiteboardService.sendSceneActivityState(roomId, { state: next, senderId: role, sceneId: currentSceneId });
    }
  }, [isSynced, hasActivityAuthority, roomId, role, currentSceneId]);

  useEffect(() => {
    if (!isSynced || hasActivityAuthority || !roomId) return;
    const unsubscribe = whiteboardService.subscribeToSceneActivityState(roomId, (payload) => {
      // Discard snapshots for any scene other than the one currently on
      // screen — a broadcast sent right as the sender navigates away can
      // otherwise arrive while this side is still on (or has already
      // moved to) a different scene, handing that scene's useSyncedState a
      // wrong-shaped object it then crashes reading a field off of.
      if (payload.sceneId !== currentSceneId) return;
      setActivityStateLocal(payload.state);
    });
    return unsubscribe;
  }, [isSynced, hasActivityAuthority, roomId, currentSceneId]);

  // Voices in synced activities: only the driving side runs the scene
  // logic that speaks, so relay each line to the other screen so the
  // student (or the teacher, when the student drives) hears it too.
  useEffect(() => {
    if (!isSynced || !roomId || !role || !usesRealSync) return;
    const sceneId = currentSceneId;
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
  }, [isSynced, roomId, role, usesRealSync, hasActivityAuthority, currentSceneId]);

  const activitySync = usesRealSync
    ? { isSynced, isAuthority: hasActivityAuthority, state: activityState, setState: setActivityState }
    : undefined;

  // skipsLock activities are bidirectional for both roles at once — safe
  // from feedback loops because isApplyingRemoteTapRef (below) stops a
  // replayed synthetic event from being re-captured and re-broadcast.
  //
  // Bug fixed here: this previously read `role === 'teacher'` unconditionally
  // (no `&& !interactionUnlocked` guard), so once a teacher granted the
  // student control both sides captured+broadcast their own taps at once —
  // violating the "exactly one side captures at a time" invariant this
  // comment describes. The teacher's stray broadcasts still got replayed on
  // the student's side (replay is unconditional now — see the subscription
  // effect below), but it doubled real traffic on the tap channel during
  // every unlocked activity and made this file's own driver/follower model
  // a lie.
  const iCaptureTaps = isSynced && !!role && !usesRealSync && (skipsLock || (role === 'teacher' && !interactionUnlocked) || (role === 'student' && interactionUnlocked));

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

    // Drag gestures (basket/sort/word-build/etc.): track each active
    // pointer's down-position and target path, and broadcast pixel deltas
    // from that down position — not absolute coordinates — so the follower
    // can reproduce the same relative motion on its own (possibly
    // differently sized/positioned) copy of the element. Move broadcasts
    // are throttled; down/up always send immediately.
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

  // Deliberately NOT gated on interactionUnlocked/skipsLock (there used to
  // be an `iReplayTaps` guard mirroring iCaptureTaps' role/unlock check) --
  // that gate raced against the async round-trip for the teacher's
  // per-scene "reset to locked": setInteractionUnlocked updates the
  // teacher's own state synchronously, but the follower only learns the new
  // value after a real DB write + realtime round-trip. If the driver
  // (whichever side currently captures) acted before that round-trip
  // landed, the other side's still-stale local `interactionUnlocked` copy
  // made this effect skip subscribing entirely, silently dropping the tap
  // for good (a broadcast channel has no replay buffer) -- reported live as
  // "teacher clicks the vocabulary, nothing happens on the student's side."
  // whiteboardService's channel is already `broadcast: { self: false } }`,
  // so every scene_tap this side ever receives is guaranteed to be from the
  // OTHER party already -- no local unlock guess is needed to decide
  // whether to trust and replay it.
  useEffect(() => {
    if (!isSynced || !role || !roomId) return;
    // Follower's own synthetic down-position per active gesture — an
    // anchor point on ITS OWN element (its center), since absolute screen
    // coordinates from the driver's device don't mean anything here; only
    // the broadcasted dx/dy deltas need to reproduce faithfully.
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

  // Teacher → student: broadcast the authoritative scene index so the
  // student's view always mirrors whatever the teacher is showing, and
  // persist it so a late-joining/reconnecting student can catch up even if
  // they missed the (non-replayable) broadcast.
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

  // Student: follow the teacher's broadcast — never drives its own index.
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

  // Student catch-up: apply the DB-persisted scene index whenever it
  // changes (a reliable, replicated fallback for whenever the instant
  // broadcast above was missed — e.g. joining mid-lesson, reconnecting).
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
  const syncSnapshotRef = useRef({ sceneIdx, interactionUnlocked, activityState, hasActivityAuthority, usesRealSync, sceneId: currentSceneId });
  syncSnapshotRef.current = { sceneIdx, interactionUnlocked, activityState, hasActivityAuthority, usesRealSync, sceneId: currentSceneId };
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
    const lines = SCENES.slice(sceneIdx, sceneIdx + 2).flatMap((sc) => collectSceneLines(sc));
    (async () => {
      for (const line of lines) {
        if (cancelled) return;
        try { await warmReadyClip(line.text, line.who); } catch { /* noop */ }
        await new Promise((r) => setTimeout(r, 30));
      }
    })();
    return () => { cancelled = true; stopSpeaking(); };
  }, [sceneIdx]);

  const scene = SCENES[sceneIdx] ?? SCENES[0];

  const gainHeart = useCallback(() => setHearts((h) => Math.min(MAX_HEARTS, h + 1)), []);
  const loseHeart = useCallback(() => {
    setHearts((h) => {
      const n = h - 1;
      if (n <= 0) { setTimeout(() => setHearts(MAX_HEARTS), 400); return 0; }
      return n;
    });
  }, []);
  const registerWin = useCallback((didGem: boolean) => { if (didGem) setGems((g) => g + 1); }, []);

  // An unlocked student completing the activity (e.g. a flipbook's own
  // "Next" reaching the end) can't just move its own sceneIdx — the teacher
  // stays the single source of truth. Advance locally right away so it
  // doesn't feel stuck, and ask the teacher to advance too; the teacher's
  // own goNext() then re-broadcasts via the existing sceneIdx pipe, which
  // reaches this same student again as an idempotent confirmation.
  const studentCanAdvanceViaActivity = isSynced && role === 'student' && effectiveUnlocked;
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

  // Teacher: a permitted student finishing the activity asks us to advance —
  // do so through the normal goNext() so it re-broadcasts as usual.
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
    onNavState?.({ sceneIdx, total: SCENES.length, canNavigate, interactionUnlocked: effectiveUnlocked, lockToggleApplicable: !skipsLock });
  }, [sceneIdx, SCENES.length, canNavigate, effectiveUnlocked, skipsLock, onNavState]);

  // Every scene kind's own renderer either receives `onWin` and calls it
  // exactly once on completion (real gem opportunity), or doesn't receive
  // it at all (pure narrative/display, no completion condition). The old
  // version of this list hand-enumerated ~13 "counts" kinds and silently
  // fell out of sync as new kinds were added over time (confirmed: dash,
  // memory, puzzle, trace, word-build, shape-model, shape-sort, song, and
  // ~30 others all DO call onWin but were never counted here) — students
  // were shown a gem count that undercounted what they could actually
  // earn (e.g. "9/6"). An exclude-list of the few kinds that genuinely
  // have no onWin prop at all is much shorter and can't drift the same
  // way: a newly added kind defaults to counting unless explicitly opted
  // out here, the opposite of the old always-opt-in list.
  const NON_GEM_KINDS = useMemo(
    () => new Set<Scene['kind']>(['title-card', 'cinematic', 'finale', 'sound-model', 'video-story', 'feelings', 'feelings-tap', 'numbers-learn']),
    [],
  );
  const totalGemsPossible = useMemo(
    () => SCENES.filter((s) => !NON_GEM_KINDS.has(s.kind)).length,
    [SCENES, NON_GEM_KINDS],
  );

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
      <div
      dir="ltr"
      onPointerDownCapture={unlockAudio}
      className={`relative w-full overflow-hidden transition-[background-image] duration-500 [container-type:size] ${embedded ? 'h-full' : 'min-h-screen'}`}
      style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
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
          <div className="flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-lg font-black shadow-lg ring-1 ring-white/60 backdrop-blur">
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
                lessonNumber={lessonNumber}
                role={role}
                roomId={roomId}
                activityUnlocked={activityUnlocked}
                // Safe mode: after repeated crashes, run this activity purely on
                // its own data — nothing the other screen sent can break it.
                activitySync={safeMode ? undefined : activitySync}
              />
            )}
          </SceneCrashGuard>
          {isSynced && role === 'student' && !effectiveUnlocked && !studentDriven && (
            <div className="absolute inset-0 z-40 cursor-not-allowed" aria-hidden="true">
              <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur">
                👀 Watching your teacher
              </div>
            </div>
          )}
          {isSynced && role === 'teacher' && interactionUnlocked && !skipsLock && !studentDriven && (
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

        {!isFinale && scene.kind !== 'who-said-it' && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 px-4">
            {SCENES.map((s, i) => (
              <span key={s.id} className={`h-2 rounded-full transition-all ${i === sceneIdx ? 'w-8 bg-white shadow-lg' : i < sceneIdx ? 'w-2 bg-white/80' : 'w-2 bg-white/30'}`} />
            ))}
          </div>
        )}
      </div>

      {!hideInternalNav && (canNavigate ? (
        <div className={`pointer-events-none inset-x-0 bottom-4 z-[80] flex items-center justify-between px-4 ${embedded ? 'absolute' : 'fixed'}`}>
          <button type="button" onClick={goBack} disabled={sceneIdx === 0} aria-label="Previous scene"
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-base font-bold text-slate-800 shadow-xl backdrop-blur transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100">
            <span aria-hidden>◀</span> Back
          </button>
          <div className="pointer-events-auto flex items-center gap-2">
            {isSynced && !skipsLock && (
              <button type="button" onClick={() => setInteractionUnlocked(!interactionUnlocked)}
                className={`rounded-full px-4 py-3 text-sm font-bold shadow-xl backdrop-blur transition hover:scale-105 ${interactionUnlocked ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-800'}`}>
                {interactionUnlocked ? '🔓 Student can try' : '🔒 Let student try'}
              </button>
            )}
            <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-800 shadow-xl backdrop-blur tabular-nums">{sceneIdx + 1} / {SCENES.length}</div>
          </div>
          <button type="button" onClick={goNext} disabled={sceneIdx >= SCENES.length - 1} aria-label="Next scene"
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#FE6A2F] px-5 py-3 text-base font-bold text-white shadow-xl backdrop-blur transition hover:scale-105 hover:bg-[#ff7a45] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100">
            Next <span aria-hidden>▶</span>
          </button>
        </div>
      ) : (
        <div className={`pointer-events-none inset-x-0 bottom-4 z-[80] flex items-center justify-center px-4 ${embedded ? 'absolute' : 'fixed'}`}>
          <div className="pointer-events-none flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-800 shadow-xl backdrop-blur tabular-nums">
            {effectiveUnlocked ? (
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

export default PlayUnitLesson;

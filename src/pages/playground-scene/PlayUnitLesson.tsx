import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { Scene } from '@/content/playground-library/unit1/scenes';
import { SceneRenderer, Hearts, MAX_HEARTS, Lep1Keyframes } from '@/content/playground-library/unit1/SceneRenderer';
import { stopSpeaking, prefetch, unlockAudio } from '@/content/playground-library/unit1/audio';
import { whiteboardService } from '@/services/whiteboardService';
import { getDomPath, getElementAtPath } from '@/content/playground-library/unit1/scenePathSync';

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
  /** When true, the internal Back/Next/counter bar is not rendered — the
   *  caller renders its own nav bar outside this component's frame instead,
   *  driven by onNavState + the exposed goNext/goBack ref handle. */
  hideInternalNav?: boolean;
  /** Reports scene position/navigability whenever it changes, so a caller
   *  rendering hideInternalNav can show an external nav bar in sync. */
  onNavState?: (state: { sceneIdx: number; total: number; canNavigate: boolean; interactionUnlocked: boolean }) => void;
  /** Last scene index persisted to the classroom session DB row, if any —
   *  a reliable (if slightly delayed) catch-up path for a student who
   *  joins late or reconnects and missed the instant broadcast. */
  persistedSceneIdx?: number | null;
  /** Teacher-only: called whenever the scene index changes, so the caller
   *  can persist it (in addition to the instant broadcast this component
   *  already sends) for that catch-up path. */
  onSceneIdxPersist?: (idx: number) => void;
}

const PlayUnitLesson = forwardRef<PlayUnitLessonHandle, PlayUnitLessonProps>(function PlayUnitLesson(
  { scenes, sessionKey, embedded = false, pageTitle, pageDescription, onFinaleReached, unitNumber, lessonNumber, role, roomId, hideInternalNav = false, onNavState, persistedSceneIdx, onSceneIdxPersist },
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

  const setInteractionUnlocked = useCallback((next: boolean) => {
    setInteractionUnlockedState(next);
    if (isSynced && role === 'teacher' && roomId) {
      void whiteboardService.sendSceneInteractionPermission(roomId, { unlocked: next, senderId: 'teacher' });
    }
  }, [isSynced, role, roomId]);

  // Each new activity starts locked — the teacher re-grants per activity
  // rather than an unlock silently carrying over to unrelated content.
  useEffect(() => {
    if (isSynced && role === 'teacher') setInteractionUnlocked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIdx]);

  useEffect(() => {
    if (!isSynced || role !== 'student' || !roomId) return;
    const unsubscribe = whiteboardService.subscribeToSceneInteractionPermission(roomId, (payload) => {
      setInteractionUnlockedState(payload.unlocked);
    });
    return unsubscribe;
  }, [isSynced, role, roomId]);

  const iCaptureTaps = isSynced && !!role && (role === 'teacher' || (role === 'student' && interactionUnlocked));
  const iReplayTaps = isSynced && !!role && (
    (role === 'teacher' && interactionUnlocked) || (role === 'student' && !interactionUnlocked)
  );

  useEffect(() => {
    if (!iCaptureTaps || !roomId || !role) return;
    const rootEl = sceneRootRef.current;
    if (!rootEl) return;
    const handler = (e: MouseEvent) => {
      if (isApplyingRemoteTapRef.current) return;
      const target = e.target as Element | null;
      if (!target) return;
      const path = getDomPath(rootEl, target);
      if (!path) return;
      void whiteboardService.sendSceneTap(roomId, { path, senderRole: role, senderId: role });
    };
    rootEl.addEventListener('click', handler, true);
    return () => rootEl.removeEventListener('click', handler, true);
  }, [iCaptureTaps, roomId, role, sceneIdx]);

  useEffect(() => {
    if (!iReplayTaps || !roomId) return;
    const unsubscribe = whiteboardService.subscribeToSceneTap(roomId, (payload) => {
      const rootEl = sceneRootRef.current;
      if (!rootEl) return;
      const el = getElementAtPath(rootEl, payload.path);
      if (!el) return;
      isApplyingRemoteTapRef.current = true;
      try { el.click(); } finally { isApplyingRemoteTapRef.current = false; }
    });
    return unsubscribe;
  }, [iReplayTaps, roomId]);

  useEffect(() => { window.sessionStorage.setItem(sessionKey, String(sceneIdx)); }, [sceneIdx, sessionKey]);

  // Teacher → student: broadcast the authoritative scene index so the
  // student's view always mirrors whatever the teacher is showing, and
  // persist it so a late-joining/reconnecting student can catch up even if
  // they missed the (non-replayable) broadcast.
  useEffect(() => {
    if (!isSynced || role !== 'teacher' || !roomId) return;
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
    setSceneIdx(Math.max(0, Math.min(SCENES.length - 1, persistedSceneIdx)));
  }, [isSynced, role, persistedSceneIdx, SCENES.length]);

  useEffect(() => {
    let cancelled = false;
    const upcoming = SCENES.slice(sceneIdx, sceneIdx + 2);
    const lines: { text: string; who: any }[] = [];
    for (const s of upcoming) {
      if (s.kind === 'meet') lines.push({ text: s.line, who: s.who });
      if (s.kind === 'echo') lines.push({ text: s.hearWord ?? s.word, who: s.who });
      if (s.kind === 'sound-model') s.anchors.forEach((a) => lines.push({ text: a.word, who: s.who }));
      if (s.kind === 'who-said-it') s.rounds.forEach((r) => lines.push({ text: r.line, who: r.who }));
      if (s.kind === 'finale') lines.push({ text: s.line, who: s.who });
    }
    (async () => {
      for (const line of lines.slice(0, 3)) {
        if (cancelled) return;
        try { await prefetch(line.text, line.who); } catch { /* noop */ }
        await new Promise((r) => setTimeout(r, 180));
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
  const studentCanAdvanceViaActivity = isSynced && role === 'student' && interactionUnlocked;
  const goNext = useCallback(() => {
    if (canNavigate) {
      stopSpeaking(); setSceneIdx((i) => Math.min(SCENES.length - 1, i + 1));
      return;
    }
    if (studentCanAdvanceViaActivity && roomId) {
      stopSpeaking(); setSceneIdx((i) => Math.min(SCENES.length - 1, i + 1));
      void whiteboardService.sendSceneAdvanceRequest(roomId, { senderId: 'student' });
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
    onNavState?.({ sceneIdx, total: SCENES.length, canNavigate, interactionUnlocked });
  }, [sceneIdx, SCENES.length, canNavigate, interactionUnlocked, onNavState]);

  const totalGemsPossible = useMemo(
    () => SCENES.filter((s) => s.kind === 'basket' || s.kind === 'who-said-it' || s.kind === 'name-gate' || s.kind === 'voice-stage' || s.kind === 'roleplay' || s.kind === 'join-stage' || s.kind === 'sound-pop' || s.kind === 'flipbook' || s.kind === 'color-model' || s.kind === 'color-sort' || s.kind === 'color-quiz' || s.kind === 'listen-repeat-cards' || (s.kind === 'meet' && s.repeat)).length,
    [SCENES],
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
          <SceneRenderer
            scene={scene}
            onWin={registerWin}
            onLose={loseHeart}
            onNext={goNext}
            onRestart={restart}
            gemsCollected={gems}
            heartsRemaining={hearts}
            lessonNumber={lessonNumber}
          />
          {isSynced && role === 'student' && !interactionUnlocked && (
            <div className="absolute inset-0 z-40 cursor-not-allowed" aria-hidden="true">
              <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur">
                👀 Watching your teacher
              </div>
            </div>
          )}
          {isSynced && role === 'teacher' && interactionUnlocked && (
            <div className="pointer-events-none absolute left-1/2 top-3 z-40 -translate-x-1/2 rounded-full bg-emerald-600/80 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur">
              ✋ Student is trying this
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
            {isSynced && (
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
            <span aria-hidden>👩‍🏫</span> Your teacher is guiding this lesson · {sceneIdx + 1} / {SCENES.length}
          </div>
        </div>
      ))}

      <Lep1Keyframes />
      </div>
    </>
  );
});

export default PlayUnitLesson;

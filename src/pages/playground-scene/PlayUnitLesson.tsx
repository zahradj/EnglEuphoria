import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { Scene } from '@/content/playground-library/unit1/scenes';
import { SceneRenderer, Hearts, MAX_HEARTS, Lep1Keyframes } from '@/content/playground-library/unit1/SceneRenderer';
import { stopSpeaking, prefetch, unlockAudio } from '@/content/playground-library/unit1/audio';
import { whiteboardService } from '@/services/whiteboardService';

export interface PlayUnitLessonHandle {
  goNext: () => void;
  goBack: () => void;
  goToIndex: (idx: number) => void;
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
  onNavState?: (state: { sceneIdx: number; total: number; canNavigate: boolean }) => void;
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

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    stopSpeaking(); setSceneIdx((i) => Math.min(SCENES.length - 1, i + 1));
  }, [SCENES.length, canNavigate]);
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

  useImperativeHandle(ref, () => ({ goNext, goBack, goToIndex }), [goNext, goBack, goToIndex]);

  useEffect(() => {
    onNavState?.({ sceneIdx, total: SCENES.length, canNavigate });
  }, [sceneIdx, SCENES.length, canNavigate, onNavState]);

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

        <div key={scene.id} className="relative flex-1 animate-[lep1-fade-slide_0.45s_ease-out]">
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
          <div className="pointer-events-auto rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-800 shadow-xl backdrop-blur tabular-nums">{sceneIdx + 1} / {SCENES.length}</div>
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

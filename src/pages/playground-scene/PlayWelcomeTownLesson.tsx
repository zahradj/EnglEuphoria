import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { Scene } from '@/content/playground-library/welcome-town/scenes';
import { VOICE_KEY } from '@/content/playground-library/welcome-town/scenes';
import { SceneRenderer, Hearts, MAX_HEARTS, Lep1Keyframes } from '@/content/playground-library/welcome-town/SceneRenderer';
import { stopSpeaking, prefetch, unlockAudio } from '@/content/playground-library/unit1/audio';
import { whiteboardService } from '@/services/whiteboardService';
import { getDomPath, getElementAtPath, withPointerCaptureNoop } from '@/content/playground-library/unit1/scenePathSync';

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
}

/** Gem-eligible scene kinds — every activity kind that ever calls onWin(true)
 *  exactly once when completed. Kept in sync manually with SceneRenderer.tsx
 *  (title-card/cinematic never award a gem; finale is the end screen). */
const GEM_KINDS = new Set<Scene['kind']>(['meet', 'echo', 'memory', 'vocab-spot', 'drag-match', 'choice', 'roleplay', 'join-stage', 'hello-doors', 'flipbook', 'song', 'trace', 'word-build', 'letter-game', 'jigsaw-puzzle']);

const PlayWelcomeTownLesson = forwardRef<PlayWelcomeTownLessonHandle, PlayWelcomeTownLessonProps>(function PlayWelcomeTownLesson(
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

  const [interactionUnlocked, setInteractionUnlockedState] = useState(false);
  const sceneRootRef = useRef<HTMLDivElement>(null);
  const isApplyingRemoteTapRef = useRef(false);

  const setInteractionUnlocked = useCallback((next: boolean) => {
    setInteractionUnlockedState(next);
    if (isSynced && role === 'teacher' && roomId) {
      void whiteboardService.sendSceneInteractionPermission(roomId, { unlocked: next, senderId: 'teacher' });
    }
  }, [isSynced, role, roomId]);

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

    const clickHandler = (e: MouseEvent) => {
      if (isApplyingRemoteTapRef.current) return;
      const target = e.target as Element | null;
      if (!target) return;
      const path = getDomPath(rootEl, target);
      if (!path) return;
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
        path: drag.path, kind: 'pointermove', dx: e.clientX - drag.downX, dy: e.clientY - drag.downY,
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
        dx: e.clientX - drag.downX, dy: e.clientY - drag.downY,
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

  useEffect(() => {
    if (!iReplayTaps || !roomId) return;
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
        const clientX = drag.startX + (payload.dx ?? 0);
        const clientY = drag.startY + (payload.dy ?? 0);
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
  }, [iReplayTaps, roomId]);

  useEffect(() => { window.sessionStorage.setItem(sessionKey, String(sceneIdx)); }, [sceneIdx, sessionKey]);

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

  useEffect(() => {
    if (!isSynced || role !== 'student' || !roomId) return;
    const unsubscribe = whiteboardService.subscribeToSceneLessonNav(roomId, (payload) => {
      if (unitNumber != null && payload.unitNumber !== unitNumber) return;
      if (lessonNumber != null && payload.lessonNumber !== lessonNumber) return;
      setSceneIdx(Math.max(0, Math.min(SCENES.length - 1, payload.sceneIdx)));
    });
    return unsubscribe;
  }, [isSynced, role, roomId, unitNumber, lessonNumber, SCENES.length]);

  useEffect(() => {
    if (!isSynced || role !== 'student') return;
    if (persistedSceneIdx == null) return;
    setSceneIdx(Math.max(0, Math.min(SCENES.length - 1, persistedSceneIdx)));
  }, [isSynced, role, persistedSceneIdx, SCENES.length]);

  useEffect(() => {
    let cancelled = false;
    const upcoming = SCENES.slice(sceneIdx, sceneIdx + 2);
    const lines: { text: string; who: Parameters<typeof prefetch>[1] }[] = [];
    for (const s of upcoming) {
      if (s.kind === 'meet') lines.push({ text: s.line, who: VOICE_KEY[s.who] });
      if (s.kind === 'echo') lines.push({ text: s.word, who: VOICE_KEY[s.who] });
      if (s.kind === 'finale') lines.push({ text: s.line, who: VOICE_KEY[s.who] });
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

        {!isFinale && (
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

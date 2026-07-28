import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Scene } from '@/content/playground-library/unit1/scenes';
import { SceneRenderer, Hearts, MAX_HEARTS, Lep1Keyframes } from '@/content/playground-library/unit1/SceneRenderer';
import { stopSpeaking, prefetch, unlockAudio } from '@/content/playground-library/unit1/audio';

interface PlayUnitLessonProps {
  scenes: Scene[];
  sessionKey: string;
  embedded?: boolean;
  /** Only needed by callers that also pass onFinaleReached — lets the
   *  caller identify which lesson just finished. */
  unitNumber?: number;
  lessonNumber?: number;
  /** Fired once when the finale scene is reached. */
  onFinaleReached?: () => void;
}

export default function PlayUnitLesson({ scenes, sessionKey, embedded = false, onFinaleReached }: PlayUnitLessonProps) {
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

  useEffect(() => { window.sessionStorage.setItem(sessionKey, String(sceneIdx)); }, [sceneIdx, sessionKey]);

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

  const goNext = useCallback(() => { stopSpeaking(); setSceneIdx((i) => Math.min(SCENES.length - 1, i + 1)); }, [SCENES.length]);
  const goBack = useCallback(() => { stopSpeaking(); setSceneIdx((i) => Math.max(0, i - 1)); }, []);
  const restart = useCallback(() => {
    stopSpeaking();
    setSceneIdx(0); setHearts(MAX_HEARTS); setGems(0);
    window.sessionStorage.removeItem(sessionKey);
  }, [sessionKey]);

  const totalGemsPossible = useMemo(
    () => SCENES.filter((s) => s.kind === 'basket' || s.kind === 'who-said-it' || s.kind === 'roleplay' || s.kind === 'join-stage' || s.kind === 'name-gate' || s.kind === 'meet-group' || s.kind === 'voice-stage' || (s.kind === 'meet' && s.repeat)).length,
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
    <div
      dir="ltr"
      onPointerDownCapture={unlockAudio}
      className={`relative w-full overflow-hidden transition-[background-image] duration-500 ${embedded ? 'h-full' : 'min-h-screen'}`}
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

        <div key={scene.id} className="flex-1 animate-[lep1-fade-slide_0.45s_ease-out]">
          <SceneRenderer
            scene={scene}
            onWin={registerWin}
            onLose={loseHeart}
            onNext={goNext}
            onRestart={restart}
            gemsCollected={gems}
            heartsRemaining={hearts}
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

      <Lep1Keyframes />
    </div>
  );
}

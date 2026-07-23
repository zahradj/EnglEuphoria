import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LESSON_1_SCENES } from '@/content/playground-library/lep1/scenes';
import { SceneRenderer, Hearts, MAX_HEARTS, Lep1Keyframes } from '@/content/playground-library/lep1/SceneRenderer';
import { stopSpeaking, prefetch } from '@/content/playground-library/lep1/audio';

const SESSION_KEY = 'lep1-scene-idx';

export default function PlayLesson1() {
  const navigate = useNavigate();
  const SCENES = LESSON_1_SCENES;

  const [sceneIdx, setSceneIdx] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const s = window.sessionStorage.getItem(SESSION_KEY);
    const n = s ? Number(s) : 0;
    return Number.isFinite(n) && n >= 0 && n < SCENES.length ? n : 0;
  });
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [gems, setGems] = useState(0);

  useEffect(() => { window.sessionStorage.setItem(SESSION_KEY, String(sceneIdx)); }, [sceneIdx]);

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
    window.sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const totalGemsPossible = useMemo(
    () => SCENES.filter((s) => s.kind === 'basket' || s.kind === 'who-said-it' || s.kind === 'roleplay' || s.kind === 'join-stage' || (s.kind === 'meet' && s.repeat)).length,
    [SCENES],
  );

  const isFinale = scene.kind === 'finale';

  return (
    <div
      dir="ltr"
      className="relative min-h-screen w-full overflow-hidden transition-[background-image] duration-500"
      style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.35)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full flex-col px-0 pb-6 pt-4">
        <div className="flex items-center justify-between px-4">
          <button
            onClick={() => { stopSpeaking(); navigate('/content-creator/library?hub=playground'); }}
            className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold text-orange-700 shadow-lg ring-1 ring-white/60 backdrop-blur"
          >
            ← Map
          </button>
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

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex items-center justify-between px-4">
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

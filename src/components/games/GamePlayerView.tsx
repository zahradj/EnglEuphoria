import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Lock, RotateCcw, Star } from 'lucide-react';
import { FirstSoundScene } from '@/content/playground-library/FirstSoundScene';
import { LetterBlocksScene, LetterMatchScene } from '@/content/playground-library/LetterTilesScene';
import { WhatsMissingScene } from '@/content/playground-library/WhatsMissingScene';
import { SortBasketScene } from '@/content/playground-library/SortBasketScene';
import { GrammarGapScene } from '@/content/playground-library/GrammarGapScene';
import { ColorPlayScene } from '@/content/playground-library/ColorPlayScene';
import { getLibraryGame, starsFor } from '@/content/playground-library/gamesCatalog';
import { getGameProgress, overallStars, recordStageResult } from '@/content/playground-library/gameProgress';
import { unlockAudio } from '@/content/playground-library/unit1/audio';

const FONT = "'Fredoka', system-ui, sans-serif";
const noop = () => {};

interface StageResult { stageIdx: number; stars: 1 | 2 | 3; mistakes: number }

/**
 * Full-page player for a Playground game made of several stops (stages): a
 * journey map across the top, the current stop on a 16:9 stage, a results card
 * after every stop (1-3 stars, saved) and a final card with the overall rating.
 * Used by the public library route and the student dashboard, so both behave
 * identically.
 */
export function GamePlayerView({ gameId, onBack }: { gameId: string | undefined; onBack: () => void; onPlay?: (id: string) => void }) {
  const game = getLibraryGame(gameId);
  const stageCount = game?.stages.length ?? 0;
  const initial = useMemo(() => {
    if (!game) return 0;
    const p = getGameProgress(game.id);
    const firstOpen = game.stages.findIndex((_, i) => !(p.stageStars[i] ?? 0));
    return firstOpen === -1 ? 0 : firstOpen;
  }, [game]);

  const [stageIdx, setStageIdx] = useState(initial);
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<StageResult | null>(null);
  const [progressTick, setProgressTick] = useState(0);
  const [intro, setIntro] = useState(true); // title screen with the cover
  const mistakes = useRef(0);

  if (!game) {
    return (
      <div className="mx-auto max-w-xl p-10 text-center">
        <p className="mb-4 text-lg font-black text-orange-800">We couldn't find that game.</p>
        <button onClick={onBack} className="rounded-full bg-orange-500 px-6 py-2 font-black text-white">Back</button>
      </div>
    );
  }

  const progress = getGameProgress(game.id); // re-read after each saved result (progressTick)
  void progressTick;
  const stage = game.stages[stageIdx];
  const isLast = stageIdx === stageCount - 1;

  const goTo = (i: number) => {
    mistakes.current = 0;
    setResult(null);
    setStageIdx(i);
    setRunKey((k) => k + 1);
  };
  const finishStage = () => {
    const stars = starsFor(mistakes.current, stage.units);
    recordStageResult(game.id, stageIdx, stars, stageCount);
    setProgressTick((t) => t + 1);
    setResult({ stageIdx, stars, mistakes: mistakes.current });
  };
  const onResult = ({ mistakes: m }: { mistakes: number }) => { mistakes.current = m; };
  const scene = stage.scene;
  const overall = overallStars(getGameProgress(game.id).stageStars, stageCount);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6" dir="ltr">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 transition hover:scale-105 active:scale-95">
          <ArrowLeft className="h-4 w-4" /> Games
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-black text-orange-900" style={{ fontFamily: FONT }}>{game.title}</h1>
          <p className="truncate text-sm font-semibold text-orange-700/70">Stop {stageIdx + 1} of {stageCount} · {stage.station}</p>
        </div>
        <button onClick={() => goTo(stageIdx)} aria-label="Restart this stop" className="grid h-10 w-10 place-items-center rounded-full bg-white text-orange-700 shadow ring-2 ring-orange-200 transition hover:rotate-[-90deg]">
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Journey map: the four stops, with your stars */}
      <ol className="mx-auto mb-4 flex max-w-5xl items-stretch gap-2" aria-label="Journey map">
        {game.stages.map((s, i) => {
          const stars = progress.stageStars[i] ?? 0;
          const open = i <= progress.unlocked || stars > 0;
          const current = i === stageIdx;
          return (
            <li key={s.id} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={!open}
                onClick={() => goTo(i)}
                aria-current={current ? 'step' : undefined}
                className={`flex h-full w-full flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-center transition ${
                  current ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300'
                    : open ? 'bg-white text-orange-800 shadow ring-1 ring-orange-200 hover:-translate-y-0.5'
                      : 'bg-white/60 text-orange-300 ring-1 ring-orange-100'
                }`}
              >
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white sm:h-11 sm:w-11">
                  {open ? <img src={s.art} alt="" className="h-7 w-7 object-contain sm:h-9 sm:w-9" draggable={false} /> : <Lock className="h-4 w-4 text-orange-300" />}
                  {stars > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-3 w-3" strokeWidth={4} /></span>}
                </span>
                <span className="w-full truncate text-[11px] font-black leading-tight sm:text-xs">{s.station}</span>
                <span className="inline-flex gap-0.5">
                  {[1, 2, 3].map((n) => (
                    <Star key={n} className={`h-3 w-3 ${n <= stars ? 'fill-amber-400 text-amber-500' : current ? 'fill-transparent text-white/60' : 'fill-transparent text-orange-200'}`} />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Stage: as large as fits the screen, always fully visible */}
      <div
        className="relative mx-auto aspect-video overflow-hidden rounded-3xl bg-white shadow-2xl ring-4 ring-white"
        style={{ width: 'min(100%, calc(70dvh * 16 / 9))' }}
        onPointerDownCapture={() => unlockAudio()}
      >
        {!intro && scene.kind === 'first-sound' && <FirstSoundScene key={`${stage.id}-${runKey}`} scene={scene} onNext={finishStage} onWin={noop} onResult={onResult} />}
        {!intro && scene.kind === 'letter-blocks' && <LetterBlocksScene key={`${stage.id}-${runKey}`} scene={scene} onNext={finishStage} onWin={noop} onResult={onResult} />}
        {!intro && scene.kind === 'letter-match' && <LetterMatchScene key={`${stage.id}-${runKey}`} scene={scene} onNext={finishStage} onWin={noop} onResult={onResult} />}
        {!intro && scene.kind === 'color-play' && <ColorPlayScene key={`${stage.id}-${runKey}`} scene={scene} onNext={finishStage} onWin={noop} onResult={onResult} />}
        {!intro && scene.kind === 'grammar-gap' && <GrammarGapScene key={`${stage.id}-${runKey}`} scene={scene} onNext={finishStage} onWin={noop} onResult={onResult} />}
        {!intro && scene.kind === 'sort-basket' && <SortBasketScene key={`${stage.id}-${runKey}`} scene={scene} onNext={finishStage} onWin={noop} onResult={onResult} />}
        {!intro && scene.kind === 'whats-missing' && <WhatsMissingScene key={`${stage.id}-${runKey}`} scene={scene} onNext={finishStage} onWin={noop} onResult={onResult} />}

        {intro && (
          <div className="absolute inset-0 z-[60] overflow-hidden bg-sky-200">
            <style>{`@keyframes gp-title { 0% { transform: translateY(-120%) rotate(-3deg); opacity: 0; } 70% { transform: translateY(6%) rotate(1deg); opacity: 1; } 100% { transform: none; opacity: 1; } }
@keyframes gp-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.07); } }
@media (prefers-reduced-motion: reduce) { .gp-pulse { animation: none !important; } }`}</style>
            <img src={game.cover} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 top-[5%] flex justify-center px-4" style={{ animation: 'gp-title .8s cubic-bezier(.2,.9,.3,1.2) both' }}>
              <h2 className="rounded-3xl border-4 border-[#8a5a2b] bg-[#f4c87a] px-[5%] py-[1.2%] text-center font-black text-[#4a2a0c] shadow-[0_8px_0_#8a5a2b]" style={{ fontFamily: FONT, fontSize: 'clamp(1.6rem, 5.4vw, 4rem)', lineHeight: 1.1 }}>{game.title}</h2>
            </div>
            <div className="absolute inset-x-0 top-[34%] flex justify-center">
              <button
                onClick={() => { unlockAudio(); setIntro(false); }}
                className="gp-pulse rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[7%] py-[1.4%] font-black text-white shadow-2xl ring-4 ring-white/80 transition hover:scale-105 active:scale-95"
                style={{ fontFamily: FONT, fontSize: 'clamp(1.2rem, 3.4vw, 2.4rem)', animation: 'gp-pulse 1.8s ease-in-out infinite' }}
              >
                {progress.stageStars.some(Boolean) ? "Keep going!" : "Let's go!"}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-sky-900/55 px-4 backdrop-blur-sm" style={{ animation: 'gp-fade .3s ease-out both' }}>
            <style>{`@keyframes gp-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes gp-star { 0% { transform: scale(0) rotate(-40deg); opacity: 0; } 70% { transform: scale(1.3) rotate(8deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }`}</style>
            <div className="rounded-3xl bg-white/95 px-8 py-5 text-center shadow-2xl">
              <p className="text-sm font-black uppercase tracking-wide text-orange-500">{isLast ? 'End of the line!' : `${stage.station} complete`}</p>
              <p className="text-3xl font-black text-orange-600" style={{ fontFamily: FONT }}>{result.stars === 3 ? 'Perfect!' : result.stars === 2 ? 'Great job!' : 'Well done!'}</p>
              <div className="my-2 flex justify-center gap-2">
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={n <= result.stars ? 'fill-amber-400 text-amber-500' : 'fill-transparent text-slate-300'}
                    style={{ width: 'clamp(40px, 8vw, 64px)', height: 'clamp(40px, 8vw, 64px)', animation: n <= result.stars ? `gp-star .6s cubic-bezier(.2,.9,.3,1.4) ${0.25 + n * 0.25}s both` : undefined }}
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-600">
                {result.mistakes === 0 ? 'No mistakes at all!' : `${result.mistakes} slip${result.mistakes === 1 ? '' : 's'} — you can get 3 stars next time.`}
              </p>
              {isLast && overall > 0 && (
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">Your Alphabet Express rating</p>
                  <div className="mt-1 flex justify-center gap-1.5">
                    {[1, 2, 3].map((n) => <Star key={n} className={`h-9 w-9 ${n <= overall ? 'fill-amber-400 text-amber-500' : 'fill-transparent text-slate-300'}`} />)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {!isLast ? (
                <button onClick={() => goTo(stageIdx + 1)} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-7 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">
                  Next stop: {game.stages[stageIdx + 1].station} →
                </button>
              ) : (
                <button onClick={() => goTo(0)} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-7 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">Ride again</button>
              )}
              <button onClick={() => goTo(stageIdx)} className="rounded-full bg-white px-6 py-3 text-lg font-black text-orange-700 shadow-xl transition hover:scale-105 active:scale-95">Play this stop again</button>
              <button onClick={onBack} className="rounded-full bg-white/90 px-6 py-3 text-lg font-black text-orange-700 shadow-xl transition hover:scale-105 active:scale-95">Done</button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto mt-6 grid max-w-5xl gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow ring-1 ring-orange-100">
          <h2 className="mb-1 text-lg font-black text-orange-900" style={{ fontFamily: FONT }}>This stop: {stage.title}</h2>
          <p className="text-sm font-semibold text-neutral-600">{stage.blurb}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow ring-1 ring-orange-100">
          <h2 className="mb-2 text-lg font-black text-orange-900" style={{ fontFamily: FONT }}>How to play</h2>
          <ol className="space-y-2">
            {game.howToPlay.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm font-semibold text-neutral-700">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-500 text-xs font-black text-white">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

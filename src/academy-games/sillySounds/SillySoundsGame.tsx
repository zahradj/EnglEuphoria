import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useAnimationControls } from 'framer-motion';
import { ArrowLeft, Lock, Play, RotateCcw, Smile, Star } from 'lucide-react';
import { safeSpeak } from '@/content/playground-library/unit1/audio';
import { getGameProgress, overallStars, recordStageResult } from '@/content/playground-library/gameProgress';
import { starsFor } from '@/content/playground-library/gamesCatalog';
import { ForgeButton, Sparks, useSparks } from '../verbForge/forgeUi';
import { DoctorStage, EchoStage, NinjaStage, OddStage, RhymeStage, type StageProps } from './soundStages';

export const SILLY_SOUNDS_ID = 'silly-sounds';

const STOPS = [
  { id: 'rhyme', title: 'Rhyme Roulette', blurb: 'through rhymes with blue. Spin and match!', how: 'Ears', Stage: RhymeStage },
  { id: 'odd', title: 'Odd One Out', blurb: 'Four words, one funny vowel.', how: 'Ears', Stage: OddStage },
  { id: 'ninja', title: 'Silent Ninja', blurb: 'Catch the letter nobody says.', how: 'Spell', Stage: NinjaStage },
  { id: 'doctor', title: 'Spelling Doctor', blurb: 'Cure the silly sentences.', how: 'Spell', Stage: DoctorStage },
  { id: 'echo', title: 'Parrot Echo', blurb: 'Say it like the parrot. Private, never scored.', how: 'Say', Stage: EchoStage },
] as const;

const METHOD = [
  ['Hear', 'Ears first: rhymes and odd vowels, whatever the spelling.'],
  ['Spot', 'Silent letters and tricky spellings, caught by sound.'],
  ['Laugh', 'Silly sentences stick.'],
  ['Say', 'Record yourself next to the parrot. Private.'],
] as const;

interface Props { onBack?: () => void; seed?: number; speak?: (text: string) => Promise<void> }

function CircusBackdrop() {
  const dots = Array.from({ length: 16 }, (_, i) => ({ left: (i * 61 + 7) % 100, top: (i * 37 + 11) % 100, delay: (i * 0.4) % 5, size: 4 + (i % 3) * 3 }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(110% 80% at 50% -10%, #86198f 0%, #4a044e 48%, #1a0620 92%)' }} />
      <div className="absolute inset-x-0 top-0 h-10 opacity-50" style={{ background: 'repeating-linear-gradient(90deg,#fbbf24 0 36px,#db2777 36px 72px)' }} />
      {dots.map((d, i) => (
        <motion.span key={i} className="absolute rounded-full bg-amber-200" style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }} animate={{ opacity: [0.1, 0.8, 0.1], y: [0, -12, 0] }} transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: d.delay, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

export function SillySoundsGame({ onBack, seed: seedProp, speak }: Props) {
  const [seed, setSeed] = useState(() => seedProp ?? Math.floor(Math.random() * 1e9));
  const [screen, setScreen] = useState<'map' | 'play' | 'result'>('map');
  const [stopIdx, setStopIdx] = useState(0);
  const [result, setResult] = useState<{ mistakes: number; units: number; stars: number } | null>(null);
  const [progress, setProgress] = useState(() => getGameProgress(SILLY_SOUNDS_ID));
  const [sparks, fireSparks] = useSparks();
  const frame = useRef<HTMLDivElement | null>(null);
  const shake = useAnimationControls();

  const say = useCallback(async (text: string) => {
    if (speak) { await speak(text); return; }
    await safeSpeak(text, 'teacher');
  }, [speak]);
  const spark = useCallback((el: Element | null) => {
    const f = frame.current;
    if (!f || !el) return;
    const fr = f.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    fireSparks(er.left - fr.left + er.width / 2, er.top - fr.top + er.height / 2);
  }, [fireSparks]);
  const nudge = useCallback(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) void shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
  }, [shake]);

  const total = overallStars(progress.stageStars, STOPS.length);
  const finish = (r: { mistakes: number; units: number }) => {
    const stars = starsFor(r.mistakes, r.units);
    setProgress(recordStageResult(SILLY_SOUNDS_ID, stopIdx, stars, STOPS.length));
    setResult({ ...r, stars });
    setScreen('result');
  };
  const startStop = (i: number) => { setStopIdx(i); setSeed((s) => (seedProp !== undefined ? seedProp : s + 1)); setScreen('play'); };

  const Stage = STOPS[stopIdx].Stage;
  const stageProps: StageProps = { seed, say, spark, nudge, onDone: finish };

  return (
    <MotionConfig reducedMotion="user">
      <motion.div ref={frame} animate={shake} className="relative isolate overflow-hidden rounded-3xl border border-fuchsia-300/30 text-white shadow-2xl" style={{ minHeight: 560 }}>
        <CircusBackdrop />
        <Sparks items={sparks} />
        <div className="relative z-10 p-4 pt-12 sm:p-6 sm:pt-14">
          {onBack && screen === 'map' && (
            <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-fuchsia-100 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back</button>
          )}
          <AnimatePresence mode="wait">
            {screen === 'map' && (
              <motion.div key="map" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="flex flex-wrap items-center gap-3">
                  <motion.div animate={{ rotate: [-8, 8, -8], y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-300 to-pink-500 text-white shadow-lg" aria-hidden="true"><Smile className="h-8 w-8" /></motion.div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Silly Sounds Circus</h1>
                    <p className="text-sm text-fuchsia-100 sm:text-base">Funny phonics: hear the sound, catch the silent letter, fix the silly spelling.</p>
                  </div>
                  {total > 0 && <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-bold"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /> {total}/3</span>}
                </div>
                <div className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="How it works">
                  {METHOD.map(([k, t], n) => (
                    <div key={k} title={t} className="rounded-2xl border border-white/10 bg-white/[.07] p-2 text-center sm:p-3 sm:text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 sm:text-xs"><span className="hidden sm:inline">{n + 1} · </span>{k}</p>
                      <p className="mt-1 hidden text-xs leading-snug text-fuchsia-100 sm:block">{t}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {STOPS.map((s, i) => {
                    const locked = i > progress.unlocked;
                    const stars = progress.stageStars[i] ?? 0;
                    return (
                      <motion.button key={s.id} type="button" disabled={locked} onClick={() => startStop(i)} aria-label={`${locked ? 'Locked: ' : ''}${s.title}`}
                        initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: locked ? 0.55 : 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 260, damping: 18 }}
                        whileHover={locked ? undefined : { scale: 1.03, y: -3 }} whileTap={locked ? undefined : { scale: 0.96 }}
                        className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-br from-fuchsia-700/60 to-pink-800/40 p-4 text-left shadow-lg disabled:cursor-not-allowed">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/30 text-lg font-black text-amber-300">{locked ? <Lock className="h-5 w-5" /> : i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold uppercase tracking-widest text-amber-300">{s.how}</span>
                          <span className="block text-lg font-extrabold leading-tight">{s.title}</span>
                          <span className="block text-xs text-fuchsia-100">{s.blurb}</span>
                        </span>
                        <span className="flex shrink-0 gap-0.5" aria-label={`${stars} of 3 stars`}>
                          {[1, 2, 3].map((n) => <Star key={n} className={`h-4 w-4 ${n <= stars ? 'fill-amber-300 text-amber-300' : 'text-white/25'}`} />)}
                        </span>
                        {!locked && <Play className="h-5 w-5 shrink-0 text-white/80" />}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="mt-4 text-center text-xs text-fuchsia-100/80">Everything you hear is a saved recording. Nothing is scored by a machine, and your voice never leaves your device.</p>
              </motion.div>
            )}

            {screen === 'play' && (
              <motion.div key={`play-${stopIdx}-${seed}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <button type="button" onClick={() => setScreen('map')} className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-fuchsia-100 hover:text-white"><ArrowLeft className="h-4 w-4" /> Map</button>
                <Stage {...stageProps} />
              </motion.div>
            )}

            {screen === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-xl text-center">
                <h2 className="text-2xl font-black sm:text-3xl">{STOPS[stopIdx].title} complete!</h2>
                <div className="my-4 flex justify-center gap-2" aria-label={`${result.stars} of 3 stars`}>
                  {[1, 2, 3].map((n) => (
                    <motion.span key={n} initial={{ scale: 0, rotate: -40 }} animate={{ scale: n <= result.stars ? 1 : 0.8, rotate: 0 }} transition={{ delay: 0.25 * n, type: 'spring', stiffness: 300, damping: 12 }}>
                      <Star className={`h-14 w-14 ${n <= result.stars ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_14px_rgba(252,211,77,.8)]' : 'text-white/25'}`} />
                    </motion.span>
                  ))}
                </div>
                <p className="text-sm text-fuchsia-100">{result.mistakes === 0 ? 'Perfect! Not one slip!' : `${result.mistakes} slip${result.mistakes === 1 ? '' : 's'}: play again to beat it.`}</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <ForgeButton onClick={() => startStop(stopIdx)}><span className="flex items-center gap-2"><RotateCcw className="h-5 w-5" /> Play again</span></ForgeButton>
                  <ForgeButton onClick={() => (stopIdx + 1 < STOPS.length ? startStop(stopIdx + 1) : setScreen('map'))} hot>{stopIdx + 1 < STOPS.length ? `Next: ${STOPS[stopIdx + 1].title}` : 'Back to the map'}</ForgeButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

export default SillySoundsGame;

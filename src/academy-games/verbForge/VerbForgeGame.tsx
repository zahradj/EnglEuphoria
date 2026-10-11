import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useAnimationControls } from 'framer-motion';
import { ArrowLeft, Flame, Hammer, Lock, Play, RotateCcw, Star } from 'lucide-react';
import { safeSpeak } from '@/content/playground-library/unit1/audio';
import { getGameProgress, overallStars, recordStageResult } from '@/content/playground-library/gameProgress';
import { starsFor } from '@/content/playground-library/gamesCatalog';
import { IRREGULAR_VERBS, type Verb } from './verbData';
import { MAX_BOX, readVault, summarize, type Vault } from './verbMemory';
import { ForgeBackdrop, ForgeButton, FORM, Sparks, useSparks } from './forgeUi';
import { FamilyStage, MemoryStage, PatternStage, SentenceStage, type StageProps } from './stages';

export const VERB_FORGE_ID = 'verb-forge';

const STOPS = [
  { id: 'pattern', title: 'Pattern Forge', blurb: 'See the three forms. Name the pattern.', how: 'Notice', Stage: PatternStage },
  { id: 'family', title: 'Family Forge', blurb: 'Learn verbs in families, not one by one.', how: 'Group', Stage: FamilyStage },
  { id: 'memory', title: 'Memory Forge', blurb: 'Type the forms from memory. Hard on purpose.', how: 'Recall', Stage: MemoryStage },
  { id: 'sentence', title: 'Sentence Forge', blurb: 'Which form fits the sentence?', how: 'Use', Stage: SentenceStage },
] as const;

const METHOD = [
  ['Group', 'Learn verbs in families (sing–sang–sung), not a long list.'],
  ['Hear', 'Ears first: listen to all three forms before you say them.'],
  ['Recall', 'Type it from memory. Trying to remember is what makes it stick.'],
  ['Use', 'See the form in a sentence: past time or "have"?'],
  ['Return', 'Come back tomorrow. The Vault brings your weak verbs back.'],
] as const;

const BOX_NAMES = ['New', 'Embers', 'Glow', 'Hot', 'Bright', 'Gold'];
const BOX_COLORS = ['#475569', '#fb7185', '#fb923c', '#fbbf24', '#a3e635', '#fde047'];

interface Props {
  onBack?: () => void;
  /** Same seed = same questions (tests, "play it again" fairness). */
  seed?: number;
  /** Say a line (default: the recorded voices). */
  speak?: (text: string) => Promise<void>;
}

export function VerbForgeGame({ onBack, seed: seedProp, speak }: Props) {
  const [seed, setSeed] = useState(() => seedProp ?? Math.floor(Math.random() * 1e9));
  const [screen, setScreen] = useState<'map' | 'play' | 'result'>('map');
  const [stopIdx, setStopIdx] = useState(0);
  const [result, setResult] = useState<{ mistakes: number; units: number; stars: number } | null>(null);
  const [progress, setProgress] = useState(() => getGameProgress(VERB_FORGE_ID));
  const [vault, setVault] = useState<Vault>(() => readVault());
  const [sparks, fireSparks] = useSparks();
  const frame = useRef<HTMLDivElement | null>(null);
  const shake = useAnimationControls();
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const say = useCallback(async (text: string) => {
    if (speak) { await speak(text); return; }
    await safeSpeak(text, 'teacher');
  }, [speak]);
  const hearVerb = useCallback(async (v: Verb) => {
    for (const w of [v.base, v.past, v.pp]) {
      if (!alive.current) return;
      await say(w);
      await new Promise((r) => window.setTimeout(r, 220));
    }
  }, [say]);
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

  const summary = useMemo(() => summarize(IRREGULAR_VERBS, vault), [vault]);
  const unlocked = progress.unlocked;
  const total = overallStars(progress.stageStars, STOPS.length);

  const finish = (r: { mistakes: number; units: number }) => {
    const stars = starsFor(r.mistakes, r.units);
    const next = recordStageResult(VERB_FORGE_ID, stopIdx, stars, STOPS.length);
    setProgress(next);
    setResult({ ...r, stars });
    setScreen('result');
  };

  const startStop = (i: number) => { setStopIdx(i); setSeed((s) => (seedProp !== undefined ? seedProp : s + 1)); setScreen('play'); };

  const Stage = STOPS[stopIdx].Stage;
  const stageProps: StageProps = { seed, vault, setVault, hearVerb, say, spark, nudge, onDone: finish };

  return (
    <MotionConfig reducedMotion="user">
      <motion.div ref={frame} animate={shake} className="relative isolate overflow-hidden rounded-3xl border border-violet-400/30 text-white shadow-2xl" style={{ minHeight: 560 }}>
        <ForgeBackdrop />
        <Sparks items={sparks} />
        <div className="relative z-10 p-4 sm:p-6">
          {onBack && screen === 'map' && (
            <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-violet-200 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back</button>
          )}

          <AnimatePresence mode="wait">
            {screen === 'map' && (
              <motion.div key="map" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="flex flex-wrap items-center gap-3">
                  <motion.div animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 2.4, repeat: Infinity }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-300 to-orange-500 text-white shadow-lg" aria-hidden="true"><Hammer className="h-8 w-8" /></motion.div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Verb Forge</h1>
                    <p className="text-sm text-violet-100 sm:text-base">Forge the three forms: <b style={{ color: FORM.base.hex }}>base</b> · <b style={{ color: FORM.past.hex }}>past simple</b> · <b style={{ color: FORM.pp.hex }}>past participle</b>.</p>
                  </div>
                  {total > 0 && <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-bold"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /> {total}/3</span>}
                </div>

                <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="How to remember faster">
                  {METHOD.map(([k, t], n) => (
                    <motion.div key={k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * n, type: 'spring', stiffness: 260, damping: 18 }} title={t} className="rounded-2xl border border-white/10 bg-white/[.06] p-2 text-center sm:p-3 sm:text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 sm:text-xs sm:tracking-widest"><span className="hidden sm:inline">{n + 1} · </span>{k}</p>
                      <p className="mt-1 hidden text-xs leading-snug text-violet-100 sm:block">{t}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {STOPS.map((s, i) => {
                    const locked = i > unlocked;
                    const stars = progress.stageStars[i] ?? 0;
                    return (
                      <motion.button
                        key={s.id}
                        type="button"
                        disabled={locked}
                        onClick={() => startStop(i)}
                        aria-label={`${locked ? 'Locked: ' : ''}${s.title}`}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: locked ? 0.55 : 1, scale: 1 }}
                        transition={{ delay: 0.12 + i * 0.07, type: 'spring', stiffness: 260, damping: 18 }}
                        whileHover={locked ? undefined : { scale: 1.03, y: -3 }}
                        whileTap={locked ? undefined : { scale: 0.96 }}
                        className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-br from-violet-600/60 to-fuchsia-700/40 p-4 text-left shadow-lg disabled:cursor-not-allowed"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/30 text-lg font-black text-amber-300">{locked ? <Lock className="h-5 w-5" /> : i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold uppercase tracking-widest text-amber-300">{s.how}</span>
                          <span className="block text-lg font-extrabold leading-tight">{s.title}</span>
                          <span className="block text-xs text-violet-100">{s.blurb}</span>
                        </span>
                        <span className="flex shrink-0 gap-0.5" aria-label={`${stars} of 3 stars`}>
                          {[1, 2, 3].map((n) => <Star key={n} className={`h-4 w-4 ${n <= stars ? 'fill-amber-300 text-amber-300' : 'text-white/25'}`} />)}
                        </span>
                        {!locked && <Play className="h-5 w-5 shrink-0 text-white/80" />}
                      </motion.button>
                    );
                  })}
                </div>

                <VaultPanel summary={summary} />
              </motion.div>
            )}

            {screen === 'play' && (
              <motion.div key={`play-${stopIdx}-${seed}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <button type="button" onClick={() => setScreen('map')} className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-violet-200 hover:text-white"><ArrowLeft className="h-4 w-4" /> Map</button>
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
                <p className="text-sm text-violet-100">{result.mistakes === 0 ? 'Perfect forging. Not one slip!' : `${result.mistakes} slip${result.mistakes === 1 ? '' : 's'}: those are exactly the ones the Vault will bring back.`}</p>
                <VaultPanel summary={summary} compact />
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

/** The Memory Vault: how many verbs sit in each box (weakest form decides). */
function VaultPanel({ summary, compact }: { summary: ReturnType<typeof summarize>; compact?: boolean }) {
  const max = Math.max(1, ...summary.boxes);
  return (
    <div className={`${compact ? 'mt-4' : 'mt-5'} rounded-2xl border border-white/10 bg-black/25 p-4 text-left`} aria-label="Memory Vault">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-amber-300"><Flame className="h-4 w-4" /> Memory Vault</p>
        <p className="text-xs text-violet-100">
          {summary.due > 0 ? <b className="text-white">{summary.due} verb{summary.due === 1 ? '' : 's'} ready to review today</b> : summary.boxes[0] === summary.total ? 'Your first slips and wins will be saved here.' : 'Nothing due right now. Come back tomorrow.'} · gold: {summary.mastered}/{summary.total}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-6 items-end gap-2" style={{ height: compact ? 64 : 84 }}>
        {summary.boxes.map((n, b) => (
          <div key={b} className="flex h-full flex-col items-center justify-end gap-1">
            <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(6, (n / max) * 100)}%` }} transition={{ type: 'spring', stiffness: 160, damping: 18, delay: 0.05 * b }} className="w-full rounded-t-lg" style={{ background: BOX_COLORS[b], opacity: n ? 1 : 0.35 }} />
            <span className="text-[10px] font-bold text-violet-100">{BOX_NAMES[b]}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-violet-200/80">Right answers move a verb up a box and bring it back later; slips send it back to the embers. Box {MAX_BOX} = gold: you know it.</p>
    </div>
  );
}

export default VerbForgeGame;

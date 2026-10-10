import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useAnimationControls } from 'framer-motion';
import { ArrowLeft, Ear, Lock, Mic, Play, RotateCcw, Square, Star, Unlock } from 'lucide-react';
import { safeSpeak } from '@/content/playground-library/unit1/audio';
import { getGameProgress, overallStars, recordStageResult } from '@/content/playground-library/gameProgress';
import { starsFor } from '@/content/playground-library/gamesCatalog';
import { Sparks, rng, shuffled, useSparks } from '../verbForge/forgeUi';
import { CONTRASTS, SOUND_LAB_VOICES, type Contrast, type Voice } from './soundLabData';
import { LabBackdrop, LabButton, Pin, SpeakerButton, useRecorder } from './labUi';

export const SOUND_LAB_ID = 'sound-lab';

type SayFn = (word: string, voice?: Voice) => Promise<void>;
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

interface Props {
  onBack?: () => void;
  seed?: number;
  /** Say a word in a voice (default: the recorded voices). */
  speak?: (word: string, voice: Voice) => Promise<void>;
}

/* ------------------------------------------------------------------ one lock = one contrast */

interface PickRound { pair: [string, string]; target: 0 | 1; voice: Voice; order: [0, 1] | [1, 0] }
interface SameRound { pair: [string, string]; same: boolean; first: [string, Voice]; second: [string, Voice] }

function buildRounds(c: Contrast, seed: number) {
  const r = rng(seed);
  const pairs = shuffled(c.pairs, r);
  const sides = shuffled([0, 0, 0, 0, 1, 1, 1, 1] as (0 | 1)[], r);
  const pick: PickRound[] = pairs.map((pair, i) => ({ pair, target: sides[i], voice: SOUND_LAB_VOICES[i % SOUND_LAB_VOICES.length], order: (r() < 0.5 ? [0, 1] : [1, 0]) as [0, 1] | [1, 0] }));
  const sameFlags = shuffled([true, true, true, false, false, false], r);
  const sameRounds: SameRound[] = shuffled(c.pairs, r).slice(0, 6).map((pair, i) => {
    const v1 = SOUND_LAB_VOICES[i % 3];
    const v2 = SOUND_LAB_VOICES[(i + 1 + Math.floor(r() * 2)) % 3];
    if (sameFlags[i]) { const w = pair[r() < 0.5 ? 0 : 1]; return { pair, same: true, first: [w, v1], second: [w, v2] }; }
    const flip = r() < 0.5;
    return { pair, same: false, first: [pair[flip ? 1 : 0], v1], second: [pair[flip ? 0 : 1], v2] };
  });
  return { pick, same: sameRounds };
}

type Phase = 'listen' | 'pick' | 'same' | 'say';
const PHASES: { id: Phase; label: string }[] = [
  { id: 'listen', label: 'Listen' }, { id: 'pick', label: 'Pick the pin' }, { id: 'same', label: 'Same or different?' }, { id: 'say', label: 'Say it' },
];

function LockStage({ contrast, seed, say, spark, nudge, onDone }: {
  contrast: Contrast; seed: number; say: SayFn; spark: (el: Element | null) => void; nudge: () => void; onDone: (r: { mistakes: number; units: number }) => void;
}) {
  const rounds = useMemo(() => buildRounds(contrast, seed), [contrast, seed]);
  const [phase, setPhase] = useState<Phase>('listen');
  const [mistakes, setMistakes] = useState(0);
  const addMistake = () => setMistakes((m) => m + 1);
  const units = rounds.pick.length + rounds.same.length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-300">Lock · {contrast.a.label} or {contrast.b.label}</p>
          <h2 className="text-xl font-extrabold text-white sm:text-2xl">{contrast.name}</h2>
        </div>
        <ol className="flex items-center gap-1.5 text-[11px] font-bold sm:text-xs" aria-label="Steps">
          {PHASES.map((p, i) => (
            <li key={p.id} className={`rounded-full px-2.5 py-1 ${p.id === phase ? 'bg-teal-400 text-slate-900' : PHASES.findIndex((x) => x.id === phase) > i ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}`}>{i + 1} {p.label}</li>
          ))}
        </ol>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={phase} initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.25 }}>
          {phase === 'listen' && <ListenStep contrast={contrast} say={say} onNext={() => setPhase('pick')} />}
          {phase === 'pick' && <PickStep contrast={contrast} rounds={rounds.pick} say={say} spark={spark} nudge={nudge} onMistake={addMistake} onDone={() => setPhase('same')} />}
          {phase === 'same' && <SameStep contrast={contrast} rounds={rounds.same} say={say} spark={spark} nudge={nudge} onMistake={addMistake} onDone={() => setPhase('say')} />}
          {phase === 'say' && <SayStep contrast={contrast} say={say} onDone={() => onDone({ mistakes, units })} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* 1 · Listen: ears first, no pressure */
function ListenStep({ contrast, say, onNext }: { contrast: Contrast; say: SayFn; onNext: () => void }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const hear = async (word: string, voice: Voice) => { setPlaying(`${word}-${voice}`); await say(word, voice); setPlaying(null); };
  const hearPair = async (pair: [string, string]) => { await hear(pair[0], 'teacher'); await wait(250); await hear(pair[1], 'leo'); };
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {([0, 1] as const).map((s) => {
          const side = s === 0 ? contrast.a : contrast.b;
          return (
            <div key={s} className="rounded-3xl border border-white/15 bg-white/[.07] p-4">
              <p className="text-sm font-extrabold text-teal-300">{side.label}</p>
              <p className="mb-3 text-xs text-teal-50/90">{side.how}</p>
              <ul className="space-y-2">
                {contrast.pairs.slice(0, 3).map((pair) => (
                  <li key={pair[s]} className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-black text-white">{pair[s]}</span>
                    <span className="flex gap-1.5">
                      {SOUND_LAB_VOICES.map((v, k) => (
                        <button key={v} type="button" aria-label={`Hear ${pair[s]} (voice ${k + 1})`} onClick={() => void hear(pair[s], v)} className={`flex h-9 min-w-[44px] items-center justify-center rounded-full text-xs font-bold ${playing === `${pair[s]}-${v}` ? 'bg-teal-300 text-slate-900' : 'bg-white/15 text-white'}`}>
                          {k + 1}
                        </button>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-teal-100/80">Buttons 1, 2 and 3 are three different voices. Hear each word in all three.</p>
      <p className="mt-2 rounded-2xl bg-teal-300/10 px-4 py-2 text-center text-sm font-bold text-teal-100">Listen for: {contrast.listenFor}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <LabButton onClick={() => void hearPair(contrast.pairs[0])}><span className="flex items-center gap-2"><Ear className="h-5 w-5" /> Hear {contrast.pairs[0][0]} · {contrast.pairs[0][1]}</span></LabButton>
        <LabButton onClick={onNext} hot>I can hear it. Pick the pin!</LabButton>
      </div>
    </div>
  );
}

/* 2 · Pick the pin: hear one word, choose it */
function PickStep({ contrast, rounds, say, spark, nudge, onMistake, onDone }: {
  contrast: Contrast; rounds: PickRound[]; say: SayFn; spark: (el: Element | null) => void; nudge: () => void; onMistake: () => void; onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [right, setRight] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const round = rounds[i];
  const targetWord = round.pair[round.target];
  const side = (s: 0 | 1) => (s === 0 ? contrast.a : contrast.b);

  const hear = useCallback(() => say(targetWord, round.voice), [say, targetWord, round.voice]);
  useEffect(() => { void hear(); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (s: 0 | 1, el: Element) => {
    if (right !== null || wrong.includes(s)) return;
    if (s === round.target) {
      setRight(s);
      spark(el);
      setNote('');
      await wait(500);
      await say(round.pair[s], SOUND_LAB_VOICES[(i + 1) % 3]); // the same word again, in another voice
      await wait(700);
      if (i + 1 >= rounds.length) onDone();
      else { setI(i + 1); setWrong([]); setRight(null); }
    } else {
      setWrong((w) => [...w, s]);
      onMistake();
      nudge();
      // say what to listen for, never a score
      setNote(`You heard "${round.pair[round.target]}": ${side(round.target).label}, ${side(round.target).how}. ${contrast.listenFor}`);
      await wait(500);
      await say(round.pair[0], 'teacher'); await wait(250); await say(round.pair[1], 'teacher'); // compare the two, same voice
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <SpeakerButton label="Hear it again" onClick={() => void hear()} />
        <p className="text-base font-bold text-white sm:text-lg">Which word did you hear? <span className="text-teal-300">({i + 1}/{rounds.length})</span></p>
      </div>
      <div className="mx-auto mt-4 grid max-w-xl grid-cols-2 gap-4">
        {round.order.map((s, k) => (
          <Pin key={`${i}-${s}`} index={k} word={round.pair[s]} state={right === s ? 'right' : wrong.includes(s) ? 'wrong' : wrong.length >= 2 && s === round.target ? 'hint' : 'idle'} disabled={right !== null || wrong.includes(s)} onPick={(el) => void pick(s, el)} />
        ))}
      </div>
      <div className="mt-3 min-h-[52px] text-center text-sm font-bold text-teal-100">{note}</div>
    </div>
  );
}

/* 3 · Same or different? */
function SameStep({ contrast, rounds, say, spark, nudge, onMistake, onDone }: {
  contrast: Contrast; rounds: SameRound[]; say: SayFn; spark: (el: Element | null) => void; nudge: () => void; onMistake: () => void; onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null);
  const round = rounds[i];
  const play = useCallback(async () => { await say(round.first[0], round.first[1]); await wait(450); await say(round.second[0], round.second[1]); }, [say, round]);
  useEffect(() => { void play(); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = async (saidSame: boolean, el: Element) => {
    if (answered !== null) return;
    const ok = saidSame === round.same;
    setAnswered(ok);
    if (ok) spark(el); else { onMistake(); nudge(); }
    await wait(1900);
    if (i + 1 >= rounds.length) onDone();
    else { setI(i + 1); setAnswered(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <SpeakerButton label="Hear both again" onClick={() => void play()} />
        <p className="text-base font-bold text-white sm:text-lg">You hear two words. Are they the same word? <span className="text-teal-300">({i + 1}/{rounds.length})</span></p>
      </div>
      <div className="mx-auto mt-5 grid max-w-xl grid-cols-2 gap-4">
        <LabButton wide ariaLabel="Same" index={0} tone={answered !== null && round.same ? 'right' : 'idle'} disabled={answered !== null} onClick={(el) => void answer(true, el)}>Same</LabButton>
        <LabButton wide ariaLabel="Different" index={1} tone={answered !== null && !round.same ? 'right' : 'idle'} disabled={answered !== null} onClick={(el) => void answer(false, el)}>Different</LabButton>
      </div>
      <div className="mt-3 min-h-[52px] text-center text-sm font-bold">
        {answered !== null && (
          <span className={answered ? 'text-emerald-200' : 'text-amber-200'}>
            {answered ? 'Yes! ' : 'Not this time. '}They were “{round.first[0]}” and “{round.second[0]}”: {round.same ? 'the same word' : 'two different words'}.{!answered && !round.same ? ` ${contrast.listenFor}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}

/* 4 · Say it: private, optional, never scored */
function SayStep({ contrast, say, onDone }: { contrast: Contrast; say: SayFn; onDone: () => void }) {
  const pair = contrast.pairs[0];
  const [word, setWord] = useState<0 | 1>(1);
  const recorder = useRecorder();
  const target = pair[word];
  return (
    <div className="mx-auto max-w-xl text-center">
      <p className="text-base font-bold text-white">Now say it. This is for you: it is not scored and your voice is not saved.</p>
      <div className="mt-3 flex justify-center gap-2">
        {([0, 1] as const).map((s) => (
          <button key={s} type="button" onClick={() => { setWord(s); recorder.reset(); }} aria-pressed={word === s} className={`rounded-full px-5 py-2 text-xl font-black ${word === s ? 'bg-teal-300 text-slate-900' : 'bg-white/15 text-white'}`}>{pair[s]}</button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <LabButton onClick={() => void say(target, 'teacher')}><span className="flex items-center gap-2"><Ear className="h-5 w-5" /> 1 · Listen to {target}</span></LabButton>
        {recorder.state !== 'recording' ? (
          <LabButton onClick={() => void recorder.start()} disabled={!recorder.supported}><span className="flex items-center gap-2"><Mic className="h-5 w-5" /> 2 · Record yourself</span></LabButton>
        ) : (
          <LabButton onClick={() => recorder.stop()} hot><span className="flex items-center gap-2"><Square className="h-5 w-5" /> Stop</span></LabButton>
        )}
      </div>
      {!recorder.supported && <p className="mt-3 text-sm text-amber-200">This browser cannot record here. You can skip this step.</p>}
      {recorder.state === 'denied' && recorder.supported && <p className="mt-3 text-sm text-amber-200">The microphone is not allowed. That is okay: you can skip this step.</p>}
      {recorder.state === 'recorded' && recorder.url && (
        <div className="mt-4 rounded-2xl bg-white/10 p-3">
          <p className="mb-2 text-sm font-bold text-teal-100">3 · Hear yourself, then the model again</p>
          <audio controls src={recorder.url} className="mx-auto" aria-label="Your recording" />
          <div className="mt-2"><LabButton onClick={() => void say(target, 'teacher')}>Hear the model again</LabButton></div>
          <p className="mt-3 rounded-xl bg-teal-300/15 px-3 py-2 text-sm font-bold text-teal-100">One thing to change: {contrast.oneFix}</p>
        </div>
      )}
      <p className="mt-4 text-xs text-teal-100/80">Your recording stays on this device. It is never uploaded.</p>
      <div className="mt-4"><LabButton onClick={onDone} hot>{recorder.state === 'recorded' ? 'Finish this lock' : 'Skip and finish this lock'}</LabButton></div>
    </div>
  );
}

/* ------------------------------------------------------------------ the whole game */

export function SoundLabGame({ onBack, seed: seedProp, speak }: Props) {
  const [seed, setSeed] = useState(() => seedProp ?? Math.floor(Math.random() * 1e9));
  const [screen, setScreen] = useState<'map' | 'play' | 'result'>('map');
  const [lockIdx, setLockIdx] = useState(0);
  const [result, setResult] = useState<{ mistakes: number; units: number; stars: number } | null>(null);
  const [progress, setProgress] = useState(() => getGameProgress(SOUND_LAB_ID));
  const [sparks, fireSparks] = useSparks();
  const frame = useRef<HTMLDivElement | null>(null);
  const shake = useAnimationControls();

  const say: SayFn = useCallback(async (word, voice = 'teacher') => {
    if (speak) { await speak(word, voice); return; }
    await safeSpeak(word, voice);
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
    if (!reduce) void shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } });
  }, [shake]);

  const total = overallStars(progress.stageStars, CONTRASTS.length);
  const finish = (r: { mistakes: number; units: number }) => {
    const stars = starsFor(r.mistakes, r.units);
    setProgress(recordStageResult(SOUND_LAB_ID, lockIdx, stars, CONTRASTS.length));
    setResult({ ...r, stars });
    setScreen('result');
  };
  const startLock = (i: number) => { setLockIdx(i); setSeed((s) => (seedProp !== undefined ? seedProp : s + 1)); setScreen('play'); };

  return (
    <MotionConfig reducedMotion="user">
      <motion.div ref={frame} animate={shake} className="relative isolate overflow-hidden rounded-3xl border border-teal-300/30 text-white shadow-2xl" style={{ minHeight: 520 }}>
        <LabBackdrop />
        <Sparks items={sparks} />
        <div className="relative z-10 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {screen === 'map' && (
              <motion.div key="map" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                {onBack && <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-teal-100 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back</button>}
                <div className="flex flex-wrap items-center gap-3">
                  <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2.6, repeat: Infinity }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-teal-300 to-cyan-600 text-white shadow-lg" aria-hidden="true"><Ear className="h-8 w-8" /></motion.div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Sound Lab</h1>
                    <p className="text-sm text-teal-50 sm:text-base">Train your ears first: pick the pin, crack the lock. Four sounds that change the meaning of a word.</p>
                  </div>
                  {total > 0 && <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-bold"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /> {total}/3</span>}
                </div>
                <div className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="How a lock works">
                  {[['Listen', 'Hear the two sounds in three voices.'], ['Pick', 'Hear one word. Which pin is it?'], ['Same?', 'Two words: same word or different?'], ['Say it', 'Optional and private: record and compare.']].map(([k, t], n) => (
                    <div key={k} title={t} className="rounded-2xl border border-white/10 bg-white/[.07] p-2 text-center sm:p-3 sm:text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 sm:text-xs"><span className="hidden sm:inline">{n + 1} · </span>{k}</p>
                      <p className="mt-1 hidden text-xs leading-snug text-teal-50 sm:block">{t}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {CONTRASTS.map((c, i) => {
                    const locked = i > progress.unlocked;
                    const stars = progress.stageStars[i] ?? 0;
                    return (
                      <motion.button
                        key={c.id}
                        type="button"
                        disabled={locked}
                        onClick={() => startLock(i)}
                        aria-label={`${locked ? 'Locked: ' : ''}${c.name}`}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: locked ? 0.55 : 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 260, damping: 18 }}
                        whileHover={locked ? undefined : { scale: 1.03, y: -3 }}
                        whileTap={locked ? undefined : { scale: 0.96 }}
                        className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-br from-teal-600/60 to-cyan-800/50 p-4 text-left shadow-lg disabled:cursor-not-allowed"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/30 text-amber-300">{locked ? <Lock className="h-5 w-5" /> : stars > 0 ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5 opacity-50" />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold uppercase tracking-widest text-amber-300">Lock {i + 1}</span>
                          <span className="block text-lg font-extrabold leading-tight">{c.name}</span>
                          <span className="block text-xs text-teal-50">{c.a.label} · {c.b.label}</span>
                        </span>
                        <span className="flex shrink-0 gap-0.5" aria-label={`${stars} of 3 stars`}>
                          {[1, 2, 3].map((n) => <Star key={n} className={`h-4 w-4 ${n <= stars ? 'fill-amber-300 text-amber-300' : 'text-white/25'}`} />)}
                        </span>
                        {!locked && <Play className="h-5 w-5 shrink-0 text-white/80" />}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="mt-4 text-center text-xs text-teal-100/80">Your goal is to be understood, not to sound like anyone else. Nothing here is scored by a machine.</p>
              </motion.div>
            )}

            {screen === 'play' && (
              <motion.div key={`play-${lockIdx}-${seed}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <button type="button" onClick={() => setScreen('map')} className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-teal-100 hover:text-white"><ArrowLeft className="h-4 w-4" /> Map</button>
                <LockStage contrast={CONTRASTS[lockIdx]} seed={seed} say={say} spark={spark} nudge={nudge} onDone={finish} />
              </motion.div>
            )}

            {screen === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-xl text-center">
                <h2 className="text-2xl font-black sm:text-3xl">Lock {lockIdx + 1} open! {CONTRASTS[lockIdx].name}</h2>
                <div className="my-4 flex justify-center gap-2" aria-label={`${result.stars} of 3 stars`}>
                  {[1, 2, 3].map((n) => (
                    <motion.span key={n} initial={{ scale: 0, rotate: -40 }} animate={{ scale: n <= result.stars ? 1 : 0.8, rotate: 0 }} transition={{ delay: 0.25 * n, type: 'spring', stiffness: 300, damping: 12 }}>
                      <Star className={`h-14 w-14 ${n <= result.stars ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_14px_rgba(252,211,77,.8)]' : 'text-white/25'}`} />
                    </motion.span>
                  ))}
                </div>
                <p className="text-sm text-teal-50">{result.mistakes === 0 ? 'Every pin was right. Your ears are sharp!' : `${result.mistakes} slip${result.mistakes === 1 ? '' : 's'}. Come back tomorrow: hearing sounds gets faster with a little practice every day.`}</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <LabButton onClick={() => startLock(lockIdx)}><span className="flex items-center gap-2"><RotateCcw className="h-5 w-5" /> Play again</span></LabButton>
                  <LabButton onClick={() => (lockIdx + 1 < CONTRASTS.length ? startLock(lockIdx + 1) : setScreen('map'))} hot>{lockIdx + 1 < CONTRASTS.length ? `Next: ${CONTRASTS[lockIdx + 1].name}` : 'Back to the map'}</LabButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

export default SoundLabGame;

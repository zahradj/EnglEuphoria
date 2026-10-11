import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useAnimationControls } from 'framer-motion';
import { ArrowLeft, Ear, Lock, Mic, Play, RotateCcw, Square, Star } from 'lucide-react';
import { safeSpeak } from '@/content/playground-library/unit1/audio';
import { getGameProgress, overallStars, recordStageResult } from '@/content/playground-library/gameProgress';
import { starsFor } from '@/content/playground-library/gamesCatalog';
import { Sparks, rng, shuffled, useSparks } from '../verbForge/forgeUi';
import { LabButton, useRecorder } from '../soundLab/labUi';
import { TWISTERS, TWISTER_VOICES, wordsOf, type Twister, type TwisterVoice } from './twisterData';
import { checkSpelling, type SpellResult } from './spellCheck';

export const TWISTER_LAB_ID = 'twister-lab';
type SayFn = (text: string, voice?: TwisterVoice) => Promise<void>;
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

interface Props {
  onBack?: () => void;
  seed?: number;
  /** Say a registered line in a voice (default: the saved recorded clips). */
  speak?: (text: string, voice: TwisterVoice) => Promise<void>;
}

/** Cool-to-warm stage: a dark rose arena with an amber spotlight. */
function ArenaBackdrop() {
  const dots = Array.from({ length: 14 }, (_, i) => ({ left: (i * 67 + 5) % 100, top: (i * 41 + 9) % 100, delay: (i * 0.5) % 5, size: 3 + (i % 3) * 2 }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(110% 80% at 50% -10%, #831843 0%, #3b0a2e 45%, #12040f 90%)' }} />
      <div className="absolute left-1/2 top-0 h-full w-[70%] -translate-x-1/2" style={{ background: 'linear-gradient(180deg, rgba(251,191,36,.20), rgba(251,191,36,0) 70%)', clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0 100%)' }} />
      {dots.map((d, i) => (
        <motion.span key={i} className="absolute rounded-full bg-amber-200" style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }} animate={{ opacity: [0.1, 0.7, 0.1], y: [0, -12, 0] }} transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: d.delay, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

/** The twister with the trained sound's letters coloured (amber). */
export function FocusText({ text, focus, activeChunk }: { text: string; focus: string[]; activeChunk?: string }) {
  const tokens = [...focus].sort((a, b) => b.length - a.length).map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = tokens.length ? new RegExp(`(${tokens.join('|')})`, 'gi') : null;
  const parts = re ? text.split(re) : [text];
  const lower = new Set(focus.map((f) => f.toLowerCase()));
  const active = activeChunk && text.includes(activeChunk) ? [text.indexOf(activeChunk), text.indexOf(activeChunk) + activeChunk.length] : null;
  let pos = 0;
  return (
    <span>
      {parts.map((part, k) => {
        const start = pos;
        pos += part.length;
        const hot = active && start >= active[0] && start < active[1];
        const isFocus = lower.has(part.toLowerCase());
        return <span key={k} style={{ color: isFocus ? '#fcd34d' : undefined, textDecoration: hot ? 'underline' : undefined, textDecorationColor: '#f472b6', textUnderlineOffset: 6, textDecorationThickness: 3 }}>{part}</span>;
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ one twister = one stop */

type Phase = 'listen' | 'build' | 'spell' | 'say';
const PHASES: { id: Phase; label: string }[] = [
  { id: 'listen', label: 'Listen' }, { id: 'build', label: 'Build it' }, { id: 'spell', label: 'Spell it' }, { id: 'say', label: 'Say it' },
];

function TwisterStage({ twister, seed, say, spark, nudge, onDone }: { twister: Twister; seed: number; say: SayFn; spark: (el: Element | null) => void; nudge: () => void; onDone: (r: { mistakes: number; units: number }) => void }) {
  const [phase, setPhase] = useState<Phase>('listen');
  const [voice, setVoice] = useState<TwisterVoice>('teacher');
  const [buildMistakes, setBuildMistakes] = useState(0);
  const [spellMistakes, setSpellMistakes] = useState(0);
  const units = twister.chunks.length + wordsOf(twister.text).length;
  const sayV: SayFn = useCallback((t, v) => say(t, v ?? voice), [say, voice]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">{twister.level} · {twister.sound}</p>
          <h2 className="text-xl font-extrabold text-white sm:text-2xl">{twister.title}</h2>
        </div>
        <ol className="flex items-center gap-1.5 text-[11px] font-bold sm:text-xs" aria-label="Steps">
          {PHASES.map((p, i) => (
            <li key={p.id} className={`rounded-full px-2.5 py-1 ${p.id === phase ? 'bg-amber-300 text-slate-900' : PHASES.findIndex((x) => x.id === phase) > i ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}`}>{i + 1} {p.label}</li>
          ))}
        </ol>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={phase} initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.25 }}>
          {phase === 'listen' && <ListenStep twister={twister} voice={voice} setVoice={setVoice} say={sayV} onNext={() => setPhase('build')} />}
          {phase === 'build' && <BuildStep twister={twister} seed={seed} say={sayV} spark={spark} nudge={nudge} onMistake={() => setBuildMistakes((m) => m + 1)} onDone={() => setPhase('spell')} />}
          {phase === 'spell' && <SpellStep twister={twister} say={sayV} spark={spark} nudge={nudge} onFirstCheck={(errors) => setSpellMistakes(errors)} onDone={() => setPhase('say')} />}
          {phase === 'say' && <SayStep twister={twister} say={sayV} onDone={() => onDone({ mistakes: buildMistakes + spellMistakes, units })} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* 1 · Listen: chunk by chunk, then at speed */
function ListenStep({ twister, voice, setVoice, say, onNext }: { twister: Twister; voice: TwisterVoice; setVoice: (v: TwisterVoice) => void; say: SayFn; onNext: () => void }) {
  const [active, setActive] = useState<string | undefined>();
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const slow = async () => {
    for (const c of twister.chunks) {
      if (!alive.current) return;
      setActive(c);
      await say(c);
      await wait(550);
    }
    setActive(undefined);
  };
  return (
    <div>
      <div className="rounded-3xl border border-white/15 bg-white/[.07] p-5 text-center sm:p-7">
        <p className="text-2xl font-extrabold leading-relaxed text-white sm:text-4xl"><FocusText text={twister.text} focus={twister.focus} activeChunk={active} /></p>
        <p className="mt-2 text-xs text-amber-100/90">The <span className="font-bold text-amber-300">gold letters</span> are the sound you are training: {twister.sound}.</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2" aria-label="Chunks">
        {twister.chunks.map((c) => (
          <button key={c} type="button" onClick={() => void say(c)} className="rounded-full bg-white/15 px-4 py-2 text-base font-bold text-white hover:bg-white/25 active:scale-95">{c}</button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-white">
        Voice:
        {TWISTER_VOICES.map((v, k) => (
          <button key={v} type="button" aria-pressed={voice === v} aria-label={`Voice ${k + 1}`} onClick={() => setVoice(v)} className={`h-9 min-w-[44px] rounded-full text-xs font-bold ${voice === v ? 'bg-amber-300 text-slate-900' : 'bg-white/15 text-white'}`}>{k + 1}</button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <LabButton accent="rose" onClick={() => void slow()}><span className="flex items-center gap-2"><Ear className="h-5 w-5" /> Hear it slowly</span></LabButton>
        <LabButton accent="rose" onClick={() => void say(twister.text)}><span className="flex items-center gap-2"><Play className="h-5 w-5" /> Hear it at speed</span></LabButton>
      </div>
      <p className="mt-3 rounded-2xl bg-amber-300/10 px-4 py-2 text-center text-sm font-bold text-amber-100">How to say it: {twister.tip}</p>
      <div className="mt-4 text-center"><LabButton accent="rose" onClick={onNext} hot>I know how it sounds. Build it!</LabButton></div>
    </div>
  );
}

/* 2 · Build it from its chunks */
function BuildStep({ twister, seed, say, spark, nudge, onMistake, onDone }: { twister: Twister; seed: number; say: SayFn; spark: (el: Element | null) => void; nudge: () => void; onMistake: () => void; onDone: () => void }) {
  const order = useMemo(() => {
    const r = rng(seed + 5);
    let tries = 0;
    let s = shuffled(twister.chunks.map((c, i) => i), r);
    while (twister.chunks.length > 1 && s.every((v, i) => v === i) && tries++ < 5) s = shuffled(s, r); // never start already solved
    return s;
  }, [twister, seed]);
  const [built, setBuilt] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const done = built.length === twister.chunks.length;
  const tap = async (idx: number, el: Element) => {
    if (done || built.includes(idx)) return;
    if (idx === built.length) {
      spark(el);
      const next = [...built, idx];
      setBuilt(next);
      await say(twister.chunks[idx]);
      if (next.length === twister.chunks.length) { await wait(400); await say(twister.text); }
    } else {
      setWrong(idx); onMistake(); nudge();
      window.setTimeout(() => setWrong(null), 500);
    }
  };
  return (
    <div className="text-center">
      <p className="text-base font-bold text-white sm:text-lg">Tap the chunks in the right order. Listen as you go.</p>
      <div className="mx-auto mt-3 min-h-[64px] max-w-2xl rounded-3xl border-2 border-dashed border-white/30 bg-white/[.06] p-3 text-xl font-extrabold text-white sm:text-2xl" aria-label="Your chunks">
        {built.length === 0 ? <span className="text-white/40">…</span> : built.map((i) => <motion.span key={i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 360, damping: 14 }} className="mr-2 inline-block">{twister.chunks[i]}</motion.span>)}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {order.map((idx, k) => (
          <LabButton key={idx} accent="rose" index={k} ariaLabel={twister.chunks[idx]} tone={built.includes(idx) ? 'wrong' : wrong === idx ? 'wrong' : 'idle'} disabled={built.includes(idx) || done} onClick={(el) => void tap(idx, el)}>{twister.chunks[idx]}</LabButton>
        ))}
      </div>
      <div className="mt-5 min-h-[56px]">{done && <LabButton accent="rose" onClick={onDone} hot>Now spell it!</LabButton>}</div>
    </div>
  );
}

/* 3 · Spell it from memory, with correction */
function SpellStep({ twister, say, spark, nudge, onFirstCheck, onDone }: { twister: Twister; say: SayFn; spark: (el: Element | null) => void; nudge: () => void; onFirstCheck: (errors: number) => void; onDone: () => void }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SpellResult | null>(null);
  const [checks, setChecks] = useState(0);
  const [shown, setShown] = useState(false);
  const tipFor = (w: string) => twister.spellingTips.find((t) => t.word === w)?.tip;

  const check = (el: Element) => {
    const r = checkSpelling(text, twister.text);
    setResult(r);
    if (checks === 0) onFirstCheck(r.errors);
    setChecks((c) => c + 1);
    if (r.allRight) spark(el); else nudge();
  };
  const showAnswer = () => { setText(twister.text); setShown(true); setResult(null); };
  const finished = !!result?.allRight || shown;

  return (
    <div>
      <p className="text-center text-base font-bold text-white sm:text-lg">Write the twister from memory. Listen if you need to.</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <LabButton accent="rose" onClick={() => void say(twister.text)}><span className="flex items-center gap-2"><Ear className="h-5 w-5" /> Listen again</span></LabButton>
      </div>
      <label className="mt-3 block">
        <span className="sr-only">Your twister</span>
        <textarea
          aria-label="Your twister"
          value={text}
          onChange={(e) => { setText(e.target.value); if (result && !result.allRight) setResult(null); }}
          autoComplete="off" autoCapitalize="none" spellCheck={false}
          readOnly={shown}
          rows={3}
          placeholder="Type it here…"
          className="w-full rounded-2xl border-2 border-white/25 bg-white/10 p-4 text-xl font-bold text-white outline-none placeholder:text-white/40 focus:bg-white/15"
        />
      </label>
      {!finished && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <LabButton accent="rose" onClick={check} disabled={!text.trim()} hot={!!text.trim()}>Check my spelling</LabButton>
          {checks >= 2 && <LabButton accent="rose" onClick={showAnswer}>Show me the answer</LabButton>}
        </div>
      )}
      {result && (
        <div className="mt-4 rounded-3xl border border-white/15 bg-white/[.07] p-4" aria-label="Spelling correction">
          <p className="mb-2 text-sm font-bold" style={{ color: result.allRight ? '#6ee7b7' : '#fde68a' }}>{result.allRight ? 'Perfect spelling! Every word is right.' : `${result.errors} thing${result.errors === 1 ? '' : 's'} to fix. Look at the letters in gold.`}</p>
          <ul className="flex flex-wrap gap-2">
            {result.words.map((w, k) => (
              <li key={k} className="rounded-xl px-3 py-1.5 text-lg font-extrabold" style={{ background: w.status === 'ok' ? 'rgba(52,211,153,.18)' : 'rgba(251,191,36,.16)', color: w.status === 'ok' ? '#a7f3d0' : '#fde68a' }}>
                {w.status === 'ok' && w.expected}
                {w.status === 'spelling' && (
                  <span title={w.typed}>
                    <s className="mr-1 text-sm text-pink-200/80">{w.typed}</s>
                    {w.marks!.map((m, i) => <span key={i} style={m.fix ? { color: '#fbbf24', textDecoration: 'underline', textDecorationThickness: 3 } : undefined}>{m.ch}</span>)}
                    {(w.note || tipFor(w.expected)) && <span className="ml-1 block text-xs font-bold text-amber-100/90">{w.note ?? tipFor(w.expected)}</span>}
                  </span>
                )}
                {w.status === 'wrong' && <span><s className="mr-1 text-sm text-pink-200/80">{w.typed}</s>{w.expected}</span>}
                {w.status === 'missing' && <span><span className="mr-1 text-sm text-pink-200/80">missing</span>{w.expected}</span>}
              </li>
            ))}
            {result.extra.map((x, k) => <li key={`x${k}`} className="rounded-xl bg-pink-500/20 px-3 py-1.5 text-sm font-bold text-pink-100">extra word: <s>{x}</s></li>)}
          </ul>
        </div>
      )}
      <div className="mt-4 min-h-[56px] text-center">
        {finished && <LabButton accent="rose" onClick={onDone} hot>{shown ? 'I copied it. Next: say it!' : 'Next: say it!'}</LabButton>}
      </div>
    </div>
  );
}

/* 4 · Say it: three takes, private, never scored */
const TAKES = [
  { id: 'slow', title: '1 · Slowly', how: 'Say every sound. Take your time.' },
  { id: 'normal', title: '2 · Normal pace', how: 'Say it like talking to a friend.' },
  { id: 'fast', title: '3 · Faster', how: 'Faster, but every word must stay clear.' },
] as const;

function TakeCard({ take }: { take: (typeof TAKES)[number] }) {
  const rec = useRecorder();
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[.07] p-3 text-center">
      <p className="font-extrabold text-amber-200">{take.title}</p>
      <p className="mb-2 text-xs text-white/80">{take.how}</p>
      {rec.state !== 'recording' ? (
        <LabButton accent="rose" onClick={() => { rec.reset(); void rec.start(); }} disabled={!rec.supported}><span className="flex items-center gap-2"><Mic className="h-5 w-5" /> {rec.state === 'recorded' ? 'Record again' : 'Record'}</span></LabButton>
      ) : (
        <LabButton accent="rose" onClick={() => rec.stop()} hot><span className="flex items-center gap-2"><Square className="h-5 w-5" /> Stop</span></LabButton>
      )}
      {rec.state === 'recorded' && rec.url && <audio controls src={rec.url} aria-label={`Your take: ${take.title}`} className="mx-auto mt-2 w-full max-w-[260px]" />}
      {rec.state === 'denied' && rec.supported && <p className="mt-2 text-xs text-amber-200">The microphone is not allowed. You can skip.</p>}
    </div>
  );
}

function SayStep({ twister, say, onDone }: { twister: Twister; say: SayFn; onDone: () => void }) {
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const items = [['all', 'I said every word.'], ['sound', `My ${twister.sound} sound was clear.`], ['flow', 'I did not stop in the middle.']] as const;
  return (
    <div className="text-center">
      <p className="text-base font-bold text-white">Say it three ways. This is for you: it is not scored and your voice is not saved.</p>
      <p className="mt-2 text-xl font-extrabold text-white"><FocusText text={twister.text} focus={twister.focus} /></p>
      <div className="mt-3"><LabButton accent="rose" onClick={() => void say(twister.text)}><span className="flex items-center gap-2"><Ear className="h-5 w-5" /> Hear the model</span></LabButton></div>
      {!supported && <p className="mt-3 text-sm text-amber-200">This browser cannot record here. You can still practise out loud and skip the recording.</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">{TAKES.map((t) => <TakeCard key={t.id} take={t} />)}</div>
      <fieldset className="mx-auto mt-4 max-w-md rounded-2xl bg-white/[.07] p-3 text-left">
        <legend className="px-2 text-sm font-bold text-amber-200">Listen to yourself. Tick what is true:</legend>
        {items.map(([id, label]) => (
          <label key={id} className="flex items-center gap-2 py-1 text-white"><input type="checkbox" checked={!!checks[id]} onChange={(e) => setChecks((c) => ({ ...c, [id]: e.target.checked }))} className="h-5 w-5" /> {label}</label>
        ))}
        <p className="mt-2 text-xs text-white/80">One thing to change next time: {twister.tip}</p>
      </fieldset>
      <p className="mt-3 text-xs text-white/70">Your recordings stay on this device. They are never uploaded.</p>
      <div className="mt-4"><LabButton accent="rose" onClick={onDone} hot>Finish this twister</LabButton></div>
    </div>
  );
}

/* ------------------------------------------------------------------ the whole game */

export function TwisterGame({ onBack, seed: seedProp, speak }: Props) {
  const [seed, setSeed] = useState(() => seedProp ?? Math.floor(Math.random() * 1e9));
  const [screen, setScreen] = useState<'map' | 'play' | 'result'>('map');
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<{ mistakes: number; units: number; stars: number } | null>(null);
  const [progress, setProgress] = useState(() => getGameProgress(TWISTER_LAB_ID));
  const [sparks, fireSparks] = useSparks();
  const frame = useRef<HTMLDivElement | null>(null);
  const shake = useAnimationControls();

  const say: SayFn = useCallback(async (text, voice = 'teacher') => {
    if (speak) { await speak(text, voice); return; }
    await safeSpeak(text, voice);
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

  const total = overallStars(progress.stageStars, TWISTERS.length);
  const finish = (r: { mistakes: number; units: number }) => {
    const stars = starsFor(r.mistakes, r.units);
    setProgress(recordStageResult(TWISTER_LAB_ID, idx, stars, TWISTERS.length));
    setResult({ ...r, stars });
    setScreen('result');
  };
  const start = (i: number) => { setIdx(i); setSeed((s) => (seedProp !== undefined ? seedProp : s + 1)); setScreen('play'); };

  return (
    <MotionConfig reducedMotion="user">
      <motion.div ref={frame} animate={shake} className="relative isolate overflow-hidden rounded-3xl border border-pink-300/30 text-white shadow-2xl" style={{ minHeight: 520 }}>
        <ArenaBackdrop />
        <Sparks items={sparks} />
        <div className="relative z-10 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {screen === 'map' && (
              <motion.div key="map" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                {onBack && <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-pink-100 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back</button>}
                <div className="flex flex-wrap items-center gap-3">
                  <motion.div animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 1.4, repeat: Infinity }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-300 to-pink-500 text-white shadow-lg" aria-hidden="true"><Mic className="h-8 w-8" /></motion.div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Twister Lab</h1>
                    <p className="text-sm text-pink-50 sm:text-base">Hear it, build it, spell it, say it. Clear first, fast later.</p>
                  </div>
                  {total > 0 && <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-bold"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /> {total}/3</span>}
                </div>
                <div className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="How a twister works">
                  {[['Listen', 'Chunk by chunk, then at speed.'], ['Build', 'Put the chunks in order.'], ['Spell', 'Write it from memory. Get corrected.'], ['Say it', 'Record three takes. Private.']].map(([k, t], n) => (
                    <div key={k} title={t} className="rounded-2xl border border-white/10 bg-white/[.07] p-2 text-center sm:p-3 sm:text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 sm:text-xs"><span className="hidden sm:inline">{n + 1} · </span>{k}</p>
                      <p className="mt-1 hidden text-xs leading-snug text-pink-50 sm:block">{t}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {TWISTERS.map((t, i) => {
                    const locked = i > progress.unlocked;
                    const stars = progress.stageStars[i] ?? 0;
                    return (
                      <motion.button
                        key={t.id}
                        type="button"
                        disabled={locked}
                        onClick={() => start(i)}
                        aria-label={`${locked ? 'Locked: ' : ''}${t.title}`}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: locked ? 0.55 : 1, scale: 1 }}
                        transition={{ delay: 0.08 + i * 0.05, type: 'spring', stiffness: 260, damping: 18 }}
                        whileHover={locked ? undefined : { scale: 1.03, y: -3 }}
                        whileTap={locked ? undefined : { scale: 0.96 }}
                        className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-br from-pink-600/60 to-fuchsia-900/50 p-4 text-left shadow-lg disabled:cursor-not-allowed"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/30 text-lg font-black text-amber-300">{locked ? <Lock className="h-5 w-5" /> : i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold uppercase tracking-widest text-amber-300">{t.level} · {t.sound}</span>
                          <span className="block text-lg font-extrabold leading-tight">{t.title}</span>
                        </span>
                        <span className="flex shrink-0 gap-0.5" aria-label={`${stars} of 3 stars`}>
                          {[1, 2, 3].map((n) => <Star key={n} className={`h-4 w-4 ${n <= stars ? 'fill-amber-300 text-amber-300' : 'text-white/25'}`} />)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                <p className="mt-4 text-center text-xs text-pink-100/80">Everything you hear is a saved recording. Nothing is scored by a machine, and your voice never leaves your device.</p>
              </motion.div>
            )}

            {screen === 'play' && (
              <motion.div key={`play-${idx}-${seed}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <button type="button" onClick={() => setScreen('map')} className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-pink-100 hover:text-white"><ArrowLeft className="h-4 w-4" /> Map</button>
                <TwisterStage twister={TWISTERS[idx]} seed={seed} say={say} spark={spark} nudge={nudge} onDone={finish} />
              </motion.div>
            )}

            {screen === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-xl text-center">
                <h2 className="text-2xl font-black sm:text-3xl">{TWISTERS[idx].title} done!</h2>
                <div className="my-4 flex justify-center gap-2" aria-label={`${result.stars} of 3 stars`}>
                  {[1, 2, 3].map((n) => (
                    <motion.span key={n} initial={{ scale: 0, rotate: -40 }} animate={{ scale: n <= result.stars ? 1 : 0.8, rotate: 0 }} transition={{ delay: 0.25 * n, type: 'spring', stiffness: 300, damping: 12 }}>
                      <Star className={`h-14 w-14 ${n <= result.stars ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_14px_rgba(252,211,77,.8)]' : 'text-white/25'}`} />
                    </motion.span>
                  ))}
                </div>
                <p className="text-sm text-pink-50">{result.mistakes === 0 ? 'Perfect build and perfect spelling!' : `${result.mistakes} slip${result.mistakes === 1 ? '' : 's'} in the building and spelling. Try it again tomorrow: it gets easier every time.`}</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <LabButton accent="rose" onClick={() => start(idx)}><span className="flex items-center gap-2"><RotateCcw className="h-5 w-5" /> Play again</span></LabButton>
                  <LabButton accent="rose" onClick={() => (idx + 1 < TWISTERS.length ? start(idx + 1) : setScreen('map'))} hot>{idx + 1 < TWISTERS.length ? `Next: ${TWISTERS[idx + 1].title}` : 'Back to the map'}</LabButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

export default TwisterGame;

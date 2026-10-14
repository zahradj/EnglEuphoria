import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Volume2 } from 'lucide-react';
import { ForgeButton, StopHeader, rng, shuffled } from '../verbForge/forgeUi';
import { useRecorder } from '../soundLab/labUi';
import { DOCTORS, ECHOES, NINJAS, ODDS, RHYMES, doctorOptions, doctorSentence, rhymeOptions } from './soundData';

export interface StageProps {
  seed: number;
  say: (text: string) => Promise<void>;
  spark: (el: Element | null) => void;
  nudge: () => void;
  onDone: (result: { mistakes: number; units: number }) => void;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const GOLD = '#fcd34d';

function useRounds(count: number, onDone: StageProps['onDone']) {
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const slip = () => setMistakes((m) => m + 1);
  const advance = () => {
    if (i + 1 >= count) onDone({ mistakes, units: count });
    else setI(i + 1);
  };
  return { i, mistakes, slip, advance };
}

/* ------------------------------------------------------------------ 1 · Rhyme Roulette */

export function RhymeStage({ seed, say, spark, nudge, onDone }: StageProps) {
  const rounds = useMemo(() => { const r = rng(seed); return shuffled(RHYMES, r).slice(0, 8).map((x) => ({ x, options: shuffled(rhymeOptions(x), r) })); }, [seed]);
  const { i, slip, advance } = useRounds(rounds.length, onDone);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const { x, options } = rounds[i];

  useEffect(() => { void say(x.word); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (o: string, el: Element) => {
    if (right || wrong.includes(o)) return;
    if (o === x.answer) {
      setRight(true); spark(el); await say(o); await wait(1400);
      setRight(false); setWrong([]); advance();
    } else { setWrong((w) => [...w, o]); slip(); nudge(); void say(o); }
  };
  return (
    <div>
      <StopHeader title="Rhyme Roulette" sub={`Which word rhymes? · ${i + 1} of ${rounds.length}`} done={i} total={rounds.length} />
      <div className="rounded-3xl border border-white/15 bg-white/[.07] p-5 text-center">
        <motion.p key={x.id} initial={{ scale: 0.6, rotate: -4 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }} className="text-5xl font-black text-white sm:text-6xl">{x.word}</motion.p>
        <button type="button" onClick={() => void say(x.word)} aria-label={`Hear ${x.word}`} className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25"><Volume2 className="h-4 w-4" /> Hear it again</button>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {options.map((o, k) => (
          <ForgeButton key={`${x.id}-${o}`} index={k} ariaLabel={o} tone={o === x.answer && right ? 'right' : wrong.includes(o) ? 'wrong' : 'idle'} disabled={right || wrong.includes(o)} onClick={(el) => void pick(o, el)}>{o}</ForgeButton>
        ))}
      </div>
      <p className="mt-3 min-h-[40px] text-center text-sm font-bold text-amber-100">
        {right ? <span><b style={{ color: GOLD }}>{x.word}</b> rhymes with <b className="text-white">{x.answer}</b>: {x.pattern}.</span> : wrong.length > 0 ? 'Listen: it must sound the same at the end, whatever the spelling.' : null}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ 2 · Odd One Out */

export function OddStage({ seed, say, spark, nudge, onDone }: StageProps) {
  const rounds = useMemo(() => { const r = rng(seed + 3); return shuffled(ODDS, r).slice(0, 6).map((x) => ({ x, words: shuffled([...x.words], r) })); }, [seed]);
  const { i, slip, advance } = useRounds(rounds.length, onDone);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const { x, words } = rounds[i];

  const hearAll = async () => { for (const w of words) { await say(w); await wait(250); } };
  useEffect(() => { void hearAll(); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (w: string, el: Element) => {
    if (right || wrong.includes(w)) return;
    if (w === x.odd) {
      setRight(true); spark(el); await wait(1800);
      setRight(false); setWrong([]); advance();
    } else { setWrong((a) => [...a, w]); slip(); nudge(); void say(w); }
  };
  return (
    <div>
      <StopHeader title="Odd One Out" sub={`Which vowel sound is different? · ${i + 1} of ${rounds.length}`} done={i} total={rounds.length} />
      <p className="mb-3 text-center text-sm text-white/80">Tap a word to hear it. Pick the one that does not sound like the others.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {words.map((w, k) => {
          const isRight = right && w === x.odd;
          const isWrong = wrong.includes(w);
          return (
            <motion.button key={`${x.id}-${w}`} type="button" aria-label={w} disabled={right || isWrong} onClick={(e) => void pick(w, e.currentTarget)}
              initial={{ opacity: 0, y: 24 }} animate={isWrong ? { x: [0, -7, 7, -4, 4, 0], opacity: 0.45, y: 0 } : { opacity: 1, y: 0, rotate: isRight ? [0, -6, 6, 0] : 0 }} transition={isWrong ? { duration: 0.45 } : isRight ? { duration: 0.5 } : { type: 'spring', stiffness: 280, damping: 16, delay: k * 0.07 }}
              whileTap={{ scale: 0.93 }}
              className="min-h-[72px] rounded-2xl border-2 border-white/25 px-3 text-2xl font-extrabold text-white" style={{ background: isRight ? 'linear-gradient(180deg,#34d399,#059669)' : 'linear-gradient(180deg,#a21caf,#701a75)' }}>
              {w}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-3 text-center"><button type="button" onClick={() => void hearAll()} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25"><Volume2 className="h-4 w-4" /> Hear all four</button></div>
      <p className="mt-3 min-h-[40px] text-center text-sm font-bold text-amber-100">{right ? x.sound : wrong.length > 0 ? 'Not that one. Say them in your head: which vowel is different?' : null}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ 3 · Silent Ninja */

export function NinjaStage({ seed, say, spark, nudge, onDone }: StageProps) {
  const rounds = useMemo(() => shuffled(NINJAS, rng(seed + 7)), [seed]);
  const { i, slip, advance } = useRounds(rounds.length, onDone);
  const [wrong, setWrong] = useState<number[]>([]);
  const [right, setRight] = useState(false);
  const n = rounds[i];

  useEffect(() => { void say(n.word); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (k: number, el: Element) => {
    if (right || wrong.includes(k)) return;
    if (k === n.index) {
      setRight(true); spark(el); await say(n.word); await wait(1500);
      setRight(false); setWrong([]); advance();
    } else { setWrong((w) => [...w, k]); slip(); nudge(); }
  };
  return (
    <div>
      <StopHeader title="Silent Ninja" sub={`Catch the silent letter · ${i + 1} of ${rounds.length}`} done={i} total={rounds.length} />
      <p className="mb-3 text-center text-sm text-white/80">Listen to the word. Tap the letter you do not say.</p>
      <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Letters">
        {[...n.word].map((ch, k) => {
          const isRight = right && k === n.index;
          const isWrong = wrong.includes(k);
          return (
            <motion.button key={`${n.id}-${k}`} type="button" aria-label={`letter ${ch} position ${k + 1}`} disabled={right || isWrong} onClick={(e) => void pick(k, e.currentTarget)}
              initial={{ opacity: 0, y: -30 }} animate={isRight ? { opacity: 0.35, scale: [1, 1.4, 0.8], y: 0 } : isWrong ? { x: [0, -6, 6, 0], opacity: 0.5, y: 0 } : { opacity: 1, y: [0, -5, 0] }} transition={isRight || isWrong ? { duration: 0.5 } : { delay: k * 0.05, y: { repeat: Infinity, duration: 2 + (k % 3) * 0.3 } }}
              whileTap={{ scale: 0.88 }}
              className="h-16 w-14 rounded-xl border-2 text-4xl font-black text-white sm:h-20 sm:w-16 sm:text-5xl" style={{ borderColor: isRight ? '#34d399' : 'rgba(255,255,255,.35)', background: isRight ? 'rgba(52,211,153,.3)' : 'rgba(255,255,255,.1)', textDecoration: isRight ? 'line-through' : undefined }}>
              {ch}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-3 text-center"><button type="button" onClick={() => void say(n.word)} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25"><Volume2 className="h-4 w-4" /> Hear it again</button></div>
      <p className="mt-3 min-h-[40px] text-center text-sm font-bold text-amber-100">{right ? n.note : wrong.length > 0 ? 'That letter is pronounced. Say the word slowly.' : null}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ 4 · Spelling Doctor */

export function DoctorStage({ seed, say, spark, nudge, onDone }: StageProps) {
  const rounds = useMemo(() => { const r = rng(seed + 11); return shuffled(DOCTORS, r).slice(0, 8).map((d) => ({ d, options: shuffled(doctorOptions(d), r) })); }, [seed]);
  const { i, slip, advance } = useRounds(rounds.length, onDone);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const { d, options } = rounds[i];
  const [before, after] = d.text.split('___');

  const pick = async (o: string, el: Element) => {
    if (right || wrong.includes(o)) return;
    if (o === d.answer) {
      setRight(true); spark(el); await say(doctorSentence(d)); await wait(1200);
      setRight(false); setWrong([]); advance();
    } else { setWrong((w) => [...w, o]); slip(); nudge(); }
  };
  return (
    <div>
      <StopHeader title="Spelling Doctor" sub={`Cure the silly sentence · ${i + 1} of ${rounds.length}`} done={i} total={rounds.length} />
      <div className="rounded-3xl border border-white/15 bg-white/[.07] p-5 text-center text-2xl font-extrabold leading-relaxed text-white sm:text-3xl">
        {before}
        <motion.span key={String(right)} initial={{ scale: 0.7, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="mx-1 inline-block min-w-[110px] rounded-xl border-b-4 px-2" style={{ borderColor: right ? '#34d399' : 'rgba(255,255,255,.5)', color: right ? '#6ee7b7' : 'transparent' }}>{right ? d.answer : '___'}</motion.span>
        {after}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {options.map((o, k) => (
          <ForgeButton key={`${d.id}-${o}`} index={k} ariaLabel={o} tone={o === d.answer && right ? 'right' : wrong.includes(o) ? 'wrong' : 'idle'} disabled={right || wrong.includes(o)} onClick={(el) => void pick(o, el)}>{o}</ForgeButton>
        ))}
      </div>
      <p className="mt-3 min-h-[40px] text-center text-sm font-bold text-amber-100">{right ? d.tip : wrong.length > 0 ? 'That spelling does not match the sound. Think of the pattern.' : null}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ 5 · Parrot Echo (private, never scored) */

function EchoCard({ pair, say }: { pair: (typeof ECHOES)[number]; say: StageProps['say'] }) {
  const rec = useRecorder();
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const items = [['clear', 'Both words were clear.'], ['rhyme', 'They sounded the same at the end.']] as const;
  return (
    <div className="rounded-3xl border border-white/15 bg-white/[.07] p-4 text-center">
      <p className="text-3xl font-black text-white">{pair.a} <span style={{ color: GOLD }}>·</span> {pair.b}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => void say(pair.a)} aria-label={`Hear ${pair.a}`} className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/25"><Volume2 className="h-4 w-4" /> {pair.a}</button>
        <button type="button" onClick={() => void say(pair.b)} aria-label={`Hear ${pair.b}`} className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/25"><Volume2 className="h-4 w-4" /> {pair.b}</button>
      </div>
      <p className="mt-2 text-xs text-amber-100">{pair.tip}</p>
      <div className="mt-3">
        {rec.state !== 'recording'
          ? <ForgeButton onClick={() => { rec.reset(); void rec.start(); }} disabled={!rec.supported}><span className="flex items-center gap-2"><Mic className="h-5 w-5" /> {rec.state === 'recorded' ? 'Record again' : 'Record both words'}</span></ForgeButton>
          : <ForgeButton onClick={() => rec.stop()} hot><span className="flex items-center gap-2"><Square className="h-5 w-5" /> Stop</span></ForgeButton>}
      </div>
      {rec.state === 'recorded' && rec.url && <audio controls src={rec.url} aria-label={`Your take: ${pair.a} and ${pair.b}`} className="mx-auto mt-2 w-full max-w-[260px]" />}
      {rec.state === 'denied' && <p className="mt-2 text-xs text-amber-200">The microphone is not allowed. You can skip.</p>}
      <fieldset className="mx-auto mt-2 max-w-xs text-left">
        {items.map(([id, label]) => (
          <label key={id} className="flex items-center gap-2 py-0.5 text-sm text-white"><input type="checkbox" checked={!!checks[id]} onChange={(e) => setChecks((c) => ({ ...c, [id]: e.target.checked }))} className="h-4 w-4" /> {label}</label>
        ))}
      </fieldset>
    </div>
  );
}

export function EchoStage({ seed, say, onDone }: StageProps) {
  const pairs = useMemo(() => shuffled(ECHOES, rng(seed + 13)).slice(0, 3), [seed]);
  const finished = useRef(false);
  return (
    <div>
      <StopHeader title="Parrot Echo" sub="Say it like the parrot. Private." done={0} total={pairs.length} />
      <p className="mb-3 text-center text-sm text-white/80">Listen, record yourself, then listen to you. It is not scored and your voice is never uploaded.</p>
      <div className="grid gap-3 sm:grid-cols-3">{pairs.map((p) => <EchoCard key={p.id} pair={p} say={say} />)}</div>
      <p className="mt-3 text-center text-xs text-white/70">Your recordings stay on this device.</p>
      <div className="mt-3 text-center"><ForgeButton hot onClick={() => { if (!finished.current) { finished.current = true; onDone({ mistakes: 0, units: pairs.length }); } }}>Finish the circus</ForgeButton></div>
    </div>
  );
}

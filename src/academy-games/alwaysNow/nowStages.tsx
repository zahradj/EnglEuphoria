import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { isDue, review, writeVaultFor, type StageProps } from './nowMemory';
import { ForgeButton, StopHeader, rng, shuffled } from '../verbForge/forgeUi';
import {
  FUNNY, GATES, JUDGES, MONSTERS, RECALLS, SORT_CUES, SPELLS, STATIVES, TENSE, gateAnswer, gateSentence, recallSentence, spellOptions, spellSentence,
  type GateRound, type Tense,
} from './nowData';

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const norm = (s: string) => s.trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');

/* ------------------------------------------------------------------ one generic "choose" stage */

interface ChoiceRound {
  key: string;
  prompt: ReactNode;
  options: string[];
  answer: string;
  /** Said when the answer is right (a recorded clip). */
  say: string;
  /** Said when the round appears (ears first), if any. */
  sayFirst?: string;
  explain: ReactNode;
  hint?: ReactNode;
}

function ChoiceStage({ title, sub, rounds, big, pause = 1300, spark, nudge, say, onDone }: { title: string; sub: string; rounds: ChoiceRound[]; big?: boolean; pause?: number } & Pick<StageProps, 'spark' | 'nudge' | 'say' | 'onDone'>) {
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const r = rounds[i];

  useEffect(() => { if (r.sayFirst) void say(r.sayFirst); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (o: string, el: Element) => {
    if (right || wrong.includes(o)) return;
    if (o === r.answer) {
      setRight(true); spark(el);
      await say(r.say);
      await wait(pause);
      if (i + 1 >= rounds.length) { onDone({ mistakes, units: rounds.length }); return; }
      setI(i + 1); setWrong([]); setRight(false);
    } else {
      setWrong((x) => [...x, o]); setMistakes((m) => m + 1); nudge();
    }
  };
  return (
    <div>
      <StopHeader title={title} sub={`${sub} · ${i + 1} of ${rounds.length}`} done={i} total={rounds.length} />
      <div className={`rounded-3xl border border-white/15 bg-white/[.07] p-5 text-center font-extrabold leading-relaxed text-white ${big ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>{r.prompt}</div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {r.options.map((o, k) => (
          <ForgeButton key={`${r.key}-${o}`} index={k} ariaLabel={o} tone={o === r.answer && right ? 'right' : wrong.includes(o) ? 'wrong' : 'idle'} disabled={right || wrong.includes(o)} onClick={(el) => void pick(o, el)}>{o}</ForgeButton>
        ))}
      </div>
      <p className="mt-3 min-h-[40px] text-center text-sm font-bold text-amber-100">{right ? r.explain : wrong.length > 0 ? (r.hint ?? 'Not that one. Look at the cue words.') : null}</p>
    </div>
  );
}

const Blank = ({ right, text, color }: { right: boolean; text: string; color: string }) => (
  <motion.span key={String(right)} initial={{ scale: 0.7, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="mx-1 inline-block min-w-[110px] rounded-xl border-b-4 px-2" style={{ borderColor: right ? color : 'rgba(255,255,255,.5)', color: right ? color : 'transparent' }}>{right ? text : '___'}</motion.span>
);

function SentenceStage({ title, sub, source, count, seed, funny, spark, nudge, say, onDone }: { title: string; sub: string; source: GateRound[]; count: number; seed: number; funny?: boolean } & Pick<StageProps, 'spark' | 'nudge' | 'say' | 'onDone'>) {
  const picked = useMemo(() => {
    const r = rng(seed);
    return shuffled(source, r).slice(0, count).map((g) => ({ g, options: shuffled([g.simple, g.continuous], r) }));
  }, [seed, source, count]);
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const { g, options } = picked[i];
  const answer = gateAnswer(g);
  const [before, after] = g.text.split('___');
  const color = TENSE[g.tense].hex;

  const pick = async (o: string, el: Element) => {
    if (right || wrong.includes(o)) return;
    if (o === answer) {
      setRight(true); spark(el);
      await say(gateSentence(g));
      await wait(funny ? 1500 : 1000);
      if (i + 1 >= picked.length) { onDone({ mistakes, units: picked.length }); return; }
      setI(i + 1); setWrong([]); setRight(false);
    } else {
      setWrong((x) => [...x, o]); setMistakes((m) => m + 1); nudge();
    }
  };
  return (
    <div>
      <StopHeader title={title} sub={`${sub} · ${i + 1} of ${picked.length}`} done={i} total={picked.length} />
      <p className="mb-2 text-center text-sm font-bold text-cyan-200">{g.context}</p>
      <div className="rounded-3xl border border-white/15 bg-white/[.07] p-5 text-center text-2xl font-extrabold leading-relaxed text-white sm:text-3xl">
        {before}<Blank right={right} text={answer} color={color} />{after}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {options.map((o, k) => (
          <ForgeButton key={`${g.id}-${o}`} index={k} ariaLabel={o} tone={o === answer && right ? 'right' : wrong.includes(o) ? 'wrong' : 'idle'} disabled={right || wrong.includes(o)} onClick={(el) => void pick(o, el)}>{o}</ForgeButton>
        ))}
      </div>
      <p className="mt-3 min-h-[40px] text-center text-sm font-bold text-amber-100">
        {right ? <span><b style={{ color }}>{g.cue}</b> → {TENSE[g.tense].label} ({TENSE[g.tense].idea}){funny ? ' · What a scene!' : ''}</span> : wrong.length > 0 ? 'Hint: find the cue words in the sentence.' : null}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ 1 · Cue Sort */

export function SortStage(p: StageProps) {
  const rounds = useMemo(() => {
    const r = rng(p.seed);
    return shuffled(SORT_CUES, r).slice(0, 10).map((c): ChoiceRound => ({
      key: c.text, prompt: <span style={{ color: TENSE[c.tense].hex }} className="text-white">{c.text}</span>, options: [TENSE.simple.short, TENSE.continuous.short], answer: TENSE[c.tense].short,
      say: c.text, sayFirst: c.text,
      explain: <span><b style={{ color: TENSE[c.tense].hex }}>{c.text}</b> goes with {TENSE[c.tense].label}: {TENSE[c.tense].idea}.</span>,
      hint: 'Think: is it a habit (Always) or happening now (Now)?',
    }));
  }, [p.seed]);
  return <ChoiceStage {...p} title="Cue Sort" sub="Always or Now?" rounds={rounds} big pause={1100} />;
}

/* ------------------------------------------------------------------ 2 · Scene Check */

export function SceneStage(p: StageProps) { return <SentenceStage {...p} title="Scene Check" sub="Read the cue" source={GATES} count={10} />; }

/* ------------------------------------------------------------------ 3 · Funny Reporter */

export function FunnyStage(p: StageProps) { return <SentenceStage {...p} title="Funny Reporter" sub="Silly news" source={FUNNY} count={8} funny />; }

/* ------------------------------------------------------------------ Monster Contrast */

export function MonsterStage(p: StageProps) { return <SentenceStage {...p} title="Monster Contrast" sub="Habit vs right now" source={MONSTERS} count={8} funny />; }

/* ------------------------------------------------------------------ Silly Judge */

export function JudgeStage({ seed, spark, nudge, say, onDone }: StageProps) {
  const rounds = useMemo(() => shuffled(JUDGES, rng(seed + 17)), [seed]);
  const [i, setI] = useState(0);
  const [step, setStep] = useState<'judge' | 'fix' | 'done'>('judge');
  const [wrong, setWrong] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const r = rounds[i];
  const color = TENSE[r.tense].hex;
  const next = async () => {
    await wait(1400);
    if (i + 1 >= rounds.length) { onDone({ mistakes, units: rounds.length }); return; }
    setI(i + 1); setStep('judge'); setWrong([]);
  };
  const judge = async (saysRight: boolean, el: Element) => {
    if (step !== 'judge') return;
    if (saysRight === r.ok) {
      spark(el);
      if (r.ok) { setStep('done'); await say(r.fixed); await next(); } else setStep('fix');
    } else { setMistakes((m) => m + 1); nudge(); }
  };
  const options = useMemo(() => shuffled([r.wrongForm, r.rightForm].filter((x, k, a) => a.indexOf(x) === k), rng(seed + i)), [r, seed, i]);
  const fix = async (o: string, el: Element) => {
    if (step !== 'fix' || wrong.includes(o)) return;
    if (o === r.rightForm) { spark(el); setStep('done'); await say(r.fixed); await next(); }
    else { setWrong((x) => [...x, o]); setMistakes((m) => m + 1); nudge(); }
  };
  return (
    <div>
      <StopHeader title="Silly Judge" sub={`Is the verb right? · ${i + 1} of ${rounds.length}`} done={i} total={rounds.length} />
      <div className="rounded-3xl border border-white/15 bg-white/[.07] p-5 text-center text-2xl font-extrabold leading-relaxed text-white sm:text-3xl">
        {step === 'done' ? r.fixed : r.text}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {step === 'judge' && (
          <>
            <ForgeButton index={0} onClick={(el) => void judge(true, el)}>The verb is right</ForgeButton>
            <ForgeButton index={1} onClick={(el) => void judge(false, el)}>Fix the verb</ForgeButton>
          </>
        )}
        {step === 'fix' && options.map((o, k) => (
          <ForgeButton key={`${r.id}-${o}`} index={k} ariaLabel={o} tone={wrong.includes(o) ? 'wrong' : 'idle'} disabled={wrong.includes(o)} onClick={(el) => void fix(o, el)}>{o}</ForgeButton>
        ))}
      </div>
      <p className="mt-3 min-h-[40px] text-center text-sm font-bold text-amber-100">
        {step === 'fix' && <span>Which form does <b style={{ color }}>{r.cue}</b> need?</span>}
        {step === 'done' && <span><b style={{ color }}>{r.cue}</b> → {TENSE[r.tense].label}. {r.ok ? 'It was right already: silly, but correct!' : 'Fixed!'}</span>}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ 4 · Spell It */

export function SpellStage(p: StageProps) {
  const rounds = useMemo(() => {
    const r = rng(p.seed + 5);
    const s = shuffled(SPELLS.filter((x) => x.kind === 's'), r).slice(0, 4);
    const ing = shuffled(SPELLS.filter((x) => x.kind === 'ing'), r).slice(0, 4);
    return shuffled([...s, ...ing], r).map((x): ChoiceRound => ({
      key: x.id, options: shuffled(spellOptions(x), r), answer: x.correct, say: spellSentence(x),
      prompt: <span>{x.frame.replace('___', '…')} <span style={{ color: TENSE.simple.hex }} className="whitespace-nowrap">({x.base})</span></span>,
      explain: <span>{x.base} → <b className="text-white">{x.correct}</b>. {x.rule}</span>,
      hint: 'Look at how the verb ends.',
    }));
  }, [p.seed]);
  return <ChoiceStage {...p} title="Spell It" sub="-s and -ing" rounds={rounds} pause={1500} />;
}

/* ------------------------------------------------------------------ 5 · No -ing Club */

export function StativeStage(p: StageProps) {
  const rounds = useMemo(() => {
    const r = rng(p.seed + 9);
    return shuffled(STATIVES, r).map((x): ChoiceRound => ({
      key: x.id, options: shuffled([x.right, x.wrong], r), answer: x.right, say: x.right,
      prompt: <span className="text-xl sm:text-2xl">Which sentence is correct?</span>,
      explain: <span><b className="text-white">{x.verb}</b> is a state verb: use the present simple, never -ing.</span>,
      hint: 'State verbs (know, like, want, love, need) do not take -ing.',
    }));
  }, [p.seed]);
  return <ChoiceStage {...p} title="No -ing Club" sub="State verbs" rounds={rounds} pause={1400} />;
}

/* ------------------------------------------------------------------ 6 · Recall */

const RECALL_COUNT = 8;

export function RecallStage({ seed, vault, setVault, say, spark, nudge, onDone }: StageProps) {
  const items = useMemo(() => {
    const r = rng(seed + 31);
    const order = shuffled(RECALLS, r);
    const due = order.filter((x) => vault[`ps:${x.id}`] && isDue(vault, `ps:${x.id}`));
    const fresh = order.filter((x) => !vault[`ps:${x.id}`]);
    const rest = order.filter((x) => !due.includes(x) && !fresh.includes(x));
    return [...due.sort((a, b) => vault[`ps:${a.id}`].box - vault[`ps:${b.id}`].box), ...fresh, ...rest].slice(0, RECALL_COUNT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [tries, setTries] = useState(0);
  const [state, setState] = useState<'ask' | 'right' | 'shown'>('ask');
  const [mistakes, setMistakes] = useState(0);
  const vaultRef = useRef(vault);
  vaultRef.current = vault;
  const x = items[i];
  const [before, after] = x.text.split('___');

  const record = (ok: boolean) => {
    const next = review(vaultRef.current, `ps:${x.id}`, ok);
    vaultRef.current = next;
    setVault(next);
    writeVaultFor(next);
  };
  const advance = async () => {
    await wait(1400);
    if (i + 1 >= items.length) { onDone({ mistakes, units: items.length }); return; }
    setI(i + 1); setText(''); setTries(0); setState('ask');
  };
  const check = async (el: Element) => {
    if (state !== 'ask' || !text.trim()) return;
    if (norm(text) === x.answer) {
      setState('right'); spark(el); record(tries === 0);
      await say(recallSentence(x)); await advance();
    } else if (tries === 0) {
      setTries(1); setMistakes((m) => m + 1); nudge();
    } else {
      setTries(2); setState('shown'); nudge(); record(false);
      await say(recallSentence(x)); await advance();
    }
  };
  const color = TENSE[x.tense].hex;
  return (
    <div>
      <StopHeader title="Recall" sub={`Type the verb · ${i + 1} of ${items.length}`} done={i} total={items.length} />
      <div className="mx-auto max-w-lg rounded-3xl border border-white/15 bg-white/[.07] p-5 text-center">
        <p className="text-xl font-extrabold text-white sm:text-2xl">{before}<span className="mx-1 text-amber-300">___</span>{after} <span style={{ color: TENSE.simple.hex }}>({x.base})</span></p>
        <input
          aria-label="Your answer" value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void check(e.currentTarget); }}
          disabled={state !== 'ask'} autoComplete="off" autoCapitalize="none" spellCheck={false}
          className="mt-3 w-full rounded-2xl border-2 border-white/25 bg-white/10 p-3 text-center text-2xl font-extrabold text-white outline-none focus:bg-white/15"
        />
        <div className="mt-3 min-h-[40px] text-sm font-bold text-amber-100">
          {state === 'right' && <span><b style={{ color }}>{x.cue}</b> → {TENSE[x.tense].label}: {x.answer}</span>}
          {state === 'shown' && <span>The answer: <b className="text-white">{x.answer}</b> (<span style={{ color }}>{x.cue}</span> → {TENSE[x.tense].label}). It comes back soon.</span>}
          {state === 'ask' && tries === 1 && <span>Not quite. Is "<b style={{ color }}>{x.cue}</b>" a habit or happening now? {x.tense === 'continuous' ? 'Use am / is / are + -ing.' : 'Use the simple form (he/she: -s or -es).'}</span>}
        </div>
        <div className="mt-2"><ForgeButton onClick={(el) => void check(el)} disabled={state !== 'ask' || !text.trim()} hot={!!text.trim() && state === 'ask'}>Check</ForgeButton></div>
      </div>
    </div>
  );
}

export type { Tense };

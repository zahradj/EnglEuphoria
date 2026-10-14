import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { review, type Vault } from '../verbForge/verbMemory';
import { FORM, ForgeButton, StopHeader, rng, shuffled } from '../verbForge/forgeUi';
import {
  HOP_IRREGULAR, HOP_PAIRS, REGULAR_SPELLING, SIGNALS, SPELL_RULES, signalAnswer, signalOptions, spellingOptions,
  type Pair, type SpellKind,
} from './hopData';
import { hopCardKey, pickHopVerbs, writeHopVault, type Direction } from './hopMemory';

export interface HopStageProps {
  seed: number;
  vault: Vault;
  setVault: (v: Vault) => void;
  say: (text: string) => Promise<void>;
  spark: (el: Element | null) => void;
  nudge: () => void;
  onDone: (result: { mistakes: number; units: number }) => void;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const PRESENT = FORM.base.hex;
const PAST = FORM.past.hex;

/* ------------------------------------------------------------------ 1 · Twin Match */

const ROUNDS = 3;
const PER_ROUND = 5;

export function MatchStage({ seed, say, spark, nudge, onDone }: HopStageProps) {
  const rounds = useMemo(() => {
    const r = rng(seed);
    const pool = shuffled(HOP_IRREGULAR, r).slice(0, ROUNDS * PER_ROUND);
    return Array.from({ length: ROUNDS }, (_, k) => {
      const set = pool.slice(k * PER_ROUND, (k + 1) * PER_ROUND);
      return { left: shuffled(set, r), right: shuffled(set, r) };
    });
  }, [seed]);
  const [round, setRound] = useState(0);
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const busy = useRef(false);
  const cur = rounds[round];

  const tapLeft = (base: string) => { if (!busy.current && !done.includes(base)) { setPickedLeft(base); void say(base); } };
  const tapRight = async (verbBase: string, el: Element) => {
    if (busy.current || !pickedLeft || done.includes(verbBase)) return;
    if (pickedLeft === verbBase) {
      busy.current = true;
      spark(el);
      const v = cur.left.find((x) => x.base === verbBase)!;
      const next = [...done, verbBase];
      setDone(next);
      setPickedLeft(null);
      await say(v.past);
      await wait(350);
      if (next.length === PER_ROUND) {
        if (round + 1 >= ROUNDS) { onDone({ mistakes, units: ROUNDS * PER_ROUND }); return; }
        setRound(round + 1); setDone([]);
      }
      busy.current = false;
    } else {
      setWrong(verbBase); setMistakes((m) => m + 1); nudge(); setPickedLeft(null);
      window.setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div>
      <StopHeader title="Twin Match" sub={`Pairs ${round + 1} of ${ROUNDS}`} done={done.length} total={PER_ROUND} />
      <p className="mb-3 text-center text-base font-bold text-white sm:text-lg">Tap the <span style={{ color: PRESENT }}>present</span> word, then its <span style={{ color: PAST }}>past</span> twin.</p>
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-x-6 gap-y-3">
        <div className="flex flex-col gap-3" aria-label="Present">
          {cur.left.map((v, k) => {
            const isDone = done.includes(v.base);
            return (
              <motion.button key={v.base} type="button" aria-label={`present ${v.base}`} disabled={isDone} onClick={() => tapLeft(v.base)}
                initial={{ opacity: 0, x: -24 }} animate={{ opacity: isDone ? 0.35 : 1, x: 0, scale: pickedLeft === v.base ? 1.06 : 1 }} transition={{ type: 'spring', stiffness: 280, damping: 16, delay: k * 0.06 }}
                whileTap={{ scale: 0.93 }}
                className="min-h-[56px] rounded-2xl border-2 px-3 text-xl font-extrabold text-white" style={{ borderColor: PRESENT, background: pickedLeft === v.base ? 'rgba(56,189,248,.35)' : FORM.base.soft, boxShadow: pickedLeft === v.base ? `0 0 22px ${PRESENT}88` : undefined }}>
                {v.base}
              </motion.button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3" aria-label="Past">
          {cur.right.map((v, k) => {
            const isDone = done.includes(v.base);
            return (
              <motion.button key={v.base} type="button" aria-label={`past ${v.past}`} disabled={isDone} onClick={(e) => void tapRight(v.base, e.currentTarget)}
                initial={{ opacity: 0, x: 24 }} animate={wrong === v.base ? { x: [0, -7, 7, -4, 4, 0], opacity: 1 } : { opacity: isDone ? 0.35 : 1, x: 0 }} transition={wrong === v.base ? { duration: 0.45 } : { type: 'spring', stiffness: 280, damping: 16, delay: k * 0.06 }}
                whileTap={{ scale: 0.93 }}
                className="min-h-[56px] rounded-2xl border-2 px-3 text-xl font-extrabold text-white" style={{ borderColor: PAST, background: isDone ? 'rgba(52,211,153,.3)' : FORM.past.soft }}>
                {v.past}
              </motion.button>
            );
          })}
        </div>
      </div>
      {done.length > 0 && (
        <p className="mt-3 text-center text-sm text-amber-100">{done.map((b) => { const v = cur.left.find((x) => x.base === b)!; return `${v.base} → ${v.past}`; }).join('  ·  ')}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ 2 · Past Rules */

export function SpellStage({ seed, say, spark, nudge, onDone }: HopStageProps) {
  const rounds = useMemo(() => {
    const r = rng(seed + 11);
    const kinds: SpellKind[] = ['ed', 'd', 'ied', 'double'];
    const picked = kinds.flatMap((k) => shuffled(REGULAR_SPELLING.filter((x) => x.kind === k), r).slice(0, 2));
    return shuffled(picked, r).map((v) => ({ v, options: shuffled(spellingOptions(v), r) }));
  }, [seed]);
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const { v, options } = rounds[i];

  useEffect(() => { void say(v.base); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (w: string, el: Element) => {
    if (right || wrong.includes(w)) return;
    if (w === v.past) {
      setRight(true); spark(el);
      await say(v.past);
      await wait(1500);
      if (i + 1 >= rounds.length) { onDone({ mistakes, units: rounds.length }); return; }
      setI(i + 1); setWrong([]); setRight(false);
    } else {
      setWrong((x) => [...x, w]); setMistakes((m) => m + 1); nudge();
    }
  };
  const rule = SPELL_RULES[v.kind];

  return (
    <div>
      <StopHeader title="Past Rules" sub={`Spell the past · ${i + 1} of ${rounds.length}`} done={i} total={rounds.length} />
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" aria-label="The four rules">
        {(Object.keys(SPELL_RULES) as SpellKind[]).map((k) => (
          <div key={k} className="rounded-xl border px-2 py-1.5 text-center text-xs" style={{ borderColor: k === v.kind && right ? PAST : 'rgba(255,255,255,.15)', background: k === v.kind && right ? FORM.past.soft : 'rgba(255,255,255,.05)' }}>
            <p className="font-extrabold text-amber-200">{SPELL_RULES[k].title}</p>
            <p className="text-white/90">{SPELL_RULES[k].rule}</p>
            <p className="font-bold" style={{ color: PAST }}>{SPELL_RULES[k].example}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-lg font-bold text-white">Yesterday I … <span style={{ color: PRESENT }} className="text-2xl font-extrabold">({v.base})</span></p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        {options.map((w, k) => (
          <ForgeButton key={`${i}-${w}`} index={k} ariaLabel={w} tone={w === v.past && right ? 'right' : wrong.includes(w) ? 'wrong' : 'idle'} disabled={right || wrong.includes(w)} onClick={(el) => void pick(w, el)}>{w}</ForgeButton>
        ))}
      </div>
      <div className="mt-3 min-h-[48px] text-center text-sm font-bold text-amber-100">
        {right && <span>{rule.title}: {rule.rule} <span style={{ color: PAST }}>{v.base} → {v.past}</span></span>}
        {!right && wrong.length > 0 && <span>Not that spelling. Look at how the verb ends.</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 3 · Time Gate */

export function GateStage({ seed, say, spark, nudge, onDone }: HopStageProps) {
  const rounds = useMemo(() => {
    const r = rng(seed + 23);
    return shuffled(SIGNALS, r).slice(0, 10).map((s) => ({ s, options: shuffled(signalOptions(s), r) as string[] }));
  }, [seed]);
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const { s, options } = rounds[i];
  const answer = signalAnswer(s);

  const pick = async (w: string, el: Element) => {
    if (right || wrong.includes(w)) return;
    if (w === answer) {
      setRight(true); spark(el);
      await say(s.text.replace('___', answer));
      await wait(900);
      if (i + 1 >= rounds.length) { onDone({ mistakes, units: rounds.length }); return; }
      setI(i + 1); setWrong([]); setRight(false);
    } else {
      setWrong((x) => [...x, w]); setMistakes((m) => m + 1); nudge();
    }
  };
  const [before, after] = s.text.split('___');
  const color = s.tense === 'present' ? PRESENT : PAST;

  return (
    <div>
      <StopHeader title="Time Gate" sub={`Read the time word · ${i + 1} of ${rounds.length}`} done={i} total={rounds.length} />
      <div className="rounded-3xl border border-white/15 bg-white/[.07] p-5 text-center text-2xl font-extrabold leading-relaxed text-white sm:text-3xl">
        {before}
        <motion.span key={`${i}-${right}`} initial={{ scale: 0.6, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="mx-1 inline-block min-w-[96px] rounded-xl border-b-4 px-2" style={{ borderColor: right ? color : 'rgba(255,255,255,.5)', color: right ? color : 'transparent' }}>{right ? answer : '___'}</motion.span>
        {after}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {options.map((w, k) => (
          <ForgeButton key={`${i}-${w}`} index={k} ariaLabel={w} tone={w === answer && right ? 'right' : wrong.includes(w) ? 'wrong' : 'idle'} disabled={right || wrong.includes(w)} onClick={(el) => void pick(w, el)}>{w}</ForgeButton>
        ))}
      </div>
      <p className="mt-3 min-h-[28px] text-center text-sm font-bold text-amber-100">
        {right ? <span><b style={{ color }}>{s.signal}</b> → {s.tense === 'present' ? 'present (blue)' : 'past (orange)'}</span> : wrong.length > 0 ? <span>Hint: look at the time words in the sentence.</span> : null}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ 4 · Recall (both directions, spaced) */

const RECALL_COUNT = 8;

export function RecallStage({ seed, vault, setVault, say, spark, nudge, onDone }: HopStageProps) {
  const items = useMemo(() => {
    const r = rng(seed + 37);
    const verbs = pickHopVerbs(HOP_PAIRS, vault, RECALL_COUNT, Date.now(), (a) => shuffled(a, r));
    return verbs.map((p) => ({ p, dir: (r() < 0.5 ? 'toPast' : 'toPresent') as Direction }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [tries, setTries] = useState(0);
  const [state, setState] = useState<'ask' | 'right' | 'shown'>('ask');
  const [mistakes, setMistakes] = useState(0);
  const vaultRef = useRef(vault);
  vaultRef.current = vault;
  const { p, dir }: { p: Pair; dir: Direction } = items[i];
  const prompt = dir === 'toPast' ? p.base : p.past;
  const answer = dir === 'toPast' ? p.past : p.base;

  const record = (ok: boolean) => {
    const next = review(vaultRef.current, hopCardKey(p.base, dir), ok);
    vaultRef.current = next;
    setVault(next);
    writeHopVault(next);
  };
  const advance = async () => {
    await wait(1300);
    if (i + 1 >= items.length) { onDone({ mistakes, units: items.length }); return; }
    setI(i + 1); setText(''); setTries(0); setState('ask');
  };

  const check = async (el: Element) => {
    if (state !== 'ask' || !text.trim()) return;
    if (norm(text) === answer) {
      setState('right'); spark(el);
      record(tries === 0);
      await say(answer);
      await advance();
    } else if (tries === 0) {
      setTries(1); setMistakes((m) => m + 1); nudge();
    } else {
      setTries(2); setState('shown'); nudge();
      record(false);
      await say(answer);
      await advance();
    }
  };

  const hint = tries === 1 ? `Starts with "${answer[0]}" · ${answer.length} letters` : '';
  return (
    <div>
      <StopHeader title="Recall" sub={`Type it from memory · ${i + 1} of ${items.length}`} done={i} total={items.length} />
      <div className="mx-auto max-w-md rounded-3xl border border-white/15 bg-white/[.07] p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">{dir === 'toPast' ? 'Present → Past' : 'Past → Present'}</p>
        <p className="mt-2 text-4xl font-black" style={{ color: dir === 'toPast' ? PRESENT : PAST }}>{prompt}</p>
        <p className="mt-1 text-sm text-white/80">Write the <b style={{ color: dir === 'toPast' ? PAST : PRESENT }}>{dir === 'toPast' ? 'past' : 'present'}</b> form.</p>
        <input
          aria-label="Your answer"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void check(e.currentTarget); }}
          disabled={state !== 'ask'}
          autoComplete="off" autoCapitalize="none" spellCheck={false}
          className="mt-3 w-full rounded-2xl border-2 border-white/25 bg-white/10 p-3 text-center text-2xl font-extrabold text-white outline-none focus:bg-white/15"
        />
        <div className="mt-3 min-h-[28px] text-sm font-bold text-amber-100">
          {state === 'right' && <span style={{ color: '#6ee7b7' }}>{prompt} → {answer}. {p.regular ? '' : 'Irregular: remember it as a pair.'}</span>}
          {state === 'shown' && <span>The answer: <b className="text-white">{answer}</b>. It comes back soon.</span>}
          {state === 'ask' && tries === 1 && <span>Not quite. {hint}</span>}
        </div>
        <div className="mt-2"><ForgeButton onClick={(el) => void check(el)} disabled={state !== 'ask' || !text.trim()} hot={!!text.trim() && state === 'ask'}>Check</ForgeButton></div>
      </div>
    </div>
  );
}

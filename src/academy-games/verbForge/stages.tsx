import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lightbulb } from 'lucide-react';
import {
  FAMILIES, IRREGULAR_VERBS, PATTERNS, REGULAR_VERBS, SENTENCES, answerOf, familyVerbs, regularised, sentenceOptions,
  type FamilyId, type SentenceRound, type Verb,
} from './verbData';
import { cardKey, pickVerbs, review, writeVault, type FormKey, type Vault } from './verbMemory';
import { FORM, ForgeButton, StopHeader, VerbCard, FormChip, rng, shuffled, type FormId } from './forgeUi';

export interface StageProps {
  seed: number;
  vault: Vault;
  setVault: (v: Vault) => void;
  /** Say the three forms of a verb, one after the other. */
  hearVerb: (v: Verb) => Promise<void>;
  /** Say one line. */
  say: (text: string) => Promise<void>;
  /** Sparks from the middle of an element (an event target) inside the game frame. */
  spark: (el: Element | null) => void;
  /** A gentle nudge of the whole frame for a wrong answer. */
  nudge: () => void;
  onDone: (result: { mistakes: number; units: number }) => void;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/* ------------------------------------------------------------------ 1 · Pattern Forge */

export function PatternStage({ seed, hearVerb, spark, nudge, onDone }: StageProps) {
  const rounds = useMemo(() => {
    const r = rng(seed);
    const take = (list: Verb[], n: number) => shuffled(list, r).slice(0, n);
    const irr = (p: Verb['pattern']) => IRREGULAR_VERBS.filter((x) => x.pattern === p);
    return shuffled([...take(irr('AAA'), 2), ...take(irr('ABB'), 2), ...take(irr('ABC'), 3), ...take(irr('ABA'), 1), ...take(REGULAR_VERBS, 2)], r);
  }, [seed]);
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hearing, setHearing] = useState(false);
  const verb = rounds[i];

  const hear = async () => { setHearing(true); await hearVerb(verb); setHearing(false); };
  useEffect(() => { void hear(); /* ears first */ }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (id: string, el: Element) => {
    if (right || wrong.includes(id)) return;
    if (id === verb.pattern) {
      setRight(id);
      spark(el);
      await wait(1500);
      if (i + 1 >= rounds.length) onDone({ mistakes, units: rounds.length });
      else { setI(i + 1); setWrong([]); setRight(null); }
    } else {
      setWrong((w) => [...w, id]);
      setMistakes((m) => m + 1);
      nudge();
    }
  };
  const rule = PATTERNS.find((p) => p.id === verb.pattern)!;

  return (
    <div>
      <StopHeader title="Pattern Forge" sub="Look at the three forms" done={i} total={rounds.length} />
      <VerbCard verb={verb} onHear={hear} hearing={hearing} />
      <p className="mt-4 text-center text-base font-bold text-white sm:text-lg">Which pattern is it?</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PATTERNS.map((p, k) => (
          <div key={p.id} className="flex">
            <ForgeButton wide index={k} ariaLabel={p.label} tone={right === p.id ? 'right' : wrong.includes(p.id) ? 'wrong' : 'idle'} disabled={!!right || wrong.includes(p.id)} hot={wrong.length >= 2 && p.id === verb.pattern && !right} onClick={(el) => void pick(p.id, el)}>
              {p.label}
            </ForgeButton>
          </div>
        ))}
      </div>
      <div className="mt-3 min-h-[44px] text-center">
        <AnimatePresence>
          {right && (
            <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm font-bold text-emerald-200">
              <Lightbulb className="h-4 w-4" /> {rule.label}: {rule.rule}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 2 · Family Forge */

const FAMILY_ORDER: FamilyId[] = ['sing', 'know', 'ought', 'speak', 'write', 'kept', 'told', 'run'];

function options(verb: Verb, form: 'past' | 'pp', r: () => number): string[] {
  const correct = verb[form];
  const other = form === 'past' ? verb.pp : verb.past;
  const mate = shuffled(familyVerbs(verb.family as FamilyId).filter((x) => x.base !== verb.base), r)[0];
  const pool = [regularised(verb.base), other, mate?.[form], verb.base].filter((x): x is string => !!x && x !== correct);
  const wrongOnes = Array.from(new Set(pool)).slice(0, 2);
  return shuffled([correct, ...wrongOnes], r);
}

export function FamilyStage({ seed, hearVerb, say, spark, nudge, onDone }: StageProps) {
  const rounds = useMemo(() => {
    const r = rng(seed + 11);
    return shuffled(FAMILY_ORDER, r).map((fid) => {
      const members = familyVerbs(fid);
      const verb = members[Math.floor(r() * members.length)];
      return { verb, past: options(verb, 'past', r), pp: options(verb, 'pp', r) };
    });
  }, [seed]);
  const [i, setI] = useState(0);
  const [step, setStep] = useState<'past' | 'pp' | 'done'>('past');
  const [wrong, setWrong] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const round = rounds[i];
  const fam = FAMILIES[round.verb.family as FamilyId];

  useEffect(() => { void say(round.verb.base); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (form: 'past' | 'pp', word: string, el: Element) => {
    if (step !== form || wrong.includes(word)) return;
    if (word === round.verb[form]) {
      spark(el);
      setWrong([]);
      void say(word);
      if (form === 'past') setStep('pp');
      else {
        setStep('done');
        await wait(900);
        await hearVerb(round.verb);
        await wait(900);
        if (i + 1 >= rounds.length) onDone({ mistakes, units: rounds.length * 2 });
        else { setI(i + 1); setStep('past'); }
      }
    } else {
      setWrong((w) => [...w, word]);
      setMistakes((m) => m + 1);
      nudge();
    }
  };

  const hide: FormId[] = step === 'past' ? ['past', 'pp'] : step === 'pp' ? ['pp'] : [];
  const list = step === 'past' ? round.past : step === 'pp' ? round.pp : [];

  return (
    <div>
      <StopHeader title="Family Forge" sub={`The ${fam.name} family`} done={i} total={rounds.length} />
      <div className="mb-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-center">
        <p className="text-sm font-extrabold text-amber-200">{fam.rule}</p>
        <p className="text-xs text-amber-100/90 sm:text-sm">{fam.hook}</p>
      </div>
      <VerbCard verb={round.verb} hide={hide} focus={step === 'done' ? undefined : step} />
      <p className="mt-4 text-center text-base font-bold text-white sm:text-lg">
        {step === 'done' ? 'Forged!' : step === 'past' ? `Pick the PAST SIMPLE of "${round.verb.base}"` : `Pick the PAST PARTICIPLE of "${round.verb.base}"`}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
        {list.map((w, k) => (
          <ForgeButton key={`${i}-${step}-${w}`} wide index={k} tone={wrong.includes(w) ? 'wrong' : 'idle'} disabled={wrong.includes(w)} hot={wrong.length >= 2 && w === round.verb[step as 'past' | 'pp']} onClick={(el) => void pick(step as 'past' | 'pp', w, el)}>
            {w}
          </ForgeButton>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 3 · Memory Forge (type it from memory) */

interface MemoryRound { verb: Verb; reverse: boolean }

export function MemoryStage({ seed, vault, setVault, hearVerb, spark, nudge, onDone }: StageProps) {
  const rounds = useMemo<MemoryRound[]>(() => {
    const r = rng(seed + 23);
    const picked = pickVerbs(IRREGULAR_VERBS.filter((x) => x.pattern !== 'AAA'), vault, 8, Date.now(), (a) => shuffled(a, r));
    return picked.map((verb, k) => ({ verb, reverse: k % 4 === 3 }));
    // the vault only decides the order when the stop starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  const [i, setI] = useState(0);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [ok, setOk] = useState<Record<string, boolean>>({});
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'asking' | 'right' | 'revealed'>('asking');
  const [mistakes, setMistakes] = useState(0);
  const missedThisRound = useRef(false);
  const round = rounds[i];
  const asked: FormKey[] = round.reverse ? ['base'] : ['past', 'pp'];
  const vaultRef = useRef(vault);
  vaultRef.current = vault;

  const record = (key: FormKey, correct: boolean) => {
    const next = review(vaultRef.current, cardKey(round.verb.base, key), correct);
    vaultRef.current = next;
    setVault(next);
    writeVault(next);
  };

  const next = async () => {
    if (i + 1 >= rounds.length) { onDone({ mistakes, units: rounds.length }); return; }
    setI(i + 1); setVals({}); setOk({}); setAttempts(0); setStatus('asking'); missedThisRound.current = false;
  };

  const submit = async (el: Element | null) => {
    if (status !== 'asking') return;
    const results: Record<string, boolean> = {};
    for (const f of asked) results[f] = norm(vals[f] ?? '') === round.verb[f];
    setOk((o) => ({ ...o, ...results }));
    const allRight = asked.every((f) => results[f] || ok[f]);
    if (allRight) {
      // the first try counts as "knew it"; a right answer after a hint does not
      asked.forEach((f) => record(f, attempts === 0));
      setStatus('right');
      spark(el);
      await hearVerb(round.verb);
      await wait(700);
      await next();
    } else if (attempts === 0) {
      setAttempts(1);
      setMistakes((m) => m + (missedThisRound.current ? 0 : 1));
      missedThisRound.current = true;
      nudge();
    } else {
      asked.forEach((f) => record(f, false));
      setStatus('revealed');
      nudge();
    }
  };

  const hint = attempts >= 1 && status === 'asking';
  const pattern = PATTERNS.find((p) => p.id === round.verb.pattern)!;

  return (
    <div>
      <StopHeader title="Memory Forge" sub="Type it from memory" done={i} total={rounds.length} />
      {round.reverse ? (
        <div data-verb={round.verb.base} className="rounded-3xl border border-white/15 bg-white/[.06] p-4">
          <div className="mx-auto max-w-xs"><FormChip form="pp" text={round.verb.pp} /></div>
          <p className="mt-3 text-center text-sm font-bold text-white sm:text-base">Which verb is this? Type the BASE form (1).</p>
        </div>
      ) : (
        <VerbCard verb={round.verb} hide={['past', 'pp']} focus={undefined} />
      )}
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => { e.preventDefault(); void submit(e.currentTarget.querySelector('button[type=submit]')); }}
      >
        {asked.map((f, k) => {
          const done = ok[f] || status === 'revealed';
          const bad = attempts >= 1 && !ok[f] && status === 'asking';
          return (
            <label key={f} className={`block ${asked.length === 1 ? 'sm:col-span-2' : ''}`}>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: FORM[f].hex }}>{FORM[f].short} · {FORM[f].label}</span>
              <input
                autoFocus={k === 0}
                autoComplete="off" autoCapitalize="none" spellCheck={false}
                aria-label={FORM[f].label}
                disabled={status !== 'asking' || ok[f]}
                value={status === 'revealed' ? round.verb[f] : vals[f] ?? ''}
                onChange={(e) => setVals((v) => ({ ...v, [f]: e.target.value }))}
                placeholder={hint ? `${round.verb[f][0]}${'·'.repeat(Math.max(0, round.verb[f].length - 1))}` : '…'}
                className="h-14 w-full rounded-2xl border-2 bg-white/10 px-4 text-xl font-extrabold text-white outline-none placeholder:text-white/40 focus:bg-white/15"
                style={{ borderColor: done ? FORM[f].hex : bad ? '#f9a8d4' : 'rgba(255,255,255,.25)' }}
              />
            </label>
          );
        })}
        {status === 'asking' && (
          <div className="sm:col-span-2">
            <ForgeButton wide onClick={(el) => void submit(el)}><span className="flex items-center justify-center gap-2">Forge it <ArrowRight className="h-5 w-5" /></span></ForgeButton>
          </div>
        )}
        {/* the submit control is the real button above; keep Enter working inside the inputs */}
        <button type="submit" className="sr-only" tabIndex={-1}>Forge it</button>
      </form>
      <div className="mt-3 min-h-[48px] text-center text-sm">
        {hint && <p className="inline-flex items-center gap-2 rounded-full bg-amber-300/15 px-4 py-1.5 font-bold text-amber-200"><Lightbulb className="h-4 w-4" /> Hint: {pattern.label} · {pattern.rule}</p>}
        {status === 'revealed' && (
          <div className="flex flex-col items-center gap-2">
            <p className="font-bold text-pink-200">That one goes back in the Vault. It is: {round.verb.base} – {round.verb.past} – {round.verb.pp}</p>
            <ForgeButton onClick={() => void next()}><span className="flex items-center gap-2">Next <ArrowRight className="h-5 w-5" /></span></ForgeButton>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 4 · Sentence Forge */

export function SentenceStage({ seed, say, spark, nudge, onDone }: StageProps) {
  const rounds = useMemo<SentenceRound[]>(() => shuffled(SENTENCES, rng(seed + 37)).slice(0, 10), [seed]);
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const round = rounds[i];
  const opts = useMemo(() => shuffled(sentenceOptions(round), rng(seed + i)), [round, seed, i]);
  const answer = answerOf(round);
  const formId: FormId = round.form;
  const [before, after] = round.text.split('___');

  const pick = async (word: string, el: Element) => {
    if (right || wrong.includes(word)) return;
    if (word === answer) {
      setRight(true);
      spark(el);
      await say(round.text.replace('___', answer));
      await wait(1100);
      if (i + 1 >= rounds.length) onDone({ mistakes, units: rounds.length });
      else { setI(i + 1); setWrong([]); setRight(false); }
    } else {
      setWrong((w) => [...w, word]);
      setMistakes((m) => m + 1);
      nudge();
    }
  };

  // underline the clue in the colour of the right form once answered
  const renderClue = (text: string) => {
    if (!right || !text.includes(round.clue)) return text;
    const [a, ...rest] = text.split(round.clue);
    return <>{a}<span style={{ color: FORM[formId].hex, borderBottom: `3px solid ${FORM[formId].hex}` }}>{round.clue}</span>{rest.join(round.clue)}</>;
  };

  return (
    <div>
      <StopHeader title="Sentence Forge" sub="Which form fits?" done={i} total={rounds.length} />
      <div className="rounded-3xl border border-white/15 bg-white/[.06] p-5 text-center sm:p-7">
        <p data-testid="sentence" className="text-xl font-extrabold leading-relaxed text-white sm:text-3xl">
          {renderClue(before)}
          <motion.span
            key={right ? 'filled' : 'gap'}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 13 }}
            className="mx-1 inline-block min-w-[96px] rounded-xl border-2 px-3"
            style={right ? { borderColor: FORM[formId].hex, background: FORM[formId].soft, color: FORM[formId].hex } : { borderColor: 'rgba(255,255,255,.4)', borderStyle: 'dashed', color: 'transparent' }}
          >
            {right ? answer : '____'}
          </motion.span>
          {renderClue(after)}
        </p>
        <p className="mt-2 text-sm text-violet-200">verb: <b className="text-white">{round.base}</b></p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {opts.map((w, k) => (
          <ForgeButton key={`${i}-${w}`} wide index={k} tone={right && w === answer ? 'right' : wrong.includes(w) ? 'wrong' : 'idle'} disabled={right || wrong.includes(w)} hot={wrong.length >= 2 && w === answer && !right} onClick={(el) => void pick(w, el)}>
            {w}
          </ForgeButton>
        ))}
      </div>
      <div className="mt-3 min-h-[44px] text-center">
        <AnimatePresence>
          {right && (
            <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold" style={{ background: FORM[formId].soft, color: FORM[formId].hex }}>
              <Lightbulb className="h-4 w-4" /> {round.why}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useEffect, useMemo } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { ShapeIcon, sayWithin } from './shared';

/* ---------- Pip's Secret Card (Pre-A1 Unit 2 Lesson 4 signature game) ----------
 * "Guess Who" with Unit 2's colours and shapes: Pip hides one of six coloured
 * shapes; the CHILD asks the questions ("Is it red?" / "Is it a circle?"),
 * Pip answers "Yes, it is!" / "No, it isn't!", and every card that doesn't fit
 * flips away until one is left. The information gap makes the question real —
 * the child can only win by asking (the lesson's goal), not by tapping. */

export const SECRET_INTRO = 'I have a secret card. Ask me!';
export const YES_LINE = 'Yes, it is!';
export const NO_LINE = "No, it isn't!";
export function askLine(kind: 'color' | 'shape', word: string) {
  return kind === 'color' ? `Is it ${word.toLowerCase()}?` : `Is it a ${word.toLowerCase()}?`;
}
export function foundLine(colorWord: string, shape: string) {
  return `You found it! It's a ${colorWord.toLowerCase()} ${shape}!`;
}

type Card = Extract<Scene, { kind: 'secret-card' }>['cards'][number];
type Phase = 'ask' | 'asking' | 'found';

export function SecretCardScene({ scene, onWin, onNext, sync }: { scene: Extract<Scene, { kind: 'secret-card' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    out: [] as number[],
    asked: [] as string[],
    question: '',
    answer: '',
    phase: 'ask' as Phase,
    gemDone: false,
  });
  const { round, out, asked, question, answer, phase, gemDone } = state;
  const total = scene.rounds.length;
  const secretIdx = round < total ? scene.rounds[round]?.secret : undefined;
  const secret: Card | undefined = secretIdx != null ? scene.cards[secretIdx] : undefined;
  const outSet = useMemo(() => new Set(out), [out]);
  const left = scene.cards.map((_, i) => i).filter((i) => !outSet.has(i));

  useEffect(() => {
    if (!secret) return;
    setState((s) => ({ ...s, out: [], asked: [], question: '', answer: '', phase: 'ask' }));
    const t = window.setTimeout(() => cueSpeak(SECRET_INTRO, scene.who), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  // Question chips: every colour and shape still on the table, not yet asked.
  const chips = useMemo(() => {
    const seen = new Set<string>();
    const res: { kind: 'color' | 'shape'; word: string; hex?: string }[] = [];
    for (const i of left) {
      const c = scene.cards[i];
      if (!c) continue;
      if (!seen.has(`c:${c.colorWord}`)) { seen.add(`c:${c.colorWord}`); res.push({ kind: 'color', word: c.colorWord, hex: c.colorHex }); }
      if (!seen.has(`s:${c.shape}`)) { seen.add(`s:${c.shape}`); res.push({ kind: 'shape', word: c.shape }); }
    }
    const askedSet = new Set(asked);
    return res.filter((ch) => !askedSet.has(`${ch.kind}:${ch.word}`)).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'color' ? -1 : 1));
  }, [left.join(','), asked.join(','), scene.cards]);

  const ask = async (kind: 'color' | 'shape', word: string) => {
    if (!secret || phase !== 'ask') return;
    const q = askLine(kind, word);
    sfx.pop();
    setState((s) => ({ ...s, phase: 'asking', question: q, answer: '', asked: [...s.asked, `${kind}:${word}`] }));
    // A moment for the child to SAY the question before Pip answers.
    await new Promise((res) => setTimeout(res, 1600));
    const yes = kind === 'color' ? secret.colorWord === word : secret.shape === word;
    const a = yes ? YES_LINE : NO_LINE;
    setState((s) => ({ ...s, answer: a }));
    await sayWithin(a, scene.who);
    const fits = (c: Card) => (kind === 'color' ? c.colorWord === word : c.shape === word) === yes;
    const nextOut = scene.cards.map((c, i) => (outSet.has(i) || !fits(c) ? i : -1)).filter((i) => i >= 0);
    yes ? sfx.match() : sfx.click();
    setState((s) => ({ ...s, out: nextOut }));
    const remaining = scene.cards.length - nextOut.length;
    if (remaining > 1) {
      window.setTimeout(() => setState((s) => ({ ...s, phase: 'ask', question: '', answer: '' })), 700);
      return;
    }
    await new Promise((res) => setTimeout(res, 700));
    setState((s) => ({ ...s, phase: 'found' }));
    sfx.reveal();
    await sayWithin(foundLine(secret.colorWord, secret.shape), scene.who, 5000);
    await new Promise((res) => setTimeout(res, 1200));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
  };

  if (!secret) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4">
          <div className="rounded-3xl bg-white px-8 py-3 text-center text-2xl font-black text-orange-600 shadow-2xl">🃏 You found all of Pip's secret cards!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {phase === 'found' ? `🎉 ${foundLine(secret.colorWord, secret.shape)}` : '🃏 Pip has a secret card. Ask Pip!'}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(SECRET_INTRO, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      {/* The question the child asks, and Pip's answer (bottom left, under Pip's face). */}
      {(question || answer) && (
        <div className="absolute bottom-[20%] left-[3%] z-30 flex w-[36%] max-w-[400px] flex-col gap-2">
          {question && (
            <div className="rounded-3xl bg-white px-4 py-3 text-center shadow-2xl ring-4 ring-sky-300 animate-[lep1-pop_0.3s_ease-out]">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-600">You ask</div>
              <div className="text-2xl font-black text-sky-800 sm:text-3xl">“{question}”</div>
            </div>
          )}
          {answer && (
            <div className={`rounded-3xl px-4 py-3 text-center text-2xl font-black text-white shadow-2xl animate-[lep1-pop_0.3s_ease-out] sm:text-3xl ${answer === YES_LINE ? 'bg-green-500' : 'bg-rose-500'}`}>
              🦊 {answer}
            </div>
          )}
        </div>
      )}

      {/* The six cards (right two thirds — Pip is painted on the left). */}
      <div className="absolute right-[3%] top-[14%] z-20 grid w-[50%] grid-cols-3 gap-3">
        {scene.cards.map((c, i) => {
          const gone = outSet.has(i);
          const isSecret = phase === 'found' && i === secretIdx;
          return (
            <div
              key={i}
              aria-label={`${c.colorWord.toLowerCase()} ${c.shape}`}
              className={`grid aspect-[4/3] place-items-center rounded-3xl border-4 p-3 shadow-xl transition-all duration-500 ${gone ? 'scale-90 border-white/40 bg-white/30 opacity-30 grayscale' : 'border-white bg-white/95'} ${isSecret ? 'scale-110 ring-8 ring-yellow-300 animate-[lep1-hop_0.8s_ease-in-out_infinite]' : ''}`}
            >
              <span className="block h-[10vh] w-[10vh] max-w-full"><ShapeIcon shape={c.shape} fill={c.colorHex} /></span>
            </div>
          );
        })}
      </div>

      {/* Question chips */}
      <div className="absolute inset-x-0 bottom-[4%] z-30 flex flex-wrap items-center justify-center gap-3 px-4">
        {phase === 'ask' && chips.map((ch) => (
          <button
            key={`${ch.kind}:${ch.word}`}
            onClick={() => ask(ch.kind, ch.word)}
            className="flex min-h-[56px] items-center gap-2 rounded-full border-4 border-white bg-white px-4 py-2 text-lg font-black text-neutral-800 shadow-2xl transition active:scale-95"
          >
            {ch.kind === 'color'
              ? <span className="block h-7 w-7 rounded-full border-2 border-white shadow-inner" style={{ backgroundColor: ch.hex }} />
              : <span className="block h-7 w-7"><ShapeIcon shape={ch.word} fill="#FEFBDD" /></span>}
            {askLine(ch.kind, ch.word)}
          </button>
        ))}
        {phase === 'asking' && !answer && <div className="rounded-full bg-sky-500 px-6 py-3 text-lg font-black text-white shadow-2xl">🎤 Say it to Pip!</div>}
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function secretCardLines(scene: Extract<Scene, { kind: 'secret-card' }>) {
  const out: [string, string][] = [[scene.who, SECRET_INTRO], [scene.who, YES_LINE], [scene.who, NO_LINE]];
  for (const r of scene.rounds) {
    const c = scene.cards[r.secret];
    if (c) out.push([scene.who, foundLine(c.colorWord, c.shape)]);
  }
  return out;
}

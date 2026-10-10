import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { sayWithin, ShapeIcon, STICKER_FILTER, STICKER_TILTS } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Pip's Secret Card (Pre-A1 Unit 2 Lesson 4 signature game) ----------
 * "Guess Who" with Unit 2's colours and shapes: Pip hides one of six coloured
 * shapes; the CHILD asks the questions ("Is it red?" / "Is it a circle?"),
 * Pip answers "Yes, it is!" / "No, it isn't!", and every card that doesn't fit
 * flips away until one is left. The information gap makes the question real —
 * the child can only win by asking (the lesson's goal), not by tapping. */

export const SECRET_INTRO = 'I have a secret card. Ask me!';
export const YES_LINE = 'Yes, it is!';
export const NO_LINE = "No, it isn't!";
type AskKind = 'color' | 'shape' | 'toy' | 'size' | 'person';
const aAn = (w: string) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
export function askLine(kind: AskKind, word: string) {
  // People are asked by name, no article: "Is it Grandma?" (Unit 5 Lesson 4 family cards).
  if (kind === 'person') return `Is it ${word}?`;
  const w = word.toLowerCase();
  if (kind === 'color' || kind === 'size') return `Is it ${w}?`;
  return `Is it ${aAn(w)} ${w}?`;
}
type Card = Extract<Scene, { kind: 'secret-card' }>['cards'][number];
/** "It's a red circle!" for shapes; "It's a big red ball!" for toys. */
export function foundLine(c: Card) {
  if (c.person && c.word) return `You found it! It's ${c.word}!`;
  const parts = c.word ? [c.size, c.colorWord.toLowerCase(), c.word.toLowerCase()].filter(Boolean).join(' ') : `${c.colorWord.toLowerCase()} ${c.shape}`;
  return `You found it! It's ${aAn(parts)} ${parts}!`;
}
/** Does a card have this colour / shape / toy / size? */
function has(c: Card, kind: AskKind, word: string) {
  if (kind === 'color') return c.colorWord === word;
  if (kind === 'shape') return c.shape === word;
  if (kind === 'toy' || kind === 'person') return c.word === word;
  return c.size === word;
}
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
  const [bursts, fire] = useBursts();
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
    const res: { kind: AskKind; word: string; hex?: string; img?: string }[] = [];
    const add = (kind: AskKind, word: string, extra: { hex?: string; img?: string } = {}) => {
      if (!seen.has(`${kind}:${word}`)) { seen.add(`${kind}:${word}`); res.push({ kind, word, ...extra }); }
    };
    for (const i of left) {
      const c = scene.cards[i];
      if (!c) continue;
      if (c.word) {
        add(c.person ? 'person' : 'toy', c.word, { img: c.img });
        if (c.size) add('size', c.size);
      } else add('shape', c.shape);
      if (c.colorWord) add('color', c.colorWord, { hex: c.colorHex });
    }
    const askedSet = new Set(asked);
    const order: AskKind[] = ['size', 'toy', 'person', 'color', 'shape'];
    let open = res.filter((ch) => !askedSet.has(`${ch.kind}:${ch.word}`));
    // People: ask "Is it big? / Is it small?" first (the Guess Who strategy), then the names still in play —
    // eight chips at once also covered the cards on a phone.
    const sizeAsked = asked.some((a) => a.startsWith('size:'));
    if (!sizeAsked && open.some((ch) => ch.kind === 'person') && open.some((ch) => ch.kind === 'size')) open = open.filter((ch) => ch.kind === 'size');
    return open.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
  }, [left.join(','), asked.join(','), scene.cards]);

  const ask = async (kind: AskKind, word: string) => {
    if (!secret || phase !== 'ask') return;
    const q = askLine(kind, word);
    sfx.pop();
    setState((s) => ({ ...s, phase: 'asking', question: q, answer: '', asked: [...s.asked, `${kind}:${word}`] }));
    // A moment for the child to SAY the question before Pip answers.
    await new Promise((res) => setTimeout(res, 1600));
    const yes = has(secret, kind, word);
    const a = yes ? YES_LINE : NO_LINE;
    setState((s) => ({ ...s, answer: a }));
    await sayWithin(a, scene.who);
    const fits = (c: Card) => has(c, kind, word) === yes;
    const nextOut = scene.cards.map((c, i) => (outSet.has(i) || !fits(c) ? i : -1)).filter((i) => i >= 0);
    if (yes) sfx.match(); else sfx.click();
    setState((s) => ({ ...s, out: nextOut }));
    const remaining = scene.cards.length - nextOut.length;
    if (remaining > 1) {
      window.setTimeout(() => setState((s) => ({ ...s, phase: 'ask', question: '', answer: '' })), 700);
      return;
    }
    await new Promise((res) => setTimeout(res, 700));
    setState((s) => ({ ...s, phase: 'found' }));
    sfx.reveal();
    fire(70, 40, 'confetti');
    await sayWithin(foundLine(secret), scene.who, 5000);
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
        {phase === 'found' ? `🎉 ${foundLine(secret)}` : secret.person ? '👪 Who is it? Ask Pip!' : secret.word ? '🃏 Guess the secret card. Ask!' : '🃏 Pip has a secret card. Ask Pip!'}
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
          const scale = c.size === 'small' ? 0.62 : 1;
          return (
            <motion.div
              key={`${round}-${i}`}
              aria-label={c.person ? c.word : c.word ? [c.size, c.colorWord.toLowerCase(), c.word].filter(Boolean).join(' ') : `${c.colorWord.toLowerCase()} ${c.shape}`}
              className="grid aspect-[4/3] place-items-center"
              initial={{ scale: 0, rotate: -12 }}
              animate={isSecret ? { scale: [1.25, 1.4, 1.25], y: [0, -14, 0] } : gone ? { scale: 0.7, opacity: 0.22, rotate: 0 } : { scale: 1, opacity: 1, rotate: 0, y: [0, -5, 0] }}
              transition={isSecret ? { duration: 0.8, repeat: Infinity } : gone ? { duration: 0.4 } : { scale: { type: 'spring', stiffness: 260, damping: 14, delay: i * 0.07 }, y: { duration: 2.2 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' } }}
              style={{ filter: gone ? 'grayscale(1)' : undefined }}
            >
              {/* Each card is a die-cut sticker (no white frame); small toys are drawn small. */}
              <span className="relative block h-[12vh] w-[12vh] max-w-full" style={{ filter: STICKER_FILTER, transform: `rotate(${STICKER_TILTS[i % STICKER_TILTS.length]}deg) scale(${scale})` }}>
                {isSecret && <span className="absolute -inset-3 rounded-full bg-yellow-300/70 blur-xl" />}
                {c.img ? <img src={c.img} alt="" draggable={false} className="relative h-full w-full object-contain" /> : <ShapeIcon shape={c.shape} fill={c.colorHex} />}
              </span>
            </motion.div>
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
              : ch.kind === 'toy' || ch.kind === 'person'
                ? <img src={ch.img} alt="" draggable={false} className="block h-9 w-9 object-contain" />
                : ch.kind === 'size'
                  ? <span className="grid h-8 w-8 place-items-center font-black text-orange-500">{ch.word === 'big' ? <span className="text-2xl">⬤</span> : <span className="text-xs">⬤</span>}</span>
                  : <span className="block h-7 w-7"><ShapeIcon shape={ch.word} fill="#FEFBDD" /></span>}
            {askLine(ch.kind, ch.word)}
          </button>
        ))}
        {phase === 'asking' && !answer && <div className="rounded-full bg-sky-500 px-6 py-3 text-lg font-black text-white shadow-2xl">🎤 Say it to Pip!</div>}
      </div>
      <Bursts items={bursts} />
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function secretCardLines(scene: Extract<Scene, { kind: 'secret-card' }>) {
  const out: [string, string][] = [[scene.who, SECRET_INTRO], [scene.who, YES_LINE], [scene.who, NO_LINE]];
  for (const r of scene.rounds) {
    const c = scene.cards[r.secret];
    if (c) out.push([scene.who, foundLine(c)]);
  }
  return out;
}

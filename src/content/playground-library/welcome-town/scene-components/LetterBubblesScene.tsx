import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { CalmBg } from '../../unit1/scene-components/gameFx';

/* ---------- Letter Bubbles (anagram, Wordwall "Anagram" / "Spell the word", modern design — docs/a1-activity-library.md §10) ----------
 * The picture shows the word; its letters float up in soap bubbles, mixed up. The child pops the bubbles in the right
 * order — each popped letter flies into its slot and is sounded by the letter's name in the slot tile. A wrong
 * bubble just wobbles; after two misses the next right bubble shimmers. When the word is complete it is said
 * ("Happy! I am happy!"). Mechanics: Wordwall Anagram, Duolingo ABC spelling, bubble-pop games. Better: the picture
 * gives the meaning first, letters float (playful, no timer), the whole word and a sentence are heard at the end. */

type Bubbles = Extract<Scene, { kind: 'letter-bubbles' }>;
/** a fixed, word-dependent shuffle (the same on both screens), never the word in order */
export function bubbleOrder(word: string): number[] {
  const n = word.length;
  const idx = Array.from({ length: n }, (_, i) => i);
  let seed = [...word].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  for (let i = n - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) >>> 0; const j = seed % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  if (n > 1 && idx.every((v, i) => v === i)) idx.push(idx.shift()!);
  return idx;
}

export function LetterBubblesScene({ scene, onNext, onWin, onLose, sync }: { scene: Bubbles; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.words.length;
  const [state, setState] = useSyncedState(sync, { round: 0, out: [-1], misses: 0, wrong: -1, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const w = scene.words[round];
  const word = (w?.word ?? '').toLowerCase();
  const order = useMemo(() => bubbleOrder(word), [word]);
  const out = useMemo(() => (Array.isArray(state.out) ? state.out.filter((n) => n >= 0 && n < word.length) : []), [state.out, word]);
  const got = Math.min(word.length, out.length);
  const complete = got >= word.length && word.length > 0;
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !w) return undefined;
    const t = window.setTimeout(() => cueSpeak(`Spell it! ${w.word}!`, voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // bubble b holds letter word[order[b]]; any bubble with the next needed letter is right (the two Ps in "happy")
  const popped = (b: number) => out.includes(b);
  const pop = (b: number) => {
    if (!w || complete || done || popped(b)) return;
    if (word[order[b]] !== word[got]) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: b, misses: (Number(s.misses) || 0) + 1 }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.pop();
    const n = got + 1;
    setState((s) => ({ ...s, out: [...(Array.isArray(s.out) ? s.out.filter((x) => x >= 0) : []), b], misses: 0, wrong: -1 }));
    if (n >= word.length) { window.setTimeout(() => { sfx.match(); cueSpeak(w.say, 'teacher'); }, 300); }
  };
  const next = () => {
    sfx.click();
    setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, round: n, out: [-1], misses: 0, wrong: -1 };
    });
  };

  const hintBubble = Number(state.misses) >= 2 ? order.findIndex((v, b) => !popped(b) && word[v] === word[got]) : -1;
  return (
    <div className="absolute inset-0 select-none overflow-hidden">
      {/* busy picture calmed down so the floating pieces are the clearest thing (owner 2026-10-14) */}
      <CalmBg img={scene.bg} strength="strong" />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/20 to-sky-900/40" />
      {done && <Confetti count={80} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🫧 ${scene.title}`}
        </span>
      </div>
      {!done && w && (
        <>
          <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-sky-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>🫧 {round + 1}/{total}</span>
          {/* the picture */}
          <button type="button" onClick={() => { sfx.click(); cueSpeak(w.word, voiceOf(scene.who)); }}
            className="absolute left-[5%] top-[16%] z-20 flex h-[min(32vh,21vw)] w-[min(32vh,21vw)] items-center justify-center rounded-[3vh] border-[0.6vh] border-white bg-white/90 shadow-2xl">
            <img src={w.img} alt="" draggable={false} className="h-[86%] w-[86%] object-contain" />
            <span className="absolute -bottom-[1.5vh] right-[-1.5vh] rounded-full bg-sky-500 px-2 py-1 text-[min(2.6vh,1.8vw)] text-white shadow">🔊</span>
          </button>
          {/* the slots */}
          <div className="absolute left-[5%] right-[5%] bottom-[6%] z-20 flex justify-center gap-[1vw]">
            {[...word].map((c, i) => (
              <div key={i} className={`grid h-[min(11vh,7.4vw)] w-[min(9vh,6vw)] place-items-center rounded-[1.6vh] border-[0.5vh] ${i < got ? 'border-sky-400 bg-white' : 'border-dashed border-white/80 bg-white/30'} shadow-lg`}>
                <AnimatePresence>
                  {i < got && (
                    <motion.span key={`${round}-${i}`} className="font-black text-sky-700" style={{ fontSize: 'min(6vh, 4vw)' }}
                      initial={reduce ? false : { y: -120, scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>{c}</motion.span>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          {/* the bubbles */}
          <div className="absolute left-[34%] right-[4%] top-[18%] z-20 h-[48%]">
            {order.map((_, b) => {
              const gone = popped(b);
              const n = order.length;
              const left = 6 + (b / Math.max(1, n - 1)) * 76;
              const top = 18 + ((b * 37) % 50);
              return (
                <AnimatePresence key={`${round}-${b}`}>
                  {!gone && (
                    <motion.button type="button" onClick={() => pop(b)} aria-label={`bubble ${word[order[b]]}`}
                      className="absolute grid place-items-center rounded-full"
                      style={{ left: `${left}%`, top: `${top}%`, width: 'min(16vh,10.5vw)', height: 'min(16vh,10.5vw)', marginLeft: 'calc(min(16vh,10.5vw) / -2)',
                        // a bright, almost-white bubble with a coloured rim, so the letter reads on any picture (owner 2026-10-14)
                        background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,1) 0 9%, rgba(255,255,255,0.88) 10% 55%, rgba(224,242,254,0.85) 78%, rgba(125,211,252,0.9) 100%)',
                        boxShadow: hintBubble === b ? '0 0 3vh rgba(253,224,71,0.95), inset 0 0 1.5vh rgba(255,255,255,0.9)' : 'inset 0 0 1.5vh rgba(255,255,255,0.9), 0 0.8vh 1.8vh rgba(14,116,144,0.35)',
                        border: `0.55vh solid ${['#38bdf8', '#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#fb923c'][b % 6]}` }}
                      initial={reduce ? false : { y: 200, opacity: 0 }}
                      animate={state.wrong === b ? { x: [0, -10, 10, -6, 0], y: 0, opacity: 1 } : reduce ? { y: 0, opacity: 1 } : { y: [0, -12, 0], opacity: 1 }}
                      transition={state.wrong === b ? { duration: 0.4 } : { y: { duration: 2.6 + (b % 3) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: b * 0.2 }, opacity: { duration: 0.4 } }}
                      exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.25 } }}
                      whileHover={{ scale: 1.08 }}>
                      <span className="font-black text-sky-900" style={{ fontSize: 'min(7.4vh, 4.9vw)', lineHeight: 1 }}>{word[order[b]]}</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
          {complete && (
            <div className="absolute inset-x-0 top-[52%] z-30 flex flex-col items-center gap-[1vh]">
              <span className="rounded-[2vh] bg-white/95 px-5 py-2 font-black text-sky-800 shadow-xl" style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>🎉 {w.say}</span>
              <button type="button" onClick={next} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>{round + 1 >= total ? 'Done! ⭐' : 'Next word 🫧'}</button>
            </div>
          )}
        </>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}

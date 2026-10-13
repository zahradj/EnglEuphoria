import { useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';

/* ---------- Listen and Match (`listen-match`, Pre-A1 — owner 2026-10-13) ----------
 * The owner's rule: every time new words are shown, a matching activity follows — Pre-A1 listens and matches (no
 * written words), A1 reads and matches. Here the words are ONLY sounds: a row of coloured speakers (no text), and the
 * pictures of the words just taught. The child taps a speaker, hears "A bat!", then taps the bat: the speaker sticks to
 * its picture and the word is said again. A wrong picture wiggles and we hear "Listen again!". All matched = the gem.
 * Researched (mechanics only): Cambridge Pre A1 Starters Listening Part 1/4 ("listen and draw lines / tick the box"),
 * Wordwall "Match up" with audio, Lingokids / Khan Academy Kids "listen and find". Better: no reading at all (the
 * cards are sounds, a 4-year-old can play alone); the child replays any speaker as often as they like; the matched
 * speaker stays on its picture so the board shows the progress; no timer, no lost points. Tap-tap, so it mirrors live. */

type ListenMatch = Extract<Scene, { kind: 'listen-match' }>;
export const LISTEN_MATCH_WRONG = 'Listen again!';
const SPEAKER_COLORS = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400', 'bg-violet-400', 'bg-orange-400', 'bg-teal-400', 'bg-pink-400'];

/** A fixed shuffle from the scene id, so the teacher's and the student's speakers are in the same order. */
export function speakerOrder(id: string, n: number): number[] {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  // never leave a speaker right under its own picture's slot on the first card
  if (n > 1 && order[0] === 0) [order[0], order[1]] = [order[1], order[0]];
  return order;
}

export function ListenMatchScene({ scene, onWin, onNext, sync }: { scene: ListenMatch; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { picked: -1, matched: [-1] as number[], wrong: -1, busy: false });
  const matched = useMemo(() => (Array.isArray(state.matched) ? state.matched.filter((n) => n >= 0) : []), [state.matched]);
  const matchedSet = useMemo(() => new Set(matched), [matched]);
  const picked = Number.isInteger(state.picked) ? state.picked : -1;
  const order = useMemo(() => speakerOrder(scene.id, scene.items.length), [scene.id, scene.items.length]);
  const done = matched.length >= scene.items.length;

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(scene.prompt, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const play = (i: number) => {
    const it = scene.items[i];
    if (!it || state.busy || matchedSet.has(i)) return;
    sfx.click();
    setState((s) => ({ ...s, picked: i }));
    cueSpeak(it.say, it.who ?? scene.who);
  };

  const pick = async (i: number) => {
    const it = scene.items[i];
    if (!it || state.busy || matchedSet.has(i) || done) return;
    if (picked < 0) { cueSpeak(scene.prompt, scene.who); return; }
    if (picked !== i) {
      sfx.wrong();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      cueSpeak(LISTEN_MATCH_WRONG, scene.who);
      return;
    }
    sfx.match();
    const next = [...matched, i];
    setState((s) => ({ ...s, matched: next, picked: -1, busy: true }));
    await sayWithin(it.say, it.who ?? scene.who, 2600);
    setState((s) => ({ ...s, busy: false }));
    if (next.length >= scene.items.length) {
      sfx.gem(); onWin(true);
      void sayWithin(scene.doneLine, scene.who, 4000);
    }
  };

  const colorOf = (i: number) => SPEAKER_COLORS[order.indexOf(i) % SPEAKER_COLORS.length];
  const cols = scene.items.length > 4 ? 3 : 2;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-indigo-950/20" />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[10%] z-30 flex justify-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.2*var(--svw,1vw)), 5.2vh), 2.6rem)' }}>
          {done ? `🎉 ${scene.doneLine}` : `👂 ${scene.prompt}`}
        </span>
      </div>

      {/* the pictures */}
      <div className="absolute inset-x-[12%] top-[19%] bottom-[26%] z-20 grid gap-[1.4vh]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${Math.ceil(scene.items.length / cols)}, minmax(0, 1fr))` }}>
        {scene.items.map((it, i) => {
          const ok = matchedSet.has(i);
          return (
            <motion.button key={`${it.label}-${i}`} type="button" onClick={() => void pick(i)} aria-label={it.label}
              className={`relative flex min-h-0 items-center justify-center rounded-[3vh] border-[0.6vh] shadow-xl transition-colors ${ok ? 'border-emerald-400 bg-emerald-50/80' : picked >= 0 ? 'border-amber-300 bg-white/70' : 'border-white/70 bg-white/55'}`}
              animate={state.wrong === i ? { x: [0, -12, 12, -7, 0] } : ok && !reduce ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.45 }}>
              <img src={it.img} alt="" draggable={false} className="h-[82%] w-[82%] object-contain" style={{ filter: STICKER_FILTER }} />
              {ok && (
                <motion.span className={`absolute -bottom-[1.2vh] right-[6%] flex h-[min(7vh,5vw)] w-[min(7vh,5vw)] items-center justify-center rounded-full border-[0.4vh] border-white ${colorOf(i)} shadow-lg`}
                  initial={reduce ? false : { scale: 0, y: 80 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                  style={{ fontSize: 'min(3.4vh, 2.4vw)' }}>🔊</motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* the sounds — speakers only, no written words */}
      {!done && (
        <div className="absolute inset-x-[4%] bottom-[10%] z-30 flex items-end justify-center gap-[1.4vw]">
          {order.map((i, k) => {
            if (matchedSet.has(i)) return <span key={i} className="h-[min(10vh,8vw)] w-[min(10vh,8vw)] rounded-full border-[0.4vh] border-dashed border-white/60" />;
            const on = picked === i;
            return (
              <motion.button key={i} type="button" onClick={() => play(i)} aria-label={`sound ${k + 1}`}
                className={`flex h-[min(10vh,8vw)] w-[min(10vh,8vw)] items-center justify-center rounded-full border-[0.5vh] ${on ? 'border-yellow-200 ring-4 ring-yellow-300' : 'border-white'} ${colorOf(i)} shadow-2xl`}
                animate={on && !reduce ? { y: [0, -10, 0] } : {}} transition={on ? { duration: 0.8, repeat: Infinity } : {}}
                style={{ fontSize: 'min(5vh, 3.6vw)' }}>🔊</motion.button>
            );
          })}
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[11%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}

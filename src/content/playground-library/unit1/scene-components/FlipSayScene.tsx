import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Flip & Say (extra practice, owner 2026-10-12) ----------
 * Speaking cards: a row of face-down cards in the lesson's colours. The child picks ANY card, it flips over, the picture
 * appears with the lesson's sentence frame ("I like ___!", "It's a ___!"), the child says it (🔊 = the model), the teacher
 * taps ✓ and the card turns gold. All cards gold = win. Sources (mechanic only): Wordwall "Flip tiles" and "Speaking
 * cards" templates (JALT "Using Wordwall warm-up and review activities"), classroom flashcard "turn and talk". Better: the
 * child chooses the order (agency), every card ends in a full spoken sentence, not a tap, and both screens flip together. */

type Flip = Extract<Scene, { kind: 'flip-say' }>;
const BACKS = ['from-pink-400 to-rose-500', 'from-sky-400 to-blue-500', 'from-amber-300 to-orange-500', 'from-lime-400 to-emerald-500', 'from-violet-400 to-purple-500', 'from-teal-300 to-cyan-500'];

export function FlipSayScene({ scene, onWin, onNext, sync }: { scene: Flip; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { open: -1, done: [] as number[], gemDone: false });
  const doneSet = useMemo(() => new Set((Array.isArray(state.done) ? state.done : []).filter((n) => typeof n === 'number')), [state.done]);
  const open = typeof state.open === 'number' && state.open >= 0 && state.open < scene.cards.length ? state.open : -1;
  const all = doneSet.size >= scene.cards.length;
  const [bursts, fire] = useBursts();
  const cols = scene.cards.length > 6 ? 4 : 3;

  const flip = (i: number) => {
    if (open >= 0 || doneSet.has(i)) return;
    sfx.pop();
    setState((s) => ({ ...s, open: i }));
    window.setTimeout(() => cueSpeak(scene.cards[i].say, scene.who), 450);
  };
  const said = () => {
    if (open < 0) return;
    sfx.match();
    const col = open % cols, row = Math.floor(open / cols);
    fire(20 + col * (60 / Math.max(1, cols - 1)), 30 + row * 30, 'stars');
    const next = [...doneSet, open];
    const win = next.length >= scene.cards.length;
    if (win && !state.gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, open: -1, done: next, gemDone: s.gemDone || win }));
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/10" />
      {all && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-[8%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.8*var(--svw,1vw)), 4.6vh), 2.2rem)' }}>
          {all ? scene.doneLine : open >= 0 ? scene.cards[open].say : scene.title}
        </span>
      </div>

      <div className="absolute left-1/2 top-[52%] z-20 grid -translate-x-1/2 -translate-y-1/2 gap-[2vh]" style={{ gridTemplateColumns: `repeat(${cols}, min(19vh, 13vw))` }}>
        {scene.cards.map((c, i) => {
          const isOpen = open === i, isDone = doneSet.has(i);
          const face = isOpen || isDone;
          return (
            <motion.button key={i} type="button" onClick={() => flip(i)} aria-label={face ? c.label : `Card ${i + 1}`}
              className="relative aspect-[3/4] rounded-[2.5vh] [perspective:900px]" whileHover={reduce || face ? {} : { y: -6 }} whileTap={{ scale: 0.95 }}>
              <motion.div className="absolute inset-0 rounded-[2.5vh] [transform-style:preserve-3d]" animate={{ rotateY: face ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.45 }}>
                <div className={`absolute inset-0 grid place-items-center rounded-[2.5vh] border-[0.5vh] border-white bg-gradient-to-b ${BACKS[i % BACKS.length]} shadow-[0_0.8vh_0_rgba(0,0,0,0.25)] [backface-visibility:hidden]`}>
                  <span className="font-black text-white/90" style={{ fontSize: 'min(8vh, 5vw)' }}>?</span>
                </div>
                <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-[2.5vh] border-[0.5vh] ${isDone ? 'border-yellow-300 bg-yellow-50' : 'border-white bg-white'} shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]`}>
                  <img src={c.img} alt="" draggable={false} className="h-[70%] w-[86%] object-contain" />
                  <span className="font-black text-emerald-800" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{isDone ? `⭐ ${c.label}` : c.label}</span>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {open >= 0 && (
        <motion.div className="absolute inset-x-0 bottom-[4%] z-30 flex items-center justify-center gap-3" initial={reduce ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <button type="button" onClick={() => cueSpeak(scene.cards[open].say, scene.who)} aria-label="Hear it" className="grid h-[8vh] w-[8vh] place-items-center rounded-full bg-white/95 text-[3.8vh] shadow-lg">🔊</button>
          <span className="rounded-full bg-white/95 px-5 py-2 font-black text-emerald-800 shadow-lg" style={{ fontSize: 'min(3.2vh, 2.1vw)' }}>🗣️ Say it!</span>
          <button type="button" onClick={said} className={`${CLAY_BUTTON} px-7 py-2`} style={{ fontSize: 'min(3.2vh, 2.1vw)' }}>I said it! ✓</button>
        </motion.div>
      )}
      <Bursts items={bursts} />
      {all && (
        <motion.div className="absolute inset-x-0 bottom-[6%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </div>
  );
}

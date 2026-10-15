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
import { SKIN } from '../../gameSkin';

/* ---------- Balloon Match (Wordwall "Balloon Pop", redesigned — docs/a1-activity-library.md §12) ----------
 * Balloons float in the sky, each carrying a sentence ("This is Mia."). The pictures wait in baskets below. The child
 * taps a balloon (it glows) and then the picture it belongs to: the balloon floats down to the basket and pops in a
 * burst of confetti, and the sentence is said. A wrong basket makes the balloon bounce back up. Picture first, then
 * balloon, works too. Mechanics: Wordwall Balloon Pop / Match up, Khan Academy Kids reading matches. Better: whole
 * sentences (reading for meaning, not single words), tap-tap instead of fast popping, every match is heard. */

type BalloonMatch = Extract<Scene, { kind: 'balloon-match' }>;
/** Balloon colours from the shared game palette (gameSkin.ts): light / deep pairs for a soft round shine. */
const COLORS: [string, string][] = [['#A78BFA', '#6D28D9'], ['#5EEAD4', '#0D9488'], ['#F9A8D4', '#DB2777'], ['#FCD34D', '#D97706'], ['#93C5FD', '#3B6FD4'], ['#FDA4AF', '#E0475B']];

export function BalloonMatchScene({ scene, onNext, onWin, onLose, sync }: { scene: BalloonMatch; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const n = scene.pairs.length;
  // balloons in a fixed mixed order (never the basket order)
  const order = useMemo(() => Array.from({ length: n }, (_, i) => (i + Math.ceil(n / 2)) % n), [n]);
  const [state, setState] = useSyncedState(sync, { balloon: -1, basket: -1, matched: [-1], wrong: -1, done: false });
  const matched = useMemo(() => new Set(Array.isArray(state.matched) ? state.matched.filter((x) => x >= 0) : []), [state.matched]);
  const sel = Number(state.balloon);
  const basketSel = Number(state.basket);
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak('Read a balloon. Find its picture!', voiceOf(scene.who)), 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const tryMatch = (b: number, k: number) => {
    if (b === k) {
      sfx.reveal(); window.setTimeout(() => sfx.pop(), 450);
      cueSpeak(scene.pairs[b].text, 'teacher');
      setState((s) => {
        const list = [...(Array.isArray(s.matched) ? s.matched.filter((x) => x >= 0) : []), b];
        return { ...s, matched: list, balloon: -1, basket: -1, wrong: -1 };
      });
      if (matched.size + 1 >= n) window.setTimeout(() => setState((s) => ({ ...s, done: true })), 1600);
      return;
    }
    sfx.wrong(); onLose();
    setState((s) => ({ ...s, wrong: b, balloon: -1, basket: -1 }));
    window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 700);
  };
  const tapBalloon = (b: number) => {
    if (done || matched.has(b)) return;
    sfx.click();
    cueSpeak(scene.pairs[b].text, voiceOf(scene.who));
    if (basketSel >= 0) { tryMatch(b, basketSel); return; }
    setState((s) => ({ ...s, balloon: b }));
  };
  const tapBasket = (k: number) => {
    if (done || matched.has(k)) return;
    if (sel >= 0) { tryMatch(sel, k); return; }
    sfx.click();
    setState((s) => ({ ...s, basket: k }));
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden">
      <CalmBg img={scene.bg} />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🎈 ${scene.title}`}
        </span>
      </div>
      {!done && <span className={`absolute end-3 top-[13%] z-30 px-4 py-2 ${SKIN.pill}`} style={{ fontSize: 'min(3vh, 2vw)' }}>🎈 {matched.size}/{n}</span>}
      {/* the balloons */}
      <div className="absolute inset-x-[3%] top-[17%] z-20 flex h-[40%] justify-around">
        {order.map((b, slot) => {
          const p = scene.pairs[b];
          const isSel = sel === b;
          return (
            <AnimatePresence key={b}>
              {!matched.has(b) && (
                <motion.button type="button" onClick={() => tapBalloon(b)} aria-label={p.text} className="relative flex flex-col items-center"
                  style={{ width: `${Math.min(18, 92 / n)}%` }}
                  animate={state.wrong === b ? { y: [0, 60, 0], x: [0, -8, 8, 0] } : reduce ? { y: isSel ? -6 : 0 } : { y: isSel ? [-10, -18, -10] : [0, -12, 0] }}
                  transition={state.wrong === b ? { duration: 0.6 } : { duration: 2.4 + (slot % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                  exit={{ y: 260, scale: 0.4, opacity: 0, transition: { duration: 0.5 } }}>
                  <span className={`relative flex aspect-[4/5] w-full items-center justify-center rounded-[50%] p-[7%] shadow-[inset_-1.2vh_-1.6vh_2.4vh_rgba(0,0,0,0.18),0_1.6vh_2.4vh_rgba(30,10,60,0.3)] ${isSel ? 'ring-[0.7vh] ring-[#FDE68A]' : ''}`}
                    style={{ background: `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.75) 0 7%, ${COLORS[slot % COLORS.length][0]} 26%, ${COLORS[slot % COLORS.length][1]} 92%)` }}>
                    <span className={`rounded-[1.4vh] bg-[#FFFBF3]/95 px-[0.6vw] py-[0.6vh] text-center font-black leading-tight shadow ${SKIN.ink}`} style={{ fontSize: 'min(2.6vh, 1.7vw)' }}>{p.text}</span>
                  </span>
                  <span className="h-[1.4vh] w-[1.4vh] -mt-[0.4vh] rotate-45" style={{ background: COLORS[slot % COLORS.length][1] }} />
                  <span className="h-[7vh] w-[0.25vh] bg-[#F7E8CF]/90" />
                </motion.button>
              )}
            </AnimatePresence>
          );
        })}
      </div>
      {/* the baskets */}
      <div className="absolute inset-x-[4%] bottom-[5%] z-20 flex justify-around">
        {scene.pairs.map((p, k) => {
          const got = matched.has(k);
          return (
            <motion.button key={k} type="button" onClick={() => tapBasket(k)} aria-label={p.label} whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center p-[0.8vh] ${SKIN.card} ${basketSel === k ? 'ring-[0.5vh] ring-[#FDE68A]' : got ? 'ring-[0.5vh] ring-[#4ADE80]' : ''}`}
              style={{ width: `${Math.min(17, 90 / n)}%` }}>
              <img src={p.img} alt="" draggable={false} className="h-[min(17vh,11vw)] w-full object-contain" />
              <span className="mt-[0.4vh] w-full rounded-[1vh] bg-gradient-to-b from-[#5B3A8C] to-[#3B1E66] py-[0.5vh] text-center font-black text-[#FFF4DC]" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>
                {got ? '🎉' : '🧺'}
              </span>
              {got && !reduce && (
                <motion.span className="pointer-events-none absolute -top-[4vh] text-[min(5vh,3.4vw)]" initial={{ scale: 0, y: 0 }} animate={{ scale: [0, 1.4, 1], y: -10 }} transition={{ duration: 0.6 }}>💥</motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}

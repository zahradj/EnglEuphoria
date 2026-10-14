import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Pass the Present (classic pass-the-parcel, modern design — docs/a1-activity-library.md §11) ----------
 * A big present wrapped in one layer of paper per question. The friend asks; every right answer tears one layer off
 * (it flies away in strips, the next paper colour shows); inside the last layer waits the prize sticker. No music
 * stop, no timer, nobody is "out" — the suspense is the next colour and the prize.
 * Mechanics: pass-the-parcel party game, Wordwall "Open the box", Blooket chests. Better: the parcel only opens with
 * English answers, the layers count down visibly, and the prize goes into the child's Sticker Book line. */

type Parcel = Extract<Scene, { kind: 'pass-parcel' }>;
const PAPER = [
  ['#F43F5E', '#FDE047'], ['#3B82F6', '#F9A8D4'], ['#22C55E', '#FDBA74'], ['#A855F7', '#67E8F9'],
  ['#F97316', '#BEF264'], ['#EC4899', '#93C5FD'], ['#14B8A6', '#FDE68A'], ['#EAB308', '#C4B5FD'],
];

export function PassParcelScene({ scene, onNext, onWin, onLose, sync }: { scene: Parcel; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, wrong: -1, ripping: false, done: false });
  const round = Math.max(0, Math.min(total, Number(state.round) || 0));
  const r = round < total ? scene.rounds[round] : undefined;
  const done = !!state.done;
  const busy = useRef(false);
  const gemDone = useRef(false);
  const layersLeft = Math.max(0, total - round);
  const paper = PAPER[(total - layersLeft) % PAPER.length];

  useEffect(() => {
    if (done || !r) return undefined;
    busy.current = false;
    const t = window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const answer = (c: number) => {
    if (!r || busy.current || done) return;
    if (c !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: c }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    busy.current = true;
    sfx.match(); sfx.reveal();
    cueSpeak(r.choices[c], 'teacher');
    setState((s) => ({ ...s, ripping: true }));
    window.setTimeout(() => setState((s) => {
      const next = (Number(s.round) || 0) + 1;
      return next >= total ? { ...s, round: next, ripping: false, done: true } : { ...s, round: next, ripping: false };
    }), 1200);
  };

  const box = 'min(40vh, 28vw)';
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[7%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🎁 ${scene.title}`}
        </span>
      </div>
      {!done && (
        <span className="absolute right-3 top-[14%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-pink-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>
          {layersLeft} {layersLeft === 1 ? 'layer' : 'layers'} left
        </span>
      )}
      {/* the present */}
      <div className="absolute left-1/2 top-[44%] z-20 -translate-x-1/2 -translate-y-1/2" style={{ width: box, height: box }}>
        {done ? (
          <motion.div className="grid h-full w-full place-items-center" initial={reduce ? false : { scale: 0.2, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>
            <div className="grid aspect-square w-[88%] place-items-center rounded-full border-[0.8vh] border-white bg-gradient-to-b from-amber-200 to-orange-400 shadow-2xl">
              <img src={scene.prize.img} alt={scene.prize.label} draggable={false} className="h-[78%] w-[78%] object-contain drop-shadow-xl" />
            </div>
            <span className="mt-[1vh] rounded-full bg-white px-4 py-1 font-black text-orange-700 shadow" style={{ fontSize: 'min(3vh, 2vw)' }}>{scene.prize.label}</span>
          </motion.div>
        ) : (
          <motion.div className="relative h-full w-full" animate={state.ripping || reduce ? {} : { rotate: [0, -3, 3, 0], y: [0, -6, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
            <div className="absolute inset-[6%] rounded-[2.4vh] border-[0.6vh] border-white shadow-2xl" style={{ background: `repeating-linear-gradient(45deg, ${paper[0]} 0 1.6vh, ${paper[0]}dd 1.6vh 3.2vh)` }} />
            <div className="absolute inset-y-[6%] left-1/2 w-[16%] -translate-x-1/2" style={{ background: paper[1] }} />
            <div className="absolute inset-x-[6%] top-1/2 h-[16%] -translate-y-1/2" style={{ background: paper[1] }} />
            <div className="absolute left-1/2 top-[1%] -translate-x-1/2" style={{ fontSize: 'min(10vh, 7vw)' }}>🎀</div>
            {/* the layer being torn off */}
            <AnimatePresence>
              {state.ripping && [0, 1, 2, 3, 4, 5].map((k) => (
                <motion.div key={`${round}-${k}`} className="absolute rounded-md" style={{ left: `${10 + k * 14}%`, top: '30%', width: '14%', height: '40%', background: paper[0] }}
                  initial={{ opacity: 1, y: 0, rotate: 0 }} animate={{ opacity: 0, y: -200 - k * 30, x: (k - 2.5) * 60, rotate: (k - 2.5) * 50 }} transition={{ duration: 1 }} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      {/* the question */}
      {r && !done && (
        <motion.div key={round} className="absolute inset-x-[10%] bottom-[3%] z-40 rounded-[3vh] border-[0.6vh] border-white bg-white/95 p-[2vh] text-center shadow-2xl"
          initial={reduce ? false : { y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="mb-[1.4vh] flex items-center justify-center gap-3">
            {r.img && <img src={r.img} alt="" draggable={false} className="h-[min(9vh,6vw)] w-auto object-contain" />}
            <button type="button" onClick={() => cueSpeak(r.ask, voiceOf(scene.who))} className="font-black text-[#3b2410]" style={{ fontSize: 'min(4.2vh, 2.9vw)' }}>
              {r.ask} <span className="text-[0.7em]">🔊</span>
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-[1.4vw]">
            {r.choices.map((c, ci) => (
              <motion.button key={ci} type="button" onClick={() => answer(ci)} whileTap={{ scale: 0.93 }} disabled={state.ripping}
                animate={state.wrong === ci ? { x: [0, -10, 10, -6, 0] } : {}}
                className="rounded-[2vh] border-[0.4vh] border-white bg-gradient-to-b from-pink-400 to-pink-600 px-[2.2vw] py-[1.2vh] font-black text-white shadow-[0_0.7vh_0_rgba(0,0,0,0.25)]"
                style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>{c}</motion.button>
            ))}
          </div>
        </motion.div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[6%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}

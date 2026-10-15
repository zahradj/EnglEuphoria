import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { SKIN } from '../../gameSkin';

/* ---------- Sentence Dominoes (classic dominoes, modern design — docs/a1-activity-library.md §11) ----------
 * The chain on the table ends with a picture. The child's dominoes each have a SENTENCE on one half and a new picture
 * on the other; the child reads them and plays the one whose sentence matches the open picture — it slides on with a
 * click and its picture becomes the new open end. A wrong domino wobbles back to the hand. The chain grows across the
 * table until the hand is empty. Mechanics: picture/word dominoes (classroom ESL), Wordwall "Match up". Better: the
 * match is sentence ↔ picture, so the child READS for meaning; every played tile is read aloud; no opponent. */

type Dom = Extract<Scene, { kind: 'dominoes' }>;

function DominoHalf({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex h-full w-1/2 items-center justify-center p-[0.8vh] ${className}`}>{children}</div>;
}

export function DominoesScene({ scene, onNext, onWin, onLose, sync }: { scene: Dom; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.steps.length;
  const [state, setState] = useSyncedState(sync, { placed: 0, wrong: -1, done: false });
  const placed = Math.max(0, Math.min(total, Number(state.placed) || 0));
  const done = !!state.done;
  const gemDone = useRef(false);
  const busy = useRef(false);
  // the hand: the tiles not yet played, in a fixed mixed order (same on both screens)
  const order = useMemo(() => scene.steps.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % 11) - ((b * 7 + 3) % 11)), [scene.steps]);
  const rest = order.filter((i) => i >= placed);
  // up to 4 tiles in hand — always including the one that fits
  const hand = rest.slice(0, 4).includes(placed) || placed >= total ? rest.slice(0, 4) : [...rest.slice(0, 3), placed].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const end = placed === 0 ? scene.start : scene.steps[placed - 1];

  useEffect(() => {
    if (done) return undefined;
    busy.current = false;
    const t = window.setTimeout(() => cueSpeak(placed === 0 ? `Look! What is it? Find the sentence!` : 'Now this picture! Find the sentence!', voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const play = (i: number) => {
    if (done || busy.current) return;
    if (i !== placed) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    busy.current = true;
    sfx.click(); sfx.match();
    cueSpeak(scene.steps[i].text, 'teacher');
    setState((s) => {
      const n = (Number(s.placed) || 0) + 1;
      return { ...s, placed: n, wrong: -1, done: n >= total };
    });
  };

  // the table shows the start tile and the last three played tiles
  const shown = Array.from({ length: placed }, (_, k) => k).slice(-3);
  const tileW = 'min(34vh, 23vw)';
  const tileH = 'min(15vh, 10vw)';
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[6%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🁫 ${scene.title}`}
        </span>
      </div>
      {!done && <span className={`absolute end-3 top-[14%] z-30 px-4 py-2 ${SKIN.pill}`} style={{ fontSize: 'min(3vh, 2vw)' }}>{placed}/{total}</span>}
      {/* the table with the chain */}
      <div className={`absolute inset-x-[3%] top-[20%] z-20 flex h-[34%] items-center justify-center gap-[0.6vw] px-[1vw] ${SKIN.frame}`}>
        <div className="flex items-center rounded-[1.6vh] border-[0.4vh] border-white bg-[#fffaf0] shadow-lg" style={{ width: `calc(${tileW} / 2)`, height: tileH }}>
          <img src={scene.start.img} alt={scene.start.label} draggable={false} className="h-full w-full object-contain p-[0.8vh]" />
        </div>
        <AnimatePresence initial={false}>
          {shown.map((k) => (
            <motion.div key={k} layout className={`flex items-center divide-x-[0.3vh] divide-dashed divide-neutral-300 rounded-[1.6vh] border-[0.4vh] bg-[#fffaf0] shadow-lg ${k === placed - 1 ? 'border-yellow-300' : 'border-white'}`}
              style={{ width: tileW, height: tileH }}
              initial={reduce ? false : { y: 160, opacity: 0, rotate: 8 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
              <DominoHalf><span className="text-center font-black leading-tight text-[#2A1A05]" style={{ fontSize: 'min(2.5vh, 1.7vw)' }}>{scene.steps[k].text}</span></DominoHalf>
              <DominoHalf><img src={scene.steps[k].img} alt={scene.steps[k].label} draggable={false} className="h-full w-full object-contain" /></DominoHalf>
            </motion.div>
          ))}
        </AnimatePresence>
        {!done && (
          <motion.div className="grid place-items-center rounded-[1.6vh] border-[0.4vh] border-dashed border-yellow-200 text-yellow-100" style={{ width: `calc(${tileW} / 2)`, height: tileH, fontSize: 'min(6vh, 4vw)' }}
            animate={reduce ? {} : { opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity }}>?</motion.div>
        )}
      </div>
      {/* the open end, big, so the child knows which picture to describe */}
      {!done && end && (
        <div className="absolute bottom-[4%] left-[3%] z-20 flex flex-col items-center gap-[0.6vh]">
          <span className={`px-3 py-1 ${SKIN.pill}`} style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>Match this! 👉</span>
          <div className="rounded-[2vh] border-[0.5vh] border-yellow-300 bg-[#fffaf0] p-[0.8vh] shadow-xl"><img src={end.img} alt={end.label} draggable={false} className="h-[min(22vh,14vw)] w-[min(22vh,14vw)] object-contain" /></div>
        </div>
      )}
      {/* the hand */}
      {!done && (
        <div className="absolute bottom-[4%] left-[22%] right-[3%] z-30 grid grid-cols-2 gap-[1.2vh]">
          {hand.map((i) => (
            <motion.button key={i} type="button" onClick={() => play(i)} whileTap={{ scale: 0.95 }} whileHover={reduce ? {} : { y: -4 }}
              animate={state.wrong === i ? { x: [0, -10, 10, -6, 0] } : {}}
              className={`flex items-center divide-x-[0.3vh] divide-dashed divide-[#E5CFA6] ${SKIN.card}`}
              style={{ height: 'min(14vh, 9.4vw)' }}>
              <DominoHalf><span className="text-center font-black leading-tight text-[#2A1A05]" style={{ fontSize: 'min(2.7vh, 1.8vw)' }}>{scene.steps[i].text}</span></DominoHalf>
              <DominoHalf><img src={scene.steps[i].img} alt="" draggable={false} className="h-full w-full object-contain" /></DominoHalf>
            </motion.button>
          ))}
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}

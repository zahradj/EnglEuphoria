import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Washing Line (Pre-A1 Unit 9 Lesson 1 signature game) ----------
 * Laundry day in Pip's backyard. The clean clothes are in the basket; Pip asks for one — "Where is my
 * red shirt?" — and the child taps it: it flies up and is pegged on the washing line, where it swings
 * in the breeze. A wrong piece is named back ("No, not the dress! Listen again."), so a mistake is more
 * listening. When the line is full the wind blows and everything dances.
 * Sources (mechanic only): Lingokids / Toca Boca dress-up and "hang it up" play, Cambridge Pre A1
 * Starters "listen and point" (clothes and colours), the classroom washing-line flashcard game.
 * Better: the request joins the new word to a colour the child knows ("the red shirt"), every right
 * answer builds a visible line of clothes (permanence), and the payoff is the windy dance; no clock. */

type Line = Extract<Scene, { kind: 'washing-line' }>;
export const lineWrongLine = (word: string) => `No, not the ${word}! Listen again.`;

export function WashingLineScene({ scene, onWin, onNext, sync }: { scene: Line; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, hung: [] as number[], gemDone: false });
  const { round, hung, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const slotX = (k: number) => scene.rope.x0 + ((k + 0.5) * (scene.rope.x1 - scene.rope.x0)) / Math.max(1, total);

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  useEffect(() => { if (done) void sayWithin(scene.doneLine, scene.who, 4000); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [done]);

  const pick = async (i: number) => {
    const c = scene.clothes[i];
    if (!r || !c || busy.current || hung.includes(i)) return;
    busy.current = true;
    if (i !== r.item) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(lineWrongLine(c.word), scene.who, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, hung: [...s.hung, i] }));
    fire(slotX(hung.length), scene.rope.y + 10, 'stars');
    await sayWithin(r.reply, scene.who, 3000);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  const size = 'min(17vh, 12vw)';

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? `👕 ${r.line}` : scene.doneLine}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-14 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* Clothes on the line, each with a peg; they sway, and dance in the wind at the end */}
      <AnimatePresence>
        {hung.map((ci, k) => {
          const c = scene.clothes[ci];
          if (!c) return null;
          return (
            <motion.div key={ci} className="absolute z-20 -translate-x-1/2" style={{ left: `${slotX(k)}%`, top: `${scene.rope.y}%`, transformOrigin: '50% 0%' }}
              initial={{ y: 300, scale: 0.5, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1, rotate: done ? [0, 9, -9, 7, -7, 0] : [0, 3, -3, 0] }}
              transition={{ y: { type: 'spring', stiffness: 160, damping: 15 }, scale: { duration: 0.4 }, rotate: { duration: done ? 1.4 : 3.2, repeat: Infinity, ease: 'easeInOut', delay: k * 0.15 } }}>
              <span className="absolute left-1/2 top-[-6px] z-10 block h-[min(4vh,2.8vw)] w-[min(1.6vh,1.1vw)] -translate-x-1/2 rounded-sm border-2 border-[#7A4B21] bg-[#D9A066] shadow" />
              <img src={c.img} alt={c.word} draggable={false} className="block object-contain" style={{ height: size, width: size, filter: STICKER_FILTER }} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* The basket of clean clothes */}
      {!done && <div className="absolute bottom-[5%] left-1/2 z-30 flex -translate-x-1/2 items-end gap-3 rounded-[2rem] border-[5px] border-[#B07A3B] bg-[#E9C48A]/90 px-4 pb-2 pt-3 shadow-2xl">
        {scene.clothes.map((c, i) => {
          if (hung.includes(i)) return null;
          const glow = r && misses >= 2 && i === r.item;
          return (
            <motion.button key={i} onClick={() => { void pick(i); }} aria-label={c.word} className="relative block" whileTap={{ scale: 0.9 }}
              animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -4, 0] }}
              transition={wrong === i ? { duration: 0.4 } : { duration: 2 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}>
              {glow && <span className="absolute -inset-2 animate-pulse rounded-full bg-yellow-300/80 blur-md" />}
              <img src={c.img} alt="" draggable={false} className="relative z-10 h-[min(14vh,10vw)] w-[min(14vh,10vw)] object-contain" style={{ filter: STICKER_FILTER }} />
            </motion.button>
          );
        })}
      </div>}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[10%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function washingLineLines(scene: Line) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.clothes.map((c) => [scene.who, lineWrongLine(c.word)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}

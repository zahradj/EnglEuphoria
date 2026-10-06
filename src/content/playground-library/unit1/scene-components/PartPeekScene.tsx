import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CropPic, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Whose Is It? (Pre-A1 Unit 4 Lesson 5) ----------
 * One body part peeks out of a round gap in a leafy bush — big grey feet,
 * stripy head, flippers — and Pip asks "Whose feet are these?". The child
 * taps the animal's face; the bush slides away and the whole animal is there
 * ("The elephant's feet! The elephant stomps its feet!"). Researched: the
 * peekaboo / "Whose tail is it?" picture-book pattern (Cambridge Pre A1
 * Starters "look and guess"), Khan Academy Kids hide-and-reveal, and
 * Lingokids animal games. Better: the clue is a BODY PART from this unit, so
 * the child names the part and the animal together, and the reveal recalls
 * the story's move. Wrong faces are named back; no clock. */

type Peek = Extract<Scene, { kind: 'part-peek' }>;
export const peekWrongLine = (label: string) => `Not the ${label}! Look again!`;

export function PartPeekScene({ scene, onWin, onNext, sync }: { scene: Peek; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, open: false, wrong: [] as number[], gemDone: false });
  const { round, open, wrong, gemDone } = state;
  const wrongSet = useMemo(() => new Set(wrong), [wrong]);
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const a = r ? scene.animals[r.animal] : undefined;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.question, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (i: number) => {
    const b = scene.animals[i];
    if (!r || !b || busy.current || open || wrongSet.has(i)) return;
    busy.current = true;
    if (i !== r.animal) {
      sfx.wrong(); shake();
      setMisses((m) => m + 1);
      setState((s) => ({ ...s, wrong: [...s.wrong, i] }));
      await sayWithin(peekWrongLine(b.label), scene.who, 2600);
      busy.current = false;
      return;
    }
    sfx.match(); fire(50, 40, 'stars');
    setState((s) => ({ ...s, open: true }));
    await sayWithin(r.reply, scene.who, 4500);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    window.setTimeout(() => {
      setState((s) => ({ ...s, round: next, open: false, wrong: [], gemDone: s.gemDone || next >= total }));
      if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
    }, 900);
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {r ? (open ? r.reply : r.question) : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.question, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The bush with the peeking part; it slides away to show the animal. */}
      {r && a && (
        <div key={round} className="absolute left-1/2 top-[28%] z-10 h-[40vh] w-[min(71vh,60vw)] -translate-x-1/2 [@media(max-height:500px)]:top-[26%] [@media(max-height:500px)]:h-[36vh]">
          <motion.img src={a.img} alt={a.label} draggable={false}
            className="absolute inset-0 h-full w-full rounded-[28px] border-[6px] border-white object-cover shadow-[0_14px_30px_rgba(0,0,0,0.3)]"
            initial={{ opacity: 0 }} animate={{ opacity: open ? 1 : 0 }} transition={{ duration: 0.5 }} />
          <motion.div
            className="absolute inset-0 grid place-items-center rounded-[28px] shadow-[0_14px_30px_rgba(0,0,0,0.3)]"
            style={{ background: 'radial-gradient(circle at 30% 30%, #4ADE80, #15803D 70%)', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.18)' }}
            animate={open ? { y: '120%', rotate: 8, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeIn' }}
          >
            {/* Leaves around the gap. */}
            {Array.from({ length: 14 }, (_, k) => {
              const ang = (k / 14) * Math.PI * 2;
              return <span key={k} className="absolute h-[22%] w-[13%] rounded-[50%_50%_50%_0] bg-green-500/90" style={{ left: `${44 + Math.cos(ang) * 40}%`, top: `${40 + Math.sin(ang) * 38}%`, transform: `rotate(${(ang * 180) / Math.PI}deg)` }} />;
            })}
            <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <CropPic img={a.img} at={r.part} w={r.partW} alt={`peeking ${r.partWord}`} className="h-[30vh] w-[30vh] border-[6px] border-amber-900/70 shadow-[inset_0_0_18px_rgba(0,0,0,0.5)] [@media(max-height:500px)]:h-[27vh] [@media(max-height:500px)]:w-[27vh]" />
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* The animals' faces to choose from. */}
      {r && !open && (
        <div className="absolute inset-x-0 bottom-[11%] z-20 flex items-end justify-center gap-[3vw] px-4 [@media(max-height:500px)]:bottom-[13%]">
          {scene.animals.map((b, i) => {
            const isWrong = wrongSet.has(i);
            const glow = misses >= 2 && i === r.animal;
            return (
              <motion.button key={b.label} onClick={() => { void pick(i); }} aria-label={b.label}
                className={`relative ${isWrong ? 'opacity-40' : ''}`}
                animate={isWrong ? { x: [0, -8, 8, -4, 4, 0] } : { y: [0, -5, 0] }}
                transition={isWrong ? { duration: 0.4 } : { duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                whileTap={{ scale: 0.9 }}>
                {glow && <span className="absolute -inset-2 animate-pulse rounded-full bg-yellow-300/80 blur-md" />}
                <CropPic img={b.img} at={b.face} w={b.faceW} alt={b.label} className="relative h-[min(17vh,14vw)] w-[min(17vh,14vw)] border-[5px] border-white shadow-[0_8px_18px_rgba(0,0,0,0.3)]" />
              </motion.button>
            );
          })}
        </div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function partPeekLines(scene: Peek) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.question], [scene.who, r.reply]]),
    ...scene.animals.map((a) => [scene.who, peekWrongLine(a.label)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}

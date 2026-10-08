import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CropPic, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Who Can Do It? (Pre-A1 Unit 4 Lesson 5 signature game) ----------
 * After the "Animal Moves" film: "Who stomps their feet?" — the child taps the
 * animal (the round face pictures), the animal's move fills the screen, and
 * Pip asks "Can you do it?". The child does the move with their own body and
 * taps "I can do it!" (saying it). Researched: Eric Carle's call-and-response
 * movement book "From Head to Toe" ("I can do it!"), Lingokids action games
 * and Cambridge Pre A1 "listen and point". Better than both: the child must
 * understand the verb + body part to pick the animal, then PRODUCES the move
 * and the sentence — the screen waits for the child, not a clock. A wrong
 * animal is named back with its own move ("The seal claps its hands!"). */

type Match = Extract<Scene, { kind: 'move-match' }>;
export const moveWrongLine = (a: { label: string; move: string }) => `No, the ${a.label} ${a.move}! Try again!`;
export const CAN_DO = 'I can do it!';

export function MoveMatchScene({ scene, onWin, onNext, sync }: { scene: Match; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, found: false, wrong: [] as number[], gemDone: false });
  const { round, found, wrong, gemDone } = state;
  const wrongSet = useMemo(() => new Set(wrong), [wrong]);
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r || found) return;
    const t = window.setTimeout(() => cueSpeak(r.question, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (i: number) => {
    const a = scene.animals[i];
    if (!r || !a || busy.current || found || wrongSet.has(i)) return;
    busy.current = true;
    if (i !== r.animal) {
      sfx.wrong(); shake();
      setMisses((m) => m + 1);
      setState((s) => ({ ...s, wrong: [...s.wrong, i] }));
      await sayWithin(moveWrongLine(a), scene.who, 3200);
      busy.current = false;
      return;
    }
    sfx.match(); fire(50, 45, 'stars');
    setState((s) => ({ ...s, found: true }));
    await sayWithin(r.reply, scene.who, 4500);
    busy.current = false;
  };

  const canDo = async () => {
    if (!r || !found || busy.current) return;
    busy.current = true;
    sfx.pop(); fire(50, 70, 'confetti');
    await sayWithin(CAN_DO, scene.who, 2200);
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, found: false, wrong: [], gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  const shown = r && found ? scene.animals[r.animal] : undefined;

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${shown ? shown.img : scene.bg})`, transition: 'background-image 0.4s' }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {r ? (found ? r.reply : r.question) : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(found ? r.reply : r.question, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The animals' faces. */}
      {r && !found && (
        <div key={round} className="absolute inset-x-0 bottom-[11%] z-20 flex items-end justify-center gap-[3vw] px-4">
          {scene.animals.map((a, i) => {
            const isWrong = wrongSet.has(i);
            const glow = misses >= 2 && i === r.animal;
            return (
              <motion.button
                key={a.label}
                onClick={() => { void pick(i); }}
                aria-label={a.label}
                className={`relative flex flex-col items-center gap-1 ${isWrong ? 'opacity-40' : ''}`}
                initial={{ y: 80, opacity: 0 }}
                animate={isWrong ? { y: 0, opacity: 0.4, x: [0, -8, 8, -4, 4, 0] } : { y: [0, -6, 0], opacity: 1 }}
                transition={isWrong ? { duration: 0.4 } : { y: { duration: 2.2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.3, delay: i * 0.08 } }}
                whileTap={{ scale: 0.9 }}
              >
                {glow && <span className="absolute -inset-2 animate-pulse rounded-full bg-yellow-300/80 blur-md" />}
                <CropPic img={a.img} at={a.face} w={a.faceW} alt={a.label} className="relative h-[min(22vh,17vw)] w-[min(22vh,17vw)] border-[5px] border-white shadow-[0_8px_18px_rgba(0,0,0,0.3)]" />
              </motion.button>
            );
          })}
        </div>
      )}

      {/* The child's turn: do the move, then say it. */}
      {r && found && (
        <motion.div className="absolute inset-x-0 bottom-[10%] z-30 flex flex-col items-center gap-2" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
          <span className="rounded-full bg-white/90 px-4 py-1 text-base font-black text-sky-700 shadow">🙋 Can you do it? Do it with your body!</span>
          <button onClick={() => { void canDo(); }} className={`${CLAY_BUTTON} px-10 py-3 text-2xl`}>💪 {CAN_DO}</button>
        </motion.div>
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
export function moveMatchLines(scene: Match) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.question], [scene.who, r.reply]]),
    ...scene.animals.map((a) => [scene.who, moveWrongLine(a)]),
    [scene.who, CAN_DO],
    [scene.who, scene.doneLine],
  ] as [string, string][];
}

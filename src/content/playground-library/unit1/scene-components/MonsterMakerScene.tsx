import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';
import { MonsterArt, PartPreview, type MonsterLook } from './monsterParts';

/* ---------- Monster Maker (Pre-A1 Unit 4 Lesson 4 signature game) ----------
 * The monster tells the child what it has — "I have three eyes!", "I have
 * big feet!" — and the child picks the matching part, which pops onto a plain
 * monster until it is complete and dances. Researched: the Cambridge Pre A1
 * "listen and draw / colour the monster" task, the picture book "Go Away, Big
 * Green Monster!" (a face built part by part), and Lingokids / Khan Academy
 * Kids build-a-character games. Better than the apps: the child must hear the
 * NUMBER or the SIZE, not only the part (one / two / three eyes, big / small
 * feet), so "I have …" + number + size is what builds the monster. A wrong
 * pick is named back ("That's two eyes! Try again!"), the right one glows
 * after two misses, no clock. */

type Maker = Extract<Scene, { kind: 'monster-maker' }>;
type Value = number | 'big' | 'small';
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five'];
const PART_NAME = { eyes: ['eye', 'eyes'], ears: ['ear', 'ears'], hands: ['hand', 'hands'], feet: ['foot', 'feet'] } as const;
/** "three eyes", "big feet", "one eye". */
export const describePart = (part: keyof typeof PART_NAME, v: Value) =>
  typeof v === 'number' ? `${NUM[v] ?? v} ${PART_NAME[part][v === 1 ? 0 : 1]}` : `${v} ${PART_NAME[part][1]}`;
export const makerWrongLine = (part: keyof typeof PART_NAME, v: Value) => `That's ${describePart(part, v)}! Try again!`;

export function MonsterMakerScene({ scene, onWin, onNext, sync }: { scene: Maker; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, wrong: [] as number[], gemDone: false });
  const { round, wrong, gemDone } = state;
  const wrongSet = useMemo(() => new Set(wrong), [wrong]);
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  // The monster so far: every finished round adds its part.
  const look = useMemo<MonsterLook>(() => {
    const l: MonsterLook = { color: scene.color };
    scene.rounds.slice(0, Math.min(round, total)).forEach((x) => {
      if (x.part === 'eyes' && typeof x.answer === 'number') l.eyes = x.answer;
      if (x.part !== 'eyes' && typeof x.answer === 'string') l[x.part] = x.answer;
    });
    return l;
  }, [round, scene.rounds, scene.color, total]);
  const lastPart = round > 0 && round <= total ? scene.rounds[round - 1]?.part ?? null : null;

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 600);
    const idle = window.setInterval(() => { if (!busy.current) cueSpeak(r.line, scene.who); }, 8000);
    return () => { window.clearTimeout(t); window.clearInterval(idle); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (i: number) => {
    const v = r?.options[i];
    if (!r || v === undefined || busy.current || wrongSet.has(i)) return;
    busy.current = true;
    if (v !== r.answer) {
      sfx.wrong(); shake();
      setMisses((m) => m + 1);
      setState((s) => ({ ...s, wrong: [...s.wrong, i] }));
      await sayWithin(makerWrongLine(r.part, v), scene.who, 3000);
      busy.current = false;
      return;
    }
    sfx.pop();
    window.setTimeout(() => { sfx.match(); fire(38, 45, 'stars'); }, 200);
    const next = round + 1;
    setState((s) => ({ ...s, round: next, wrong: [], gemDone: s.gemDone || next >= total }));
    await sayWithin(r.reply, scene.who, 3500);
    if (next >= total && !gemDone) { fire(38, 40, 'confetti'); sfx.gem(); onWin(true); void sayWithin(scene.doneLine, scene.who, 4000); }
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {r ? r.line : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The monster being built. */}
      <motion.div
        className={`absolute z-10 h-[62vh] w-[52vh] ${done ? 'left-1/2 -translate-x-1/2' : 'left-[8%] portrait:left-1/2 portrait:-translate-x-1/2'} bottom-[10%] portrait:bottom-[30%] portrait:h-[42vh] portrait:w-[35vh] [@media(max-height:500px)]:h-[56vh] [@media(max-height:500px)]:w-[46vh]`}
        animate={done ? { y: [0, -24, 0], rotate: [0, -6, 6, 0] } : { y: [0, -5, 0] }}
        transition={done ? { duration: 0.9, repeat: Infinity } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <MonsterArt look={look} pop={lastPart} />
      </motion.div>

      {/* The parts to choose from. */}
      {r && (
        <div key={round} className="absolute right-[5%] top-[30%] z-20 flex flex-col gap-[2.5vh] portrait:inset-x-0 portrait:bottom-[9%] portrait:top-auto portrait:flex-row portrait:justify-center [@media(max-height:500px)]:top-[24%] [@media(max-height:500px)]:gap-1.5">
          {r.options.map((v, i) => {
            const isWrong = wrongSet.has(i);
            const glow = misses >= 2 && v === r.answer;
            return (
              <motion.button
                key={i}
                onClick={() => { void pick(i); }}
                aria-label={describePart(r.part, v)}
                className={`relative h-[min(16vh,22vw)] w-[min(30vh,40vw)] rounded-[24px] bg-white/90 p-2 shadow-[0_8px_0_rgba(0,0,0,0.18)] portrait:w-[28vw] [@media(max-height:500px)]:h-[14.5vh] ${isWrong ? 'opacity-40' : ''}`}
                initial={{ scale: 0, rotate: -8 }}
                animate={isWrong ? { scale: 1, rotate: 0, x: [0, -8, 8, -4, 4, 0] } : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: i * 0.08 }}
                whileHover={{ y: -4, scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
              >
                {glow && <span className="absolute inset-0 animate-pulse rounded-[24px] ring-8 ring-yellow-300" />}
                <PartPreview part={r.part} value={v} />
              </motion.button>
            );
          })}
        </div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[6%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function monsterMakerLines(scene: Maker) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply], ...r.options.filter((v) => v !== r.answer).map((v) => [scene.who, makerWrongLine(r.part, v)])]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}

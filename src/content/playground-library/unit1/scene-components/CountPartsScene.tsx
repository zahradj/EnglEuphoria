import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';
import { MonsterArt, type MonsterPart } from './monsterParts';

/* ---------- How Many? (Pre-A1 Unit 4 Lesson 4) ----------
 * A monster asks "How many eyes?". The child taps each eye — it lights up
 * and the count is said out loud ("One! Two! Three!") — then picks the
 * number, and the monster answers with the lesson sentence: "I have three
 * eyes!". Researched: Khan Academy Kids / Duolingo ABC tap-to-count, the
 * Cambridge Pre A1 "How many …?" question, and counting body parts in the
 * Montessori "count on me" routine. Better than tap-to-count apps: the count
 * belongs to a body the child is describing, so it ends in a real sentence
 * ("I have …"), and the number choice only comes after the child has counted
 * everything (no guessing). No clock; a wrong number is named back. */

type Count = Extract<Scene, { kind: 'count-parts' }>;
const NUM = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
export const countWord = (n: number) => `${NUM[n] ?? n}!`;
export const countWrongLine = (n: number) => `${NUM[n] ?? n}? Count again!`;

export function CountPartsScene({ scene, onWin, onNext, sync }: { scene: Count; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, counted: [] as number[], solved: false, gemDone: false });
  const { round, counted, solved, gemDone } = state;
  const countedSet = useMemo(() => new Set(counted), [counted]);
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const n = r ? partCount(r.look, r.part) : 0;
  const allCounted = counted.length >= n && n > 0;
  const choices = useMemo(() => (r ? [n - 1, n, n + 1].filter((x) => x >= 1).sort(() => (round % 2 ? 1 : -1)) : []), [r, n, round]);
  const busy = useRef(false);
  const [wrongPick, setWrongPick] = useState(-1);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    busy.current = false;
    setWrongPick(-1);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.question, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tapPart = (part: MonsterPart, i: number) => {
    if (!r || part !== r.part || countedSet.has(i) || solved) return;
    sfx.pop();
    const k = counted.length + 1;
    setState((s) => ({ ...s, counted: [...s.counted, i] }));
    void sayWithin(countWord(k), scene.who, 1500);
  };

  const pick = async (v: number) => {
    if (!r || busy.current || !allCounted || solved) return;
    busy.current = true;
    if (v !== n) {
      sfx.wrong(); setWrongPick(v);
      await sayWithin(countWrongLine(v), scene.who, 2500);
      setWrongPick(-1);
      busy.current = false;
      return;
    }
    sfx.match(); fire(40, 45, 'stars');
    setState((s) => ({ ...s, solved: true }));
    await sayWithin(r.answer, scene.who, 3500);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 50, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, counted: [], solved: false, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {r ? (solved ? r.answer : r.question) : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.question, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {r && (
        <motion.div key={round} className="absolute bottom-[9%] left-[10%] z-10 h-[62vh] w-[52vh] portrait:bottom-[28%] portrait:left-1/2 portrait:h-[42vh] portrait:w-[35vh] portrait:-translate-x-1/2 [@media(max-height:500px)]:h-[56vh] [@media(max-height:500px)]:w-[46vh]"
          initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1, y: solved ? [0, -18, 0] : 0 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
          <MonsterArt look={r.look} glow={counted.map((index) => ({ part: r.part, index }))} onPart={tapPart} />
        </motion.div>
      )}

      {/* Count so far, then the number choice. */}
      {r && (
        <div className="absolute right-[6%] top-[32%] z-20 flex w-[min(44vw,62vh)] flex-col items-center gap-4 portrait:inset-x-0 portrait:bottom-[8%] portrait:top-auto portrait:w-auto [@media(max-height:500px)]:top-[42%] [@media(max-height:500px)]:gap-2">
          {!allCounted ? (
            <div className="rounded-3xl bg-white/90 px-5 py-3 text-center font-black text-orange-700 shadow-lg" style={{ fontSize: 'clamp(1rem, 2.2vw, 1.6rem)' }}>
              👆 Tap and count! <span className="ml-2 text-sky-600">{counted.length}</span>
            </div>
          ) : (
            <div className="flex gap-[3vw]">
              {choices.map((v, k) => (
                <motion.button
                  key={v}
                  onClick={() => { void pick(v); }}
                  aria-label={`${v}`}
                  className={`grid h-[min(17vh,22vw)] w-[min(17vh,22vw)] place-items-center rounded-full font-black text-white shadow-[0_8px_0_rgba(0,0,0,0.2)] ${['bg-sky-500', 'bg-pink-500', 'bg-amber-500'][k % 3]} ${solved && v !== n ? 'opacity-40' : ''}`}
                  initial={{ scale: 0 }}
                  animate={wrongPick === v ? { scale: 1, x: [0, -8, 8, -4, 4, 0] } : { scale: solved && v === n ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14, delay: k * 0.08 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ fontSize: 'min(9vh, 11vw)', ...THICK_WORDS }}
                >
                  {v}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </div>
  );
}

/** How many of `part` the monster has. */
export function partCount(look: Count['rounds'][number]['look'], part: MonsterPart): number {
  if (part === 'eyes') return look.eyes ?? 0;
  if (part === 'ears') return look.ears ? 2 : 0;
  if (part === 'arms') return look.hands ? look.arms ?? 2 : 0;
  return look.feet ? look.legs ?? 2 : 0;
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function countPartsLines(scene: Count) {
  const out: [string, string][] = [];
  for (const r of scene.rounds) {
    const n = partCount(r.look, r.part);
    out.push([scene.who, r.question], [scene.who, r.answer]);
    for (let k = 1; k <= n; k++) out.push([scene.who, countWord(k)]);
    for (const v of [n - 1, n + 1]) if (v >= 1) out.push([scene.who, countWrongLine(v)]);
  }
  out.push([scene.who, scene.doneLine]);
  return out;
}

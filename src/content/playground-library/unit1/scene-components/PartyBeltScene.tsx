import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Party Belt (Pre-A1 Unit 8 Lesson 3 signature game) ----------
 * The party food truck has a moving belt: pizza, cake, ice cream (and the unit's earlier food) ride
 * slowly past. A friend at the table asks — "Ice cream, please!" — and the child grabs that food as it
 * goes by; it pops onto the friend's plate and the friend says "Yummy! I like ice cream!". A wrong grab
 * is named back ("No, that's cake!"), so a mistake is more listening, never a buzzer. The belt never
 * stops and every food comes round again, so there is no fail state and no clock.
 * Sources (mechanic only): conveyor-belt sushi / food-factory games in kids' apps (Toca Kitchen,
 * Lingokids food games), Cambridge Pre A1 Starters "listen and find", Wordwall "whack-a-mole" (tap the
 * right one as it passes). Better: the target is only HEARD (no printed word on the belt), the moving
 * belt makes the child listen first and watch second, and the earlier unit food rides along as
 * distractors, so the lesson's three words are picked out of the whole unit. */

type Belt = Extract<Scene, { kind: 'party-belt' }>;
export const beltWrongLine = (word: string) => `No, that's ${word}!`;

const LOOP_SECONDS = 16;

export function PartyBeltScene({ scene, onWin, onNext, sync }: { scene: Belt; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, gemDone: false });
  const { round, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [served, setServed] = useState<{ k: number; food: number } | null>(null);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const friend = r ? CAST[r.friend] : CAST[scene.who];

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    setServed(null);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, r.friend), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const grab = async (slot: number, food: number) => {
    const f = scene.foods[food];
    if (!r || !f || busy.current) return;
    busy.current = true;
    if (food !== r.target) {
      sfx.wrong(); shake(); setWrong(slot);
      setMisses((m) => m + 1);
      await sayWithin(beltWrongLine(f.word), r.friend, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.match();
    setServed({ k: Date.now(), food });
    fire(scene.seat.x, scene.seat.y + 14, 'stars');
    await sayWithin(r.reply, r.friend, 3200);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  // Two of each food ride the belt, evenly spaced.
  const tiles = [...scene.foods.map((_, i) => i), ...scene.foods.map((_, i) => i)];
  const n = tiles.length;

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      <style>{`@keyframes lep1-belt-ride { from { left: -12%; } to { left: 108%; } } @keyframes lep1-belt-stripes { from { background-position: 0 0; } to { background-position: 80px 0; } }`}</style>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? `🎉 ${friend.name}: “${r.line}”` : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>🍽️</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, r.friend)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The friend at the table, with a plate */}
      {r && (
        <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${scene.seat.x}%`, top: `${scene.seat.y}%` }}>
          <motion.img key={round} src={friend.img} alt={friend.name} draggable={false}
            className="block object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]" style={{ height: 'min(36vh, 26vw)', maxWidth: 'none' }}
            initial={{ y: 40, opacity: 0 }}
            animate={served ? { y: [0, -18, 0, -10, 0], opacity: 1 } : { y: [0, -5, 0], opacity: 1 }}
            transition={served ? { duration: 0.9 } : { y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.5 } }} />
          <div className="mx-auto -mt-3 grid h-[min(9vh,7vw)] w-[min(20vh,15vw)] place-items-center rounded-[50%] border-4 border-sky-200 bg-white shadow-xl">
            <AnimatePresence>
              {served && scene.foods[served.food] && (
                <motion.img key={served.k} src={scene.foods[served.food].img} alt="" className="-mt-6 h-[min(11vh,8vw)] w-[min(11vh,8vw)] object-contain" style={{ filter: STICKER_FILTER }}
                  initial={{ scale: 0, y: -80 }} animate={{ scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* The moving belt */}
      <div className="absolute inset-x-0 bottom-[6%] z-20 h-[24%]">
        <div className="absolute inset-x-0 bottom-0 h-[38%] rounded-t-xl border-y-[6px] border-slate-700 shadow-2xl"
          style={{ backgroundColor: '#4b5563', backgroundImage: 'repeating-linear-gradient(90deg, #6b7280 0 40px, #4b5563 40px 80px)', animation: done ? undefined : `lep1-belt-stripes ${LOOP_SECONDS / 14}s linear infinite` }} />
        {tiles.map((food, slot) => {
          const f = scene.foods[food];
          if (!f) return null;
          const glow = r && misses >= 2 && food === r.target;
          return (
            <div key={slot} className="absolute bottom-[22%] -translate-x-1/2"
              style={{ animation: `lep1-belt-ride ${LOOP_SECONDS}s linear infinite`, animationDelay: `${-(slot / n) * LOOP_SECONDS}s`, animationPlayState: done ? 'paused' : 'running' }}>
              <motion.button onClick={() => { void grab(slot, food); }} aria-label={f.word} className="relative block" whileTap={{ scale: 0.88 }}
                animate={wrong === slot ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -4, 0] }}
                transition={wrong === slot ? { duration: 0.4 } : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
                {glow && <span className="absolute -inset-3 animate-pulse rounded-full bg-yellow-300/80 blur-md" />}
                <img src={f.img} alt="" draggable={false} className="relative z-10 h-[min(17vh,12vw)] w-[min(17vh,12vw)] object-contain" style={{ filter: STICKER_FILTER }} />
              </motion.button>
            </div>
          );
        })}
      </div>

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 top-[34%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function partyBeltLines(scene: Belt) {
  return [
    ...scene.rounds.flatMap((r) => [[r.friend, r.line], [r.friend, r.reply], ...scene.foods.filter((_, i) => i !== r.target).map((f) => [r.friend, beltWrongLine(f.word)])]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CropPic, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Feed the Ducks (Pre-A1 Unit 5 Lesson 5 signature game) ----------
 * After the "My Day with Dad" film: ducks swim on the pond, each carrying a
 * little photo of the story (playing ball, feeding the ducks, ice cream, the
 * book). Pip says what they did — "We eat ice cream!" — and the child taps the
 * duck with that photo: a piece of bread flies, the duck quacks and paddles a
 * happy circle. Researched: Khan Academy Kids / Lingokids "listen and feed"
 * play, Cambridge Pre A1 "listen and point" and the story-retell questions of
 * picture-book teaching. Better: every answer is a whole sentence from the
 * story ("We read a book!"), the photos are the story's own pictures (so the
 * child retells it), and a wrong duck is named back ("No, that's the book!").
 * Calm: the ducks bob, nothing runs away, no clock. */

type Feed = Extract<Scene, { kind: 'duck-feed' }>;
export const duckWrongLine = (name: string) => `No, that's ${name}! Try again!`;
export const DUCK_QUACK = 'Quack, quack! Thank you!';

export function DuckFeedScene({ scene, onWin, onNext, sync }: { scene: Feed; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, fed: [] as number[], gemDone: false });
  const { round, fed, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bread, setBread] = useState<{ k: number; to: number } | null>(null);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const feed = async (i: number) => {
    const d = scene.ducks[i];
    if (!r || !d || busy.current) return;
    busy.current = true;
    if (i !== r.duck) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(duckWrongLine(d.name), scene.who, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    setBread({ k: Date.now(), to: i });
    await new Promise((res) => window.setTimeout(res, 800));
    sfx.match(); fire(d.x, d.y, 'stars');
    setState((s) => ({ ...s, fed: [...s.fed, i] }));
    await sayWithin(DUCK_QUACK, scene.who, 2200);
    await sayWithin(r.reply, scene.who, 3200);
    setBread(null);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? `🦆 ${r.line}` : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>🍞</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The ducks, each with a photo from the story on a little sign. */}
      {scene.ducks.map((d, i) => {
        const glow = r && misses >= 2 && i === r.duck;
        const happy = fed.includes(i) && bread === null && r?.duck !== i;
        return (
          <motion.button key={i} onClick={() => { void feed(i); }} aria-label={d.label}
            className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -6, 0], rotate: happy ? [0, 8, -8, 0] : [0, -2, 2, 0] }}
            transition={wrong === i ? { duration: 0.4 } : { duration: 2.4 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            whileTap={{ scale: 0.9 }}>
            {glow && <span className="absolute -inset-3 animate-pulse rounded-full bg-yellow-300/80 blur-md" />}
            <span className="relative z-10 rounded-xl border-4 border-white bg-white shadow-[0_8px_18px_rgba(0,0,0,0.3)]">
              <CropPic img={d.img} at={d.at} w={d.w} aspect={d.aspect} alt={d.label} className="!rounded-lg h-[min(15vh,11vw)] w-[min(15vh,11vw)]" />
            </span>
            <span className="relative -mt-2 select-none leading-none" style={{ fontSize: 'min(14vh,10vw)', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.25))' }}>🦆</span>
          </motion.button>
        );
      })}

      {/* The piece of bread flying to the right duck. */}
      <AnimatePresence>
        {bread && scene.ducks[bread.to] && (
          <motion.span key={bread.k} className="pointer-events-none absolute z-30 text-[7vh]"
            initial={{ left: '50%', top: '95%', rotate: 0, opacity: 1 }}
            animate={{ left: `${scene.ducks[bread.to].x}%`, top: `${scene.ducks[bread.to].y + 6}%`, rotate: 360 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.75, ease: 'easeOut' }}>🍞</motion.span>
        )}
      </AnimatePresence>

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
export function duckFeedLines(scene: Feed) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.ducks.map((d) => [scene.who, duckWrongLine(d.name)]),
    [scene.who, DUCK_QUACK],
    [scene.who, scene.doneLine],
  ] as [string, string][];
}

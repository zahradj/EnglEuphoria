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

/* ---------- Feed Pip (Pre-A1 Unit 8 Lesson 1 signature game) ----------
 * A picnic. A hungry friend asks politely — "Can I have a banana, please?" — and the child gives the
 * right food from the blanket: it flies to the friend, who munches and says "Yum! I like bananas!".
 * A wrong food is handed back with its name ("No, thank you! That's an apple."), so a mistake is more
 * listening, never a buzzer. The friend's tummy fills with a heart per round.
 * Sources (mechanic only): Lingokids / Khan Academy Kids "feed the character" play, Cambridge Pre A1
 * Starters "listen and give / point", and the classroom "pretend picnic" role play.
 * Better: the request is a whole polite sentence the child will say back later, the answer is the
 * child's own action (give), and the wrong food is named back; calm, no clock. */

type Feed = Extract<Scene, { kind: 'feed-pip' }>;
export const feedWrongLine = (phrase: string) => `No, thank you! That's ${phrase}.`;

export function FeedPipScene({ scene, onWin, onNext, sync }: { scene: Feed; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, gemDone: false });
  const { round, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [flying, setFlying] = useState<{ k: number; i: number } | null>(null);
  const [munch, setMunch] = useState(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const eater = CAST[scene.who];
  const eaterImg = scene.whoImg ?? eater.img;

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const give = async (i: number) => {
    const f = scene.foods[i];
    if (!r || !f || busy.current) return;
    busy.current = true;
    if (i !== r.target) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(feedWrongLine(f.phrase), scene.who, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    setFlying({ k: Date.now(), i });
    await new Promise((res) => window.setTimeout(res, 800));
    setMunch(true); sfx.match(); fire(scene.mouth.x, scene.mouth.y, 'stars');
    await sayWithin(r.reply, scene.who, 3200);
    setMunch(false); setFlying(null);
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
          {r ? `🧺 ${r.line}` : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>💛</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The hungry friend (the wrapper centres it; the motion element only animates) */}
      <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${scene.mouth.x}%`, top: `${scene.mouth.y + 14}%` }}>
        <motion.img
          src={eaterImg} alt={eater.name} draggable={false}
          className="block object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]"
          style={{ height: 'min(42vh, 30vw)', maxWidth: 'none' }}
          animate={munch ? { scale: [1, 1.08, 0.96, 1.06, 1], rotate: [0, -3, 3, 0] } : { y: [0, -6, 0] }}
          transition={munch ? { duration: 0.9 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* The food on the blanket */}
      {scene.foods.map((f, i) => {
        const glow = r && misses >= 2 && i === r.target;
        const away = flying?.i === i;
        return (
          <div key={i} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${f.x}%`, top: `${f.y}%`, opacity: away ? 0 : 1 }}>
            <motion.button onClick={() => { void give(i); }} aria-label={f.word} className="relative block"
              animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -5, 0] }}
              transition={wrong === i ? { duration: 0.4 } : { duration: 2.2 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              whileTap={{ scale: 0.9 }}>
              {glow && <span className="absolute -inset-3 animate-pulse rounded-full bg-yellow-300/80 blur-md" />}
              <img src={f.img} alt="" draggable={false} className="relative z-10 h-[min(17vh,12vw)] w-[min(17vh,12vw)] object-contain" style={{ filter: STICKER_FILTER }} />
            </motion.button>
          </div>
        );
      })}

      {/* The food flying to the friend */}
      <AnimatePresence>
        {flying && scene.foods[flying.i] && (
          <motion.img key={flying.k} src={scene.foods[flying.i].img} alt="" className="pointer-events-none absolute z-30 h-[min(14vh,10vw)] w-[min(14vh,10vw)] -translate-x-1/2 -translate-y-1/2 object-contain"
            initial={{ left: `${scene.foods[flying.i].x}%`, top: `${scene.foods[flying.i].y}%`, scale: 1, opacity: 1 }}
            animate={{ left: `${scene.mouth.x}%`, top: `${scene.mouth.y}%`, scale: 0.5, rotate: 200 }}
            exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.75, ease: 'easeOut' }} />
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
export function feedPipLines(scene: Feed) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.foods.map((f) => [scene.who, feedWrongLine(f.phrase)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Put It On! (Pre-A1 Unit 9 Lesson 2 signature game) ----------
 * A snowy morning: Pip wants to go out and play, but he needs his clothes. He asks for one thing at a
 * time — "Put on my green hat!" — and the child taps it on the bench: it flies onto Pip (the hat on his
 * head, the socks and then the shoes on his feet). A wrong piece is named back ("No, not the shoes!
 * Listen again."). When he is dressed, Pip waves: "Let's go out and play in the snow!".
 * Sources (mechanic only): dress-up play in Toca Boca / Lingokids / Khan Academy Kids ("dress the
 * character for the weather"), Cambridge Pre A1 Starters "listen and point", TPR "put on your hat".
 * Better: the clothes land where they are worn (head / feet), the order is real (socks before shoes),
 * and every request is a whole sentence with a colour the child knows; no clock, no fail state. */

type PutOn = Extract<Scene, { kind: 'put-on' }>;
export const putOnWrongLine = (word: string) => `No, not the ${word}! Listen again.`;

export function PutOnScene({ scene, onWin, onNext, sync }: { scene: PutOn; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, worn: [] as number[], gemDone: false });
  const { round, worn, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const doll = scene.doll;

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
    if (!r || !c || busy.current || worn.includes(i)) return;
    busy.current = true;
    if (i !== r.item) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(putOnWrongLine(c.word), scene.who, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, worn: [...s.worn, i] }));
    fire(doll.x, doll.y, 'stars');
    await sayWithin(r.reply, scene.who, 3000);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? `🧦 ${r.line}` : scene.doneLine}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-14 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* Pip, and the clothes he has on (each placed where it is worn, in % of Pip's picture) */}
      <motion.div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${doll.x}%`, top: `${doll.y}%`, height: `${doll.h}vh`, aspectRatio: '1 / 1' }}
        animate={done ? { y: [0, -24, 0, -14, 0] } : { y: [0, -5, 0] }} transition={done ? { duration: 1, repeat: Infinity, repeatDelay: 0.6 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
        <img src={doll.img} alt="Pip" draggable={false} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]" />
        <AnimatePresence>
          {[...worn].sort((a, b) => (scene.clothes[a]?.layer ?? 0) - (scene.clothes[b]?.layer ?? 0)).map((ci) => {
            const c = scene.clothes[ci];
            if (!c) return null;
            return (
              <motion.img key={ci} src={c.img} alt={c.word} draggable={false} className="absolute object-contain"
                style={{ left: `${c.at.x}%`, top: `${c.at.y}%`, width: `${c.at.w}%`, transform: 'translate(-50%, -50%)', filter: STICKER_FILTER }}
                initial={{ opacity: 0, scale: 2.2, y: -120 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 15 }} />
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* The bench with the clothes */}
      {!done && (
        <div className="absolute bottom-[6%] left-[4%] z-30 flex max-w-[48%] flex-wrap items-end justify-center gap-3 rounded-[2rem] border-[5px] border-[#8B5A2B] bg-[#D9A066]/90 px-4 pb-3 pt-3 shadow-2xl">
          {scene.clothes.map((c, i) => {
            if (worn.includes(i)) return null;
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
        </div>
      )}

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
export function putOnLines(scene: PutOn) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.clothes.map((c) => [scene.who, putOnWrongLine(c.word)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}

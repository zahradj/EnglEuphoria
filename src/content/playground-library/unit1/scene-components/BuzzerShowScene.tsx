import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Family Buzzer Show (Pre-A1 Unit 5 Lesson 6 signature game) ----------
 * A children's TV game show: three podiums, each with a family member's photo
 * and a big red buzzer. Pip, the host, asks a question about the unit —
 * "Who bakes cookies with Pip?" — and the child presses the right buzzer: the
 * podium lights up, the audience claps, Pip answers in a whole sentence, and
 * the child says it on the microphone ("This is my grandma!"). Researched: the
 * family TV quiz-show format (buzzer + podiums, no content taken), Cambridge
 * Pre A1 "listen and point", Lingokids / Khan Academy Kids end-of-unit review
 * play. Better: the questions are the unit's own story moments, so answering
 * IS retelling the unit; nobody races anybody (one contestant, no clock); a
 * wrong buzzer is named back ("No, that's Grandpa!") and the right one glows
 * after two tries. */

type Show = Extract<Scene, { kind: 'buzzer-show' }>;
export const buzzerWrongLine = (name: string) => `No, that's ${name}! Try again!`;
export const BUZZER_CHEER = 'Yes! Right answer!';

export function BuzzerShowScene({ scene, onWin, onNext, sync }: { scene: Show; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, buzzed: false, gemDone: false });
  const { round, buzzed, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r || buzzed) return;
    const t = window.setTimeout(async () => {
      if (round === 0) await sayWithin(scene.intro, scene.who, 6000);
      cueSpeak(r.line, scene.who);
    }, round === 0 ? 600 : 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const buzz = async (podium: number) => {
    if (!r || buzzed || busy.current) return;
    const face = scene.faces[r.faces[podium]];
    if (!face) return;
    busy.current = true;
    if (podium !== r.answer) {
      sfx.wrong(); shake(); setWrong(podium);
      setMisses((m) => m + 1);
      await sayWithin(buzzerWrongLine(face.name), scene.who, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    const p = scene.podiums[podium];
    window.setTimeout(() => { sfx.match(); fire(p.x, p.y, 'stars'); }, 250);
    setState((s) => ({ ...s, buzzed: true }));
    await sayWithin(BUZZER_CHEER, scene.who, 2000);
    await sayWithin(r.reply, scene.who, 3600);
    busy.current = false;
  };

  /** The child said the sentence — next question. */
  const said = () => {
    if (!r || !buzzed || busy.current) return;
    sfx.pop(); fire(50, 70, 'confetti');
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, buzzed: false, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4500);
  };

  const glow = r && !buzzed && misses >= 2 ? r.answer : -1;

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={80} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? (buzzed ? r.reply : `🎤 ${r.line}`) : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(buzzed ? r.reply : r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The contestants: a photo on each podium's frame, and its buzzer. */}
      {r && scene.podiums.map((p, i) => {
        const face = scene.faces[r.faces[i]];
        if (!face) return null;
        const lit = buzzed && i === r.answer;
        return (
          <div key={`${round}-${i}`} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <motion.div className="flex flex-col items-center gap-[1.2vh]"
              initial={{ scale: 0.4, opacity: 0 }} animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0], scale: 1, opacity: 1 } : { scale: lit ? 1.12 : 1, opacity: buzzed && !lit ? 0.45 : 1 }}
              transition={wrong === i ? { duration: 0.4 } : { type: 'spring', stiffness: 170, damping: 14, delay: i * 0.08 }}>
              <span className={`relative rounded-full border-[0.8vh] p-[0.4vh] shadow-[0_10px_24px_rgba(0,0,0,0.35)] ${lit ? 'border-yellow-300 bg-yellow-200' : 'border-white bg-white'}`}>
                {lit && <span className="absolute -inset-4 animate-pulse rounded-full bg-yellow-300/60 blur-xl" />}
                <img src={face.img} alt={face.label} draggable={false} className="relative h-[min(17vh,12vw)] w-[min(17vh,12vw)] rounded-full object-contain" />
              </span>
              <motion.button onClick={() => { void buzz(i); }} aria-label={`Buzz for ${face.label}`} disabled={buzzed}
                className={`relative grid h-[min(10vh,7vw)] w-[min(18vh,13vw)] place-items-center rounded-[50%] border-b-[0.9vh] border-red-900 bg-gradient-to-b from-red-400 to-red-600 text-[min(3.4vh,2.4vw)] font-black text-white shadow-[0_8px_16px_rgba(0,0,0,0.35)] ${glow === i ? 'ring-4 ring-yellow-300 animate-pulse' : ''}`}
                whileTap={{ y: 4, scale: 0.94 }}>
                BUZZ!
              </motion.button>
            </motion.div>
          </div>
        );
      })}

      {r && buzzed && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex flex-col items-center gap-2" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
          <span className="rounded-full bg-white/90 px-4 py-1 text-base font-black text-sky-700 shadow">🙋 Your turn! Say it:</span>
          <button onClick={said} className={`${CLAY_BUTTON} px-8 py-3 text-2xl`}>🎤 {r.say}</button>
        </motion.div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function buzzerShowLines(scene: Show) {
  return [
    [scene.who, scene.intro],
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.faces.map((f) => [scene.who, buzzerWrongLine(f.name)]),
    [scene.who, BUZZER_CHEER],
    [scene.who, scene.doneLine],
  ] as [string, string][];
}

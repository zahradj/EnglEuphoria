import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin, useArtBox } from './shared';
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
  const rootRef = useRef<HTMLDivElement>(null);
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
  const box = useArtBox(rootRef, 1376 / 768);

  return (
    <motion.div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-gradient-to-b from-[#3b0d5c] via-[#5b1a86] to-[#b4621f]" animate={shakeCtl}>
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

      {/* The stage picture in its own box (cover on landscape screens, whole picture on portrait ones),
          so each photo sits in its podium's painted frame and each button on its painted red buzzer. */}
      <div className="absolute" style={box}>
        <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
        {r && scene.podiums.map((p, i) => {
          const face = scene.faces[r.faces[i]];
          if (!face) return null;
          const lit = buzzed && i === r.answer;
          return (
            <div key={`${round}-${i}`}>
              <div className="pointer-events-none absolute z-20 w-[10.5%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <motion.div className="relative"
                  initial={{ scale: 0.3, opacity: 0 }} animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0], scale: 1, opacity: 1 } : { scale: lit ? 1.15 : 1, opacity: buzzed && !lit ? 0.45 : 1 }}
                  transition={wrong === i ? { duration: 0.4 } : { type: 'spring', stiffness: 170, damping: 14, delay: i * 0.08 }}>
                  {lit && <span className="absolute -inset-5 animate-pulse rounded-full bg-yellow-300/70 blur-xl" />}
                  <img src={face.img} alt={face.label} draggable={false}
                    className={`relative aspect-square w-full rounded-full border-[0.5vh] object-contain shadow-[0_6px_14px_rgba(0,0,0,0.3)] ${lit ? 'border-yellow-300 bg-yellow-100' : 'border-amber-400 bg-amber-50'}`} />
                </motion.div>
              </div>
              <div className="absolute z-20 h-[13%] w-[15%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.by}%` }}>
                <motion.button onClick={() => { void buzz(i); }} aria-label={`Buzz for ${face.label}`} disabled={buzzed}
                  className={`block h-full w-full rounded-[50%] ${glow === i ? 'animate-pulse bg-yellow-300/50 ring-4 ring-yellow-300' : 'hover:bg-white/20'}`}
                  whileTap={{ scale: 0.85 }}>
                  <span className="sr-only">Buzz</span>
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>

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

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';
import { RoboArt, type RoboPart } from './roboParts';

/* ---------- Robo Says (Pre-A1 Unit 4 Lesson 6 signature game) ----------
 * Pip plays Simon Says on Robo with a memory twist: "Simon says: eyes,
 * then hands!" — Robo lights each part in order and Pip names it, then the
 * child touches the same parts on Robo in the same order (and on their own
 * body). Chains grow from one part to three. Researched: the classic
 * Simon electronic memory game (watch the lights, repeat the order), the
 * classroom Simon Says / "Touch your …" TPR routine (games4esl), Cambridge
 * Pre A1 "listen and point" and Khan Academy Kids' calm, self-paced design.
 * Better than both: the spoken body words — not colours or beeps — are what
 * the child remembers, every part is named again when it is tapped, a wrong
 * tap names the part that was touched and replays the chain, and the next
 * part glows after two misses. No clock. */

type Copy = Extract<Scene, { kind: 'robo-copy' }>;
const cap = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);
export const roboPartWord = (p: RoboPart) => `${cap(p)}!`;
export const roboWrongLine = (p: RoboPart) => `Oops! Robo's ${p}! Watch again!`;
const STEP_MS = 1300;

export function RoboCopyScene({ scene, onWin, onNext, sync }: { scene: Copy; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, step: 0, gemDone: false });
  const { round, step, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  /** Local only: which part Robo is showing (null = the child's turn), misses, the replay counter. */
  const [showing, setShowing] = useState<RoboPart | null>(null);
  const [demo, setDemo] = useState(true);
  const [misses, setMisses] = useState(0);
  const [replay, setReplay] = useState(0);
  const [flash, setFlash] = useState<RoboPart | null>(null);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  // Robo's demo: the line, then each part lights in order and is named.
  useEffect(() => {
    if (!r) return;
    let cancelled = false;
    const timers: number[] = [];
    setDemo(true);
    setShowing(null);
    busy.current = true;
    const startAt = replay ? 400 : 700;
    timers.push(window.setTimeout(() => { if (!cancelled && !replay) cueSpeak(r.line, scene.who); }, startAt));
    const lead = replay ? 600 : 700 + Math.min(4200, 900 + r.line.split(' ').length * 330);
    r.seq.forEach((p, i) => {
      timers.push(window.setTimeout(() => { if (cancelled) return; setShowing(p); sfx.pop(); cueSpeak(roboPartWord(p), scene.who); }, lead + i * STEP_MS));
      timers.push(window.setTimeout(() => { if (!cancelled) setShowing(null); }, lead + i * STEP_MS + STEP_MS - 300));
    });
    timers.push(window.setTimeout(() => { if (cancelled) return; setDemo(false); busy.current = false; }, lead + r.seq.length * STEP_MS));
    return () => { cancelled = true; timers.forEach((t) => window.clearTimeout(t)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, replay, scene.id]);

  useEffect(() => { setMisses(0); }, [round]);

  const touch = async (p: RoboPart) => {
    if (!r || busy.current || demo) return;
    const want = r.seq[step];
    if (!want) return;
    busy.current = true;
    if (p !== want) {
      sfx.wrong(); shake();
      setMisses((m) => m + 1);
      setState((s) => ({ ...s, step: 0 }));
      await sayWithin(roboWrongLine(p), scene.who, 2600);
      busy.current = false;
      setReplay((n) => n + 1);
      return;
    }
    sfx.pop();
    setFlash(p);
    window.setTimeout(() => setFlash(null), 700);
    const next = step + 1;
    if (next < r.seq.length) {
      setState((s) => ({ ...s, step: next }));
      await sayWithin(roboPartWord(p), scene.who, 1400);
      busy.current = false;
      return;
    }
    // Chain complete.
    sfx.match(); fire(50, 40, 'stars');
    setState((s) => ({ ...s, step: next }));
    await sayWithin(r.reply, scene.who, 3600);
    const nr = round + 1;
    if (nr >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: nr, step: 0, gemDone: s.gemDone || nr >= total }));
    setReplay(0);
    if (nr >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  const lit = useMemo<RoboPart[]>(() => {
    if (done) return [];
    if (showing) return [showing];
    return flash ? [flash] : [];
  }, [showing, flash, done]);
  const hint = !demo && misses >= 2 && r ? r.seq[step] ?? null : null;

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.3rem, calc(3.3*var(--svw,1vw)), 2.8rem)' }}>
          {r ? r.line : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
        </div>
      </div>
      {r && (
        <button onClick={() => { if (!busy.current) setReplay((n) => n + 1); }} aria-label="Watch Robo again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">
          🔁
        </button>
      )}

      {/* Robo. */}
      <motion.div
        className="absolute bottom-[4%] left-1/2 z-10 h-[56vh] w-[37.5vh] -translate-x-1/2 md:left-[38%] portrait:bottom-[22%] portrait:h-[46vh] portrait:w-[31vh] [@media(max-height:500px)]:h-[54vh] [@media(max-height:500px)]:w-[36vh]"
        animate={done ? { y: [0, -22, 0], rotate: [0, -5, 5, 0] } : { y: [0, -4, 0] }}
        transition={done ? { duration: 0.9, repeat: Infinity } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <RoboArt lit={lit} hint={hint} onPart={(p) => { void touch(p); }} />
      </motion.div>

      {/* Whose turn + the chain so far. */}
      {r && (
        <div className="absolute right-[5%] top-[38%] z-20 flex flex-col items-center gap-3 portrait:inset-x-0 portrait:bottom-[7%] portrait:top-auto [@media(max-height:500px)]:right-[3%] [@media(max-height:500px)]:top-[40%]">
          <motion.div key={demo ? 'watch' : 'you'} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`rounded-3xl px-5 py-3 text-center font-black shadow-lg ${demo ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-orange-700'}`}
            style={{ fontSize: 'clamp(1rem, 2.2vw, 1.6rem)' }}>
            {demo ? '👀 Watch Robo!' : '👆 Your turn!'}
          </motion.div>
          <div className="flex gap-2">
            {r.seq.map((p, i) => (
              <span key={i} className={`grid h-[min(7vh,9vw)] w-[min(7vh,9vw)] place-items-center rounded-full border-4 border-white text-base font-black shadow ${i < step ? 'bg-emerald-400 text-white' : 'bg-white/60 text-slate-500'}`}>
                {i < step ? '✓' : i + 1}
              </span>
            ))}
          </div>
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
export function roboCopyLines(scene: Copy) {
  const parts = new Set<RoboPart>(scene.rounds.flatMap((r) => r.seq));
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...[...parts].map((p) => [scene.who, roboPartWord(p)]),
    ...(['head', 'eyes', 'ears', 'nose', 'mouth', 'shoulders', 'arms', 'hands', 'knees', 'feet'] as RoboPart[]).map((p) => [scene.who, roboWrongLine(p)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}

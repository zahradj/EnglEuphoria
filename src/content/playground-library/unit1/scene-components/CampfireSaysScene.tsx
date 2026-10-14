import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Campfire Says (U10L3 signature, owner 2026-10-12: vary every lesson) ----------
 * A garden camp-out at dusk. The friends stand round the campfire. The host calls one friend and one action
 * ("Pip, clap your hands!"); that friend steps into the warm light and the child taps the action — three
 * pictures of THAT friend clapping, playing and sleeping. The friend really does it: claps with sparkles,
 * plays with a bouncing ball, or lies down to sleep while "zzz" bubbles float up and the sky gets darker. The last
 * round is "Everybody, sleep!" — night falls, the stars come out. A wrong action is named back ("Not play! Listen
 * again."), nothing is lost, and the right one glows after two tries. Sources (mechanic only): Simon Says /
 * classroom TPR, Cambridge Pre A1 Starters listening (names + actions), Khan Academy Kids "follow the
 * instructions". Better: the child hears WHO and WHAT, picks the action picture of that friend, and the camp
 * reacts with real cause and effect (the light, the ball, the night). */

type Camp = Extract<Scene, { kind: 'campfire-says' }>;
type Act = 'clap' | 'play' | 'sleep';
const ACTS: Act[] = ['clap', 'play', 'sleep'];

export function CampfireSaysScene({ scene, onWin, onNext, sync }: { scene: Camp; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, poses: scene.friends.map(() => 'idle'), gemDone: false });
  const { round, poses, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const all = r?.friend === -1;
  const target = r && !all ? r.friend : -1;
  const busy = useRef(false);
  const [nope, setNope] = useState<Act | null>(null);
  const [misses, setMisses] = useState(0);
  const [bursts, fire] = useBursts();
  const sleeping = poses.filter((p) => p === 'sleep').length;
  const night = done ? 1 : Math.min(0.7, sleeping * 0.18);

  useEffect(() => {
    busy.current = false; setMisses(0); setNope(null);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const choose = async (a: Act) => {
    if (!r || busy.current) return;
    if (a !== r.action) {
      sfx.wrong(); setNope(a); setMisses((m) => m + 1);
      await sayWithin(`Not ${a}! Listen again.`, scene.who, 1600);
      setNope(null); return;
    }
    busy.current = true;
    sfx.whoop();
    const idx = all ? scene.friends.map((_, i) => i) : [target];
    setState((s) => ({ ...s, poses: s.poses.map((p, i) => (idx.includes(i) ? a : p)) }));
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 120));
    sfx.match();
    for (const i of idx) fire(scene.friends[i].x, 58, a === 'sleep' ? 'sparkle' : 'stars');
    await sayWithin(r.reply, scene.who, 2200);
    await new Promise((res) => window.setTimeout(res, 500));
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 30, 'confetti'); sfx.gem(); onWin(true); }
    // after a single-friend round, the friend wakes up / stands again for the next call (unless it is the night)
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total, poses: next >= total ? s.poses : s.poses.map((p, i) => (i === target && !all ? 'idle' : p)) }));
  };

  const friendImg = (i: number) => {
    const f = scene.friends[i];
    const p = poses[i] as Act | 'idle';
    return p === 'idle' ? f.idle : f.poses[p];
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {/* dusk → night: a deep-blue veil and stars as more friends fall asleep */}
      <motion.div className="pointer-events-none absolute inset-0 z-[1]" style={{ background: 'linear-gradient(180deg, rgba(17,24,64,0.85), rgba(17,24,64,0.35))' }}
        animate={{ opacity: night }} transition={{ duration: 1.2 }} />
      {!reduce && night > 0.3 && [8, 22, 37, 55, 68, 83, 93].map((x, k) => (
        <motion.span key={k} className="pointer-events-none absolute z-[2] text-[2.4vh]" style={{ left: `${x}%`, top: `${6 + (k % 3) * 7}%` }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }} transition={{ duration: 1.6 + (k % 3) * 0.5, repeat: Infinity }}>✨</motion.span>
      ))}
      {done && <Confetti count={50} />}

      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? scene.doneLine : r?.line ?? ''}
        </span>
      </div>

      {/* campfire glow that flickers (live light over the still picture) */}
      {!reduce && (
        <motion.span className="pointer-events-none absolute z-[3] rounded-full mix-blend-screen" style={{ left: `${scene.fire.x}%`, top: `${scene.fire.y}%`, width: '34vh', height: '26vh', translate: '-50% -50%', background: 'radial-gradient(circle, rgba(255,170,60,0.55), rgba(255,120,40,0) 70%)' }}
          animate={{ scale: [1, 1.08, 0.97, 1.05, 1], opacity: [0.8, 1, 0.75, 0.95, 0.8] }} transition={{ duration: 1.4, repeat: Infinity }} />
      )}

      {/* the friends */}
      {scene.friends.map((f, i) => {
        const p = poses[i] as Act | 'idle';
        const called = (i === target || all) && !done && p !== r?.action;
        return (
          <div key={f.who} className="absolute z-10" style={{ left: `${f.x}%`, top: '92%', width: 'min(34vh, 22vw)', aspectRatio: '1', translate: '-50% -100%' }}>
            {/* the warm spotlight on the called friend */}
            {called && <motion.span className="pointer-events-none absolute inset-x-[5%] bottom-[2%] h-[22%] rounded-[50%] bg-yellow-200/60 blur-md" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }} />}
            <span className="pointer-events-none absolute inset-x-[18%] bottom-[3%] h-[8%] rounded-[50%] bg-black/30 blur-sm" />
            <AnimatePresence mode="wait">
              <motion.img key={`${i}-${p}`} src={friendImg(i)} alt={f.name} draggable={false} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_1vh_1vh_rgba(0,0,0,0.3)]"
                style={{ transformOrigin: '50% 100%' }}
                initial={reduce ? false : { scaleY: 0.7, scaleX: 1.2, opacity: 0.4 }}
                animate={reduce ? { opacity: 1 } : p === 'clap' ? { scaleY: [1, 1.06, 1], scaleX: 1, opacity: 1, rotate: [0, -3, 3, 0] }
                  : p === 'play' ? { y: [0, -18, 0], scaleY: 1, scaleX: 1, opacity: 1 }
                  : p === 'sleep' ? { scaleY: [1, 1.03, 1], scaleX: 1, opacity: 1 }
                  : called ? { y: [0, -8, 0], scaleY: 1, scaleX: 1, opacity: 1 } : { scaleY: [1, 1.02, 1], scaleX: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: p === 'play' ? 0.7 : p === 'sleep' ? 2.4 : 1.2, repeat: Infinity, ease: 'easeInOut', opacity: { duration: 0.2 }, scaleX: { duration: 0.3 } }} />
            </AnimatePresence>
            {/* zzz bubbles while sleeping */}
            {p === 'sleep' && !reduce && [0, 1, 2].map((k) => (
              <motion.span key={k} className="pointer-events-none absolute right-[18%] top-[30%] font-black text-sky-100" style={{ fontSize: `${2 + k * 0.6}vh`, ...THICK_WORDS }}
                animate={{ y: [0, -50], x: [0, 14], opacity: [0, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.8 }}>z</motion.span>
            ))}
            <span className="absolute -bottom-[1%] left-1/2 -translate-x-1/2 rounded-full bg-amber-900/70 px-3 font-black text-amber-50" style={{ fontSize: 'min(2.6vh, 1.7vw)' }}>{f.name}</span>
          </div>
        );
      })}

      {/* the three action pictures of the called friend (everybody: Pip's) */}
      {r && (
        <div className="absolute inset-x-0 top-[24%] z-30 flex justify-center gap-[2.5vw]">
          {ACTS.map((a) => {
            const fi = all ? 0 : target;
            const glow = misses >= 2 && a === r.action;
            return (
              <motion.button key={`${round}-${a}`} type="button" aria-label={a} onClick={() => { void choose(a); }}
                className="relative flex flex-col items-center rounded-[2.5vh] border-[0.6vh] border-amber-200 bg-gradient-to-b from-orange-300 to-rose-400 p-[0.8vh] shadow-[0_0.8vh_0_#9a3412,0_1.5vh_2vh_rgba(0,0,0,0.3)]"
                initial={reduce ? false : { y: -30, opacity: 0 }}
                animate={nope === a && !reduce ? { x: [0, -10, 10, -6, 0], y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }} whileTap={{ scale: 0.92 }}>
                {glow && <span className="pointer-events-none absolute -inset-[12%] -z-10 animate-pulse rounded-[3vh] bg-yellow-300/80 blur-lg" />}
                <img src={scene.friends[fi].poses[a]} alt="" draggable={false} className="object-contain drop-shadow-[0_0.5vh_0.4vh_rgba(0,0,0,0.3)]" style={{ width: 'min(13vh, 9vw)', height: 'min(13vh, 9vw)' }} />
                <span className="mt-[0.3vh] font-black text-white [text-shadow:0_0.3vh_0_rgba(0,0,0,0.35)]" style={{ fontSize: 'min(3vh, 2vw)' }}>{a}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      <Bursts items={bursts} />
      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-x-0 top-[34%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: 'spring' }}>
            <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

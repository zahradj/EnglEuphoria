import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';
import { firstSound, phonicsListenLine, phonicsNo, phonicsYes } from './phonicsShared';

/* ---------- Sound Fishing (phonics, owner 2026-10-11) ----------
 * A pond (code-drawn water over the lesson picture). Four fish swim slowly to and fro, each carrying a
 * picture. Pip plays a letter SOUND (recorded); the child taps the fish whose picture starts with it: the
 * line drops (anticipation), the fish wriggles up in an arc into the bucket (squash, splash, the word is
 * said). A wrong fish flips its tail, its word is said, and it swims on. Sources (mechanic only): Boom
 * "Fishing Phonics" beginning sounds, the classroom magnet-fishing game. Better: the sound is played, not
 * shown, and the fish keep moving, so the child listens and tracks. */

type Fish = Extract<Scene, { kind: 'sound-fish' }>;
const FISH_COLORS = ['#f97316', '#06b6d4', '#a855f7', '#22c55e', '#ec4899'];
const LANES = [40, 52, 64, 76];

function FishSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 140 80" className="h-full w-full">
      <path d="M110 40 L138 18 L132 40 L138 62 Z" fill={color} stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="62" cy="40" rx="54" ry="34" fill={color} stroke="#1e293b" strokeWidth="4" />
      <circle cx="28" cy="32" r="7" fill="#fff" stroke="#1e293b" strokeWidth="3" /><circle cx="27" cy="32" r="3" fill="#111" />
    </svg>
  );
}

export function SoundFishScene({ scene, onWin, onNext, sync }: { scene: Fish; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, gemDone: false });
  const { round, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [caught, setCaught] = useState<number | null>(null);
  const [nope, setNope] = useState(-1);
  const [misses, setMisses] = useState(0);
  const [bucket, setBucket] = useState(0);
  const [bursts, fire] = useBursts();
  const answer = r ? r.fish.findIndex((f) => firstSound(f.word) === r.letter.toLowerCase()) : -1;

  const playSound = () => { if (r) void playLetterPhonic(r.letter); };
  useEffect(() => {
    busy.current = false; setMisses(0); setCaught(null);
    if (!r) return;
    const t1 = window.setTimeout(() => cueSpeak(phonicsListenLine, scene.who), 400);
    const t2 = window.setTimeout(playSound, 2700);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const hook = async (i: number) => {
    if (!r || busy.current) return;
    busy.current = true;
    const f = r.fish[i];
    if (i !== answer) {
      sfx.wrong(); setNope(i); setMisses((m) => m + 1);
      await sayWithin(phonicsNo(f.word), scene.who, 1800);
      setNope(-1); busy.current = false; return;
    }
    setCaught(i); sfx.whoop();
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 900));
    sfx.pop(); fire(86, 78, 'splash'); fire(86, 70, 'stars'); setBucket((b) => b + 1);
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 90));
    sfx.match();
    await sayWithin(phonicsYes(f.word), scene.who, 1800);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {done && <Confetti count={60} />}
      {/* the pond */}
      <div className="absolute inset-x-[4%] bottom-[6%] top-[34%] z-10 overflow-hidden rounded-[45%] border-[6px] border-sky-200/80 shadow-inner" style={{ background: 'linear-gradient(180deg,#7dd3fc,#0284c7)' }}>
        {!reduce && [0, 1, 2].map((k) => (
          <motion.span key={k} className="absolute h-2 rounded-full bg-white/40" style={{ top: `${20 + k * 25}%`, width: '18%' }}
            animate={{ left: ['-20%', '110%'] }} transition={{ duration: 9 + k * 3, repeat: Infinity, ease: 'linear', delay: k * 2 }} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? 'What a big catch!' : 'Catch the fish that starts with the sound!'}
        </span>
      </div>
      {r && (
        <motion.button onClick={playSound} aria-label="Play the sound again" className="absolute left-1/2 top-[24%] z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-6 py-2 text-4xl font-black text-sky-700 shadow-xl"
          animate={reduce ? {} : { scale: [1, 1.06, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
          🔊 <span>{r.letter.toLowerCase()}</span>
        </motion.button>
      )}
      {r && r.fish.map((f, i) => {
        const glow = misses >= 2 && i === answer;
        const isCaught = caught === i;
        return (
          <motion.button key={`${round}-${i}`} onClick={() => { void hook(i); }} aria-label={f.word} className="absolute z-20" style={{ top: `${LANES[i % LANES.length]}%`, width: 'min(22vh, 15vw)', height: 'min(13vh, 9vw)', translate: '-50% -50%' }}
            initial={{ left: i % 2 ? '18%' : '82%' }}
            animate={isCaught ? { left: ['50%', '70%', '86%'], top: [`${LANES[i % LANES.length]}%`, '20%', '78%'], scale: [1, 1.1, 0.4], rotate: [0, -30, 20] }
              : reduce ? { left: `${20 + i * 20}%` } : nope === i ? { rotate: [0, 15, -15, 0] } : { left: i % 2 ? ['18%', '82%', '18%'] : ['82%', '18%', '82%'] }}
            transition={isCaught ? { duration: 0.9 } : nope === i ? { duration: 0.4 } : { duration: 14 + i * 2, repeat: Infinity, ease: 'linear' }}>
            {glow && <span className="absolute -inset-3 animate-pulse rounded-full bg-yellow-300/60 blur-md" />}
            <div className="absolute inset-0"><FishSvg color={FISH_COLORS[i % FISH_COLORS.length]} /></div>
            <span className="absolute left-[30%] top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow">
              <img src={f.img} alt="" draggable={false} style={{ width: 'min(7vh, 5vw)', height: 'min(7vh, 5vw)' }} className="object-contain" />
            </span>
          </motion.button>
        );
      })}
      {/* the line drops onto the caught fish */}
      <AnimatePresence>
        {caught !== null && !reduce && <motion.span className="absolute left-1/2 top-0 z-30 w-0.5 bg-slate-700" initial={{ height: 0 }} animate={{ height: ['0%', '45%', '0%'] }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} />}
      </AnimatePresence>
      {/* the bucket */}
      <div className="pointer-events-none absolute bottom-[4%] right-[4%] z-30 flex flex-col items-center">
        <span className="text-5xl">🪣</span>
        <span className="rounded-full bg-white/90 px-2 text-sm font-black text-sky-700">{bucket} 🐟</span>
      </div>
      <Bursts items={bursts} />
      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-x-0 top-[40%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
            <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

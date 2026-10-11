import { type ReactNode, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';
import { firstSound, phonicsListenLine, phonicsNo, phonicsYes } from './phonicsShared';

/* ---------- Sound Moles (phonics whack-a-mole, owner 2026-10-11) ----------
 * Six molehills on the grass. Pip plays a letter SOUND (recorded clip). Moles pop up, each holding a picture
 * sign; the child bonks every mole whose picture starts with that sound (the word is said, stars, the mole
 * spins down dizzy). A wrong mole giggles and its word is said ("Sun! Try again!") — nothing is lost. Calm pace:
 * moles stay up 2.6 s. Three bonks per sound. Sources (mechanic only): whack-a-mole phonics apps, Starfall /
 * Teach Your Monster first-sound games. Better: pictures, not letters, so the child must HEAR the first sound. */

type Mole = Extract<Scene, { kind: 'sound-mole' }>;
const HOLES = [{ x: 24, y: 56 }, { x: 50, y: 56 }, { x: 76, y: 56 }, { x: 24, y: 86 }, { x: 50, y: 86 }, { x: 76, y: 86 }];
const NEED = 3;

function MoleBody({ up, bonked, children }: { up: boolean; bonked: boolean; children: ReactNode }) {
  return (
    <motion.div className="absolute inset-x-0 bottom-[18%] mx-auto flex w-[70%] flex-col items-center" initial={{ y: '60%', opacity: 0 }}
      animate={{ y: up ? (bonked ? ['0%', '-8%', '60%'] : '0%') : '60%', opacity: up && !bonked ? 1 : bonked ? [1, 1, 0] : 0, rotate: bonked ? [0, 20, -20, 360] : 0, scaleY: bonked ? [1, 0.7, 1] : 1 }}
      transition={{ duration: bonked ? 0.6 : 0.28, ease: up && !bonked ? 'backOut' : 'easeIn' }}>
      {children}
      <svg viewBox="0 0 100 90" className="w-full">
        <ellipse cx="50" cy="55" rx="40" ry="38" fill="#8B5E3C" stroke="#3b2414" strokeWidth="4" />
        <ellipse cx="50" cy="66" rx="18" ry="12" fill="#F5C9A5" />
        <circle cx="36" cy="44" r="6" fill="#111" /><circle cx="64" cy="44" r="6" fill="#111" />
        <circle cx="38" cy="42" r="2" fill="#fff" /><circle cx="66" cy="42" r="2" fill="#fff" />
        <ellipse cx="50" cy="58" rx="8" ry="6" fill="#ff8fa3" stroke="#3b2414" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}

export function SoundMoleScene({ scene, onWin, onNext, sync }: { scene: Mole; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, hits: 0, gemDone: false });
  const { round, hits, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  // which picture is up in each hole (local: the moles keep popping; the score is shared)
  const [holes, setHoles] = useState<(number | null)[]>(HOLES.map(() => null));
  const [bonk, setBonk] = useState<number | null>(null);
  const [nope, setNope] = useState<number | null>(null);
  const [bursts, fire] = useBursts();
  const busy = useRef(false);
  const tick = useRef(0);

  const playSound = () => { if (r) void playLetterPhonic(r.letter); };
  useEffect(() => {
    if (!r) return;
    const t1 = window.setTimeout(() => cueSpeak(phonicsListenLine, scene.who), 400);
    const t2 = window.setTimeout(playSound, 2600);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  // moles pop up and down; every other pop shows a picture that starts with the sound
  useEffect(() => {
    if (!r) return;
    const targets = r.pictures.map((p, i) => (firstSound(p.word) === r.letter.toLowerCase() ? i : -1)).filter((i) => i >= 0);
    const others = r.pictures.map((_, i) => i).filter((i) => !targets.includes(i));
    const id = window.setInterval(() => {
      tick.current += 1;
      setHoles((h) => {
        const free = h.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
        if (!free.length) return h;
        const hole = free[(tick.current * 7) % free.length];
        const pool = tick.current % 2 === 0 || !others.length ? targets : others;
        const pic = pool[(tick.current * 5) % pool.length];
        const next = [...h]; next[hole] = pic;
        window.setTimeout(() => setHoles((hh) => { const n = [...hh]; if (n[hole] === pic) n[hole] = null; return n; }), reduce ? 3200 : 2600);
        return next;
      });
    }, 900);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const whack = async (hole: number) => {
    const pic = holes[hole];
    if (!r || pic === null || busy.current) return;
    const p = r.pictures[pic];
    if (firstSound(p.word) !== r.letter.toLowerCase()) {
      sfx.wrong(); setNope(hole); void sayWithin(phonicsNo(p.word), scene.who, 1600);
      window.setTimeout(() => setNope(null), 600);
      return;
    }
    busy.current = true;
    setBonk(hole); sfx.pop();
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 90)); // hit-stop
    sfx.match(); fire(HOLES[hole].x, HOLES[hole].y - 12, 'stars');
    void sayWithin(phonicsYes(p.word), scene.who, 1500);
    await new Promise((res) => window.setTimeout(res, 600));
    setHoles((h) => { const n = [...h]; n[hole] = null; return n; }); setBonk(null);
    const nh = hits + 1;
    if (nh >= NEED) {
      await new Promise((res) => window.setTimeout(res, 900));
      const next = round + 1;
      setHoles(HOLES.map(() => null));
      if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
      setState((s) => ({ ...s, round: next, hits: 0, gemDone: s.gemDone || next >= total }));
    } else setState((s) => ({ ...s, hits: nh }));
    busy.current = false;
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? 'Great bonking!' : 'Bonk the moles that start with the sound!'}
        </span>
      </div>
      {/* the grassy field the moles live in (code-drawn so the holes read clearly on any lesson picture) */}
      <div className="absolute inset-x-[6%] bottom-[5%] top-[34%] z-10 rounded-[40px] border-[6px] border-lime-200/80 shadow-xl" style={{ background: 'linear-gradient(180deg,#a3e635,#4d7c0f)' }} />
      {r && (
        <motion.button onClick={playSound} aria-label="Play the sound again" className="absolute left-1/2 top-[23%] z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-6 py-2 text-4xl font-black text-orange-600 shadow-xl"
          animate={reduce ? {} : { scale: [1, 1.06, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
          🔊 <span>{r.letter.toLowerCase()}</span>
        </motion.button>
      )}
      {HOLES.map((h, i) => {
        const pic = holes[i];
        const p = r && pic !== null ? r.pictures[pic] : null;
        return (
          <button key={i} onClick={() => { void whack(i); }} aria-label={p ? p.word : 'hole'} className="absolute z-20" style={{ left: `${h.x}%`, top: `${h.y}%`, width: 'min(24vh, 17vw)', height: 'min(26vh, 18vw)', translate: '-50% -80%' }}>
            <div className="absolute inset-0">
              <MoleBody up={!!p} bonked={bonk === i}>
                {p && (
                  <motion.div className="-mb-2 rounded-2xl border-4 border-amber-700 bg-white p-1 shadow-md" animate={nope === i ? { rotate: [0, -12, 12, -8, 0] } : {}} transition={{ duration: 0.5 }}>
                    <img src={p.img} alt="" draggable={false} style={{ width: 'min(11vh, 7.5vw)', height: 'min(11vh, 7.5vw)' }} className="object-contain" />
                  </motion.div>
                )}
              </MoleBody>
            </div>
            {/* the molehill in front */}
            <span className="pointer-events-none absolute bottom-0 left-1/2 h-[26%] w-full -translate-x-1/2 rounded-t-[50%] bg-[#6b4423] shadow-[inset_0_6px_0_rgba(255,255,255,0.15)]" />
          </button>
        );
      })}
      {r && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full bg-white/85 px-3 py-1 shadow-lg">
          {Array.from({ length: NEED }, (_, i) => <span key={i} className={`text-2xl ${i < hits ? '' : 'opacity-25 grayscale'}`}>⭐</span>)}
        </div>
      )}
      <Bursts items={bursts} />
      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-x-0 bottom-[14%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
            <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

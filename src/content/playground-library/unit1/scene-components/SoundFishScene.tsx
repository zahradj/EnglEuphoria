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
 * A painted pond (Canva art). Four painted fish swim slowly to and fro (flip at the turns, bob, bubbles), each carrying a
 * picture. Pip plays a letter SOUND (recorded); the child taps the fish whose picture starts with it: the
 * line drops (anticipation), the fish wriggles up in an arc into the bucket (squash, splash, the word is
 * said). A wrong fish flips its tail, its word is said, and it swims on. Sources (mechanic only): Boom
 * "Fishing Phonics" beginning sounds, the classroom magnet-fishing game. Better: the sound is played, not
 * shown, and the fish keep moving, so the child listens and tracks. */

type Fish = Extract<Scene, { kind: 'sound-fish' }>;
// painted Canva art (owner 2026-10-11: "improve the illustration and the animation, they look flat")
const POND = '/lep1/scenes/bg-game-pond-wide.png';
const FISH = ['orange', 'teal', 'purple', 'green', 'pink'].map((c) => `/lep1/items/item-fish-${c}.png`);
const BUCKET = '/lep1/items/item-fish-bucket.png';
const LANES = [45, 59, 73, 87];
const BUCKET_AT = { x: 89, y: 80 };

/** A painted fish (faces left in the art) that swims across its lane, flips at each turn, bobs and wiggles,
 *  and trails a few bubbles; the picture sits on the white patch in the middle (which does not move when flipped). */
function SwimFish({ i, img, word, glow, nope, hidden, reduce, onTap }: { i: number; img: string; word: string; glow: boolean; nope: boolean; hidden: boolean; reduce: boolean | null; onTap: (el: HTMLElement) => void }) {
  const dur = 15 + i * 2.5;
  const startLeft = i % 2 === 1;
  const path = startLeft ? ['16%', '84%', '16%'] : ['84%', '16%', '84%'];
  // art faces left: moving right = flipped
  const flip = startLeft ? [-1, -1, 1, 1, -1] : [1, 1, -1, -1, 1];
  return (
    <motion.button onClick={(e) => onTap(e.currentTarget)} aria-label={word} className="absolute z-20" style={{ top: `${LANES[i % LANES.length]}%`, width: 'min(22vh, 15.5vw)', aspectRatio: '1', translate: '-50% -50%', visibility: hidden ? 'hidden' : 'visible' }}
      initial={{ left: reduce ? `${18 + i * 21}%` : path[0] }}
      animate={reduce ? { left: `${18 + i * 21}%` } : { left: path }}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}>
      {glow && <span className="absolute inset-[15%] animate-pulse rounded-full bg-yellow-300/70 blur-xl" />}
      {/* bob up and down + a little dart when it is the wrong fish */}
      <motion.div className="absolute inset-0" animate={reduce ? {} : nope ? { x: [0, -30, 20, 0], rotate: [0, 18, -12, 0] } : { y: [0, -7, 0, 6, 0] }}
        transition={nope ? { duration: 0.5 } : { duration: 2.4 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}>
        <motion.div className="absolute inset-0" animate={reduce ? {} : { scaleX: flip, rotate: [-3, 3, -3] }}
          transition={{ scaleX: { duration: dur, repeat: Infinity, times: [0, 0.48, 0.52, 0.98, 1] }, rotate: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } }}>
          <img src={FISH[i % FISH.length]} alt="" draggable={false} className="pointer-events-none h-full w-full object-contain drop-shadow-[0_10px_8px_rgba(0,40,80,0.35)]" />
        </motion.div>
        <img src={img} alt="" draggable={false} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain" style={{ width: '27%', height: '27%' }} />
      </motion.div>
      {/* bubbles */}
      {!reduce && [0, 1, 2].map((k) => (
        <motion.span key={k} className="pointer-events-none absolute left-1/2 top-[30%] rounded-full border-2 border-white/80 bg-white/30" style={{ width: 8 + k * 4, height: 8 + k * 4 }}
          animate={{ y: [0, -60 - k * 20], opacity: [0, 0.9, 0], x: [0, (k - 1) * 10] }} transition={{ duration: 2.2, repeat: Infinity, delay: k * 0.7 + i * 0.4, ease: 'easeOut' }} />
      ))}
    </motion.button>
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
  const [caught, setCaught] = useState<{ i: number; x: number; y: number } | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; k: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
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

  const hook = async (i: number, el: HTMLElement) => {
    if (!r || busy.current) return;
    // where the fish is right now (it keeps swimming), in % of the pond
    const b = box.current?.getBoundingClientRect(); const e = el.getBoundingClientRect();
    const at = b ? { x: ((e.left + e.width / 2 - b.left) / b.width) * 100, y: ((e.top + e.height / 2 - b.top) / b.height) * 100 } : { x: 50, y: 60 };
    setRipple({ ...at, k: Date.now() });
    busy.current = true;
    const f = r.fish[i];
    if (i !== answer) {
      sfx.wrong(); setNope(i); setMisses((m) => m + 1);
      await sayWithin(phonicsNo(f.word), scene.who, 1800);
      setNope(-1); busy.current = false; return;
    }
    setCaught({ i, ...at }); sfx.whoop();
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 450)); // the line drops, the fish wriggles
    fire(at.x, at.y, 'splash');
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 900)); // up, over, into the bucket
    sfx.pop(); fire(BUCKET_AT.x, BUCKET_AT.y - 6, 'splash'); fire(BUCKET_AT.x, BUCKET_AT.y - 14, 'stars'); setBucket((b) => b + 1);
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 90));
    sfx.match();
    await sayWithin(phonicsYes(f.word), scene.who, 1800);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" ref={box} style={{ backgroundImage: `url(${POND})` }}>
      {done && <Confetti count={60} />}
      {/* light ripples drifting on the water (live UI motion over the still picture, no zoom/pan) */}
      {!reduce && [0, 1, 2, 3].map((k) => (
        <motion.span key={k} className="pointer-events-none absolute z-10 h-1.5 rounded-full bg-white/50 blur-[1px]" style={{ top: `${44 + k * 12}%`, width: '12%' }}
          animate={{ left: ['-15%', '110%'], opacity: [0, 0.8, 0] }} transition={{ duration: 11 + k * 3, repeat: Infinity, ease: 'linear', delay: k * 2.5 }} />
      ))}
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
      {r && r.fish.map((f, i) => (
        <SwimFish key={`${round}-${i}`} i={i} img={f.img} word={f.word} glow={misses >= 2 && i === answer} nope={nope === i} hidden={caught?.i === i} reduce={reduce} onTap={(el) => { void hook(i, el); }} />
      ))}
      {/* a ripple ring where the child tapped */}
      {ripple && !reduce && (
        <motion.span key={ripple.k} className="pointer-events-none absolute z-20 h-[10vh] w-[16vh] rounded-[50%] border-4 border-white/90" style={{ left: `${ripple.x}%`, top: `${ripple.y}%`, translate: '-50% -50%' }}
          initial={{ scale: 0.2, opacity: 1 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.7 }} />
      )}
      {/* the catch: the line drops onto the fish, it wriggles, then flies up and over into the bucket */}
      {caught && r && (
        <>
          <motion.span className="pointer-events-none absolute top-0 z-30 w-[3px] origin-top bg-slate-700/80" style={{ left: `${caught.x}%` }}
            initial={{ height: '0%' }} animate={reduce ? { height: '0%' } : { height: [`0%`, `${caught.y}%`, `${caught.y}%`, '0%'] }} transition={{ duration: 0.9, times: [0, 0.4, 0.5, 1] }} />
          <motion.div className="pointer-events-none absolute z-30" style={{ width: 'min(22vh, 15.5vw)', aspectRatio: '1', translate: '-50% -50%' }}
            initial={{ left: `${caught.x}%`, top: `${caught.y}%` }}
            animate={reduce ? { left: `${BUCKET_AT.x}%`, top: `${BUCKET_AT.y}%`, scale: 0.4 } : {
              left: [`${caught.x}%`, `${caught.x}%`, `${caught.x}%`, `${(caught.x + BUCKET_AT.x) / 2}%`, `${BUCKET_AT.x}%`],
              top: [`${caught.y}%`, `${caught.y}%`, '16%', '8%', `${BUCKET_AT.y - 4}%`],
              rotate: [0, -20, 20, -30, 160], scale: [1, 1.05, 1.1, 0.9, 0.35] }}
            transition={{ duration: 1.35, times: [0, 0.3, 0.55, 0.75, 1], ease: 'easeInOut' }}>
            <img src={FISH[caught.i % FISH.length]} alt="" className="h-full w-full object-contain" />
            <img src={r.fish[caught.i].img} alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain" style={{ width: '27%', height: '27%' }} />
          </motion.div>
        </>
      )}
      {/* the bucket: squashes each time a fish lands in it */}
      <div className="pointer-events-none absolute z-30 flex flex-col items-center" style={{ left: `${BUCKET_AT.x}%`, top: `${BUCKET_AT.y}%`, translate: '-50% -40%' }}>
        <motion.img key={bucket} src={BUCKET} alt="" className="object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)]" style={{ width: 'min(18vh, 12vw)', transformOrigin: '50% 100%' }}
          initial={bucket && !reduce ? { scaleY: 0.75, scaleX: 1.2 } : false} animate={{ scaleY: 1, scaleX: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 9 }} />
        <span className="-mt-2 rounded-full bg-white/90 px-3 text-lg font-black text-sky-700 shadow">{bucket} 🐟</span>
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

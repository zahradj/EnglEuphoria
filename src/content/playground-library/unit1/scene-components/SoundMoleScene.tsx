import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, FloatText, useBursts } from './gameFx';
import { firstSound, phonicsListenLine, phonicsNo, phonicsYes } from './phonicsShared';

/* ---------- Sound Moles (phonics whack-a-mole, owner 2026-10-11) ----------
 * Six painted molehills on a painted meadow (Canva art; back row smaller for depth). Pip plays a letter SOUND (recorded clip). Moles pop up, each holding a picture
 * sign; the child bonks every mole whose picture starts with that sound (the word is said, stars, the mole
 * spins down dizzy). A wrong mole giggles and its word is said ("Sun! Try again!") — nothing is lost. Calm pace:
 * moles stay up 2.6 s. Three bonks per sound. Sources (mechanic only): whack-a-mole phonics apps, Starfall /
 * Teach Your Monster first-sound games. Better: pictures, not letters, so the child must HEAR the first sound. */

type Mole = Extract<Scene, { kind: 'sound-mole' }>;
// painted Canva art (owner 2026-10-11: "improve the illustration and the animation, they look flat")
const MEADOW = '/lep1/scenes/bg-game-meadow-wide.png';
const ART = { peek: '/lep1/items/item-mole-peek.png', laugh: '/lep1/items/item-mole-laugh.png', dizzy: '/lep1/items/item-mole-dizzy.png', hole: '/lep1/items/item-mole-hole.png', holeGrass: '/lep1/items/item-mole-hole-grass.png', dirt: '/lep1/items/item-mole-dirt.png' };
// back row smaller and higher = depth; front row bigger
const HOLES = [{ x: 27, y: 62, s: 0.8 }, { x: 50, y: 62, s: 0.8 }, { x: 73, y: 62, s: 0.8 }, { x: 19, y: 87, s: 1 }, { x: 50, y: 87, s: 1 }, { x: 81, y: 87, s: 1 }];
const NEED = 3;
const CRUMBS = [-70, -35, 0, 35, 70];

/** One hole: painted molehill, the mole rising out of it (clipped at the opening), soil flying when it pops. */
function MoleHole({ i, pic, img, word, bonked, nope, reduce, onTap }: { i: number; pic: number | null; img?: string; word?: string; bonked: boolean; nope: boolean; reduce: boolean | null; onTap: () => void }) {
  const h = HOLES[i];
  const up = pic !== null;
  const [ring, setRing] = useState(0);
  const face = bonked ? ART.dizzy : nope ? ART.laugh : ART.peek;
  return (
    <button onClick={() => { setRing((r) => r + 1); onTap(); }} aria-label={word ?? 'hole'} className="absolute" style={{ left: `${h.x}%`, top: `${h.y}%`, width: `calc(min(27vh, 19vw) * ${h.s})`, aspectRatio: '1', translate: '-50% -50%', zIndex: h.y > 70 ? 22 : 18 }}>
      {/* soft ground shadow + the painted hole */}
      <span className="pointer-events-none absolute inset-x-[8%] top-[62%] h-[18%] rounded-[50%] bg-black/25 blur-md" />
      <img src={i % 2 ? ART.holeGrass : ART.hole} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
      {/* the mole lives in a window that ends at the hole's opening, so it really comes OUT of the ground */}
      <div className="pointer-events-none absolute -inset-x-[12%] overflow-hidden" style={{ top: '-130%', bottom: '44%' }}>
        <AnimatePresence>
          {up && (
            <motion.div key={pic} className="absolute inset-x-0 bottom-0 flex flex-col items-center" style={{ transformOrigin: '50% 100%' }}
              initial={{ y: '105%' }}
              animate={bonked ? { y: ['0%', '0%', '105%'], scaleY: [0.7, 0.8, 1], scaleX: [1.2, 1.1, 1] } : reduce ? { y: '0%' } : { y: '0%', scaleY: [0.75, 1.14, 0.94, 1], scaleX: [1.15, 0.9, 1.04, 1] }}
              exit={{ y: '105%', transition: { duration: 0.22, ease: 'easeIn' } }}
              transition={bonked ? { duration: 0.75, times: [0, 0.45, 1], ease: 'easeIn' } : { duration: 0.42, ease: 'easeOut' }}>
              {/* the picture sign on its little stick */}
              <motion.div className="relative -mb-[14%] flex flex-col items-center" animate={nope ? { rotate: [0, -14, 12, -8, 0] } : reduce ? {} : { rotate: [-3, 3, -3] }} transition={nope ? { duration: 0.5 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="rounded-2xl border-[5px] border-amber-700 bg-gradient-to-b from-yellow-200 to-amber-300 p-1 shadow-[0_6px_0_#92400e,0_10px_16px_rgba(0,0,0,0.35)]">
                  {img && <img src={img} alt="" draggable={false} className="object-contain" style={{ width: `calc(min(11vh, 7.6vw) * ${h.s})`, height: `calc(min(11vh, 7.6vw) * ${h.s})` }} />}
                </div>
                <span className="h-[3vh] w-2 rounded-b bg-amber-800" />
              </motion.div>
              <motion.img src={face} alt="" draggable={false} className="w-full object-contain" style={{ transformOrigin: '50% 100%', clipPath: 'inset(0 0 21% 0)', marginBottom: '-21%' }}
                animate={reduce || bonked ? {} : { rotate: [-2, 2, -2], scaleY: [1, 1.03, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* the front rim of the hole, drawn again on top so the mole's bottom disappears INTO the ground */}
      <img src={i % 2 ? ART.holeGrass : ART.hole} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" style={{ clipPath: 'inset(52% 0 0 0)' }} />
      {/* soil flies out when a mole pops up */}
      {up && !reduce && CRUMBS.map((dx, k) => (
        <motion.img key={`${pic}-${k}`} src={ART.dirt} alt="" draggable={false} className="pointer-events-none absolute left-1/2 top-[40%] w-[18%]"
          initial={{ x: '-50%', y: 0, opacity: 1, scale: 0.6 }} animate={{ x: [`-50%`, `${dx * 1.2 - 50}%`], y: [0, -40 - (k % 2) * 25, 30], opacity: [1, 1, 0], scale: [0.6, 0.8, 0.5], rotate: [0, dx] }}
          transition={{ duration: 0.6, ease: 'easeOut' }} />
      ))}
      {/* tap ripple: every tap feels like a bonk */}
      {ring > 0 && !reduce && (
        <motion.span key={ring} className="pointer-events-none absolute left-1/2 top-[40%] h-[40%] w-[70%] rounded-[50%] border-4 border-white/90"
          initial={{ x: '-50%', y: '-50%', scale: 0.3, opacity: 1 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ duration: 0.45 }} />
      )}
    </button>
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
    sfx.match(); fire(HOLES[hole].x, HOLES[hole].y - 22, 'stars');
    void sayWithin(phonicsYes(p.word), scene.who, 1500);
    await new Promise((res) => window.setTimeout(res, 800));
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
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${MEADOW})` }}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? 'Great bonking!' : 'Bonk the moles that start with the sound!'}
        </span>
      </div>
      {r && (
        <motion.button onClick={playSound} aria-label="Play the sound again" className="absolute left-1/2 top-[23%] z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-6 py-2 text-4xl font-black text-orange-600 shadow-xl"
          animate={reduce ? {} : { scale: [1, 1.06, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
          🔊 <span>{r.letter.toLowerCase()}</span>
        </motion.button>
      )}
      {HOLES.map((_, i) => {
        const pic = holes[i];
        const p = r && pic !== null ? r.pictures[pic] : undefined;
        return <MoleHole key={i} i={i} pic={p ? pic : null} img={p?.img} word={p?.word} bonked={bonk === i} nope={nope === i} reduce={reduce} onTap={() => { void whack(i); }} />;
      })}
      <FloatText show={bonk !== null} x={bonk !== null ? HOLES[bonk].x : 50} y={bonk !== null ? HOLES[bonk].y - 30 : 50}><span className="text-3xl">BONK! ⭐</span></FloatText>
      {r && (
        <div className="pointer-events-none absolute left-4 top-[22%] z-30 flex gap-1 rounded-full bg-white/85 px-3 py-1 shadow-lg">
          {Array.from({ length: NEED }, (_, i) => <span key={i} className={`text-2xl ${i < hits ? '' : 'opacity-40 grayscale'}`}>⭐</span>)}
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

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';
import { firstSound, phonicsNo, phonicsYes } from './phonicsShared';

/* ---------- Hungry Letter Monsters (phonics, owner 2026-10-11) ----------
 * Two or three painted monsters (Canva art, closed/open mouth) wait with a letter on their tummy (each tummy plays its recorded sound when
 * tapped). A picture card pops up and its word is said; the child feeds it to the monster whose letter it
 * starts with: the monster opens wide (anticipation), the card flies in an arc, CHOMP (squash + hit-stop),
 * crumbs and a happy wiggle. The wrong monster shakes its head and the word is said again. Sources (mechanic
 * only): ESL "Hungry Monsters" initial-sound whiteboard game, Phonics Farm (feed the animals), Lingokids
 * feeding games. Better: the child hears the WORD and maps its first sound to a letter — the core of reading. */

type Monsters = Extract<Scene, { kind: 'letter-monsters' }>;
export const monsterIntroLine = 'Feed the hungry monsters! Who eats this one?';

// painted Canva monsters (owner 2026-10-11: "improve the illustration and the animation, they look flat");
// each has a closed-mouth and an open-mouth picture, identical except the mouth; the white tummy patch holds the letter
const LAND = '/lep1/scenes/bg-game-monsterland-wide.png';
const SKINS = ['orange', 'blue', 'purple'].map((c) => ({ closed: `/lep1/items/item-monster-${c}.png`, open: `/lep1/items/item-monster-${c}-open.png` }));
const CRUMBS = [-60, -30, 0, 30, 60, -45, 45];

export function LetterMonstersScene({ scene, onWin, onNext, sync }: { scene: Monsters; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, gemDone: false });
  const { round, gemDone } = state;
  const total = scene.cards.length;
  const c = round < total ? scene.cards[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [open, setOpen] = useState(-1);
  const [fly, setFly] = useState<number | null>(null);
  const [nope, setNope] = useState(-1);
  const [yum, setYum] = useState(-1);
  const [misses, setMisses] = useState(0);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const n = scene.monsters.length;
  const mx = (i: number) => (n === 2 ? 30 + i * 40 : 19 + i * 31);

  useEffect(() => {
    busy.current = false; setMisses(0); setOpen(-1);
    if (!c) return;
    const t = window.setTimeout(() => cueSpeak(round === 0 ? monsterIntroLine : c.word.charAt(0).toUpperCase() + c.word.slice(1) + '!', scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const feed = async (i: number) => {
    if (!c || busy.current) return;
    busy.current = true;
    const m = scene.monsters[i];
    if (firstSound(c.word) !== m.letter.toLowerCase()) {
      sfx.wrong(); shake(); setNope(i); setMisses((x) => x + 1);
      await sayWithin(phonicsNo(c.word), scene.who, 1800);
      setNope(-1); busy.current = false; return;
    }
    setOpen(i); sfx.whoop();
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 220)); // the mouth opens first
    setFly(i);
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 520));
    setFly(null); setOpen(-1); setYum(i); sfx.pop();
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 110)); // chomp hit-stop
    sfx.match(); fire(mx(i), 50, 'sparkle'); void playLetterPhonic(m.letter);
    window.setTimeout(() => setYum(-1), 1300);
    await sayWithin(phonicsYes(c.word), scene.who, 1800);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  const right = c ? scene.monsters.findIndex((m) => m.letter.toLowerCase() === firstSound(c.word)) : -1;
  const sea = scene.look === 'sea';
  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${sea ? scene.bg : LAND})` }} animate={shakeCtl}>
      {sea && <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(56,189,248,0.18), rgba(3,105,161,0.12) 70%, rgba(254,251,221,0.18))' }} />}
      {/* sea: bubbles rise past the monsters */}
      {sea && !reduce && Array.from({ length: 12 }, (_, k) => (
        <motion.span key={`bub${k}`} className="pointer-events-none absolute z-10 rounded-full border-2 border-white/70 bg-white/20"
          style={{ left: `${(k * 37) % 96 + 2}%`, width: `${10 + (k % 4) * 6}px`, height: `${10 + (k % 4) * 6}px` }}
          initial={{ top: '105%', opacity: 0 }} animate={{ top: ['105%', '-8%'], opacity: [0, 0.9, 0.9, 0], x: [0, 8, -6, 4] }}
          transition={{ duration: 7 + (k % 5), repeat: Infinity, delay: k * 0.7, ease: 'linear' }} />
      ))}
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? (sea ? 'Yum! The sea monsters are full!' : 'Yum! The monsters are full!') : 'Who eats this one? Listen to the first sound!'}
        </span>
      </div>
      {/* the picture card */}
      <AnimatePresence mode="wait">
        {c && fly === null && (
          <motion.button key={round} onClick={() => cueSpeak(c.word.charAt(0).toUpperCase() + c.word.slice(1) + '!', scene.who)} aria-label={c.word}
            className={`absolute left-1/2 top-[21%] z-30 shadow-2xl ${sea ? 'rounded-full border-4 border-white/80 p-4' : 'rounded-3xl border-4 border-amber-200 bg-gradient-to-b from-pink-200 to-rose-300 p-2'}`}
            style={{ translate: '-50% 0', ...(sea ? { background: 'radial-gradient(circle at 30% 25%, #ffffff 0 10%, rgba(240,251,255,0.95) 28%, rgba(186,230,253,0.9) 70%, rgba(125,211,252,0.95) 100%)', boxShadow: 'inset -8px -10px 18px rgba(3,105,161,0.35), 0 12px 24px rgba(3,105,161,0.35)' } : {}) }}
            initial={{ scale: 0, rotate: -15, y: 0 }} animate={reduce ? { scale: 1 } : { scale: 1, rotate: [0, -3, 3, 0], y: [0, -10, 0] }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 2.6, repeat: Infinity } }}>
            <img src={c.img} alt="" draggable={false} style={{ width: 'min(16vh, 12vw)', height: 'min(16vh, 12vw)' }} className="object-contain" />
          </motion.button>
        )}
      </AnimatePresence>
      {c && fly !== null && (
        <motion.img src={c.img} alt="" className="pointer-events-none absolute z-40 object-contain" style={{ width: 'min(14vh, 10vw)', translate: '-50% -50%' }}
          initial={{ left: '50%', top: '30%', scale: 1 }} animate={{ left: ['50%', `${(50 + mx(fly)) / 2}%`, `${mx(fly)}%`], top: ['30%', '20%', '60%'], scale: [1, 0.85, 0.15], rotate: [0, 160, 340] }}
          transition={{ duration: 0.5, ease: 'easeIn' }} />
      )}
      {/* the monsters */}
      {scene.monsters.map((m, i) => {
        const skin = SKINS[i % SKINS.length];
        const lean = c && fly === null && nope !== i ? (mx(i) < 50 ? 5 : mx(i) > 50 ? -5 : 0) : 0; // eager: they lean toward the food
        return (
          <div key={m.letter} className="absolute z-20" style={{ left: `${mx(i)}%`, top: '96%', width: 'min(42vh, 27vw)', aspectRatio: '1', translate: '-50% -100%' }}>
            {/* soft shadow that shrinks when the monster hops */}
            <motion.span className="pointer-events-none absolute inset-x-[18%] bottom-[4%] h-[9%] rounded-[50%] bg-black/30 blur-md"
              animate={yum === i && !reduce ? { scaleX: [1, 0.6, 1, 0.7, 1], opacity: [1, 0.5, 1, 0.6, 1] } : {}} transition={{ duration: 1.1 }} />
            <motion.button onClick={() => { void feed(i); }} aria-label={`monster ${m.letter}`} className="absolute inset-0" style={{ transformOrigin: '50% 92%' }}
              animate={reduce ? {} :
                nope === i ? { rotate: [0, -10, 10, -7, 7, 0], y: 0 } :
                yum === i ? { y: [0, 0, -40, 0, -22, 0], scaleY: [0.8, 1, 1.08, 0.9, 1.04, 1], scaleX: [1.18, 1, 0.94, 1.08, 0.97, 1], rotate: 0 } :
                open === i ? { scaleY: 1.12, scaleX: 0.93, rotate: lean, y: -6 } :
                misses >= 2 && i === right ? { y: [0, -18, 0], rotate: lean } :
                { y: 0, scaleY: [1, 1.035, 1], scaleX: [1, 0.985, 1], rotate: lean }}
              transition={nope === i ? { duration: 0.55 } : yum === i ? { duration: 1.1, ease: 'easeOut' } : open === i ? { type: 'spring', stiffness: 400, damping: 12 } : { duration: misses >= 2 && i === right ? 0.6 : 1.7 + i * 0.35, repeat: Infinity, ease: 'easeInOut', rotate: { type: 'spring', stiffness: 120, damping: 10 } }}>
              <img src={open === i ? skin.open : skin.closed} alt="" draggable={false} className="pointer-events-none h-full w-full object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.25)]" />
              {/* the letter on the tummy patch (tap: hear its sound) */}
              <span role="button" tabIndex={0} aria-label={`sound ${m.letter}`} onClick={(e) => { e.stopPropagation(); void playLetterPhonic(m.letter); }}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 font-black leading-none text-slate-800" style={{ top: open === i ? '69.7%' : '67.4%', fontSize: 'min(10vh, 6.4vw)' }}>
                {m.letter.toLowerCase()}
              </span>
            </motion.button>
            {/* crumbs fly out of the mouth on the chomp */}
            {yum === i && !reduce && CRUMBS.map((dx, k) => (
              <motion.span key={k} className={`pointer-events-none absolute left-1/2 top-[40%] h-3 w-3 rounded-full shadow ${sea ? 'border border-white bg-sky-100/80' : 'bg-amber-500'}`}
                initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: dx * 1.6, y: [0, -50 - (k % 3) * 20, 40], opacity: [1, 1, 0] }} transition={{ duration: 0.7, ease: 'easeOut' }} />
            ))}
          </div>
        );
      })}
      <div className="pointer-events-none absolute bottom-3 left-3 z-30 flex gap-1 rounded-full bg-white/85 px-3 py-1 shadow-lg">
        {scene.cards.map((_, i) => <span key={i} className={`text-xl ${i < round ? '' : 'opacity-25 grayscale'}`}>{sea ? '🐚' : '🍪'}</span>)}
      </div>
      <Bursts items={bursts} />
      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-x-0 top-[34%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
            <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

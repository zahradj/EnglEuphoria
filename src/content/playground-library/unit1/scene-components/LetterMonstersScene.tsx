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
 * Two or three round monsters wait with a letter on their tummy (each tummy plays its recorded sound when
 * tapped). A picture card pops up and its word is said; the child feeds it to the monster whose letter it
 * starts with: the monster opens wide (anticipation), the card flies in an arc, CHOMP (squash + hit-stop),
 * crumbs and a happy wiggle. The wrong monster shakes its head and the word is said again. Sources (mechanic
 * only): ESL "Hungry Monsters" initial-sound whiteboard game, Phonics Farm (feed the animals), Lingokids
 * feeding games. Better: the child hears the WORD and maps its first sound to a letter — the core of reading. */

type Monsters = Extract<Scene, { kind: 'letter-monsters' }>;
export const monsterIntroLine = 'Feed the hungry monsters! Who eats this one?';

function MonsterSvg({ color, open }: { color: string; open: boolean }) {
  return (
    <svg viewBox="0 0 120 130" className="h-full w-full drop-shadow-[0_10px_8px_rgba(0,0,0,0.3)]">
      <path d="M20 40 L28 14 L40 36 M80 36 L92 14 L100 40" stroke="#2b2b2b" strokeWidth="5" fill={color} strokeLinejoin="round" />
      <ellipse cx="60" cy="72" rx="52" ry="54" fill={color} stroke="#2b2b2b" strokeWidth="5" />
      <circle cx="42" cy="48" r="11" fill="#fff" stroke="#2b2b2b" strokeWidth="3" /><circle cx="78" cy="48" r="11" fill="#fff" stroke="#2b2b2b" strokeWidth="3" />
      <circle cx="44" cy="50" r="5" fill="#111" /><circle cx="80" cy="50" r="5" fill="#111" />
      {open
        ? <ellipse cx="60" cy="76" rx="24" ry="16" fill="#5b0e1a" stroke="#2b2b2b" strokeWidth="4" />
        : <path d="M38 72 Q60 90 82 72" stroke="#2b2b2b" strokeWidth="5" fill="none" strokeLinecap="round" />}
      <ellipse cx="60" cy="108" rx="24" ry="14" fill="#fff" stroke="#2b2b2b" strokeWidth="3" />
    </svg>
  );
}

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
  const [misses, setMisses] = useState(0);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const n = scene.monsters.length;
  const mx = (i: number) => (n === 2 ? 32 + i * 36 : 20 + i * 30);

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
    setFly(null); setOpen(-1); sfx.pop();
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 90)); // chomp hit-stop
    sfx.match(); fire(mx(i), 58, 'sparkle'); void playLetterPhonic(m.letter);
    await sayWithin(phonicsYes(c.word), scene.who, 1800);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  const right = c ? scene.monsters.findIndex((m) => m.letter.toLowerCase() === firstSound(c.word)) : -1;
  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? 'Yum! The monsters are full!' : 'Who eats this one? Listen to the first sound!'}
        </span>
      </div>
      {/* the picture card */}
      <AnimatePresence mode="wait">
        {c && fly === null && (
          <motion.button key={round} onClick={() => cueSpeak(c.word.charAt(0).toUpperCase() + c.word.slice(1) + '!', scene.who)} aria-label={c.word}
            className="absolute left-1/2 top-[30%] z-30 rounded-3xl border-4 border-white bg-white p-2 shadow-2xl" style={{ translate: '-50% 0' }}
            initial={{ scale: 0, rotate: -15 }} animate={reduce ? { scale: 1 } : { scale: 1, rotate: [0, -3, 3, 0] }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
            <img src={c.img} alt="" draggable={false} style={{ width: 'min(18vh, 13vw)', height: 'min(18vh, 13vw)' }} className="object-contain" />
          </motion.button>
        )}
      </AnimatePresence>
      {c && fly !== null && (
        <motion.img src={c.img} alt="" className="pointer-events-none absolute z-40 object-contain" style={{ width: 'min(14vh, 10vw)', translate: '-50% -50%' }}
          initial={{ left: '50%', top: '38%', scale: 1 }} animate={{ left: ['50%', `${(50 + mx(fly)) / 2}%`, `${mx(fly)}%`], top: ['38%', '22%', '58%'], scale: [1, 0.9, 0.2], rotate: [0, 180, 360] }}
          transition={{ duration: 0.5, ease: 'easeIn' }} />
      )}
      {/* the monsters */}
      {scene.monsters.map((m, i) => (
        <div key={m.letter} className="absolute z-20" style={{ left: `${mx(i)}%`, top: '66%', width: 'min(30vh, 20vw)', height: 'min(32vh, 21vw)', translate: '-50% -50%' }}>
          <motion.button onClick={() => { void feed(i); }} aria-label={`monster ${m.letter}`} className="absolute inset-0" style={{ transformOrigin: '50% 100%' }}
            animate={reduce ? {} : nope === i ? { rotate: [0, -12, 12, -8, 8, 0] } : open === i ? { scaleY: 1.12, scaleX: 0.92 } : misses >= 2 && i === right ? { y: [0, -14, 0] } : { y: [0, -4, 0], scaleY: 1, scaleX: 1 }}
            transition={nope === i ? { duration: 0.5 } : open === i ? { duration: 0.2 } : { duration: misses >= 2 && i === right ? 0.6 : 1.8 + i * 0.3, repeat: Infinity }}>
            <MonsterSvg color={m.color} open={open === i} />
          </motion.button>
          <button onClick={() => { void playLetterPhonic(m.letter); }} aria-label={`sound ${m.letter}`}
            className="absolute left-1/2 top-[83%] z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-2 font-black leading-none text-slate-800" style={{ fontSize: 'min(6vh, 4vw)' }}>
            {m.letter.toLowerCase()}
          </button>
        </div>
      ))}
      <div className="pointer-events-none absolute bottom-3 left-3 z-30 flex gap-1 rounded-full bg-white/85 px-3 py-1 shadow-lg">
        {scene.cards.map((_, i) => <span key={i} className={`text-xl ${i < round ? '' : 'opacity-25 grayscale'}`}>🍪</span>)}
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

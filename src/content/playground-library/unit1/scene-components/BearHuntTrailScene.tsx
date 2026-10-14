import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type TargetAndTransition, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Bear Hunt Trail (U10L5 signature, owner 2026-10-12: "he, she, they … and animals to use it can") ----------
 * The friends walk the trail of the story film: tall grass, the stream, the river, the hill, the cave. At each stop
 * the narrator says ONE sentence ("She can swim!") and the child taps WHO it is: Pip, Leo, Mia, the animal at this
 * stop, or all three friends. The pronoun decides: he = a boy (Pip OR Leo is right), she = Mia, it = the animal,
 * they = everybody. Right: that one jumps into the middle and DOES the action, the footprints march on to the next
 * stop. Wrong: the sticker shakes and the narrator says who the word means ("He is a boy! Listen: She can swim!"),
 * nothing is lost, the right one glows after two misses. At the cave: "Shh! It can sleep!" … the bear wakes up and
 * everybody dances. Sources (mechanic only): Cambridge Pre A1 Starters listening (listen and point to the person),
 * Lingokids / Khan Academy Kids "who is it?" picture taps, Duolingo ABC instant feedback, the classroom bear-hunt
 * chant walk (a path of places). Better: the choice is the PRONOUN itself (he / she / it / they), so a boy and a girl,
 * one and many, a friend and an animal are contrasted at every stop; the answer is shown, not just marked. */

type Trail = Extract<Scene, { kind: 'bear-hunt-trail' }>;
type Pick = 'pip' | 'mia' | 'leo' | 'animal' | 'all';
type Act = Trail['stops'][number]['action'];
const RIGHT: Record<Trail['stops'][number]['pronoun'], Pick[]> = { he: ['pip', 'leo'], she: ['mia'], it: ['animal'], they: ['all'] };
const HINT: Record<Trail['stops'][number]['pronoun'], string> = {
  he: 'He is a boy!', she: 'She is a girl!', it: 'It is an animal!', they: 'They are all the friends!',
};
const MOVE: Record<Act, TargetAndTransition> = {
  walk: { x: [-50, 50, 0], y: [0, -8, 0, -8, 0, -8, 0], transition: { duration: 1.8 } },
  jump: { y: [0, -140, 0, -90, 0], scaleY: [1, 1.1, 0.8, 1.05, 0.9, 1], transition: { duration: 1.4 } },
  swim: { x: [-60, 60, -60, 0], y: [0, -10, 0, -10, 0], rotate: [-6, 6, -6, 0], transition: { duration: 2 } },
  fly: { y: [0, -150, -110, -160, 0], rotate: [0, -8, 8, -8, 0], transition: { duration: 2 } },
  run: { x: [-120, 120, 0], y: [0, -12, 0, -12, 0, -12, 0], transition: { duration: 1.3 } },
  sleep: { scaleY: [1, 0.94, 1, 0.94, 1], rotate: [0, -3, 0], transition: { duration: 2.4 } },
  dance: { rotate: [-12, 12, -12, 12, 0], x: [-30, 30, -30, 30, 0], y: [0, -14, 0, -14, 0], transition: { duration: 1.6 } },
};

export function BearHuntTrailScene({ scene, onWin, onNext, sync }: { scene: Trail; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, gemDone: false });
  const { round, gemDone } = state;
  const total = scene.stops.length;
  const s = round < total ? scene.stops[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [nope, setNope] = useState<Pick | null>(null);
  const [misses, setMisses] = useState(0);
  const [show, setShow] = useState<{ pick: Pick; k: number } | null>(null);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    busy.current = false; setMisses(0); setNope(null); setShow(null);
    const t = window.setTimeout(() => cueSpeak(s ? s.line : scene.doneLine, scene.who), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const wait = (ms: number) => new Promise((res) => window.setTimeout(res, reduce ? 0 : ms));
  const choose = async (p: Pick) => {
    if (!s || busy.current) return;
    if (!RIGHT[s.pronoun].includes(p)) {
      sfx.wrong(); setNope(p); setMisses((m) => m + 1);
      await sayWithin(`${HINT[s.pronoun]} Listen: ${s.line}`, scene.who, 3200);
      setNope(null); return;
    }
    busy.current = true;
    sfx.match(); setShow({ pick: p, k: Date.now() }); fire(50, 50, 'stars');
    await sayWithin(s.reply, scene.who, 3000);
    await wait(500);
    const next = round + 1;
    sfx.whoop();
    if (next >= total && !gemDone) { fire(50, 35, 'confetti'); sfx.gem(); onWin(true); }
    setState((st) => ({ ...st, round: next, gemDone: st.gemDone || next >= total }));
  };

  const friend = (k: 'pip' | 'mia' | 'leo') => scene.friends.find((f) => f.key === k);
  const tokens: { pick: Pick; label: string; imgs: string[] }[] = s ? [
    ...(['pip', 'mia', 'leo'] as const).map((k) => ({ pick: k as Pick, label: friend(k)?.name ?? k, imgs: [friend(k)?.img ?? ''] })),
    ...(s.animal ? [{ pick: 'animal' as Pick, label: s.animal.word, imgs: [s.animal.img] }] : []),
    { pick: 'all', label: 'all', imgs: scene.friends.map((f) => f.img) },
  ] : [];
  const performer = show && s ? tokens.find((t) => t.pick === show.pick) : undefined;
  const bg = done ? scene.doneBg : s?.bg ?? scene.bg;

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-black">
      {/* the stop's place (story picture), cross-fading from stop to stop — stills hold still */}
      <AnimatePresence initial={false}>
        <motion.div key={bg} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bg})`, filter: done ? undefined : 'blur(3px)', transform: done ? undefined : 'scale(1.03)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.8 }} />
      </AnimatePresence>
      <div className={`pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b ${done ? 'from-black/25 via-transparent to-black/20' : 'from-black/45 via-black/25 to-black/45'}`} />
      {done && <Confetti count={70} />}

      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.2*var(--svw,1vw)), 5.4vh), 2.6rem)' }}>
          {done ? scene.doneLine : s?.line ?? ''}
        </span>
      </div>

      {/* the trail: one stop per place, paw prints walk on as each stop is solved, the cave at the end */}
      <div className="pointer-events-none absolute left-1/2 top-[24%] z-30 flex -translate-x-1/2 items-center gap-[0.6vw] rounded-full bg-amber-900/55 px-[1.4vw] py-[0.8vh] shadow-lg backdrop-blur-sm">
        {scene.stops.map((st, i) => (
          <div key={i} className="flex items-center gap-[0.6vw]">
            <motion.span className={`grid place-items-center rounded-full border-[0.35vh] ${i < round ? 'border-lime-200 bg-lime-500' : i === round ? 'border-yellow-100 bg-amber-400' : 'border-amber-200/60 bg-amber-800/60'}`}
              style={{ width: 'min(5vh, 3.4vw)', height: 'min(5vh, 3.4vw)', fontSize: 'min(2.8vh, 1.9vw)' }}
              animate={i === round && !reduce ? { scale: [1, 1.15, 1] } : { scale: 1 }} transition={{ duration: 1.2, repeat: i === round ? Infinity : 0 }}>
              {i < round ? '🐾' : st.icon}
            </motion.span>
            {i < total - 1 && <span className="text-amber-100/80" style={{ fontSize: 'min(2vh, 1.4vw)' }}>{i < round ? '• • •' : '· · ·'}</span>}
          </div>
        ))}
        <span className="ms-[0.4vw]" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>{done ? '🎉' : '🐻'}</span>
      </div>

      {/* the one who can: jumps into the middle and does it */}
      <AnimatePresence>
        {performer && show && s && (
          <motion.div key={`perf-${show.k}`} className="pointer-events-none absolute left-1/2 top-[56%] z-20 flex items-end justify-center"
            style={{ height: 'min(36vh, 24vw)', translate: '-50% -50%' }}
            initial={reduce ? false : { scale: 0.3, y: 120, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}>
            <motion.span className="absolute left-1/2 top-1/2 -z-10 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: 'radial-gradient(closest-side, rgba(255,236,150,0.85), rgba(255,200,80,0.35) 55%, rgba(255,200,80,0) 100%)' }}
              animate={reduce ? {} : { scale: [0.9, 1.05, 0.95] }} transition={{ duration: 1.6, repeat: Infinity, repeatType: 'mirror' }} />
            {s.action === 'swim' && (
              <motion.span className="absolute -inset-x-[20%] bottom-[2%] h-[26%] rounded-[50%] bg-gradient-to-b from-sky-300/80 to-blue-500/80"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }} />
            )}
            {performer.imgs.map((img, i) => (
              <motion.img key={i} src={img} alt="" draggable={false} className="relative h-full object-contain drop-shadow-[0_1.5vh_1vh_rgba(0,0,0,0.35)]"
                style={{ transformOrigin: '50% 90%', marginInline: performer.imgs.length > 1 ? '-2vh' : 0 }}
                animate={reduce ? {} : { ...MOVE[s.action], transition: { ...(MOVE[s.action].transition as object), delay: 0.35 + i * 0.12 } } as TargetAndTransition} />
            ))}
            {s.action === 'sleep' && !reduce && [0, 1, 2].map((k) => (
              <motion.span key={k} className="absolute right-[10%] top-[10%] font-black text-sky-100" style={{ fontSize: `${2.4 + k * 0.7}vh`, ...THICK_WORDS }}
                animate={{ y: [0, -50], x: [0, 14], opacity: [0, 1, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: k * 0.7 }}>z</motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* who is it? the stickers to tap */}
      {s && (
        <div className="absolute inset-x-0 bottom-[3%] z-30 flex items-end justify-center gap-[1.8vw]">
          {tokens.map((t, i) => {
            const glow = misses >= 2 && RIGHT[s.pronoun].includes(t.pick) && !show;
            const gone = show?.pick === t.pick;
            return (
              <motion.button key={`${round}-${t.pick}`} type="button" aria-label={t.label} onClick={() => { void choose(t.pick); }}
                className={`relative flex flex-col items-center rounded-[2.5vh] border-[0.6vh] p-[0.7vh] shadow-[0_0.8vh_0_rgba(0,0,0,0.25),0_1.5vh_2vh_rgba(0,0,0,0.3)] ${t.pick === 'animal' ? 'border-lime-200 bg-gradient-to-b from-emerald-400 to-teal-600' : t.pick === 'all' ? 'border-amber-200 bg-gradient-to-b from-amber-400 to-orange-500' : 'border-sky-200 bg-gradient-to-b from-sky-400 to-indigo-500'}`}
                initial={reduce ? false : { y: 60, opacity: 0 }}
                animate={nope === t.pick && !reduce ? { x: [0, -10, 10, -6, 0], y: 0, opacity: 1 } : { y: 0, opacity: gone ? 0.35 : 1 }}
                transition={nope === t.pick ? { duration: 0.45 } : { delay: reduce ? 0 : 0.1 + i * 0.07 }} whileTap={{ scale: 0.92 }}>
                {glow && <span className="pointer-events-none absolute -inset-[12%] -z-10 animate-pulse rounded-[3vh] bg-yellow-300/80 blur-lg" />}
                <span className="flex items-end justify-center" style={{ width: t.imgs.length > 1 ? 'min(19vh, 13vw)' : 'min(13vh, 9vw)', height: 'min(13vh, 9vw)' }}>
                  {t.imgs.map((img, k) => (
                    <img key={k} src={img} alt="" draggable={false} className="h-full min-w-0 object-contain drop-shadow-[0_0.5vh_0.4vh_rgba(0,0,0,0.3)]"
                      style={{ width: `${100 / t.imgs.length + (t.imgs.length > 1 ? 14 : 0)}%`, marginInline: t.imgs.length > 1 ? '-0.8vh' : 0 }} />
                  ))}
                </span>
                {nope === t.pick && (
                  <motion.span className="absolute -top-[18%] right-[4%] grid h-[5vh] w-[5vh] place-items-center rounded-full bg-gradient-to-b from-yellow-200 to-amber-300 text-[3vh] font-black text-amber-800 shadow-lg"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}>?</motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      <Bursts items={bursts} />
      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-x-0 bottom-[10%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9, type: 'spring' }}>
            <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

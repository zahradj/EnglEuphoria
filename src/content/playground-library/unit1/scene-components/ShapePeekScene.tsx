import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, ShapeIcon, StickerButton, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- What's Peeking? (Pre-A1 Unit 2 Lesson 3) ----------
 * A shape hides in a toy crate; only its top peeks out — a round edge, a
 * flat side with two corners, or one pointy tip. "What shape is hiding?"
 * The child picks circle, square or triangle; the shape jumps out and turns
 * into a thing ("A circle! It's a ball!"). Researched: the "feely bag" /
 * mystery bag game (British Council LearnEnglish Kids, Oxford Numicon feely
 * bag, TESSA shape-and-space feely bags) and peekaboo reveals in Khan
 * Academy Kids. Better than the bag: the child reasons from what they SEE
 * (round or pointy?), and a wrong guess makes the shape peek out a little
 * more — every miss is a clue, never a loss. No clock. */

type Peek = Extract<Scene, { kind: 'shape-peek' }>;
const SHAPES = ['circle', 'square', 'triangle'] as const;
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
export const SHAPE_PEEK_LINE = 'What shape is hiding?';
export const shapePeekWrong = (shape: string) => `Not a ${shape}! Look again!`;

export function ShapePeekScene({ scene, onWin, onNext, sync }: { scene: Peek; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, wrong: [] as string[], out: false, gemDone: false });
  const { round, wrong, out, gemDone } = state;
  const wrongSet = useMemo(() => new Set(wrong), [wrong]);
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const busy = useRef(false);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    busy.current = false;
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(SHAPE_PEEK_LINE, scene.who), 600);
    const idle = window.setInterval(() => { if (!busy.current) cueSpeak(SHAPE_PEEK_LINE, scene.who); }, 8000);
    return () => { window.clearTimeout(t); window.clearInterval(idle); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (shape: string) => {
    if (!r || busy.current || out || wrongSet.has(shape)) return;
    busy.current = true;
    if (shape !== r.shape) {
      sfx.wrong();
      setState((s) => ({ ...s, wrong: [...s.wrong, shape] }));
      await sayWithin(shapePeekWrong(shape), scene.who, 3000);
      busy.current = false;
      return;
    }
    sfx.whoop();
    setState((s) => ({ ...s, out: true }));
    window.setTimeout(() => { sfx.match(); fire(50, 40, 'stars'); }, 450);
    await sayWithin(r.reply, scene.who, 3800);
    await new Promise((res) => setTimeout(res, 500));
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, wrong: [], out: false, gemDone: s.gemDone || next >= total }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/15" />
        <Confetti count={60} />
        <div className="relative z-10 flex flex-col items-center gap-5 px-4">
          <div className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(2rem, calc(4.5*var(--svw,1vw)), 3.6rem)' }}>🌟 Great looking!</div>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-4 text-xl`}>Next ⭐</button>
        </div>
      </div>
    );
  }

  // How much of the shape shows: a little at first, more after each wrong guess.
  const peek = out ? 1 : Math.min(0.6, 0.28 + wrong.length * 0.16);
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/10" />
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {out ? r.reply : SHAPE_PEEK_LINE}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
        </div>
      </div>
      <button onClick={() => cueSpeak(SHAPE_PEEK_LINE, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>

      {/* The crate: the shape hides behind its front. */}
      <div key={round} className="absolute left-1/2 top-[27%] z-10 h-[40vh] w-[min(54vh,44vw)] -translate-x-1/2 portrait:top-[24%]">
        <motion.div
          className="absolute left-1/2 z-10 h-[26vh] w-[26vh] -translate-x-1/2"
          initial={{ top: '38%' }}
          animate={out ? { top: '-40%', rotate: [0, -12, 10, 0], scale: [1, 1.15, 1] } : { top: `${38 - peek * 65}%`, rotate: [0, -4, 4, 0] }}
          transition={out ? { type: 'spring', stiffness: 200, damping: 12 } : { top: { type: 'spring', stiffness: 120, damping: 14 }, rotate: { duration: 1.6, repeat: Infinity } }}
        >
          <ShapeIcon shape={r.shape} fill={r.color} />
        </motion.div>
        {/* Front of the crate (wood planks). */}
        <div className="absolute inset-x-0 bottom-0 z-20 h-[62%] rounded-[18px] border-[5px] border-[#7A4A1E] bg-gradient-to-b from-[#D99A57] to-[#B8722F] shadow-[0_14px_24px_rgba(60,30,10,0.35)]">
          <div className="absolute inset-x-0 top-1/3 h-[5px] bg-[#7A4A1E]/60" />
          <div className="absolute inset-x-0 top-2/3 h-[5px] bg-[#7A4A1E]/60" />
          <span className="absolute inset-0 grid place-items-center text-[min(9vh,7vw)] font-black text-[#FFE7B8]/90" style={{ textShadow: '0 3px 0 #7A4A1E' }}>?</span>
        </div>
        {out && (
          <motion.img
            src={r.img} alt={r.label} draggable={false}
            className="absolute -right-[46%] top-[-30%] z-30 h-[26vh] w-[26vh] object-contain"
            style={{ filter: STICKER_FILTER }}
            initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.45, type: 'spring', stiffness: 220, damping: 12 }}
          />
        )}
      </div>

      {/* Three big shape choices. */}
      <div className="absolute inset-x-0 bottom-[11%] z-20 flex items-end justify-center gap-[5vw] px-3">
        {SHAPES.map((s, i) => (
          <StickerButton
            key={s}
            onClick={() => { void pick(s); }}
            label={cap(s)}
            tilt={[-5, 3, -3][i]}
            state={out && s === r.shape ? 'right' : wrongSet.has(s) ? 'wrong' : out ? 'dim' : undefined}
            size="h-[min(17vh,15vw)] w-[min(17vh,15vw)]"
            delay={i * 0.1}
          >
            <ShapeIcon shape={s} fill="#F8FAFC" />
          </StickerButton>
        ))}
      </div>
      <Bursts items={bursts} />
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shapePeekLines(scene: Peek) {
  return [
    [scene.who, SHAPE_PEEK_LINE],
    ...scene.rounds.map((r) => [scene.who, r.reply]),
    ...SHAPES.map((s) => [scene.who, shapePeekWrong(s)]),
  ] as [string, string][];
}

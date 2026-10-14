import { useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';

/* ---------- Listen and Match (`listen-match`, Pre-A1 — owner 2026-10-13) ----------
 * The owner's rule: every time new words are shown, a matching activity follows — Pre-A1 listens and matches (no
 * written words), A1 reads and matches. Here the words are ONLY sounds: coloured speakers (no text) and the pictures of
 * the words just taught. The child taps a speaker, hears "A bat!", then taps the bat: the speaker sticks to its picture
 * and the word is said again. A wrong picture wiggles and we hear "Listen again!". All matched = the gem.
 * Researched (mechanics only): Cambridge Pre A1 Starters Listening Part 1/4 ("listen and draw lines / tick the box"),
 * Wordwall "Match up" with audio, Lingokids / Khan Academy Kids "listen and find". Better: no reading at all (the
 * cards are sounds, a 4-year-old can play alone); the child replays any speaker as often as they like; the matched
 * speaker stays on its picture so the board shows the progress; no timer, no lost points. Tap-tap, so it mirrors live.
 *
 * FOUR DESIGNS (`look`, owner 2026-10-14: "change the design of the games to prevent repetition — make it a rule"):
 * the same listening game in 45 lessons must not look the same twice in a row. `cards` (a picture grid), `balloons`
 * (the pictures float on balloons; the right one is caught and stops bobbing), `doors` (a row of doors with the
 * picture in the window; the right door swings open), `lilypads` (the pictures sit on lily pads on a pond; the right
 * pad lights up with a ripple). listenMatchVariety.test.ts (deploy gate) checks that neighbouring lessons differ. */

type ListenMatch = Extract<Scene, { kind: 'listen-match' }>;
export type ListenMatchLook = 'cards' | 'balloons' | 'doors' | 'lilypads';
export const LISTEN_MATCH_LOOKS: readonly ListenMatchLook[] = ['cards', 'balloons', 'doors', 'lilypads'];
export const LISTEN_MATCH_WRONG = 'Listen again!';
const SPEAKER_COLORS = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400', 'bg-violet-400', 'bg-orange-400', 'bg-teal-400', 'bg-pink-400'];
const BALLOON_COLORS = ['#F87171', '#60A5FA', '#FBBF24', '#34D399', '#A78BFA', '#FB923C'];
const DOOR_COLORS = ['#DC6B3C', '#3B82C4', '#C9A227', '#4F9D5B', '#8B5CF6', '#E0708A'];

/** A fixed shuffle from the scene id, so the teacher's and the student's speakers are in the same order. */
export function speakerOrder(id: string, n: number): number[] {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  // never leave a speaker right under its own picture's slot on the first card
  if (n > 1 && order[0] === 0) [order[0], order[1]] = [order[1], order[0]];
  return order;
}

/** Where picture k of n sits for the spread-out designs (% of the scene). */
const spread = (k: number, n: number, yBase: number, yStep: number) => ({
  left: n === 1 ? 50 : 13 + (k * 74) / (n - 1),
  top: yBase + ((k * 7) % 3) * yStep,
});

export function ListenMatchScene({ scene, onWin, onNext, sync }: { scene: ListenMatch; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { picked: -1, matched: [-1] as number[], wrong: -1, busy: false });
  const matched = useMemo(() => (Array.isArray(state.matched) ? state.matched.filter((n) => n >= 0) : []), [state.matched]);
  const matchedSet = useMemo(() => new Set(matched), [matched]);
  const picked = Number.isInteger(state.picked) ? state.picked : -1;
  const order = useMemo(() => speakerOrder(scene.id, scene.items.length), [scene.id, scene.items.length]);
  const done = matched.length >= scene.items.length;
  const look: ListenMatchLook = scene.look ?? 'cards';
  const n = scene.items.length;

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(scene.prompt, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const play = (i: number) => {
    const it = scene.items[i];
    if (!it || state.busy || matchedSet.has(i)) return;
    sfx.click();
    setState((s) => ({ ...s, picked: i }));
    cueSpeak(it.say, it.who ?? scene.who);
  };

  const pick = async (i: number) => {
    const it = scene.items[i];
    if (!it || state.busy || matchedSet.has(i) || done) return;
    if (picked < 0) { cueSpeak(scene.prompt, scene.who); return; }
    if (picked !== i) {
      sfx.wrong();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      cueSpeak(LISTEN_MATCH_WRONG, scene.who);
      return;
    }
    sfx.match();
    const next = [...matched, i];
    setState((s) => ({ ...s, matched: next, picked: -1, busy: true }));
    await sayWithin(it.say, it.who ?? scene.who, 2600);
    setState((s) => ({ ...s, busy: false }));
    if (next.length >= scene.items.length) {
      sfx.gem(); onWin(true);
      void sayWithin(scene.doneLine, scene.who, 4000);
    }
  };

  const colorOf = (i: number) => SPEAKER_COLORS[order.indexOf(i) % SPEAKER_COLORS.length];
  const wiggle = (i: number) => (state.wrong === i ? { x: [0, -12, 12, -7, 0] } : undefined);
  /** The matched speaker, stuck to its picture. */
  const badge = (i: number, cls = '') => (
    <motion.span className={`absolute flex h-[min(7vh,5vw)] w-[min(7vh,5vw)] items-center justify-center rounded-full border-[0.4vh] border-white ${colorOf(i)} shadow-lg ${cls}`}
      initial={reduce ? false : { scale: 0, y: 80 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}
      style={{ fontSize: 'min(3.4vh, 2.4vw)' }}>🔊</motion.span>
  );
  const pic = (it: ListenMatch['items'][number], cls: string) => <img src={it.img} alt="" draggable={false} className={cls} style={{ filter: STICKER_FILTER }} />;

  /* ---- the four designs ---- */
  const cols = n > 4 ? 3 : 2;
  const cards = (
    <div className={`absolute top-[19%] bottom-[26%] z-20 grid gap-[1.4vh] ${n <= 4 ? 'inset-x-[24%]' : 'inset-x-[12%]'}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${Math.ceil(n / cols)}, minmax(0, 1fr))` }}>
      {scene.items.map((it, i) => {
        const ok = matchedSet.has(i);
        return (
          <motion.button key={i} type="button" onClick={() => void pick(i)} aria-label={it.label}
            className={`relative flex min-h-0 items-center justify-center rounded-[3vh] border-[0.6vh] shadow-xl transition-colors ${ok ? 'border-emerald-400 bg-emerald-50/90' : picked >= 0 ? 'border-amber-300 bg-white/85' : 'border-white/80 bg-white/75'}`}
            animate={wiggle(i) ?? (ok && !reduce ? { scale: [1, 1.08, 1] } : {})} transition={{ duration: 0.45 }}>
            {pic(it, 'h-[82%] w-[82%] object-contain')}
            {ok && badge(i, '-bottom-[1.2vh] right-[6%]')}
          </motion.button>
        );
      })}
    </div>
  );

  const balloons = (
    <div className="absolute inset-0 z-20">
      {scene.items.map((it, i) => {
        const ok = matchedSet.has(i); const p = spread(i, n, 16, 9); const c = BALLOON_COLORS[i % BALLOON_COLORS.length];
        return (
          <div key={i} className="absolute -translate-x-1/2" style={{ left: `${p.left}%`, top: `${p.top}%` }}>
          <motion.div animate={ok || reduce ? {} : { y: [0, -14, 0, 8, 0], rotate: [-3, 3, -3] }} transition={{ duration: 3.2 + (i % 3) * 0.6, repeat: Infinity, ease: 'easeInOut' }}>
            <motion.button type="button" onClick={() => void pick(i)} aria-label={it.label} className="relative flex flex-col items-center" animate={wiggle(i) ?? {}} transition={{ duration: 0.45 }}>
              {/* the balloon */}
              <span className={`relative block h-[min(17vh,12vw)] w-[min(14vh,10vw)] rounded-[50%_50%_50%_50%/55%_55%_45%_45%] shadow-xl ${ok ? 'ring-[0.6vh] ring-emerald-400' : ''}`}
                style={{ background: `radial-gradient(circle at 32% 28%, #ffffffb0 0, ${c} 28%, ${c} 100%)` }}>
                <span className="absolute left-1/2 top-[101%] h-[1.2vh] w-[1.2vh] -translate-x-1/2 rotate-45" style={{ background: c }} />
              </span>
              <span className="block h-[3vh] w-[0.3vh] bg-slate-700/70" />
              {/* the picture hangs on the string */}
              <span className={`flex h-[min(13vh,9vw)] w-[min(13vh,9vw)] items-center justify-center rounded-[2vh] border-[0.5vh] bg-white/85 shadow-xl ${ok ? 'border-emerald-400' : 'border-white'}`}>
                {pic(it, 'h-[84%] w-[84%] object-contain')}
              </span>
              {ok && badge(i, 'bottom-[-1vh] right-[-1vh]')}
            </motion.button>
          </motion.div>
          </div>
        );
      })}
    </div>
  );

  const doors = (
    <div className="absolute inset-x-[6%] top-[18%] bottom-[27%] z-20 flex items-end justify-center gap-[2vw]">
      {scene.items.map((it, i) => {
        const ok = matchedSet.has(i); const c = DOOR_COLORS[i % DOOR_COLORS.length];
        return (
          <motion.button key={i} type="button" onClick={() => void pick(i)} aria-label={it.label} className="relative h-full w-[min(26vh,15vw)]" animate={wiggle(i) ?? {}} transition={{ duration: 0.45 }}>
            {/* door frame + the picture behind the door */}
            <span className="absolute inset-0 rounded-t-[8vh] border-[0.7vh] border-amber-900/70 bg-amber-100/90 shadow-2xl" />
            <span className="absolute inset-x-[10%] top-[12%] flex h-[42%] items-center justify-center">{pic(it, 'h-[92%] w-[92%] object-contain')}</span>
            {ok && <motion.span className="absolute left-1/2 top-[60%] -translate-x-1/2" style={{ fontSize: 'min(7vh,5vw)' }} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 240 }}>⭐</motion.span>}
            {/* the door leaf: closed = the picture shows in its round window; matched = it swings open */}
            <motion.span className="absolute inset-0 origin-left rounded-t-[8vh] shadow-xl" style={{ background: `linear-gradient(90deg, ${c}, ${c}cc)`, transformStyle: 'preserve-3d' }}
              animate={ok ? { rotateY: reduce ? 0 : -78, opacity: reduce ? 0 : 1 } : { rotateY: 0, opacity: 1 }} transition={{ duration: 0.7, ease: 'easeInOut' }}>
              <span className="absolute inset-x-[16%] top-[9%] flex h-[42%] items-center justify-center overflow-hidden rounded-full border-[0.5vh] border-white/80 bg-white/90">{pic(it, 'h-[86%] w-[86%] object-contain')}</span>
              <span className="absolute right-[12%] top-[62%] h-[2.2vh] w-[2.2vh] rounded-full bg-yellow-300 shadow" />
            </motion.span>
            {ok && badge(i, 'bottom-[-1vh] right-[-1vh]')}
          </motion.button>
        );
      })}
    </div>
  );

  const lilypads = (
    <div className="absolute inset-0 z-20">
      {/* the pond */}
      <div className="absolute inset-x-[4%] bottom-[22%] top-[24%] rounded-[50%] border-[0.8vh] border-emerald-700/40" style={{ background: 'radial-gradient(ellipse at 50% 40%, #93d6f5cc 0%, #4fb3e6cc 55%, #2b8ac4d9 100%)', boxShadow: 'inset 0 0 6vh rgba(0,40,80,0.35)' }} />
      {scene.items.map((it, i) => {
        const ok = matchedSet.has(i); const p = spread(i, n, 32, 11);
        return (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.left}%`, top: `${p.top}%` }}>
          <motion.div className="relative" animate={ok || reduce ? {} : { y: [0, -5, 0, 4, 0] }} transition={{ duration: 3.6 + (i % 3) * 0.5, repeat: Infinity, ease: 'easeInOut' }}>
            {ok && !reduce && <motion.span className="absolute left-1/2 top-1/2 h-[min(22vh,16vw)] w-[min(26vh,19vw)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[0.4vh] border-white/80" initial={{ scale: 0.6, opacity: 1 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.2, repeat: 2 }} />}
            <motion.button type="button" onClick={() => void pick(i)} aria-label={it.label}
              className={`relative flex h-[min(17vh,13vw)] w-[min(21vh,16vw)] items-center justify-center rounded-[50%] shadow-xl ${ok ? 'ring-[0.6vh] ring-yellow-300' : ''}`}
              style={{ background: ok ? 'radial-gradient(circle at 40% 35%, #bbf7d0, #22c55e 70%)' : 'radial-gradient(circle at 40% 35%, #86efac, #15803d 75%)', clipPath: 'polygon(50% 50%, 100% 50%, 100% 0, 0 0, 0 100%, 100% 100%, 100% 62%)' }}
              animate={wiggle(i) ?? {}} transition={{ duration: 0.45 }}>
              {pic(it, 'h-[76%] w-[66%] object-contain')}
            </motion.button>
            {ok && badge(i, 'bottom-[-0.5vh] right-[0.5vh]')}
          </motion.div>
          </div>
        );
      })}
    </div>
  );

  const board = look === 'balloons' ? balloons : look === 'doors' ? doors : look === 'lilypads' ? lilypads : cards;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-indigo-950/20" />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[10%] z-30 flex justify-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.2*var(--svw,1vw)), 5.2vh), 2.6rem)' }}>
          {done ? `🎉 ${scene.doneLine}` : `👂 ${scene.prompt}`}
        </span>
      </div>

      {board}

      {/* the sounds — speakers only, no written words */}
      {!done && (
        <div className="absolute inset-x-[4%] bottom-[10%] z-30 flex items-end justify-center gap-[1.4vw]">
          {order.map((i, k) => {
            if (matchedSet.has(i)) return <span key={i} className="h-[min(10vh,8vw)] w-[min(10vh,8vw)] rounded-full border-[0.4vh] border-dashed border-white/60" />;
            const on = picked === i;
            return (
              <motion.button key={i} type="button" onClick={() => play(i)} aria-label={`sound ${k + 1}`}
                className={`flex h-[min(10vh,8vw)] w-[min(10vh,8vw)] items-center justify-center rounded-full border-[0.5vh] ${on ? 'border-yellow-200 ring-4 ring-yellow-300' : 'border-white'} ${colorOf(i)} shadow-2xl`}
                animate={on && !reduce ? { y: [0, -10, 0] } : {}} transition={on ? { duration: 0.8, repeat: Infinity } : {}}
                style={{ fontSize: 'min(5vh, 3.6vw)' }}>🔊</motion.button>
            );
          })}
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[11%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}

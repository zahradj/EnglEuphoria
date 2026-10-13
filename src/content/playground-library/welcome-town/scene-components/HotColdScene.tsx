import { useEffect, useMemo, useRef, type MouseEvent as RMouseEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS, useArtBox } from '../../unit1/scene-components/shared';

/* ---------- Treasure Radar (Hot and Cold, modern design — docs/a1-activity-library.md §11) ----------
 * Something is hidden in the picture ("Where is Leo's red cap?"). The child taps to search: every tap sends a radar
 * ring out, the screen tints from icy blue to warm red, and the friend calls "Cold!", "Warm!", "Hot!", "Very hot!".
 * On the spot the picture pops out and the friend says the sentence ("It's my red cap!"). After six taps the spot
 * glows softly, so nobody gets stuck. Mechanics: the Hot and Cold party game, metal-detector / radar mini-games,
 * Khan Academy Kids hidden-object scenes. Better: the child listens for words (not a beeping meter), every find ends
 * in a full sentence about the lesson, and the search is shared on both screens in a live class. */

type HotCold = Extract<Scene, { kind: 'hot-cold' }>;
type Heat = 'cold' | 'warm' | 'hot' | 'very-hot';
const HEAT: Record<Heat, { word: string; icon: string; tint: string; ring: string }> = {
  cold: { word: 'Cold!', icon: '❄️', tint: 'rgba(56,189,248,0.22)', ring: '#38bdf8' },
  warm: { word: 'Warm!', icon: '🌤️', tint: 'rgba(250,204,21,0.18)', ring: '#facc15' },
  hot: { word: 'Hot!', icon: '🔥', tint: 'rgba(249,115,22,0.22)', ring: '#f97316' },
  'very-hot': { word: 'Very hot!', icon: '🔥🔥', tint: 'rgba(239,68,68,0.28)', ring: '#ef4444' },
};
/** distance in "screen-fair" % units (x is stretched by the 16:9 aspect so circles are round) */
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot((ax - bx) * (16 / 9), ay - by);
export const heatOf = (d: number): Heat | 'found' => (d < 9 ? 'found' : d < 16 ? 'very-hot' : d < 28 ? 'hot' : d < 45 ? 'warm' : 'cold');

export function HotColdScene({ scene, onNext, onWin, onLose, sync }: { scene: HotCold; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, taps: [''] as string[], found: false, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const taps = useMemo(() => (Array.isArray(state.taps) ? state.taps.filter(Boolean) : []).map((t) => {
    const [x, y, h] = t.split(',');
    return { x: Number(x) || 0, y: Number(y) || 0, heat: (h in HEAT ? h : 'cold') as Heat };
  }), [state.taps]);
  const last = taps[taps.length - 1];
  const found = !!state.found;
  const done = !!state.done;
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, 16 / 9);
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !r) return undefined;
    const t = window.setTimeout(() => cueSpeak(r.find, voiceOf(scene.who)), round === 0 ? 900 : 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const search = (e: RMouseEvent<HTMLDivElement>) => {
    if (!r || found || done) return;
    const b = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - b.left) / b.width) * 1000) / 10;
    const y = Math.round(((e.clientY - b.top) / b.height) * 1000) / 10;
    const h = heatOf(dist(x, y, r.x, r.y));
    if (h === 'found') {
      sfx.reveal(); window.setTimeout(() => sfx.gem(), 250);
      cueSpeak(r.say, voiceOf(scene.who));
      setState((s) => ({ ...s, found: true }));
      return;
    }
    if (h === 'cold') onLose();
    sfx.pop();
    cueSpeak(HEAT[h].word, voiceOf(scene.who));
    setState((s) => ({ ...s, taps: [...(Array.isArray(s.taps) ? s.taps.filter(Boolean) : []), `${x},${y},${h}`].slice(-8) }));
  };
  const next = () => {
    sfx.click();
    setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, round: n, taps: [''], found: false };
    });
  };

  const hint = !found && taps.length >= 6;
  return (
    <div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-slate-900">
      <div className="absolute" style={{ width: box.width, height: box.height, left: box.left, top: box.top }} onClick={search}>
        <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        {/* the heat tint */}
        <motion.div className="pointer-events-none absolute inset-0" animate={{ backgroundColor: found ? 'rgba(250,204,21,0.12)' : last ? HEAT[last.heat].tint : 'rgba(56,189,248,0.10)' }} transition={{ duration: 0.5 }} />
        {/* earlier taps */}
        {taps.map((t, i) => (
          <span key={i} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[min(3.4vh,2.2vw)]" style={{ left: `${t.x}%`, top: `${t.y}%`, opacity: 0.35 + (i / taps.length) * 0.65 }}>{HEAT[t.heat].icon.slice(0, 2)}</span>
        ))}
        {/* radar ring on the newest tap */}
        <AnimatePresence>
          {last && !found && !reduce && (
            <motion.span key={`${round}-${taps.length}`} className="pointer-events-none absolute rounded-full border-[0.6vh]"
              style={{ left: `${last.x}%`, top: `${last.y}%`, width: '30vh', height: '30vh', marginLeft: '-15vh', marginTop: '-15vh', borderColor: HEAT[last.heat].ring }}
              initial={{ scale: 0.1, opacity: 1 }} animate={{ scale: 1.3, opacity: 0 }} transition={{ duration: 0.9 }} />
          )}
        </AnimatePresence>
        {last && !found && (
          <span className="pointer-events-none absolute z-10 -translate-x-1/2" style={{ left: `${Math.min(88, Math.max(12, last.x))}%`, top: `${Math.max(4, last.y - 12)}%` }}>
            <motion.span key={`w-${round}-${taps.length}`} className="block whitespace-nowrap rounded-full bg-white/95 px-3 py-1 font-black shadow-lg"
              style={{ color: HEAT[last.heat].ring, fontSize: 'min(3.4vh, 2.3vw)' }}
              initial={reduce ? false : { y: 10, scale: 0.6, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}>
              {HEAT[last.heat].icon} {HEAT[last.heat].word}
            </motion.span>
          </span>
        )}
        {/* the hint glow */}
        {hint && !reduce && (
          <motion.span className="pointer-events-none absolute rounded-full bg-yellow-200/40" style={{ left: `${r.x}%`, top: `${r.y}%`, width: '16vh', height: '16vh', marginLeft: '-8vh', marginTop: '-8vh', boxShadow: '0 0 4vh rgba(253,224,71,0.9)' }}
            animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 1.4, repeat: Infinity }} />
        )}
        {/* the find */}
        <AnimatePresence>
          {found && r && (
            <div key={`f-${round}`} className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
              <motion.img src={r.img} alt={r.label} draggable={false} className="h-[min(20vh,13vw)] w-auto object-contain drop-shadow-[0_0_2vh_rgba(253,224,71,0.95)]"
                initial={reduce ? false : { scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 12 }} />
            </div>
          )}
        </AnimatePresence>
      </div>
      {done && <Confetti count={80} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `📡 ${scene.title}`}
        </span>
      </div>
      {!done && r && (
        <>
          <button type="button" onClick={() => { sfx.click(); cueSpeak(r.find, voiceOf(scene.who)); }}
            className="absolute left-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-sky-800 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>
            🔊 {r.find}
          </button>
          <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-rose-600 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>📡 {round + 1}/{total}</span>
          <div className="absolute inset-x-0 bottom-[4%] z-30 flex flex-col items-center gap-[1vh]">
            {found ? (
              <>
                <span className="rounded-[2vh] bg-white/95 px-5 py-2 font-black text-amber-700 shadow-xl" style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>🎉 {r.say}</span>
                <button type="button" onClick={next} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>{round + 1 >= total ? 'Done! ⭐' : 'Next! 📡'}</button>
              </>
            ) : (
              <span className="pointer-events-none rounded-full bg-black/55 px-5 py-2 font-black text-white" style={{ fontSize: 'min(3vh, 2vw)' }}>👆 Tap to search — listen: cold or hot?</span>
            )}
          </div>
        </>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}

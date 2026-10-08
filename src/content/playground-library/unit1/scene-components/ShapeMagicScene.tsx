import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Magic Pencil (Pre-A1 Unit 2 Lesson 3 signature game) ----------
 * The child traces a dotted shape with a finger and the shape comes alive in
 * the picture ("Draw a circle in the sky!" → the circle becomes the sun).
 * Researched: Duolingo ABC / Khan Academy Kids finger tracing, the TPR
 * "draw the shape in the air" routine (englishclub, eslkidstuff) and Cambridge
 * Pre A1 "listen and put it in the picture". Better than the apps: tracing
 * isn't a worksheet — every finished shape turns into a thing that stays, so
 * the child paints a whole scene with shapes. Forgiving: progress adds up
 * over several strokes, no clock, a glowing pencil shows the way. */

type Magic = Extract<Scene, { kind: 'shape-magic' }>;
type ShapeName = 'circle' | 'square' | 'triangle';

/** Checkpoints along each outline, in the 0–100 box of the drawing pad. */
function outlinePoints(shape: ShapeName, n = 28): { x: number; y: number }[] {
  if (shape === 'circle') return Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return { x: 50 + 40 * Math.cos(a), y: 50 + 40 * Math.sin(a) }; });
  const corners = shape === 'square' ? [[12, 12], [88, 12], [88, 88], [12, 88]] : [[50, 10], [90, 86], [10, 86]];
  const pts: { x: number; y: number }[] = [];
  const per = Math.round(n / corners.length);
  corners.forEach(([x1, y1], k) => {
    const [x2, y2] = corners[(k + 1) % corners.length];
    for (let i = 0; i < per; i++) pts.push({ x: x1 + ((x2 - x1) * i) / per, y: y1 + ((y2 - y1) * i) / per });
  });
  return pts;
}
const outlinePath = (shape: ShapeName) => (shape === 'circle' ? 'M50 10 A40 40 0 1 1 49.9 10 Z' : shape === 'square' ? 'M12 12 H88 V88 H12 Z' : 'M50 10 L90 86 L10 86 Z');
const DONE_AT = 0.72;
const REACH = 15;

export function ShapeMagicScene({ scene, onWin, onNext, sync }: { scene: Magic; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, placed: [] as number[], gemDone: false });
  const { round, placed, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const [bursts, fire] = useBursts();
  const pts = useMemo(() => (r ? outlinePoints(r.shape) : []), [r]);
  const [hit, setHit] = useState<boolean[]>([]);
  const [stroke, setStroke] = useState<{ x: number; y: number }[][]>([]);
  const [started, setStarted] = useState(false);
  const drawing = useRef(false);
  const finishing = useRef(false);
  const pad = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHit([]); setStroke([]); setStarted(false); finishing.current = false;
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 500);
    const idle = window.setInterval(() => { if (!drawing.current && !finishing.current) cueSpeak(r.line, scene.who); }, 8000);
    return () => { window.clearTimeout(t); window.clearInterval(idle); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const finish = async () => {
    if (!r || finishing.current) return;
    finishing.current = true;
    sfx.match();
    fire(r.x, r.y, 'stars');
    setState((s) => ({ ...s, placed: [...s.placed, s.round] }));
    await sayWithin(r.reply, scene.who, 3500);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 50, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  const local = (e: React.PointerEvent) => {
    const b = pad.current?.getBoundingClientRect();
    if (!b) return null;
    return { x: ((e.clientX - b.left) / b.width) * 100, y: ((e.clientY - b.top) / b.height) * 100 };
  };
  const mark = (p: { x: number; y: number }) => {
    setHit((h) => {
      const nh = pts.map((q, i) => h[i] || Math.hypot(q.x - p.x, q.y - p.y) < REACH);
      if (nh.filter(Boolean).length / pts.length >= DONE_AT) void finish();
      return nh;
    });
  };
  const down = (e: React.PointerEvent) => {
    if (!r || finishing.current) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drawing.current = true; setStarted(true);
    const p = local(e); if (!p) return;
    sfx.click();
    setStroke((s) => [...s, [p]]); mark(p);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || finishing.current) return;
    const p = local(e); if (!p) return;
    setStroke((s) => (s.length ? [...s.slice(0, -1), [...s[s.length - 1], p].slice(-160)] : [[p]]));
    mark(p);
  };
  const up = () => { drawing.current = false; };
  const progress = pts.length ? hit.filter(Boolean).length / pts.length : 0;

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {done && <Confetti count={60} />}

      {/* Shapes already drawn: they stay in the picture. */}
      {placed.map((i) => {
        const p = scene.rounds[i];
        if (!p) return null;
        return (
          <motion.img
            key={i} src={p.img} alt={p.label} draggable={false}
            className="pointer-events-none absolute z-10 object-contain"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `min(${p.size}vh, ${p.size * 0.75}vw)`, height: `min(${p.size}vh, ${p.size * 0.75}vw)`, x: '-50%', y: '-50%', filter: STICKER_FILTER }}
            initial={{ scale: 0.2, rotate: -20, opacity: 0 }}
            animate={{ scale: [0.2, 1.25, 1], rotate: 0, opacity: 1, y: ['-50%', '-56%', '-50%'] }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        );
      })}

      {/* The drawing pad: a dotted shape to trace. */}
      {r && (
        <div
          ref={pad}
          key={round}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          aria-label={`Trace the ${r.shape}`}
          className="absolute z-20 touch-none"
          style={{ left: `${r.x}%`, top: `${r.y}%`, width: `min(${r.size}vh, ${r.size * 0.75}vw)`, height: `min(${r.size}vh, ${r.size * 0.75}vw)`, transform: 'translate(-50%, -50%)' }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
            <path d={outlinePath(r.shape)} fill="rgba(255,255,255,0.28)" stroke="#fff" strokeWidth="9" strokeLinejoin="round" opacity="0.9" />
            <path d={outlinePath(r.shape)} fill="none" stroke={r.color} strokeWidth="5" strokeDasharray="7 6" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((q, i) => hit[i] && <circle key={i} cx={q.x} cy={q.y} r="4.2" fill={r.color} />)}
            {stroke.map((s, k) => <polyline key={k} points={s.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke={r.color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />)}
          </svg>
          {/* The magic pencil shows the way until the child starts. */}
          {!started && (
            <motion.span
              className="pointer-events-none absolute -ml-5 -mt-5 text-[2.6rem] drop-shadow-lg"
              animate={{ left: pts.concat(pts[0] ?? []).map((q) => `${q.x}%`), top: pts.concat(pts[0] ?? []).map((q) => `${q.y}%`) }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
            >✏️</motion.span>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {r ? r.line : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>✨</span>)}
        </div>
        {r && progress > 0 && (
          <div className="mt-1 h-2.5 w-40 overflow-hidden rounded-full bg-white/60">
            <div className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-pink-500 transition-all" style={{ width: `${Math.min(100, (progress / DONE_AT) * 100)}%` }} />
          </div>
        )}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shapeMagicLines(scene: Magic) {
  return [...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]), [scene.who, scene.doneLine]] as [string, string][];
}

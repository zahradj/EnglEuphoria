import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CLAY_CARD, STICKER_FILTER, ThingArt, sayWithin } from './shared';

/* ---------- Draw Path ----------
 * Lingokids' "Draw Path" adventure (2026): the child draws a line with a
 * finger and a character follows it. Here the voice names a thing in the
 * picture ("Take Pip to the purple circle!"), the child draws from the
 * character to it, and the character walks the line and says it ("It's a
 * purple circle!"). Listening decides where the line goes — no reading,
 * and drawing is fine-motor practice too. The character stays where it
 * arrived, so the next line starts from there. */

type DrawPath = Extract<Scene, { kind: 'draw-path' }>;
type Pt = { x: number; y: number };
const NEAR = 9; // % distance that counts as "on" the character / a spot

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, (a.y - b.y) * 0.56); // y% is shorter on a 16:9 stage

export function DrawPathScene({ scene, onWin, onLose, onNext, sync }: { scene: DrawPath; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    phase: 'draw', // draw → walk → said
    path: [] as number[], // flattened x,y (%) of the accepted line
    wrong: -1,
    gemDone: false,
  });
  const { round, phase, path, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const stage = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState<Pt[]>([]);
  const drawing = useRef(false);
  const [walkAt, setWalkAt] = useState<Pt | null>(null);

  // Where the character stands now: the start, or the spot reached last round.
  const prev = round > 0 ? scene.rounds[round - 1] : undefined;
  const prevSpot = prev ? scene.spots[prev.target] : undefined;
  const home: Pt = prevSpot ? { x: prevSpot.x, y: prevSpot.y } : scene.start;

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  // Walk the accepted line (both screens animate from the synced path).
  useEffect(() => {
    if (phase !== 'walk' || path.length < 4) { setWalkAt(null); return; }
    const pts: Pt[] = [];
    for (let i = 0; i + 1 < path.length; i += 2) pts.push({ x: path[i], y: path[i + 1] });
    let raf = 0;
    const t0 = performance.now();
    const dur = 1600;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const f = k * (pts.length - 1);
      const i = Math.floor(f), a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)];
      setWalkAt({ x: a.x + (b.x - a.x) * (f - i), y: a.y + (b.y - a.y) * (f - i) });
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, path]);

  const toPct = (e: React.PointerEvent): Pt | null => {
    const box = stage.current?.getBoundingClientRect();
    if (!box) return null;
    return { x: ((e.clientX - box.left) / box.width) * 100, y: ((e.clientY - box.top) / box.height) * 100 };
  };

  const down = (e: React.PointerEvent) => {
    if (!r || phase !== 'draw') return;
    const p = toPct(e);
    if (!p) return;
    if (dist(p, home) > NEAR * 1.4) { cueSpeak(`Start at ${CAST[scene.walker].name}!`, scene.who); return; }
    drawing.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setLive([home, p]);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = toPct(e);
    if (!p) return;
    setLive((l) => (l.length && dist(l[l.length - 1], p) < 1.2 ? l : [...l, p]));
  };
  const up = async () => {
    if (!drawing.current || !r) return;
    drawing.current = false;
    const end = live[live.length - 1];
    const hit = end ? scene.spots.findIndex((s) => dist(end, s) < Math.max(NEAR, s.size * 0.6)) : -1;
    if (hit !== r.target) {
      setLive([]);
      if (hit >= 0) {
        sfx.wrong(); onLose();
        setState((s) => ({ ...s, wrong: hit }));
        window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 700);
      }
      return;
    }
    // Keep at most ~40 points so the synced line stays small.
    const target = scene.spots[r.target];
    const pts = [...live, { x: target.x, y: target.y }];
    const stride = Math.max(1, Math.ceil(pts.length / 40));
    const slim = pts.filter((_, i) => i % stride === 0 || i === pts.length - 1);
    setLive([]);
    sfx.pop();
    setState((s) => ({ ...s, phase: 'walk', path: slim.flatMap((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]) }));
    await new Promise((res) => setTimeout(res, 1700));
    sfx.match();
    await sayWithin(r.reply, scene.who, 4000);
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, phase: 'draw', path: [], gemDone: s.gemDone || awardGem }));
  };

  const walker = CAST[scene.walker];
  const at = walkAt ?? home;
  const done = !r;
  const lineD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  const synced: Pt[] = [];
  for (let i = 0; i + 1 < path.length; i += 2) synced.push({ x: path[i], y: path[i + 1] });

  return (
    <div
      ref={stage}
      className="absolute inset-0 touch-none select-none overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${scene.bg})` }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => { drawing.current = false; setLive([]); }}
    >
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? `✏️ ${r.line}` : '🎉 You did it!'}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>}
      </div>
      {r && <button onPointerDown={(e) => e.stopPropagation()} onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>}

      {/* The line: dotted while drawing, a bright trail while walking. */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-10 h-full w-full">
        {live.length > 1 && <path d={lineD(live)} fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 18" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 12, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.35))' }} />}
        {phase === 'walk' && synced.length > 1 && <path d={lineD(synced)} fill="none" stroke="#FE6A2F" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 8, opacity: 0.85 }} />}
      </svg>

      {scene.spots.map((s, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 ${wrong === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}%`, aspectRatio: '1' }}
        >
          <ThingArt thing={s} />
        </div>
      ))}

      {/* The character, with a pulsing ring where the finger should start. */}
      <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[85%]" style={{ left: `${at.x}%`, top: `${at.y}%`, width: '11%' }}>
        {phase === 'draw' && r && <span className="absolute inset-x-[10%] bottom-0 aspect-square rounded-full bg-yellow-200/70" style={{ animation: 'lep1-ping 1.6s ease-in-out infinite' }} />}
        <img src={walker.img} alt={walker.name} draggable={false} className="relative w-full" style={{ filter: STICKER_FILTER, animation: phase === 'walk' ? 'lep1-bob 0.35s ease-in-out infinite' : undefined }} />
      </div>
      {phase === 'draw' && r && round === 0 && live.length === 0 && (
        <div className="pointer-events-none absolute z-30 text-4xl" style={{ left: `${home.x + 3}%`, top: `${home.y + 2}%`, animation: 'lep1-bob 1.2s ease-in-out infinite' }}>👆</div>
      )}

      {done && (
        <div className="absolute inset-x-0 bottom-[8%] z-30 flex flex-col items-center gap-3">
          <div className={`${CLAY_CARD} px-6 py-2 text-xl font-black text-orange-600`}>🌟 Great drawing!</div>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function drawPathLines(scene: DrawPath) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    [scene.who, `Start at ${CAST[scene.walker].name}!`],
  ] as [string, string][];
}

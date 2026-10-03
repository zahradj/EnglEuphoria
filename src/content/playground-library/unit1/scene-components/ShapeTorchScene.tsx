import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { ShapeIcon, sayWithin } from './shared';

/* ---------- Torch Hunt in the Dark Cave ----------
 * The "flashlight / I spy in the dark" pattern from kids' hidden-object apps
 * (and the A1 Magic Castle torch-hunt), made for non-readers: the cave is
 * dark, coloured shape gems hide on the wall, the voice says "Find a green
 * triangle!" and the child moves the torch around. A gem only counts once it
 * is lit: the first tap shines the torch on it, the next tap picks it.
 * Every wrong pick is named back ("That's a red circle.") so even mistakes
 * are listening input. Gem positions are % of a 16:9 stage. */

type Gem = Extract<Scene, { kind: 'shape-torch' }>['gems'][number];

const art = (c: string) => (/^[aeiou]/.test(c) ? 'an' : 'a');
export function findLine(colorWord: string, shape: string) {
  const c = colorWord.toLowerCase();
  return `Find ${art(c)} ${c} ${shape}!`;
}
export function foundLine(colorWord: string, shape: string) {
  const c = colorWord.toLowerCase();
  return `Yes! ${art(c) === 'an' ? 'An' : 'A'} ${c} ${shape}!`;
}
export function notThisLine(colorWord: string, shape: string) {
  const c = colorWord.toLowerCase();
  return `That's ${art(c)} ${c} ${shape}.`;
}

const BEAM = 0.12; // beam radius as a share of the stage width

function useStageBox() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const W = el.clientWidth, H = el.clientHeight;
      const w = Math.min(W, (H * 16) / 9);
      setBox({ w, h: (w * 9) / 16 });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, box };
}

export function ShapeTorchScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'shape-torch' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    found: [] as number[],
    wrong: -1,
    busy: false,
    // The torch starts in an empty top corner, so no gem is lit before the hunt.
    torchX: 90,
    torchY: 12,
    gemDone: false,
  });
  const { round, found, wrong, busy, torchX, torchY, gemDone } = state;
  const total = scene.targets.length;
  const targetIdx = round < total ? scene.targets[round] : undefined;
  const target: Gem | undefined = targetIdx != null ? scene.gems[targetIdx] : undefined;
  const foundSet = useMemo(() => new Set(found), [found]);
  const { ref, box } = useStageBox();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [live, setLive] = useState<{ x: number; y: number } | null>(null);
  const beforeTap = useRef<{ x: number; y: number }>({ x: torchX, y: torchY });

  useEffect(() => {
    if (!target) return;
    const t = window.setTimeout(() => cueSpeak(findLine(target.colorWord, target.shape), scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pct = (e: RPointerEvent) => {
    const b = stageRef.current!.getBoundingClientRect();
    return { x: Math.max(0, Math.min(100, ((e.clientX - b.left) / b.width) * 100)), y: Math.max(0, Math.min(100, ((e.clientY - b.top) / b.height) * 100)) };
  };
  const lit = (g: Gem, at: { x: number; y: number }) => Math.hypot(g.x - at.x, (g.y - at.y) * (9 / 16)) < BEAM * 100;

  const pick = async (i: number) => {
    const g = scene.gems[i];
    if (!target || !g || busy || foundSet.has(i)) return;
    if (!lit(g, beforeTap.current)) return; // first tap only shines the torch on it
    if (i !== targetIdx && (g.colorWord !== target.colorWord || g.shape !== target.shape)) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      cueSpeak(notThisLine(g.colorWord, g.shape), scene.who);
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 700);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, found: [...s.found, i], busy: true }));
    await sayWithin(foundLine(g.colorWord, g.shape), scene.who);
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, busy: false, gemDone: s.gemDone || awardGem }));
  };

  const done = !target;
  const t = live ?? { x: torchX, y: torchY };
  const beamPx = box.w * BEAM;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b0718]">
      <div ref={ref} className="absolute inset-0 flex items-center justify-center">
        {box.w > 0 && (
          <div
            ref={stageRef}
            className="relative touch-none overflow-hidden shadow-2xl"
            style={{ width: box.w, height: box.h, cursor: done ? 'default' : 'none' }}
            onPointerDown={(e) => { if (done) return; beforeTap.current = { x: torchX, y: torchY }; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); setLive(pct(e)); }}
            onPointerMove={(e) => { if (live) setLive(pct(e)); }}
            onPointerUp={(e) => {
              if (!live) return;
              const p = pct(e);
              setLive(null);
              setState((s) => ({ ...s, torchX: p.x, torchY: p.y }));
              // A tap on a gem that was already in the beam picks it.
              const hit = scene.gems.findIndex((g) => Math.hypot(g.x - p.x, (g.y - p.y) * (9 / 16)) < g.size * 0.6);
              if (hit >= 0) void pick(hit);
            }}
            onPointerCancel={() => setLive(null)}
          >
            <img src={scene.bg} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" />
            {scene.gems.map((g, i) => {
              const isFound = foundSet.has(i);
              return (
                <span
                  key={i}
                  aria-label={`${g.colorWord.toLowerCase()} ${g.shape}`}
                  className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 ${wrong === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
                  style={{ left: `${g.x}%`, top: `${g.y}%`, width: `${g.size}%`, aspectRatio: '1', zIndex: isFound ? 30 : 10, filter: isFound ? 'drop-shadow(0 0 14px rgba(255,214,102,.95))' : 'drop-shadow(0 3px 4px rgba(0,0,0,.4))' }}
                >
                  <span className={`block h-full w-full ${isFound ? 'animate-[lep1-pop_0.4s_ease-out]' : ''}`}><ShapeIcon shape={g.shape} fill={g.colorHex} /></span>
                </span>
              );
            })}
            {/* darkness with the torch beam (lights come on at the end) */}
            <div
              className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-1000"
              style={{
                opacity: done ? 0 : 1,
                background: `radial-gradient(circle ${beamPx * 1.25}px at ${t.x}% ${t.y}%, rgba(255,240,190,0.05) 0, rgba(255,240,190,0.05) ${beamPx * 0.8}px, rgba(6,3,20,0.99) ${beamPx * 1.25}px)`,
              }}
            />
            {!done && (
              <div className="pointer-events-none absolute z-30 -translate-x-1/2 transition-[left,top] duration-100" style={{ left: `${t.x}%`, top: `calc(${t.y}% + ${beamPx * 0.9}px)`, fontSize: Math.max(26, box.w / 22) }}>🔦</div>
            )}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-3 z-40 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {target ? `🔦 ${findLine(target.colorWord, target.shape)}` : '💡 The lights are on! You found every gem!'}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{Math.min(round + 1, total)}/{total}</span>
      </div>
      {target && (
        <button onClick={() => cueSpeak(findLine(target.colorWord, target.shape), scene.who)} className="absolute right-3 top-3 z-40 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      )}

      {/* The gem bag */}
      <div className="absolute bottom-[3%] left-3 z-40 flex items-center gap-2 rounded-3xl bg-white/90 px-3 py-2 shadow-xl">
        <span className="text-2xl">💎</span>
        {found.map((i) => scene.gems[i] && (
          <span key={i} className="block h-8 w-8 animate-[lep1-pop_0.4s_ease-out]"><ShapeIcon shape={scene.gems[i].shape} fill={scene.gems[i].colorHex} /></span>
        ))}
        {Array.from({ length: Math.max(0, total - found.length) }, (_, k) => (
          <span key={`e${k}`} className="block h-8 w-8 rounded-full border-[3px] border-dashed border-amber-300 bg-amber-50" />
        ))}
      </div>
      {done && (
        <div className="absolute inset-x-0 bottom-[12%] z-40 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shapeTorchLines(scene: Extract<Scene, { kind: 'shape-torch' }>) {
  const lines: [string, string][] = [];
  for (const i of scene.targets) {
    const g = scene.gems[i];
    if (g) lines.push([scene.who, findLine(g.colorWord, g.shape)], [scene.who, foundLine(g.colorWord, g.shape)]);
  }
  for (const g of scene.gems) lines.push([scene.who, notThisLine(g.colorWord, g.shape)]);
  return lines;
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { sayWithin } from './shared';

/* ---------- Night Sounds: "Who's there?" (Unit 7 Lesson 6, unit review) ----------
 * Night on Grandpa's farm. The animals of the unit hide in the dark (behind the haystack, in the coop,
 * by the pond…). A SOUND comes first — "Moo! Moo! Who's there?" — so the child names the animal from
 * its sound ("It's a cow!") BEFORE seeing it, then moves the torch to find it. Like shape-torch, an
 * animal only counts once it is lit: the first tap shines the torch on it, the next tap picks it.
 * A wrong animal answers with its own sound ("That's a pig. Oink!"), so mistakes are listening input
 * too. At the end the farm lights come on and every animal is there.
 * Sources (mechanic only): flashlight hidden-object games in kids' apps (Lingokids, Khan Academy Kids
 * hide-and-seek), "Where's Spot?" lift-the-flap hide-and-seek, Cambridge Pre A1 Starters "listen and
 * find". Better: sound first, word second, picture last — the child must decode the sound into the
 * word; no clock, nothing to read. Positions are % of a 16:9 stage. */

type Animal = Extract<Scene, { kind: 'night-sounds' }>['animals'][number];

export const whoLine = (a: Pick<Animal, 'sound'>) => `${a.sound} ${a.sound} Who's there?`;
export const foundAnimalLine = (a: Pick<Animal, 'word' | 'sound'>) => `Yes! It's a ${a.word}! ${a.sound}`;
export const wrongAnimalLine = (a: Pick<Animal, 'word' | 'sound'>) => `That's a ${a.word}. ${a.sound}`;

const BEAM = 0.12;

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
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);
  return { ref, box };
}

export function NightSoundsScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'night-sounds' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    found: [] as number[],
    wrong: -1,
    busy: false,
    torchX: 50,
    torchY: 10,
    gemDone: false,
  });
  const { round, found, wrong, busy, torchX, torchY, gemDone } = state;
  const total = scene.order.length;
  const targetIdx = round < total ? scene.order[round] : undefined;
  const target: Animal | undefined = targetIdx != null ? scene.animals[targetIdx] : undefined;
  const foundSet = useMemo(() => new Set(found), [found]);
  const { ref, box } = useStageBox();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [live, setLive] = useState<{ x: number; y: number } | null>(null);
  const beforeTap = useRef<{ x: number; y: number }>({ x: torchX, y: torchY });

  useEffect(() => {
    if (!target) return;
    const t = window.setTimeout(() => cueSpeak(whoLine(target), scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pct = (e: RPointerEvent) => {
    const b = stageRef.current!.getBoundingClientRect();
    return { x: Math.max(0, Math.min(100, ((e.clientX - b.left) / b.width) * 100)), y: Math.max(0, Math.min(100, ((e.clientY - b.top) / b.height) * 100)) };
  };
  const lit = (a: Animal, at: { x: number; y: number }) => Math.hypot(a.x - at.x, (a.y - at.y) * (9 / 16)) < BEAM * 100;

  const pick = async (i: number) => {
    const a = scene.animals[i];
    if (!target || !a || busy || foundSet.has(i)) return;
    if (!lit(a, beforeTap.current)) return; // the first tap only shines the torch on it
    if (i !== targetIdx) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      cueSpeak(wrongAnimalLine(a), scene.who);
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 700);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, found: [...s.found, i], busy: true }));
    await sayWithin(foundAnimalLine(a), scene.who);
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
              const hit = scene.animals.findIndex((a) => Math.hypot(a.x - p.x, (a.y - p.y) * (9 / 16)) < a.size * 0.6);
              if (hit >= 0) void pick(hit);
            }}
            onPointerCancel={() => setLive(null)}
          >
            <img src={scene.bg} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" />
            {scene.animals.map((a, i) => {
              const isFound = foundSet.has(i);
              return (
                <img
                  key={i}
                  src={a.img}
                  alt={a.word}
                  draggable={false}
                  className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none object-contain ${wrong === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''} ${isFound ? 'animate-[lep1-pop_0.4s_ease-out]' : ''}`}
                  style={{ left: `${a.x}%`, top: `${a.y}%`, width: `${a.size}%`, zIndex: isFound ? 30 : 10, filter: isFound ? 'drop-shadow(0 0 14px rgba(255,214,102,.95))' : 'drop-shadow(0 3px 4px rgba(0,0,0,.4))', maxWidth: 'none' }}
                />
              );
            })}
            {/* the dark night with the torch beam (the farm lights come on at the end) */}
            <div
              className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-1000"
              style={{
                opacity: done ? 0 : 1,
                background: `radial-gradient(circle ${beamPx * 1.25}px at ${t.x}% ${t.y}%, rgba(255,240,190,0.05) 0, rgba(255,240,190,0.05) ${beamPx * 0.8}px, rgba(6,8,30,0.97) ${beamPx * 1.25}px)`,
              }}
            />
            {!done && (
              <div className="pointer-events-none absolute z-30 -translate-x-1/2 transition-[left,top] duration-100" style={{ left: `${t.x}%`, top: `calc(${t.y}% + ${beamPx * 0.9}px)`, fontSize: Math.max(26, box.w / 22) }}>🔦</div>
            )}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-3 z-40 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-indigo-700 shadow-xl sm:text-xl">
        {target ? `🔊 ${whoLine(target)}` : '💡 The lights are on! You found every animal!'}
        <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-sm text-indigo-600">{Math.min(round + 1, total)}/{total}</span>
      </div>
      {target && (
        <button onClick={() => cueSpeak(whoLine(target), scene.who)} className="absolute right-3 top-3 z-40 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-indigo-700 shadow-lg active:scale-95">🔊 Again</button>
      )}

      {/* the animals found so far */}
      <div className="absolute bottom-[3%] left-3 z-40 flex items-center gap-2 rounded-3xl bg-white/90 px-3 py-2 shadow-xl">
        <span className="text-2xl">🌙</span>
        {found.map((i) => scene.animals[i] && (
          <img key={i} src={scene.animals[i].img} alt={scene.animals[i].word} className="h-9 w-9 animate-[lep1-pop_0.4s_ease-out] object-contain" />
        ))}
        {Array.from({ length: Math.max(0, total - found.length) }, (_, k) => (
          <span key={`e${k}`} className="block h-8 w-8 rounded-full border-[3px] border-dashed border-indigo-300 bg-indigo-50" />
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
export function nightSoundsLines(scene: Extract<Scene, { kind: 'night-sounds' }>) {
  const lines: [string, string][] = [];
  for (const a of scene.animals) lines.push([scene.who, whoLine(a)], [scene.who, foundAnimalLine(a)], [scene.who, wrongAnimalLine(a)]);
  return lines;
}

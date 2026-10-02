import { useEffect, useMemo, useRef, useState } from 'react';
import { LiveStageFill, useStageDrop } from '../../LiveStageFrame';
import type { CallRole } from '@/components/classroom/stage/callStreams';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Gather ---------- */

export function GatherScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'gather' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const IMG_W = 1920, IMG_H = 1152;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  // Synced: which friends have spoken + who is on the daisy stage. The
  // stage shows a video-call tile dragged onto it (see LiveStageFrame) —
  // no camera of its own.
  const [state, setState] = useSyncedState(sync, { spoken: [] as CharKey[], onStage: null as CallRole | null, gemDone: false });
  const spoken = useMemo(() => new Set(state.spoken ?? []), [state.spoken]);
  const onStage = state.onStage ?? null;
  const camActive = onStage !== null;
  const canControl = !sync?.isSynced || sync.isAuthority;
  const placeOnStage = (role: CallRole | null) => {
    if (role && !state.gemDone) { sfx.gem(); onWin(true); }
    setState((st) => ({ ...st, onStage: role, gemDone: st.gemDone || !!role }));
  };
  const { over, dropProps } = useStageDrop(placeOnStage);

  // Measure our own bounded container (not the browser window) so hotspot
  // math stays correct when this scene is embedded in the smaller classroom
  // stage rather than filling the whole viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const project = (x: number, y: number, r: number) => {
    const w = viewport.w || IMG_W, h = viewport.h || IMG_H;
    return { left: (x / IMG_W) * w, top: (y / IMG_H) * h, size: (r / IMG_W) * w * 2 };
  };
  const stagePos = project(scene.stage.x, scene.stage.y, scene.stage.r);

  const tapHotspot = async (h: (typeof scene.hotspots)[number]) => { sfx.match(); setState((st) => ({ ...st, spoken: st.spoken.includes(h.who) ? st.spoken : [...st.spoken, h.who] })); await safeSpeak(h.line, h.who); };

  const allSpoken = spoken.size >= scene.hotspots.length;

  return (
    <div ref={containerRef} className="absolute inset-0">
      {scene.hotspots.map((h) => {
        const p = project(h.x, h.y, h.r);
        return <button key={h.who} onClick={() => tapHotspot(h)} aria-label={`Tap ${CAST[h.who].name}`} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent" style={{ left: p.left, top: p.top, width: p.size, height: p.size }}><span className="sr-only">{CAST[h.who].name}</span></button>;
      })}
      {scene.hotspots.map((h) => {
        if (!spoken.has(h.who)) return null;
        const p = project(h.x, h.y, h.r);
        const c = CAST[h.who];
        return (
          <div key={`bubble-${h.who}`} className="absolute z-30 -translate-x-1/2 animate-[lep1-slide-up_0.35s_ease-out]" style={{ left: p.left, top: p.top - p.size / 2 - 20 }}>
            <div className="relative max-w-[16rem] rounded-2xl bg-white/95 px-4 py-2 text-center text-sm font-black shadow-2xl ring-4 backdrop-blur sm:text-base" style={{ color: c.color, borderColor: c.color }}>{h.line}</div>
          </div>
        );
      })}
      <div {...dropProps} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: stagePos.left, top: stagePos.top, width: stagePos.size, height: stagePos.size, boxShadow: camActive ? '0 0 0 6px rgba(59,130,246,0.7), 0 0 60px rgba(59,130,246,0.55)' : over ? '0 0 0 8px rgba(254,106,47,0.85), 0 0 60px rgba(254,106,47,0.55)' : '0 0 0 4px rgba(255,255,255,0.7), 0 0 30px rgba(255,255,255,0.4)', transition: 'box-shadow 0.2s' }}>
        <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #FE6A2F, #FEBE4C)' }}>
          <LiveStageFill onStage={onStage} onPlace={placeOnStage} over={over} canControl={canControl} />
          {onStage === 'student' && <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-black uppercase text-white shadow-lg">You ⭐</span>}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="pointer-events-auto max-w-lg rounded-3xl bg-white/90 px-5 py-3 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur">
          {camActive ? '🌟 Your turn! Say: Hello, my name is ______.' : allSpoken ? 'Great! Now drag the student’s video into the daisy circle for their turn.' : scene.teacher}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <button onClick={onNext} disabled={!camActive && !allSpoken} className="rounded-full bg-orange-500 px-8 py-3 text-lg font-black text-white shadow-2xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-orange-600">
          {camActive ? 'I did it! ➜' : 'Next ➜'}
        </button>
      </div>
    </div>
  );
}

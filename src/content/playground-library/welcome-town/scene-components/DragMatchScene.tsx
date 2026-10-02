import { useEffect, useMemo, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { voiceOf, CharacterPointer } from './shared';

/* ---------- Drag match (listen, then drag the word onto its object) ---------- */

export function DragMatchScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'drag-match' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const total = scene.items.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  // xPct/yPct: the drag ghost's position expressed as a percentage of the
  // scene container, NOT raw viewport pixels — see the ghost's render below
  // for why. x/y (raw client coords) are kept for the drop hit-test only,
  // which already measures everything in that same raw-viewport space and
  // is unaffected by this.
  const [drag, setDrag] = useState<{ idx: number; x: number; y: number; startX: number; startY: number; xPct: number; yPct: number } | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const gemDone = useRef(false);
  // The tray's left-to-right order is scattered rather than matching each
  // item's index (which lines up with left-to-right position in the scene
  // itself) — otherwise tray order alone gives away which tile goes where.
  const trayOrder = useMemo(() => {
    const order = scene.items.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = (i * 7 + 3) % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [scene.id]);

  const hear = (idx: number) => {
    sfx.click();
    const item = scene.items[idx];
    void safeSpeak(item.label, item.who ? voiceOf(item.who) : 'teacher');
  };

  // Container-relative percentage for a raw viewport point — used for the
  // ghost chip's position (see its render below).
  const toPct = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { xPct: 50, yPct: 50 };
    return { xPct: ((clientX - rect.left) / rect.width) * 100, yPct: ((clientY - rect.top) / rect.height) * 100 };
  };

  const startDrag = (e: React.PointerEvent, idx: number) => {
    if (placed.has(idx)) return;
    e.preventDefault();
    hear(idx);
    setDrag({ idx, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, ...toPct(e.clientX, e.clientY) });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, ...toPct(e.clientX, e.clientY) } : d));
    const up = (e: PointerEvent) => {
      const movedDist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
      // A short tap (barely moved) is just "hear the word again," not a
      // drop attempt — only a real drag gesture gets scored as a match try.
      if (movedDist < 24) { setDrag(null); return; }
      const container = containerRef.current;
      const item = scene.items[drag.idx];
      if (container) {
        const rect = container.getBoundingClientRect();
        const targetX = rect.left + (parseFloat(item.targetLeft) / 100) * rect.width;
        const targetY = rect.top + (parseFloat(item.targetTop) / 100) * rect.height;
        // Vocab-matching drops (no showBlanks landing-zone box drawn) land
        // anywhere on a full illustration, not a pinpoint — 0.14 was tight
        // enough that dropping on a visibly-correct object still missed
        // and registered as wrong. Widened so a typical character/object's
        // rendered footprint is a comfortable hit area; sentence-builder
        // (showBlanks) drops stay tighter since those have a small drawn
        // blank to aim at, not a full illustration.
        //
        // When an item declares its own targetWidth/targetHeight (a wide,
        // short object like a table isn't well covered by ANY single
        // circle radius — too small and it misses the edges, too big and
        // it starts overlapping a neighboring item), test against that
        // rectangle instead, padded a little so a drop just outside the
        // drawn edge still counts.
        let hit: boolean;
        if (item.targetWidth && item.targetHeight) {
          // targetLeft/targetTop is where the OBJECT STANDS, not its
          // visual center — every *_SPOT convention in this app anchors
          // near an object's base/floor-contact point (same reason a
          // character's own left/top works for CharacterPointer). A box
          // centered on that anchor undershoots the top of anything tall
          // (a chair's backrest sits mostly ABOVE its anchor, almost none
          // below it) — confirmed live, a drop right on the chair's
          // backrest still missed. So the box extends the object's full
          // height UPWARD from the anchor, with only a small pad below
          // it, rather than splitting the height evenly both ways.
          const w = (parseFloat(item.targetWidth) / 100) * rect.width;
          const h = (parseFloat(item.targetHeight) / 100) * rect.height;
          const pad = Math.min(rect.width, rect.height) * 0.08;
          const withinX = Math.abs(e.clientX - targetX) <= w / 2 + pad;
          const withinY = e.clientY <= targetY + pad && e.clientY >= targetY - h - pad;
          hit = withinX && withinY;
        } else {
          const dist = Math.hypot(e.clientX - targetX, e.clientY - targetY);
          const tolerance = Math.min(rect.width, rect.height) * (scene.showBlanks ? 0.14 : 0.26);
          hit = dist <= tolerance;
        }
        if (hit) {
          sfx.match();
          setPlaced((prev) => {
            const next = new Set(prev).add(drag.idx);
            if (next.size === total && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
            return next;
          });
        } else {
          sfx.wrong(); onLose();
          setWrongIdx(drag.idx);
          window.setTimeout(() => setWrongIdx(null), 500);
        }
      }
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [drag, scene.items, total, onWin, onLose]);

  const done = placed.size === total;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-cover bg-center touch-none" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      {scene.pointTo?.map((p, i) => (
        <CharacterPointer key={`point-${i}`} left={p.left} top={p.top} dir={p.dir} color={CAST[p.who].color} />
      ))}
      {scene.showBlanks && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-center text-xs font-black uppercase tracking-widest text-white shadow-lg">
          📝 Sentence Builder
        </div>
      )}
      <div className={`pointer-events-none absolute left-1/2 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base ${scene.showBlanks ? 'top-14' : 'top-4'}`}>
        {scene.teacher} <span className="ml-1 opacity-60">({placed.size}/{total})</span>
      </div>
      {/* For vocab-matching drag-match scenes, no landing-zone hint is
          rendered — the student has to remember where the object is from
          the vocab-spot scene that just taught it, not read it off a
          dashed ring drawn in advance. For sentence-builder scenes
          (showBlanks), that same "recall the hidden spot" logic doesn't
          apply — there's no environmental anchor to remember, the target
          is just "the Nth word of the sentence" — so the blank itself must
          be visible from the start or the activity isn't legible as
          sentence-building at all. */}
      {scene.showBlanks && scene.items.map((item, i) => !placed.has(i) && (
        <div
          key={`blank-${i}`}
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[5px] border-dashed border-white/85 bg-black/10 px-6 py-4"
          style={{ left: item.targetLeft, top: item.targetTop, minWidth: `${Math.max(3, item.label.length) * 1.7}ch` }}
        >
          <span className="invisible text-lg font-black uppercase tracking-wide sm:text-xl">{item.label}</span>
        </div>
      ))}
      {/* Unified to the same larger size as the tray buttons (below) —
          previously kept smaller here on the theory that a passive
          confirmation chip didn't need to match the interactive tray
          button's size, but reported live as still too small to read
          once placed. */}
      {scene.items.map((item, i) => placed.has(i) && (
        <div
          key={`placed-${i}`}
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-2xl px-7 py-5 shadow-xl ring-4 ring-white"
          style={{ left: item.targetLeft, top: item.targetTop, background: item.color, animation: 'lep1-pop 0.4s ease-out' }}
        >
          <span className="text-xl font-black uppercase tracking-wide text-white sm:text-2xl">{item.label}</span>
        </div>
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex flex-wrap justify-center gap-3 px-4">
        {trayOrder.map((i) => {
          const item = scene.items[i];
          if (placed.has(i)) return null;
          // The tray button for the item currently being dragged stays
          // MOUNTED (just visually hidden) rather than unmounting — see the
          // sticker-drag scene's identical fix just above this component
          // for why: the live-classroom DOM-tap mirror caches ONE element
          // reference from the initial pointerdown and dispatches every
          // later pointermove/pointerup straight at it. If that node
          // unmounts (or, worse, is fully removed from the tree like this
          // used to do), the cached reference goes fully detached —
          // dispatching events on a detached node never bubbles to the
          // `window` listeners this scene's own drag-move/up handlers are
          // registered on, so the OTHER participant's view of the drag
          // freezes after the very first frame. Reported live as "the
          // grab and drag / matching game doesn't work." The moving ghost
          // chip below is still what's visually shown while dragging;
          // this button just needs to keep existing at the same DOM path.
          const isBeingDragged = drag?.idx === i;
          return (
            <button
              key={`tray-${i}`}
              onPointerDown={(e) => startDrag(e, i)}
              aria-label={`Drag the word ${item.label}`}
              className={`touch-none shadow-2xl ring-4 ring-white transition active:scale-95 rounded-2xl px-7 py-5 ${wrongIdx === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''} ${isBeingDragged ? 'pointer-events-none opacity-0' : 'pointer-events-auto'}`}
              style={{ background: item.color, animation: isBeingDragged || wrongIdx === i ? undefined : 'lep1-hop 1.6s ease-in-out infinite' }}
            >
              {/* Unified to one large size regardless of showBlanks — the
                  smaller vocab-matching variant (text-sm, px-4 py-3) read
                  as a tiny target on a real classroom-scaled frame,
                  reported live as "the grab and drop buttons are too
                  small on the screen." */}
              <span className="text-xl font-black uppercase tracking-wide text-white sm:text-2xl">{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* `absolute` + percentage left/top, NOT `fixed` + raw client pixels:
          this scene renders inside MainStage's scaled letterbox frame (see
          useFrameScale), and a `transform: scale(...)` on ANY ancestor makes
          that ancestor the containing block for every `position: fixed`
          descendant per the CSS spec — so a `fixed` ghost here was actually
          positioned relative to the SCALED frame, not the real viewport,
          while its left/top came from raw (unscaled) pointer coordinates.
          The two disagreed by roughly the frame's own scale factor, so the
          ghost visibly drifted away from the real cursor/finger the moment
          the frame was scaled at all — reported live as "the arrow is far
          away from the word I'm dragging." Percentages of the scene
          container (which IS inside the same scaled space as the pointer)
          track correctly regardless of scale. */}
      {drag && (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-xl px-4 py-3 shadow-2xl ring-4 ring-white"
          style={{ left: `${drag.xPct}%`, top: `${drag.yPct}%`, background: scene.items[drag.idx].color }}
        >
          <span className="text-sm font-black uppercase tracking-wide text-white">{scene.items[drag.idx].label}</span>
        </div>
      )}
      {done && (
        <div className="absolute inset-x-0 bottom-8 z-40 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Great job! ⭐ Next</button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import * as sfx from '../../unit1/sfx';

/* ---------- Drag sticker (free teacher-placed characters, no scoring) ----------
 * Matches a real reference the user pointed to directly: a competitor's
 * house-cutaway slide where the teacher freely drags a character between
 * rooms while quizzing the student out loud — "Drag Sally into them as you
 * go." There is no quiz phase, no correct zone, nothing scored in-app; the
 * teacher IS the check. Each sticker in `scene.stickers` is independently,
 * repeatedly draggable — pick it up, drop it, pick it up again, as many
 * times as the conversation needs.
 *
 * Deliberately mirrors DragMatchScene's own plain-`useState` drag physics
 * (no `sync` prop, no ActivitySync/useSyncedState) — see
 * PlayWelcomeTownLesson.tsx's REAL_SYNC_KINDS comment: continuous pointer
 * gestures sync live via the generic DOM pointer-event tap/drag mirror
 * (sendSceneTap's pointerdown/pointermove/pointerup replay), not the
 * structured broadcast channel, so this scene must stay OFF
 * REAL_SYNC_KINDS and un-wrapped in `sync` for that mirror to apply at all. */

export function DragStickerScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'drag-sticker' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { xPct: number; yPct: number }>>({});
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ xPct: number; yPct: number } | null>(null);
  const gemDone = useRef(false);

  // Container-relative percentage — see DragMatchScene's identical helper/
  // comment for why this must be a percentage of the scene container, not
  // raw viewport pixels, inside the classroom's scaled letterbox frame.
  const toPct = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { xPct: 50, yPct: 50 };
    return { xPct: ((clientX - rect.left) / rect.width) * 100, yPct: ((clientY - rect.top) / rect.height) * 100 };
  };

  const startDrag = (e: React.PointerEvent, key: string) => {
    e.preventDefault();
    sfx.click();
    setDragKey(key);
    setDragPos(toPct(e.clientX, e.clientY));
  };

  useEffect(() => {
    if (!dragKey) return;
    const move = (e: PointerEvent) => setDragPos(toPct(e.clientX, e.clientY));
    const up = (e: PointerEvent) => {
      const p = toPct(e.clientX, e.clientY);
      setPositions((prev) => ({ ...prev, [dragKey]: p }));
      if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
      setDragKey(null);
      setDragPos(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragKey]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-cover bg-center touch-none" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        {scene.teacher}
      </div>

      {/* A real paper sticker, not an emoji chip: the source art already has
          its own white die-cut border baked in (see magic-castle/scenes.ts's
          sticker-wim.png/sticker-catcat.png generation) and a transparent
          background around it, so this just adds the physical
          "placed on the page" cues — a soft shadow and a slight tilt. */}
      {scene.stickers.map((s) => {
        const key = s.who;
        const isDragging = dragKey === key;
        const pos = isDragging && dragPos ? dragPos : (positions[key] ?? { xPct: parseFloat(s.startLeft), yPct: parseFloat(s.startTop) });
        // ALWAYS the same <button> element across the whole gesture — never
        // swap to a bare <img> while dragging. In a live classroom, the
        // teacher's raw pointerdown/move/up gets mirrored onto the other
        // side's matching DOM node by caching ONE element reference from
        // the initial pointerdown and dispatching every later move/up
        // event straight at it (see PlayWelcomeTownLesson's scene_tap
        // subscriber). Swapping the tag mid-drag makes React destroy that
        // node, so the cached reference on the OTHER participant's screen
        // goes stale after the very first frame — their view of the
        // sticker never follows the drag. Reported live as "the grab and
        // drag ('Where is Wim?') doesn't work."
        return (
          <button
            key={key}
            onPointerDown={(e) => startDrag(e, key)}
            aria-label={`Drag ${CAST[s.who].name}`}
            className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 touch-none transition-transform ${isDragging ? 'z-50 pointer-events-none' : 'pointer-events-auto active:scale-95'}`}
            style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%` }}
          >
            <img
              src={s.stickerImg} alt={CAST[s.who].name}
              className={`object-contain sm:h-36 sm:w-36 ${isDragging ? 'h-28 w-28 drop-shadow-[0_16px_24px_rgba(0,0,0,0.5)]' : 'h-28 w-28 drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]'}`}
              style={{ transform: isDragging ? 'scale(1.08) rotate(-3deg)' : 'rotate(4deg)' }}
            />
          </button>
        );
      })}
      {/* No in-scene "Next" button here on purpose — this is an open-ended,
       *  teacher-paced free-drag scene with no completion state to gate on,
       *  so the button was ALWAYS visible from the moment the scene loaded.
       *  Both the solo player's own bottom nav bar and the classroom's
       *  external Back/Next controls already advance the lesson; this
       *  second, always-on button just sat permanently over the lower
       *  rooms of the castle, blocking exactly the content the teacher and
       *  student are dragging characters into. Reported live as "Great
       *  job! Next is covering the view." */}
    </div>
  );
}

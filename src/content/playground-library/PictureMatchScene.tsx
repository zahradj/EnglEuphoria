import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type ActivitySync, useSyncedState } from './sceneActivitySync';
import { cueSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * `picture-match` — reusable "match the word to the picture" activity,
 * shared by every scene library (Welcome Town / Magic Castle / Jungle
 * Adventure and Pre-A1 Unit 1). Same shape as a classic ESL matching slide:
 * picture cards with an empty dashed slot in two side columns, the word
 * tiles in the middle; the student drags each word into the slot under its
 * picture (or taps a word, then a slot — easier on tablets). A right word
 * snaps in and is spoken; a wrong one shakes and returns to the middle.
 *
 * Any vocabulary set / background can reuse it — see the authoring contract
 * in .claude/skills/activity-pattern-library. Set `studentOnly: true` for a
 * self-check ("auto-evaluation") slide: the student works alone, the
 * teacher's copy is a live view that can't drag (handled by the lesson
 * players' studentOnly support).
 */
export interface PictureMatchItem {
  /** The word/phrase that belongs under this picture. Must be unique. */
  word: string;
  img?: string;
  emoji?: string;
}

export interface PictureMatchSceneData {
  id: string;
  kind: 'picture-match';
  teacher: string;
  /** 2-8 pictures; split into a left and a right column. */
  items: PictureMatchItem[];
  /** Optional instruction banner, e.g. "Match the words to the pictures". */
  prompt?: string;
  /** Background image; defaults to a soft sky-to-pink gradient. */
  bg?: string;
  /** Student does it alone; teacher watches (see header). */
  studentOnly?: boolean;
}

interface MatchState {
  /** Item indices already matched correctly. */
  placed: number[];
  /** Word tile (index into the shuffled order) picked up / tapped. */
  holding: number | null;
  /** Slot that just got a wrong word, for the shake + red flash. */
  wrongSlot: number | null;
}

const INITIAL: MatchState = { placed: [], holding: null, wrongSlot: null };

/** Same shuffle on every screen for a given scene (seeded by its id), and
 *  never the identity order so words don't simply line up with pictures. */
function seededOrder(n: number, seedText: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (n > 1 && order.every((v, i) => v === i)) order.push(order.shift()!);
  return order;
}

export function PictureMatchScene({ scene, onNext, onWin, onLose, sync }: {
  scene: PictureMatchSceneData;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  onLose: () => void;
  sync?: ActivitySync;
}) {
  const items = scene.items.slice(0, 8);
  const n = items.length;
  const order = useMemo(() => seededOrder(n, scene.id), [n, scene.id]);
  const [state, setState] = useSyncedState<MatchState>(sync, INITIAL);
  const { placed, holding, wrongSlot } = state;
  const isMirror = !!sync?.isSynced && !sync.isAuthority;
  const gemDone = useRef(false);
  const wrongTimer = useRef<number | null>(null);
  // Local-only drag ghost (position isn't broadcast; `holding` is).
  const [drag, setDrag] = useState<{ tile: number; x: number; y: number } | null>(null);

  useEffect(() => {
    setState(INITIAL);
    gemDone.current = false;
    return () => { if (wrongTimer.current) window.clearTimeout(wrongTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const done = placed.length >= n;
  useEffect(() => {
    if (done && !gemDone.current && !isMirror) {
      gemDone.current = true;
      sfx.gem();
      onWin(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  /** Try word tile `tile` (shuffled index) in slot `slot` (item index). */
  const attempt = (tile: number, slot: number) => {
    if (isMirror || placed.includes(slot)) return;
    const itemIdx = order[tile];
    if (itemIdx === slot) {
      sfx.match();
      cueSpeak(items[slot].word, 'teacher');
      setState((s) => ({ ...s, placed: [...s.placed, slot], holding: null, wrongSlot: null }));
    } else {
      sfx.wrong();
      onLose();
      setState((s) => ({ ...s, holding: null, wrongSlot: slot }));
      if (wrongTimer.current) window.clearTimeout(wrongTimer.current);
      wrongTimer.current = window.setTimeout(() => setState((s) => ({ ...s, wrongSlot: null })), 700);
    }
  };

  const tileMatched = (tile: number) => placed.includes(order[tile]);

  // Latest attempt() for the window listeners below (they outlive renders).
  const attemptRef = useRef(attempt);
  attemptRef.current = attempt;

  const onTilePointerDown = (tile: number) => (e: React.PointerEvent) => {
    if (isMirror || tileMatched(tile)) return;
    e.preventDefault();
    sfx.pop();
    setState((s) => ({ ...s, holding: tile }));
    const startX = e.clientX;
    const startY = e.clientY;
    setDrag({ tile, x: startX, y: startY });
    // Listeners attached right here (not in an effect) so even a very quick
    // tap's pointerup is never missed.
    const move = (ev: PointerEvent) => setDrag((d) => (d ? { ...d, x: ev.clientX, y: ev.clientY } : d));
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      setDrag(null);
      const moved = Math.hypot(ev.clientX - startX, ev.clientY - startY) > 12;
      if (!moved) return; // a tap: stays selected for tap-then-slot
      const slotEl = document
        .elementsFromPoint(ev.clientX, ev.clientY)
        .find((el) => (el as HTMLElement).dataset?.matchSlot != null) as HTMLElement | undefined;
      if (slotEl) attemptRef.current(tile, Number(slotEl.dataset.matchSlot));
      else setState((st) => ({ ...st, holding: null })); // dropped nowhere
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const onSlotTap = (slot: number) => {
    if (placed.includes(slot)) {
      cueSpeak(items[slot].word, 'teacher'); // hear a finished one again
      return;
    }
    if (holding != null) attempt(holding, slot);
  };

  const half = Math.ceil(n / 2);
  const columns = [items.slice(0, half).map((_, i) => i), items.slice(half).map((_, i) => i + half)];

  const renderCard = (slot: number) => {
    const item = items[slot];
    const isPlaced = placed.includes(slot);
    const isWrong = wrongSlot === slot;
    return (
      <div key={slot} className="flex min-h-0 flex-1 flex-col items-center rounded-[28px] bg-white/95 p-[4%] shadow-lg">
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          {item.img ? (
            <img src={item.img} alt="" className="max-h-full max-w-full object-contain" draggable={false} />
          ) : (
            <span className="text-[clamp(2rem,7vh,4.5rem)] leading-none">{item.emoji}</span>
          )}
        </div>
        <button
          type="button"
          data-match-slot={slot}
          onClick={() => onSlotTap(slot)}
          aria-label={isPlaced ? item.word : `Empty slot ${slot + 1}`}
          className={`mt-[4%] flex h-[30%] min-h-[2.5rem] w-[80%] items-center justify-center rounded-xl text-[clamp(1rem,3.4vh,2rem)] font-semibold transition ${
            isPlaced
              ? 'border-2 border-emerald-400 bg-emerald-50 text-emerald-800'
              : isWrong
                ? 'animate-[lep1-shake_0.4s_ease-in-out] border-2 border-dashed border-red-400 bg-red-50'
                : holding != null
                  ? 'border-2 border-dashed border-orange-400 bg-orange-50/60'
                  : 'border-2 border-dashed border-orange-200'
          }`}
        >
          {isPlaced ? item.word : ''}
        </button>
      </div>
    );
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-cover bg-center select-none"
      style={scene.bg ? { backgroundImage: `url(${scene.bg})` } : { background: 'linear-gradient(160deg, #d7f1fb 0%, #e8def7 55%, #f6c9c4 100%)' }}
    >
      {scene.prompt && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4">
          <div className="rounded-full bg-white/95 px-5 py-2 text-center text-base font-bold text-orange-800 shadow-lg sm:text-lg">{scene.prompt}</div>
        </div>
      )}

      <div className={`absolute inset-x-[3%] bottom-[4%] grid grid-cols-[1fr_minmax(0,0.85fr)_1fr] gap-[4%] ${scene.prompt ? 'top-[12%]' : 'top-[4%]'}`}>
        <div className="flex min-h-0 flex-col gap-[4%]">{columns[0].map(renderCard)}</div>

        <div className="flex min-h-0 flex-col items-center justify-center gap-[3%]">
          {order.map((itemIdx, tile) => {
            const matched = placed.includes(itemIdx);
            const isHeld = holding === tile;
            const isDragging = drag?.tile === tile;
            return (
              <button
                key={tile}
                type="button"
                onPointerDown={onTilePointerDown(tile)}
                disabled={isMirror || matched}
                aria-label={items[itemIdx].word}
                style={{ touchAction: 'none' }}
                className={`w-full max-w-[16rem] rounded-2xl border-2 px-3 py-[3%] text-center text-[clamp(1.1rem,4vh,2.4rem)] font-semibold shadow-md transition ${
                  matched
                    ? 'invisible'
                    : isHeld
                      ? 'scale-105 border-orange-400 bg-orange-100 text-slate-900 ring-4 ring-orange-300/60'
                      : 'border-[#E9C9A5] bg-[#FDEBD3] text-slate-900 hover:-translate-y-0.5'
                } ${isDragging ? 'opacity-40' : ''} ${isMirror ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
              >
                {items[itemIdx].word}
              </button>
            );
          })}
          {done && (
            <button type="button" onClick={onNext} className="mt-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-xl font-black text-white shadow-2xl active:scale-95">
              Next ⭐
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-[4%]">{columns[1].map(renderCard)}</div>
      </div>

      {/* Drag ghost following the finger/mouse (local only). Portalled to
          <body>: the classroom scales the scene with a CSS transform, which
          would otherwise offset a fixed-position element. */}
      {drag && createPortal(
        <div
          className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-orange-400 bg-[#FDEBD3] px-5 py-2 text-2xl font-semibold text-slate-900 shadow-2xl"
          style={{ left: drag.x, top: drag.y }}
        >
          {items[order[drag.tile]].word}
        </div>,
        document.body,
      )}
    </div>
  );
}

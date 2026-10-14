import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type ActivitySync, useSyncedState } from './sceneActivitySync';
import { cueSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * `picture-match` — reusable "match the word to the picture" activity,
 * shared by every scene library (Welcome Town / Magic Castle / Jungle
 * Adventure and Pre-A1 Unit 1). Same shape as a classic ESL matching slide:
 * big picture cards (each shaped to its own picture, so nothing is cropped)
 * with an empty slot under each, and the word pills along the bottom; the
 * student drags each word into the slot under its picture (or taps a word,
 * then a slot — easier on tablets). A right word
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
  /** Show only part of `img` (percent of the image: left x, top y, width w,
   *  height h) — lets a card reuse one room / object out of existing lesson
   *  art (e.g. the kitchen half of a two-room cutaway) instead of needing
   *  new images. */
  crop?: { x: number; y: number; w: number; h: number };
  /** Width ÷ height of `img`, used with `crop`. Defaults to 16:9 (the
   *  Playground scene backgrounds). */
  imgAspect?: number;
}

/** Part of an image, scaled to FILL its box (like object-fit: cover): an
 *  SVG whose viewBox is the crop window (image drawn at 100·aspect × 100
 *  units). The rounded tile around it does the clipping. */
export function CroppedImage({ src, crop, aspect }: { src: string; crop: { x: number; y: number; w: number; h: number }; aspect: number }) {
  return (
    <svg
      viewBox={`${crop.x * aspect} ${crop.y} ${crop.w * aspect} ${crop.h}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <image href={src} x={0} y={0} width={100 * aspect} height={100} preserveAspectRatio="none" />
    </svg>
  );
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
  /** The design (owner 2026-10-14: "change the design of the games to prevent repetition — make it a rule"):
   *  same drag/tap mechanic, different board. Rotated by unit + lesson so neighbouring lessons differ —
   *  readMatchVariety.test.ts (deploy gate). */
  look?: PictureMatchLook;
}

/** `cards` white cards · `frames` framed pictures on a wall, brass name plates, wooden word tags ·
 *  `polaroids` taped photos, sticky-note words · `chalk` chalkboard tiles, chalk words. */
export type PictureMatchLook = 'cards' | 'frames' | 'polaroids' | 'chalk';
export const PICTURE_MATCH_LOOKS: readonly PictureMatchLook[] = ['cards', 'frames', 'polaroids', 'chalk'];

const LOOK_STYLE: Record<PictureMatchLook, {
  card: string; slotEmpty: string; slotPlaced: string; pill: string; bg: string; prompt: string;
}> = {
  cards: {
    card: 'rounded-[20px] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.18)]',
    slotEmpty: 'border-[3px] border-dashed border-slate-300 bg-slate-50', slotPlaced: 'bg-emerald-500 text-white',
    pill: 'rounded-full bg-white text-slate-800', bg: 'linear-gradient(160deg, #eaf6fd 0%, #f1ecfb 55%, #fdeee9 100%)', prompt: 'text-slate-500',
  },
  frames: {
    card: 'rounded-[6px] border-[clamp(6px,2.4cqh,14px)] border-[#7a4a22] bg-[#fff8ea] shadow-[inset_0_0_0_3px_#e9b949,0_14px_28px_rgba(60,30,10,0.35)]',
    slotEmpty: 'border-[3px] border-dashed border-amber-500 bg-amber-50', slotPlaced: 'bg-gradient-to-b from-yellow-200 to-amber-400 text-amber-950',
    pill: 'rounded-md bg-gradient-to-b from-[#b7773d] to-[#8a5427] text-amber-50', bg: 'repeating-linear-gradient(90deg, #f6e7d0 0 38px, #f1dcc0 38px 76px)', prompt: 'text-amber-900/70',
  },
  polaroids: {
    card: 'rounded-[4px] bg-white p-[3%] pb-0 shadow-[0_14px_30px_rgba(15,23,42,0.28)]',
    slotEmpty: 'border-[3px] border-dashed border-sky-300 bg-white', slotPlaced: 'bg-white text-sky-700 underline decoration-wavy decoration-sky-300',
    pill: 'rounded-[3px] bg-yellow-200 text-slate-800', bg: 'linear-gradient(160deg, #e7f0ff 0%, #efe9fb 55%, #fff1e6 100%)', prompt: 'text-slate-500',
  },
  chalk: {
    card: 'rounded-[14px] border-[clamp(5px,2cqh,12px)] border-[#9a6a3a] bg-[#24543f] shadow-[0_12px_26px_rgba(0,0,0,0.35)]',
    slotEmpty: 'border-[3px] border-dashed border-white/55 bg-white/5', slotPlaced: 'bg-white/90 text-emerald-900',
    pill: 'rounded-full bg-[#2f3b45] text-white ring-2 ring-white/60', bg: 'linear-gradient(160deg, #e9efe6 0%, #ece6f4 55%, #f6ece2 100%)', prompt: 'text-slate-600',
  },
};

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
export function seededOrder(n: number, seedText: string): number[] {
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
  const look = LOOK_STYLE[scene.look ?? 'cards'] ?? LOOK_STYLE.cards;
  const isPolaroid = scene.look === 'polaroids';
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

  // Picture-first design: pictures in a 2-row grid, each card shaped to its
  // own picture (so the whole room/object is visible — no cropping, no
  // letterbox bars) and as large as its cell allows; the drop slot is a
  // label strip UNDER the picture so it never hides anything; the word pills
  // run along the bottom.
  const cols = n <= 3 ? n : Math.ceil(n / 2);
  const PICTURE_SHARE = 0.78; // picture height ÷ card height (rest = slot)

  const renderCard = (slot: number) => {
    const item = items[slot];
    const isPlaced = placed.includes(slot);
    const isWrong = wrongSlot === slot;
    const isTarget = holding != null && !isPlaced;
    const pictureAspect = item.crop ? ((item.crop.w * (item.imgAspect ?? 16 / 9)) / item.crop.h) : 4 / 3;
    const cardAspect = pictureAspect * PICTURE_SHARE;
    return (
      <div key={slot} className="flex min-h-0 min-w-0 items-center justify-center" style={{ containerType: 'size' }}>
        <div
          className={`relative flex flex-col overflow-hidden ${look.card} ring-4 transition ${
            isPlaced ? 'ring-emerald-400' : isWrong ? 'ring-red-400' : isTarget ? 'ring-orange-300' : scene.look && scene.look !== 'cards' ? 'ring-transparent' : 'ring-white'
          }`}
          style={{ width: `min(100cqw, calc(100cqh * ${cardAspect}))`, aspectRatio: cardAspect, transform: isPolaroid ? `rotate(${slot % 2 ? 2.2 : -2.2}deg)` : undefined }}
        >
          {isPolaroid && <span aria-hidden className="absolute left-1/2 top-0 z-10 h-[7%] w-[34%] -translate-x-1/2 bg-yellow-100/80 shadow-sm" />}
          <div className="relative w-full" style={{ height: `${PICTURE_SHARE * 100}%` }}>
            {item.img && item.crop ? (
              <CroppedImage src={item.img} crop={item.crop} aspect={item.imgAspect ?? 16 / 9} />
            ) : item.img ? (
              <img src={item.img} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-[clamp(2.5rem,12cqh,6rem)] leading-none">{item.emoji}</span>
            )}
          </div>
          <button
            type="button"
            data-match-slot={slot}
            onClick={() => onSlotTap(slot)}
            aria-label={isPlaced ? item.word : `Empty slot ${slot + 1}`}
            className={`m-[2.5%] flex flex-1 items-center justify-center rounded-xl text-[clamp(0.95rem,7cqh,1.8rem)] font-bold transition ${
              isPlaced
                ? look.slotPlaced
                : isWrong
                  ? 'animate-[lep1-shake_0.4s_ease-in-out] border-[3px] border-dashed border-red-400 bg-red-50'
                  : isTarget
                    ? 'animate-pulse border-[3px] border-dashed border-orange-400 bg-orange-50'
                    : look.slotEmpty
            }`}
          >
            {isPlaced ? `✓ ${item.word}` : ''}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-cover bg-center select-none"
      style={scene.bg ? { backgroundImage: `url(${scene.bg})` } : { background: look.bg }}
    >
      {/* Pictures */}
      <div
        className="absolute inset-x-[3%] top-[3%] bottom-[21%] grid gap-x-[2.5%] gap-y-[3.5%]"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${n <= 3 ? 1 : 2}, minmax(0, 1fr))` }}
      >
        {items.map((_, slot) => renderCard(slot))}
      </div>

      {/* Instruction, then the word pills (wrap to a second row if needed;
          a matched word leaves the row), then Next when done. */}
      <div className="absolute inset-x-[3%] bottom-[2.5%] flex h-[17%] flex-col items-center justify-center gap-[6%]">
        {/* On a student-only (self-check) page the teacher's copy is a live
            view: say so right where they'd try to drag, instead of pills
            that look draggable but don't respond. */}
        {!done && isMirror && scene.studentOnly ? (
          <div className="shrink-0 rounded-full bg-sky-100 px-4 py-1 text-[clamp(0.85rem,calc(2.3*var(--svh,1vh)),1.15rem)] font-bold text-sky-800">
            👀 Your student is matching on their own — each answer appears here live
          </div>
        ) : scene.prompt && !done ? (
          <div className={`shrink-0 text-[clamp(0.85rem,calc(2.4*var(--svh,1vh)),1.25rem)] font-extrabold uppercase tracking-wide ${look.prompt}`}>{scene.prompt}</div>
        ) : null}
        <div className="flex max-w-full flex-wrap items-center justify-center gap-x-[calc(1.2*var(--svw,1vw))] gap-y-2">
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
              className={`${look.pill.split(' ')[0]} px-[1.2em] py-[0.5em] text-center text-[clamp(0.9rem,calc(2.9*var(--svh,1vh)),1.6rem)] font-bold leading-none whitespace-nowrap shadow-[0_4px_14px_rgba(15,23,42,0.14)] transition ${
                matched
                  ? 'hidden'
                  : isHeld
                    ? 'scale-105 bg-orange-500 text-white ring-4 ring-orange-200'
                    : isMirror
                      ? 'bg-white/70 text-slate-500 shadow-none ring-1 ring-slate-200'
                      : `${look.pill.split(' ').slice(1).join(' ')} hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.18)]`
              } ${isDragging ? 'opacity-30' : ''} ${isMirror ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
            >
              {items[itemIdx].word}
            </button>
          );
        })}
        {done && (
          <button type="button" onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-xl font-black text-white shadow-2xl active:scale-95">
            Well done! Next ⭐
          </button>
        )}
        </div>
      </div>

      {/* Drag ghost following the finger/mouse (local only). Portalled to
          <body>: the classroom scales the scene with a CSS transform, which
          would otherwise offset a fixed-position element. */}
      {drag && createPortal(
        <div
          className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 px-6 py-2.5 text-2xl font-bold text-white shadow-2xl ring-4 ring-orange-200"
          style={{ left: drag.x, top: drag.y }}
        >
          {items[order[drag.tile]].word}
        </div>,
        document.body,
      )}
    </div>
  );
}

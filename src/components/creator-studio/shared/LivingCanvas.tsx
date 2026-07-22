import { useEffect, useMemo, useRef, useState } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Volume2 } from 'lucide-react';
import {
  CanvasElement,
  CanvasGameSlide,
  LivingCanvasSlide,
  Hub,
  HUB_FRAME,
  HUB_SNAP_TOLERANCE,
} from './canvasSchema';

type Slide = CanvasGameSlide | LivingCanvasSlide;

interface Props {
  slide: Slide;
  hub: Hub;
  /** Fired the first time every interactive element is solved/revealed. */
  onAllSolved?: () => void;
  /** When true, every element is freely draggable for the creator to reposition,
   *  and onMoveElement is called as elements settle. */
  authoring?: boolean;
  onMoveElement?: (id: string, x: number, y: number) => void;
}

function speak(text?: string) {
  if (!text) return;
  if (/^https?:\/\//i.test(text)) {
    try { new Audio(text).play().catch(() => {}); } catch {}
    return;
  }
  void playElevenLabs(text);
}

export function LivingCanvas({ slide, hub, onAllSolved, authoring, onMoveElement }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [resetKey, setResetKey] = useState(0);
  const allSolvedRef = useRef(false);

  const interactiveIds = useMemo(
    () => slide.elements.filter(e => e.interaction === 'draggable' || e.interaction === 'reveal').map(e => e.id),
    [slide.elements],
  );

  // Track container size for converting percent ↔ px during drag
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Autoplay instruction audio
  useEffect(() => {
    if (slide.instruction_audio) speak(slide.instruction_audio);
    else if (slide.instruction) speak(slide.instruction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Fire onAllSolved once
  useEffect(() => {
    if (allSolvedRef.current || interactiveIds.length === 0) return;
    const done = interactiveIds.every(id => solved.has(id) || revealed.has(id));
    if (done) {
      allSolvedRef.current = true;
      if (hub === 'playground') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else if (hub === 'academy') {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      }
      onAllSolved?.();
    }
  }, [solved, revealed, interactiveIds, onAllSolved, hub]);

  const handleReset = () => {
    setSolved(new Set());
    setRevealed(new Set());
    allSolvedRef.current = false;
    setResetKey(k => k + 1);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3">
      {(slide.title || slide.instruction) && (
        <div className="text-center">
          {slide.title && <h2 className="text-2xl font-extrabold text-slate-800">{slide.title}</h2>}
          {slide.instruction && (
            <button
              onClick={() => speak(slide.instruction_audio || slide.instruction)}
              className="inline-flex items-center gap-2 text-slate-700 mt-1 hover:text-slate-900"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">{slide.instruction}</span>
            </button>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative w-full aspect-[16/9] rounded-3xl border-4 overflow-hidden shadow-lg ${HUB_FRAME[hub]}`}
        style={
          slide.background_image
            ? { backgroundImage: `url(${slide.background_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        {slide.elements
          .slice()
          .sort((a, b) => (a.z_index ?? 1) - (b.z_index ?? 1))
          .map((el) => (
            <CanvasItem
              key={`${el.id}-${resetKey}`}
              el={el}
              hub={hub}
              container={size}
              isSolved={solved.has(el.id)}
              isRevealed={revealed.has(el.id)}
              authoring={!!authoring}
              onSolve={() => setSolved(s => new Set(s).add(el.id))}
              onReveal={() => setRevealed(s => new Set(s).add(el.id))}
              onMove={onMoveElement}
            />
          ))}

        {/* Reset */}
        <button
          onClick={handleReset}
          className="absolute bottom-3 right-3 z-50 bg-white/90 hover:bg-white text-slate-700 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md flex items-center gap-1.5"
          title="Reset game"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}

function CanvasItem({
  el, hub, container, isSolved, isRevealed, authoring, onSolve, onReveal, onMove,
}: {
  el: CanvasElement;
  hub: Hub;
  container: { w: number; h: number };
  isSolved: boolean;
  isRevealed: boolean;
  authoring: boolean;
  onSolve: () => void;
  onReveal: () => void;
  onMove?: (id: string, x: number, y: number) => void;
}) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapped, setSnapped] = useState(false);
  const [wrong, setWrong] = useState(0);

  const tolerance = el.snap_tolerance ?? HUB_SNAP_TOLERANCE[hub];

  const widthPct = el.width;
  const isReveal = el.interaction === 'reveal';
  const isDraggable = el.interaction === 'draggable' || authoring;

  // When authoring or after snap, position is based on its base coords
  const left = `${el.x}%`;
  const top = `${el.y}%`;

  const onDragEnd = (_: any, info: PanInfo) => {
    if (!container.w || !container.h) return;
    const dxPct = (info.offset.x / container.w) * 100;
    const dyPct = (info.offset.y / container.h) * 100;
    const newX = el.x + dxPct;
    const newY = el.y + dyPct;

    if (authoring) {
      onMove?.(el.id, Math.max(0, Math.min(100, newX)), Math.max(0, Math.min(100, newY)));
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    if (el.target_x != null && el.target_y != null) {
      const dist = Math.hypot(newX - el.target_x, newY - el.target_y);
      if (dist <= tolerance) {
        // Snap: animate to delta needed to land exactly on target
        const snapDx = ((el.target_x - el.x) / 100) * container.w;
        const snapDy = ((el.target_y - el.y) / 100) * container.h;
        setDragOffset({ x: snapDx, y: snapDy });
        setSnapped(true);
        speak(el.success_sfx || 'Correct!');
        onSolve();
        return;
      }
      setWrong(w => w + 1);
      speak(el.fail_sfx || 'Try again');
    }
    // Spring back
    setDragOffset({ x: 0, y: 0 });
  };

  const handleClick = () => {
    if (!isReveal || isRevealed) return;
    speak(el.reveal_sfx);
    onReveal();
  };

  // Reveal exit animations
  const exitProps =
    el.reveal_anim === 'lift' ? { y: -container.h * 0.6, opacity: 0 } :
    el.reveal_anim === 'shrink' ? { scale: 0, opacity: 0 } :
    el.reveal_anim === 'fly' ? { x: container.w * 0.6, opacity: 0, rotate: 30 } :
    { opacity: 0 };

  if (isReveal && isRevealed) {
    return (
      <AnimatePresence>
        {/* element animates out, leaving lower-z elements visible */}
      </AnimatePresence>
    );
  }

  const initial =
    el.animation_in === 'pop' ? { scale: 0, opacity: 0 } :
    el.animation_in === 'slide-up' ? { y: 30, opacity: 0 } :
    el.animation_in === 'none' ? { opacity: 1 } :
    { opacity: 0 };

  const child =
    el.type === 'text' ? (
      <div
        className="w-full h-full flex items-center justify-center text-center font-bold rounded-xl px-2"
        style={{ background: el.color || 'rgba(255,255,255,0.85)', color: '#1f2937' }}
      >
        {el.text}
      </div>
    ) : el.type === 'shape' ? (
      <div
        className="w-full h-full rounded-xl border-2 border-dashed"
        style={{ background: el.color || 'rgba(255,255,255,0.4)', borderColor: el.color || '#94a3b8' }}
      >
        {el.text && (
          <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-slate-700">
            {el.text}
          </div>
        )}
      </div>
    ) : el.src ? (
      <img
        src={el.src}
        alt=""
        draggable={false}
        className="w-full h-full object-contain pointer-events-none select-none"
      />
    ) : (
      <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-500">
        {el.id}
      </div>
    );

  return (
    <AnimatePresence>
      <motion.div
        key={el.id}
        initial={initial}
        animate={{
          opacity: 1, scale: 1, y: 0, x: 0,
          rotate: el.rotation ?? 0,
        }}
        exit={exitProps as any}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        drag={isDraggable && !snapped}
        dragMomentum={false}
        dragSnapToOrigin={false}
        onDragEnd={onDragEnd}
        onClick={handleClick}
        whileHover={isDraggable || isReveal ? { scale: 1.04 } : undefined}
        whileTap={isDraggable || isReveal ? { scale: 0.96 } : undefined}
        style={{
          position: 'absolute',
          left,
          top,
          width: `${widthPct}%`,
          height: el.height ? `${el.height}%` : 'auto',
          aspectRatio: el.height ? undefined : '1 / 1',
          translateX: dragOffset.x,
          translateY: dragOffset.y,
          zIndex: el.z_index ?? 1,
          cursor: isDraggable ? (snapped ? 'default' : 'grab') : isReveal ? 'pointer' : 'default',
          // shake when wrong
          filter: wrong > 0 && !snapped ? 'drop-shadow(0 0 4px rgba(239,68,68,0.7))' : undefined,
        }}
      >
        {child}
        {authoring && (
          <div className="absolute -top-5 left-0 text-[10px] font-mono bg-slate-900 text-white rounded px-1 py-0.5 whitespace-nowrap">
            {el.id} · {Math.round(el.x)},{Math.round(el.y)}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

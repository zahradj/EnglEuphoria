// VisualSentenceBuilder — Pre-A1 horizontal substitution table.
// Sequential locking: each slot unlocks only after the previous one is filled.
// Pure visual; word audio per drop, full-sentence audio on completion.
import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { usePlaygroundAudio } from '@/hooks/usePlaygroundAudio';
import { usePlaygroundAnimation } from '@/hooks/usePlaygroundAnimation';

export interface SentenceSlot {
  id: string;
  /** Icon id that correctly fills this slot. */
  acceptId: string;
  /** Spoken word for this slot (played on correct drop). */
  word: string;
}

export interface SentenceIcon {
  id: string;
  image: string;
  alt?: string;
}

export interface VisualSentenceBuilderProps {
  slots: SentenceSlot[];            // 2 or 3 slots
  icons: SentenceIcon[];            // draggable bank
  /** Full sentence text spoken when all slots filled. */
  fullSentence: string;
  onComplete?: () => void;
  className?: string;
}

const SLOT_W = 120;
const SLOT_H = 120;

export function VisualSentenceBuilder({
  slots,
  icons,
  fullSentence,
  onComplete,
  className = '',
}: VisualSentenceBuilderProps) {
  const [filled, setFilled] = useState<Record<string, string>>({}); // slotId → iconId
  const { playVoice } = usePlaygroundAudio();
  const { controls, celebrate, shake } = usePlaygroundAnimation();
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const nextSlotIndex = useMemo(() => {
    for (let i = 0; i < slots.length; i++) if (!filled[slots[i].id]) return i;
    return slots.length;
  }, [filled, slots]);

  const complete = nextSlotIndex >= slots.length;

  const tryDrop = async (iconId: string, clientX: number, clientY: number) => {
    if (complete) return false;
    const target = slots[nextSlotIndex];
    const el = slotRefs.current[target.id];
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const hit =
      clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    if (!hit) return false;
    if (iconId !== target.acceptId) {
      await shake();
      return false;
    }
    setFilled((p) => {
      const next = { ...p, [target.id]: iconId };
      // play word audio for this drop
      void playVoice(target.word);
      // when complete → pulse container + full sentence
      if (Object.keys(next).length === slots.length) {
        setTimeout(async () => {
          await celebrate();
          void playVoice(fullSentence);
          onComplete?.();
        }, 350);
      }
      return next;
    });
    return true;
  };

  const placedIconIds = new Set(Object.values(filled));

  return (
    <motion.div
      animate={controls}
      className={`flex flex-col items-center gap-8 select-none ${className}`}
    >
      {/* Slot row with arrows */}
      <div className="flex items-center gap-4">
        {slots.map((slot, i) => {
          const locked = i > nextSlotIndex;
          const isActive = i === nextSlotIndex;
          const iconId = filled[slot.id];
          const icon = icons.find((x) => x.id === iconId);
          return (
            <div key={slot.id} className="flex items-center gap-4">
              <motion.div
                ref={(el) => {
                  slotRefs.current[slot.id] = el;
                }}
                animate={
                  isActive
                    ? { scale: [1, 1.05, 1], boxShadow: '0 0 0 4px rgba(254,106,47,0.45)' }
                    : { scale: 1, boxShadow: '0 0 0 0 rgba(0,0,0,0)' }
                }
                transition={{ duration: 1.2, repeat: isActive ? Infinity : 0 }}
                style={{ width: SLOT_W, height: SLOT_H, opacity: locked ? 0.5 : 1 }}
                className="rounded-3xl bg-white/90 ring-4 ring-orange-200 flex items-center justify-center overflow-hidden"
              >
                <AnimatePresence>
                  {icon && (
                    <motion.img
                      key={icon.id}
                      src={icon.image}
                      alt=""
                      initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      className="w-full h-full object-contain p-3"
                      draggable={false}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
              {i < slots.length - 1 && (
                <svg width="48" height="24" viewBox="0 0 48 24" aria-hidden>
                  <path
                    d="M2 12 H40 M32 4 L42 12 L32 20"
                    stroke="#FE6A2F"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Draggable icon bank */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {icons.map((ic) => (
          <DraggableIcon
            key={ic.id}
            icon={ic}
            disabled={placedIconIds.has(ic.id) || complete}
            onDrop={(x, y) => tryDrop(ic.id, x, y)}
          />
        ))}
      </div>
    </motion.div>
  );
}

function DraggableIcon({
  icon,
  disabled,
  onDrop,
}: {
  icon: SentenceIcon;
  disabled: boolean;
  onDrop: (clientX: number, clientY: number) => Promise<boolean>;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });

  const bind = useDrag(
    ({ xy: [px, py], movement: [mx, my], down, event }) => {
      if (disabled) return;
      lastPointer.current = { x: px, y: py };
      if (down) {
        setPos({ x: mx, y: my });
        return;
      }
      // released
      void onDrop(lastPointer.current.x, lastPointer.current.y).then((ok) => {
        if (!ok) setPos({ x: 0, y: 0 });
        else setPos({ x: 0, y: 0 });
      });
      event?.preventDefault?.();
    },
    { pointer: { touch: true } },
  );

  return (
    <div
      {...bind()}
      style={{ touchAction: 'none', cursor: disabled ? 'default' : 'grab' }}
    >
      <motion.div
        animate={{ x: pos.x, y: pos.y, opacity: disabled ? 0.35 : 1, scale: disabled ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="w-20 h-20 rounded-2xl bg-white shadow-lg ring-2 ring-orange-200 flex items-center justify-center"
      >
        <img
          src={icon.image}
          alt={icon.alt ?? ''}
          draggable={false}
          className="w-full h-full object-contain p-2 pointer-events-none"
        />
      </motion.div>
    </div>
  );
}

export default VisualSentenceBuilder;

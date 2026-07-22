// DragAndDropScene — Pre-A1 free 2D drag with snap/bounce-back validation.
// Each draggable carries a target dropZone id. Correct drop snaps the item
// to the zone center with a spring; incorrect drop bounces back to its
// initial position. No instruction text — pulsing zones cue affordance.
import { useMemo, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { usePlaygroundAnimation } from '@/hooks/usePlaygroundAnimation';

export interface DropZone {
  id: string;
  x: number;        // center x in scene px
  y: number;        // center y in scene px
  width: number;
  height: number;
  image?: string;
  label?: string;   // a11y only
  color?: string;
}

export interface DraggableItem {
  id: string;
  image: string;
  initial_x: number;
  initial_y: number;
  width?: number;
  height?: number;
  targetZoneId: string;
  label?: string;   // a11y only
}

export interface DragAndDropSceneProps {
  draggableItems: DraggableItem[];
  dropZones: DropZone[];
  sceneWidth?: number;
  sceneHeight?: number;
  onItemPlaced?: (itemId: string, zoneId: string) => void;
  onComplete?: () => void;
  className?: string;
}

interface DraggableInstanceProps {
  item: DraggableItem;
  zones: DropZone[];
  scene: { w: number; h: number };
  placed: boolean;
  onPlace: (zoneId: string) => void;
  onWrong: () => void;
}

function DraggableInstance({ item, zones, scene, placed, onPlace, onWrong }: DraggableInstanceProps) {
  const controls = useAnimationControls();
  const posRef = useRef({ x: item.initial_x, y: item.initial_y });
  const w = item.width ?? 88;
  const h = item.height ?? 88;

  const bind = useDrag(
    ({ down, movement: [mx, my], first, last, event }) => {
      if (placed) return;
      event?.preventDefault?.();
      const baseX = posRef.current.x;
      const baseY = posRef.current.y;
      if (first) {
        controls.start({ scale: 1.15, transition: { duration: 0.12 } });
      }
      const nx = Math.max(0, Math.min(scene.w - w, baseX + mx));
      const ny = Math.max(0, Math.min(scene.h - h, baseY + my));
      if (down) {
        controls.set({ x: nx, y: ny });
        return;
      }
      // released
      const cx = nx + w / 2;
      const cy = ny + h / 2;
      const targetZone = zones.find((z) => z.id === item.targetZoneId);
      const within =
        targetZone &&
        cx >= targetZone.x - targetZone.width / 2 &&
        cx <= targetZone.x + targetZone.width / 2 &&
        cy >= targetZone.y - targetZone.height / 2 &&
        cy <= targetZone.y + targetZone.height / 2;
      if (within && targetZone) {
        const snapX = targetZone.x - w / 2;
        const snapY = targetZone.y - h / 2;
        posRef.current = { x: snapX, y: snapY };
        controls.start({
          x: snapX,
          y: snapY,
          scale: [1.15, 1.3, 1],
          transition: { type: 'spring', stiffness: 320, damping: 18 },
        });
        onPlace(targetZone.id);
      } else {
        controls.start({
          x: item.initial_x,
          y: item.initial_y,
          scale: 1,
          transition: { type: 'spring', stiffness: 260, damping: 14 },
        });
        if (last) onWrong();
      }
    },
    { pointer: { touch: true }, filterTaps: true },
  );

  return (
    <div
      {...bind()}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: w,
        height: h,
        touchAction: 'none',
        cursor: placed ? 'default' : 'grab',
      }}
      aria-label={item.label}
      role="img"
    >
      <motion.div
        animate={controls}
        initial={{ x: item.initial_x, y: item.initial_y, scale: 1 }}
        style={{ width: w, height: h }}
        className="select-none"
      >
        <img
          src={item.image}
          alt=""
          draggable={false}
          className="w-full h-full object-contain drop-shadow-lg pointer-events-none"
        />
      </motion.div>
    </div>
  );
}

export function DragAndDropScene({
  draggableItems,
  dropZones,
  sceneWidth = 480,
  sceneHeight = 320,
  onItemPlaced,
  onComplete,
  className = '',
}: DragAndDropSceneProps) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const { shake } = usePlaygroundAnimation();
  const scene = useMemo(() => ({ w: sceneWidth, h: sceneHeight }), [sceneWidth, sceneHeight]);

  const handlePlace = (itemId: string, zoneId: string) => {
    setPlaced((prev) => {
      const next = { ...prev, [itemId]: zoneId };
      onItemPlaced?.(itemId, zoneId);
      if (Object.keys(next).length === draggableItems.length) {
        onComplete?.();
      }
      return next;
    });
  };

  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-br from-sky-100 via-amber-50 to-orange-100 shadow-xl ring-4 ring-white/70 overflow-hidden ${className}`}
      style={{ width: sceneWidth, height: sceneHeight }}
    >
      {/* Drop zones */}
      {dropZones.map((z) => {
        const filledBy = Object.entries(placed).find(([, zoneId]) => zoneId === z.id);
        const isFilled = Boolean(filledBy);
        return (
          <motion.div
            key={z.id}
            aria-label={z.label}
            style={{
              position: 'absolute',
              left: z.x - z.width / 2,
              top: z.y - z.height / 2,
              width: z.width,
              height: z.height,
              backgroundColor: z.color ?? 'rgba(255,255,255,0.55)',
            }}
            className="rounded-2xl border-4 border-dashed border-orange-300/80 flex items-center justify-center overflow-hidden"
            animate={
              isFilled
                ? { scale: [1, 1.08, 1], borderColor: '#06D6A0' }
                : { scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }
            }
            transition={{
              duration: isFilled ? 0.5 : 1.6,
              repeat: isFilled ? 0 : Infinity,
              ease: 'easeInOut',
            }}
          >
            {z.image && (
              <img
                src={z.image}
                alt=""
                draggable={false}
                className="w-full h-full object-contain p-2 opacity-70 pointer-events-none"
              />
            )}
          </motion.div>
        );
      })}

      {/* Draggables */}
      {draggableItems.map((item) => (
        <DraggableInstance
          key={item.id}
          item={item}
          zones={dropZones}
          scene={scene}
          placed={Boolean(placed[item.id])}
          onPlace={(zoneId) => handlePlace(item.id, zoneId)}
          onWrong={() => shake()}
        />
      ))}
    </div>
  );
}

export default DragAndDropScene;

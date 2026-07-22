// MirroredStage — center column. Shows the student's active activity in
// read-only mode and reflects their live cursor and component state.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface MirroredDropZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string;
  color?: string;
}

export interface MirroredDraggableItem {
  id: string;
  image: string;
  initial_x: number;
  initial_y: number;
  width?: number;
  height?: number;
  targetZoneId: string;
}

export interface MirroredActivity {
  id: string;
  type: 'drag_and_drop' | 'click_to_reveal' | 'sentence_builder' | string;
  payload?: {
    items?: MirroredDraggableItem[];
    zones?: MirroredDropZone[];
    sceneWidth?: number;
    sceneHeight?: number;
    [k: string]: unknown;
  };
  title?: string;
}

export interface MirroredStageProps {
  activity: MirroredActivity | null;
  /** Map of itemId → zoneId (the student's current placements). */
  studentState?: Record<string, string> | null;
  cursor?: { x: number; y: number } | null;
}

export function MirroredStage({ activity, studentState, cursor }: MirroredStageProps) {
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => { setPulseKey((k) => k + 1); }, [activity?.id]);

  const items = activity?.payload?.items ?? [];
  const zones = activity?.payload?.zones ?? [];
  const sceneW = activity?.payload?.sceneWidth ?? 720;
  const sceneH = activity?.payload?.sceneHeight ?? 420;

  return (
    <div className="relative h-full w-full rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-white ring-1 ring-border overflow-hidden shadow-inner">
      <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-black/70 text-white text-[11px] font-semibold px-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        MIRRORING STUDENT · READ-ONLY
      </div>
      {activity?.title && (
        <div className="absolute right-4 top-4 z-20 rounded-full bg-white/90 text-foreground text-xs font-medium px-3 py-1 ring-1 ring-border">
          {activity.title}
        </div>
      )}

      <motion.div
        key={pulseKey}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="h-full w-full flex items-center justify-center p-8 pointer-events-none select-none"
      >
        {activity?.type === 'drag_and_drop' && items.length > 0 ? (
          <div
            className="relative bg-white/70 rounded-2xl ring-1 ring-border"
            style={{ width: sceneW, height: sceneH }}
          >
            {zones.map((z) => (
              <div
                key={z.id}
                className="absolute rounded-2xl ring-2 ring-dashed ring-orange-300/70"
                style={{
                  left: z.x - z.width / 2,
                  top: z.y - z.height / 2,
                  width: z.width,
                  height: z.height,
                  background: z.color ?? 'rgba(254,106,47,0.06)',
                }}
              >
                {z.image && (
                  <img src={z.image} alt="" className="w-full h-full object-contain p-2" draggable={false} />
                )}
              </div>
            ))}
            {items.map((it) => {
              const placedZoneId = studentState?.[it.id];
              const zone = placedZoneId ? zones.find((z) => z.id === placedZoneId) : null;
              const x = zone ? zone.x : it.initial_x;
              const y = zone ? zone.y : it.initial_y;
              const w = it.width ?? 88;
              const h = it.height ?? 88;
              return (
                <motion.img
                  key={it.id}
                  src={it.image}
                  alt=""
                  draggable={false}
                  className="absolute rounded-2xl bg-white shadow ring-2 ring-orange-200"
                  style={{ width: w, height: h }}
                  animate={{ left: x - w / 2, top: y - h / 2 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            {activity ? `Mirrored view for "${activity.type}" not yet implemented.` : 'Waiting for student activity…'}
          </div>
        )}
      </motion.div>

      {cursor && (
        <motion.div
          className="absolute z-30 pointer-events-none"
          animate={{ left: cursor.x, top: cursor.y }}
          transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          style={{ translateX: '-50%', translateY: '-50%' }}
        >
          <div className="h-4 w-4 rounded-full bg-primary ring-4 ring-primary/30 shadow-lg" />
        </motion.div>
      )}
    </div>
  );
}

export default MirroredStage;

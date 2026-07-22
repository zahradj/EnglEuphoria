import React, { useEffect, useRef, useState } from 'react';
import { MousePointer2 } from 'lucide-react';
import type { useCoPlaySync } from '@/hooks/useCoPlaySync';

interface CursorPayload {
  /** Normalized 0..1 within the arena rect. */
  x: number;
  y: number;
}

interface RemoteCursor {
  id: string;
  name?: string;
  role: 'teacher' | 'student';
  x: number;
  y: number;
  lastSeen: number;
}

interface SharedCursorsProps {
  containerRef: React.RefObject<HTMLElement>;
  sync: ReturnType<typeof useCoPlaySync>;
  staleMs?: number;
  throttleMs?: number;
}

const ROLE_COLOR: Record<'teacher' | 'student', string> = {
  teacher: 'hsl(243 75% 59%)', // indigo accent
  student: 'hsl(20 99% 59%)',  // playground orange
};

export const SharedCursors: React.FC<SharedCursorsProps> = ({
  containerRef,
  sync,
  staleMs = 4000,
  throttleMs = 40,
}) => {
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({});
  const lastSentRef = useRef(0);

  // Receive remote cursor updates
  useEffect(() => {
    return sync.on<CursorPayload>('cursor_move', (p) => {
      setCursors((prev) => ({
        ...prev,
        [p.senderId]: {
          id: p.senderId,
          name: p.senderName,
          role: p.senderRole,
          x: p.data.x,
          y: p.data.y,
          lastSeen: Date.now(),
        },
      }));
    });
  }, [sync]);

  // Sweep stale cursors
  useEffect(() => {
    const t = setInterval(() => {
      setCursors((prev) => {
        const now = Date.now();
        const next: Record<string, RemoteCursor> = {};
        for (const [id, c] of Object.entries(prev)) {
          if (now - c.lastSeen < staleMs) next[id] = c;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [staleMs]);

  // Track local mouse and broadcast (throttled)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSentRef.current < throttleMs) return;
      lastSentRef.current = now;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      sync.broadcast<CursorPayload>('cursor_move', { x, y });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [containerRef, sync, throttleMs]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Object.values(cursors).map((c) => {
        const color = ROLE_COLOR[c.role];
        return (
          <div
            key={c.id}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              left: `${c.x * 100}%`,
              top: `${c.y * 100}%`,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <MousePointer2
              className="w-5 h-5 drop-shadow-md"
              style={{ color, fill: color }}
            />
            <span
              className="ml-3 -mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow"
              style={{ background: color }}
            >
              {c.name || (c.role === 'teacher' ? 'Teacher' : 'Student')}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SharedCursors;

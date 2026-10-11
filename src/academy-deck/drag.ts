import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as RPE } from 'react';

/** Drag a chip with mouse, finger or pen; a tap (no movement) calls onTap instead. Drop targets carry data-drop="<id>". */
export function useDragChip(onDrop: (chip: string, target: string) => void, onTap?: (chip: string) => void) {
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean }>({ x: 0, y: 0, moved: false });
  const bind = (id: string, disabled = false) => ({
    onPointerDown: (e: RPE<HTMLElement>) => {
      if (disabled) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      start.current = { x: e.clientX, y: e.clientY, moved: false };
      setDrag({ id, x: 0, y: 0 });
    },
    onPointerMove: (e: RPE<HTMLElement>) => {
      if (drag?.id !== id) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) start.current.moved = true;
      setDrag({ id, x: dx, y: dy });
    },
    onPointerUp: (e: RPE<HTMLElement>) => {
      if (drag?.id !== id) return;
      setDrag(null);
      if (!start.current.moved) return; // a tap: the browser's click event follows (so keyboard and screen readers work the same way)
      const el = document.elementsFromPoint(e.clientX, e.clientY).map((n) => n.closest('[data-drop]')).find(Boolean);
      const target = el?.getAttribute('data-drop');
      if (target != null) onDrop(id, target);
    },
    onPointerCancel: () => setDrag(null),
    onClick: () => {
      if (start.current.moved) {
        start.current.moved = false;
        return;
      }
      if (!disabled) onTap?.(id);
    },
    style: (drag?.id === id ? { transform: `translate(${drag.x}px, ${drag.y}px) scale(1.08)`, zIndex: 30, touchAction: 'none' } : { touchAction: 'none' }) as CSSProperties,
    'data-dragging': drag?.id === id,
  });
  return { bind, dragging: drag?.id ?? null };
}

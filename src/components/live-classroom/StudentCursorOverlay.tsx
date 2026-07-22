import { useEffect, useState } from 'react';
import { MousePointer2 } from 'lucide-react';
import type { CursorPayload } from '@/hooks/useLiveClassroom';

interface Props {
  registerCursorHandler: (h: (p: CursorPayload) => void) => () => void;
}

/**
 * Renders a small pointer at the last known student cursor position
 * (coordinates are relative to the lesson canvas, 0..1).
 */
export function StudentCursorOverlay({ registerCursorHandler }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const unsub = registerCursorHandler(p => setPos({ x: p.x, y: p.y }));
    return unsub;
  }, [registerCursorHandler]);

  if (!pos) return null;

  return (
    <div
      className="pointer-events-none absolute z-20 transition-[top,left] duration-75 ease-out"
      style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
      aria-hidden
    >
      <MousePointer2 className="h-4 w-4 -translate-x-1 -translate-y-1 text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
      <span className="absolute left-3 top-3 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
        Student
      </span>
    </div>
  );
}

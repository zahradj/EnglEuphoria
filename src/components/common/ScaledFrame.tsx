import { useRef, type ReactNode } from 'react';
import { useFrameScale } from '@/hooks/useFrameScale';

interface ScaledFrameProps {
  children: ReactNode;
  /** Classes for the outer frame — must establish the box whose size the content should fit. Defaults to filling its parent. */
  className?: string;
}

/**
 * Wraps content built for a full-screen viewport (Playground scene lessons,
 * which size themselves with vh/vw units) so it fits whatever smaller box
 * this is placed in instead — see useFrameScale for why that's necessary.
 */
export function ScaledFrame({ children, className }: ScaledFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scale = useFrameScale(frameRef);
  return (
    <div ref={frameRef} className={className ?? 'relative h-full w-full overflow-hidden'}>
      <div
        style={{
          position: 'absolute', top: 0, left: 0,
          width: `${100 / scale}%`, height: `${100 / scale}%`,
          transform: `scale(${scale})`, transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}

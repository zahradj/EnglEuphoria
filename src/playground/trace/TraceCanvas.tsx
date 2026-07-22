// Minimal SVG trace canvas used by trace_letter / trace_word activities.
// Renders a stroke-path the learner traces; pointer samples are scored
// via svgTrace.scoreTrace() and surfaced through onComplete.
//
// Pure presentation/interaction. No business logic, no AI calls.

import { useCallback, useEffect, useRef, useState } from 'react';

import { scoreTrace, type TracePoint, type TraceScoreResult } from './svgTrace';

export interface TraceCanvasProps {
  /** SVG path "d" attribute defining the stroke the learner traces. */
  pathD: string;
  /** Viewport for the SVG (defaults to 300×120). */
  width?: number;
  height?: number;
  /** When true, the stroke renders in rainbow gradient as the learner draws. */
  rainbow?: boolean;
  /** Called once when the learner lifts the pointer. */
  onComplete?: (result: TraceScoreResult) => void;
  /** Optional aria-label for screen-reader users. */
  ariaLabel?: string;
}

export function TraceCanvas({
  pathD,
  width = 300,
  height = 120,
  rainbow = true,
  onComplete,
  ariaLabel = 'Trace the letter',
}: TraceCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [samples, setSamples] = useState<TracePoint[]>([]);
  const [drawing, setDrawing] = useState(false);

  const toSvgPoint = useCallback((evt: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y, t: Date.now() } as TracePoint;
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const p = toSvgPoint(e);
    if (!p) return;
    setDrawing(true);
    setSamples([p]);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing) return;
    const p = toSvgPoint(e);
    if (!p) return;
    setSamples((prev) => [...prev, p]);
  };

  const onPointerUp = () => {
    if (!drawing) return;
    setDrawing(false);
    if (pathRef.current) {
      const result = scoreTrace(pathRef.current, samples);
      onComplete?.(result);
    }
  };

  // Reset samples when path changes.
  useEffect(() => { setSamples([]); }, [pathD]);

  const drawnD = samples.length
    ? 'M ' + samples.map((s) => `${s.x.toFixed(1)} ${s.y.toFixed(1)}`).join(' L ')
    : '';

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="touch-none select-none rounded-2xl bg-card"
    >
      <defs>
        <linearGradient id="pg-trace-rainbow" x1="0" x2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="50%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--secondary))" />
        </linearGradient>
      </defs>
      {/* Reference stroke the learner traces */}
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeOpacity={0.35}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Learner stroke */}
      {drawnD && (
        <path
          d={drawnD}
          fill="none"
          stroke={rainbow ? 'url(#pg-trace-rainbow)' : 'hsl(var(--primary))'}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// MotorTraceCanvas — Pre-A1 letter tracing.
// Touch/pen drag draws a stroke along an SVG guide path. Straying beyond
// `tolerancePx` from the path resets the stroke with a red error flash;
// completing the path fills the SVG with a solid celebratory color.
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundAnimation } from '@/hooks/usePlaygroundAnimation';

export interface MotorTraceCanvasProps {
  svgPath: string;
  width?: number;
  height?: number;
  tolerancePx?: number;        // max allowed deviation from guide path
  strokeColor?: string;        // learner stroke color
  successColor?: string;       // fill color when complete
  coverageRequired?: number;   // 0..1 share of guide path that must be visited
  onSuccess?: () => void;
  onFail?: () => void;
  ariaLabel?: string;
  className?: string;
}

interface Pt { x: number; y: number }

export function MotorTraceCanvas({
  svgPath,
  width = 320,
  height = 220,
  tolerancePx = 22,
  strokeColor = '#FE6A2F',
  successColor = '#06D6A0',
  coverageRequired = 0.7,
  onSuccess,
  onFail,
  ariaLabel = 'Trace the letter',
  className = '',
}: MotorTraceCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const guideRef = useRef<SVGPathElement | null>(null);
  const samplesRef = useRef<Pt[]>([]);
  const visitedRef = useRef<boolean[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [pts, setPts] = useState<Pt[]>([]);
  const [completed, setCompleted] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);
  const { shake, celebrate } = usePlaygroundAnimation();

  // Build sampled guide points whenever path changes.
  useEffect(() => {
    setCompleted(false);
    setPts([]);
    samplesRef.current = [];
    if (!guideRef.current) return;
    const len = guideRef.current.getTotalLength();
    const N = 120;
    const arr: Pt[] = [];
    for (let i = 0; i < N; i++) {
      const p = guideRef.current.getPointAtLength((i / (N - 1)) * len);
      arr.push({ x: p.x, y: p.y });
    }
    samplesRef.current = arr;
    visitedRef.current = new Array(N).fill(false);
  }, [svgPath]);

  const toLocal = useCallback((evt: React.PointerEvent): Pt | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const l = pt.matrixTransform(ctm.inverse());
    return { x: l.x, y: l.y };
  }, []);

  const nearestDist = (p: Pt): { d: number; idx: number } => {
    let best = Infinity;
    let idx = -1;
    const ref = samplesRef.current;
    for (let i = 0; i < ref.length; i++) {
      const dx = p.x - ref[i].x;
      const dy = p.y - ref[i].y;
      const d = Math.hypot(dx, dy);
      if (d < best) { best = d; idx = i; }
    }
    return { d: best, idx };
  };

  const resetStroke = (fail: boolean) => {
    setPts([]);
    visitedRef.current = visitedRef.current.map(() => false);
    if (fail) {
      setErrorFlash(true);
      shake();
      window.setTimeout(() => setErrorFlash(false), 400);
      onFail?.();
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (completed) return;
    const p = toLocal(e);
    if (!p) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrawing(true);
    setPts([p]);
    const { idx } = nearestDist(p);
    if (idx >= 0) visitedRef.current[idx] = true;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing || completed) return;
    const p = toLocal(e);
    if (!p) return;
    const { d, idx } = nearestDist(p);
    if (d > tolerancePx) {
      setDrawing(false);
      resetStroke(true);
      return;
    }
    if (idx >= 0) visitedRef.current[idx] = true;
    setPts((prev) => [...prev, p]);
  };

  const finish = () => {
    if (!drawing) return;
    setDrawing(false);
    const visited = visitedRef.current.filter(Boolean).length;
    const cov = visited / Math.max(1, visitedRef.current.length);
    if (cov >= coverageRequired) {
      setCompleted(true);
      celebrate('You did it!');
      onSuccess?.();
    } else {
      resetStroke(false);
    }
  };

  const strokeD = pts.length
    ? 'M ' + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')
    : '';

  return (
    <motion.div
      className={`relative rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 p-3 shadow-lg ring-4 ring-white/70 ${className}`}
      animate={errorFlash ? { backgroundColor: ['#FECACA', '#FFEDD5'] } : {}}
      transition={{ duration: 0.4 }}
      style={{ width: width + 24, height: height + 24 }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        className="touch-none select-none block"
      >
        {/* Guide path */}
        <motion.path
          ref={guideRef}
          d={svgPath}
          fill={completed ? successColor : 'none'}
          stroke={completed ? successColor : '#FED7AA'}
          strokeWidth={completed ? 6 : 24}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={
            completed
              ? { scale: [1, 1.08, 1] }
              : { opacity: [0.65, 1, 0.65] }
          }
          transition={
            completed
              ? { duration: 0.6 }
              : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
          }
        />
        {/* Learner stroke */}
        {strokeD && !completed && (
          <path
            d={strokeD}
            fill="none"
            stroke={errorFlash ? '#EF4444' : strokeColor}
            strokeWidth={12}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      <AnimatePresence>
        {errorFlash && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl ring-4 ring-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MotorTraceCanvas;

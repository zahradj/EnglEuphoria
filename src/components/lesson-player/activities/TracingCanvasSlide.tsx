import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface ActivityData {
  instruction?: string;
  target_letters: string[];
  font_style?: 'print' | 'cursive';
}

interface Props {
  slide: any;
  hub?: 'playground' | 'academy' | 'success';
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onComplete?: () => void;
}

const TracingCanvasSlide: React.FC<Props> = ({ slide, hub = 'playground', onCorrect, onComplete }) => {
  const data: ActivityData = (slide?.activity_data ?? slide?.interactive_data) || { target_letters: [] };
  const isPlayground = hub === 'playground';
  const fontFamily = data.font_style === 'cursive'
    ? '"Comic Sans MS", cursive'
    : isPlayground ? "'Fredoka','Quicksand',sans-serif" : '"Arial Black", sans-serif';
  const [idx, setIdx] = useState(0);
  const [coverage, setCoverage] = useState(0);
  const [winFx, setWinFx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const letter = data.target_letters[idx] ?? '';
  const total = data.target_letters.length;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx?.clearRect(0, 0, c.width, c.height);
    setCoverage(0);
  }, [idx]);

  const point = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    if (isPlayground) {
      const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
      grad.addColorStop(0, ARCADE.pink);
      grad.addColorStop(0.5, ARCADE.yellow);
      grad.addColorStop(1, ARCADE.green);
      ctx.strokeStyle = grad;
      ctx.shadowColor = ARCADE.pink;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 22;
    } else {
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 18;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setCoverage((cv) => Math.min(100, cv + 0.6));
  };

  const end = () => {
    drawing.current = false;
    if (coverage > 55) {
      onCorrect?.();
      setWinFx((v) => v + 1);
      if (idx === total - 1) onComplete?.();
    }
  };

  const reset = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    setCoverage(0);
  };

  const next = () => idx < total - 1 && setIdx(idx + 1);

  // Non-playground fallback (Academy/Success): keep original look
  if (!isPlayground) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 space-y-4 text-center">
        <h2 className="text-2xl font-bold text-foreground">{slide.title || 'Trace the letter'}</h2>
        {data.instruction && <p className="text-muted-foreground">{data.instruction}</p>}
        <p className="text-sm text-muted-foreground">Letter {idx + 1} of {total}</p>
        <div
          className="relative mx-auto rounded-3xl border-4 border-amber-300 bg-amber-50 overflow-hidden"
          style={{ width: 360, height: 360 }}
        >
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center text-amber-300/60 select-none pointer-events-none"
            style={{ fontFamily, fontSize: 280, lineHeight: 1 }}
          >
            {letter}
          </span>
          <canvas
            ref={canvasRef}
            width={720}
            height={720}
            className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
          />
        </div>
        <div className="h-2 w-full max-w-xs mx-auto rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, coverage)}%` }} />
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-4 h-4" /> Clear
          </button>
          {coverage > 55 && idx < total - 1 && (
            <button onClick={next} className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 className="w-4 h-4" /> Next letter
            </button>
          )}
        </div>
      </div>
    );
  }

  // Playground arcade view
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title={slide.title || 'Trace Quest'}
        emoji="✏️"
        score={idx + (coverage > 55 ? 1 : 0)}
        total={total}
        hud={<ArcadeChip tone="purple">Letter {idx + 1} / {total}</ArcadeChip>}
      >
        <div className="relative flex flex-col items-center gap-4">
          <GameFX trigger={winFx} variant="pop" message="Nice! ✨" />

          {data.instruction && (
            <p className="text-sm font-bold text-center" style={{ color: ARCADE.navy, opacity: 0.75 }}>
              {data.instruction}
            </p>
          )}

          <div
            className="relative rounded-3xl overflow-hidden bg-white"
            style={{
              width: 320,
              height: 320,
              border: `5px solid ${coverage > 55 ? ARCADE.green : ARCADE.yellow}`,
              boxShadow: coverage > 55
                ? `0 10px 0 ${ARCADE.green}, 0 0 30px ${ARCADE.green}66`
                : `0 10px 0 ${ARCADE.pink}, 0 0 24px ${ARCADE.yellow}55`,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
              style={{
                fontFamily,
                fontSize: 260,
                lineHeight: 1,
                color: `${ARCADE.purple}55`,
                textShadow: `4px 4px 0 ${ARCADE.yellow}33`,
              }}
            >
              {letter}
            </span>
            <canvas
              ref={canvasRef}
              width={720}
              height={720}
              className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
            />
          </div>

          <div className="w-full max-w-xs">
            <div
              className="h-3 w-full rounded-full overflow-hidden"
              style={{ background: `${ARCADE.navy}22`, border: `2px solid ${ARCADE.navy}` }}
            >
              <motion.div
                className="h-full"
                animate={{ width: `${Math.min(100, coverage)}%` }}
                style={{ background: `linear-gradient(90deg, ${ARCADE.pink}, ${ARCADE.yellow}, ${ARCADE.green})` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <ArcadeButton tone="yellow" size="sm" onClick={reset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
            </ArcadeButton>
            <AnimatePresence>
              {coverage > 55 && idx < total - 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ArcadeButton tone="green" onClick={next}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Next letter
                  </ArcadeButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {coverage > 55 && idx === total - 1 && (
            <motion.p
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="text-xl font-black"
              style={{ color: ARCADE.green, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
            >
              LEVEL CLEAR! All letters mastered 🎉
            </motion.p>
          )}
        </div>
      </ArcadeFrame>
    </div>
  );
};

export default TracingCanvasSlide;

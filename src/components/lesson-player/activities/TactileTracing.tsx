import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { PenTool, RotateCcw, Check } from 'lucide-react';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface TactileTracingProps {
  slide: GeneratedSlide;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

interface Point { x: number; y: number; }

const TactileTracing: React.FC<TactileTracingProps> = ({ slide, onCorrect, onIncorrect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [tracedPoints, setTracedPoints] = useState<Point[]>([]);
  const [phase, setPhase] = useState<'tracing' | 'scored'>('tracing');
  const [winFx, setWinFx] = useState(0);

  const targetLetter = (slide.content?.word || 'L').charAt(0).toUpperCase();
  const imageUrl = slide.content?.imageUrl;

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 300; canvas.height = 300;
    ctx.clearRect(0, 0, 300, 300);
    ctx.font = "bold 200px 'Fredoka','Quicksand',sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = ARCADE.purple + '60';
    ctx.lineWidth = 4;
    ctx.strokeText(targetLetter, 150, 155);
    ctx.setLineDash([]);
  }, [targetLetter]);

  useEffect(() => { drawGuide(); }, [drawGuide]);

  const getCanvasPoint = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== 'tracing') return;
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    if (point) setTracedPoints([point]);
  }, [phase, getCanvasPoint]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || phase !== 'tracing') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const point = getCanvasPoint(e);
    if (!point) return;
    setTracedPoints(prev => {
      const next = [...prev, point];
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        // Neon arcade trace gradient
        const gradient = ctx.createLinearGradient(last.x, last.y, point.x, point.y);
        gradient.addColorStop(0, ARCADE.pink);
        gradient.addColorStop(0.5, ARCADE.yellow);
        gradient.addColorStop(1, ARCADE.green);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = ARCADE.pink;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      return next;
    });
  }, [isDrawing, phase, getCanvasPoint]);

  const stopDrawing = useCallback(() => setIsDrawing(false), []);

  const scoreTracing = useCallback(() => {
    const score = Math.min(100, Math.round((tracedPoints.length / 50) * 100));
    setAccuracy(score);
    setPhase('scored');
    if (score >= 90) {
      setWinFx(v => v + 1);
      onCorrect?.();
    } else {
      onIncorrect?.();
    }
  }, [tracedPoints, onCorrect, onIncorrect]);

  const resetTracing = useCallback(() => {
    setTracedPoints([]);
    setAccuracy(null);
    setPhase('tracing');
    drawGuide();
  }, [drawGuide]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Trace Quest"
        emoji="✏️"
        hud={
          <ArcadeChip tone="pink">
            <PenTool className="h-3 w-3 mr-1" /> Letter: {targetLetter}
          </ArcadeChip>
        }
      >
        <div className="relative flex flex-col items-center gap-4">
          <GameFX trigger={winFx} variant="confetti" message="Mastered! ✨" />

          <p className="text-sm font-bold text-center" style={{ color: ARCADE.navy, opacity: 0.75 }}>
            Trace along the dotted <span className="font-black" style={{ color: ARCADE.purple }}>{targetLetter}</span> — get ≥90% to unlock
          </p>

          <div className="relative">
            <canvas
              ref={canvasRef}
              className="rounded-3xl bg-white touch-none cursor-crosshair transition-all"
              style={{
                width: 280,
                height: 280,
                border: `5px solid ${
                  phase === 'scored'
                    ? (accuracy! >= 90 ? ARCADE.green : ARCADE.pink)
                    : ARCADE.yellow
                }`,
                boxShadow:
                  phase === 'scored' && accuracy! >= 90
                    ? `0 10px 0 ${ARCADE.green}, 0 0 30px ${ARCADE.green}66`
                    : `0 10px 0 ${ARCADE.pink}, 0 0 24px ${ARCADE.yellow}55`,
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {imageUrl && phase === 'scored' && accuracy! >= 90 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="absolute top-2 right-2 w-16 h-16 rounded-2xl overflow-hidden bg-white"
                style={{ border: `3px solid ${ARCADE.green}`, boxShadow: `0 4px 0 #048A66` }}
              >
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              </motion.div>
            )}
          </div>

          {/* Progress meter */}
          <div className="w-full max-w-xs">
            <div
              className="h-3 w-full rounded-full overflow-hidden"
              style={{ background: `${ARCADE.navy}22`, border: `2px solid ${ARCADE.navy}` }}
            >
              <motion.div
                className="h-full"
                animate={{ width: `${Math.min(100, (tracedPoints.length / 50) * 100)}%` }}
                style={{ background: `linear-gradient(90deg, ${ARCADE.pink}, ${ARCADE.yellow}, ${ARCADE.green})` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {phase === 'tracing' && (
              <>
                <ArcadeButton tone="yellow" size="sm" onClick={resetTracing}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear
                </ArcadeButton>
                <ArcadeButton tone="green" onClick={scoreTracing} disabled={tracedPoints.length < 10}>
                  <Check className="h-4 w-4 mr-1" /> Submit
                </ArcadeButton>
              </>
            )}
            {phase === 'scored' && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="text-center"
                >
                  <p
                    className="text-3xl font-black"
                    style={{
                      color: accuracy! >= 90 ? ARCADE.green : ARCADE.pink,
                      fontFamily: "'Fredoka','Quicksand',sans-serif",
                    }}
                  >
                    {accuracy}%
                  </p>
                  <p className="text-sm font-bold mt-1" style={{ color: ARCADE.navy }}>
                    {accuracy! >= 90 ? 'LEVEL CLEAR! Letter mastered ✨' : 'So close! Follow the dots more closely.'}
                  </p>
                  {accuracy! < 90 && (
                    <ArcadeButton tone="purple" size="sm" className="mt-2" onClick={resetTracing}>
                      Try Again
                    </ArcadeButton>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </ArcadeFrame>
    </div>
  );
};

export default TactileTracing;

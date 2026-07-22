import React, { useMemo, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { ArcadeFrame, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface ActivityData {
  instruction?: string;
  left_column: string[];
  right_column: string[];
  pairs: Array<[number, number]>;
}

interface Props {
  slide: any;
  hub?: 'playground' | 'academy' | 'success';
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onComplete?: () => void;
}

const HUB_LINE: Record<string, string> = {
  playground: 'stroke-amber-500',
  academy: 'stroke-indigo-500',
  success: 'stroke-emerald-500',
};

const MatchingLinesSlide: React.FC<Props> = ({ slide, hub = 'academy', onCorrect, onIncorrect, onComplete }) => {
  const data: ActivityData = (slide?.activity_data ?? slide?.interactive_data) || { left_column: [], right_column: [], pairs: [] };
  const stroke = HUB_LINE[hub] ?? HUB_LINE.academy;
  const isPlayground = hub === 'playground';

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rightRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pickedLeft, setPickedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Array<[number, number]>>([]);
  const [reveal, setReveal] = useState(false);
  const [winFx, setWinFx] = useState(0);

  const correctMap = useMemo(() => new Map(data.pairs.map(([l, r]) => [l, r])), [data.pairs]);

  const getLines = () => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return [];
    return matches.map(([li, ri], idx) => {
      const lEl = leftRefs.current[li]?.getBoundingClientRect();
      const rEl = rightRefs.current[ri]?.getBoundingClientRect();
      if (!lEl || !rEl) return null;
      const x1 = lEl.right - box.left, y1 = lEl.top + lEl.height / 2 - box.top;
      const x2 = rEl.left - box.left, y2 = rEl.top + rEl.height / 2 - box.top;
      const correct = correctMap.get(li) === ri;
      return { x1, y1, x2, y2, idx, correct };
    }).filter(Boolean) as Array<{ x1: number; y1: number; x2: number; y2: number; idx: number; correct: boolean }>;
  };

  const onLeftClick = (li: number) => { if (matches.some(([l]) => l === li)) return; setPickedLeft(li); };
  const onRightClick = (ri: number) => {
    if (pickedLeft === null) return;
    if (matches.some(([, r]) => r === ri)) return;
    const next = [...matches, [pickedLeft, ri] as [number, number]];
    setMatches(next);
    (correctMap.get(pickedLeft) === ri ? onCorrect : onIncorrect)?.();
    setPickedLeft(null);
    if (next.length === Math.min(data.left_column.length, data.right_column.length)) {
      setReveal(true);
      setWinFx((v) => v + 1);
      onComplete?.();
    }
  };

  const reset = () => { setMatches([]); setPickedLeft(null); setReveal(false); };

  const lines = getLines();

  const grid = (
    <div ref={containerRef} className="relative grid grid-cols-2 gap-12">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {lines.map((ln) => (
            <line
              key={ln.idx}
              x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
              className={reveal ? (ln.correct ? 'stroke-emerald-500' : 'stroke-rose-500') : stroke}
              strokeWidth={isPlayground ? 5 : 3}
              strokeLinecap="round"
            />
          ))}
        </svg>

        <div className="space-y-2">
          {data.left_column.map((txt, i) => {
            const used = matches.some(([l]) => l === i);
            const picked = pickedLeft === i;
            if (isPlayground) {
              return (
                <button
                  key={i}
                  ref={(el) => (leftRefs.current[i] = el)}
                  onClick={() => onLeftClick(i)}
                  disabled={used}
                  className="w-full text-left px-4 py-3 rounded-2xl border-4 font-black text-base transition"
                  style={{
                    background: picked ? ARCADE.yellow : used ? 'rgba(6,214,160,0.18)' : '#fff',
                    color: ARCADE.navy,
                    borderColor: picked ? ARCADE.pink : used ? ARCADE.green : ARCADE.blue,
                    boxShadow: `0 5px 0 ${picked ? '#B8002E' : used ? '#048A66' : '#0A5F7E'}`,
                    fontFamily: "'Fredoka','Quicksand',sans-serif",
                    opacity: used ? 0.85 : 1,
                  }}
                >
                  {txt}
                </button>
              );
            }
            return (
              <button
                key={i}
                ref={(el) => (leftRefs.current[i] = el)}
                onClick={() => onLeftClick(i)}
                disabled={used}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold transition ${
                  picked ? 'border-primary bg-primary/10' : used ? 'opacity-60 border-foreground/20 bg-muted' : 'border-foreground/20 bg-card hover:border-primary'
                }`}
              >
                {txt}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {data.right_column.map((txt, i) => {
            const used = matches.some(([, r]) => r === i);
            if (isPlayground) {
              return (
                <button
                  key={i}
                  ref={(el) => (rightRefs.current[i] = el)}
                  onClick={() => onRightClick(i)}
                  disabled={used || pickedLeft === null}
                  className="w-full text-left px-4 py-3 rounded-2xl border-4 border-dashed font-black text-base transition disabled:opacity-50"
                  style={{
                    background: used ? 'rgba(6,214,160,0.18)' : '#fff',
                    color: ARCADE.navy,
                    borderColor: used ? ARCADE.green : ARCADE.purple,
                    boxShadow: `0 4px 0 ${used ? '#048A66' : '#432F5E'}`,
                    fontFamily: "'Fredoka','Quicksand',sans-serif",
                    opacity: used ? 0.85 : 1,
                  }}
                >
                  {txt}
                </button>
              );
            }
            return (
              <button
                key={i}
                ref={(el) => (rightRefs.current[i] = el)}
                onClick={() => onRightClick(i)}
                disabled={used || pickedLeft === null}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold transition ${
                  used ? 'opacity-60 border-foreground/20 bg-muted' : 'border-foreground/20 bg-card hover:border-primary disabled:opacity-50'
                }`}
              >
                {txt}
              </button>
            );
          })}
        </div>
      </div>
  );

  if (isPlayground) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <ArcadeFrame
          title={slide.title || 'Match the Pairs!'}
          emoji="🔗"
          score={matches.length}
          total={Math.min(data.left_column.length, data.right_column.length)}
        >
          <div className="relative">
            <GameFX trigger={winFx} variant="confetti" message="Done! 🎉" />
            {data.instruction && (
              <p className="text-sm font-bold mb-4 text-center" style={{ color: ARCADE.navy, opacity: 0.8 }}>
                {data.instruction}
              </p>
            )}
            {grid}
            {reveal && (
              <div className="flex items-center justify-between pt-4">
                <span className="inline-flex items-center gap-2 font-black" style={{ color: ARCADE.green }}>
                  <CheckCircle2 className="w-5 h-5" /> LEVEL CLEAR!
                </span>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-sm font-bold"
                  style={{ color: ARCADE.navy, opacity: 0.7 }}
                >
                  <RotateCcw className="w-4 h-4" /> Try again
                </button>
              </div>
            )}
          </div>
        </ArcadeFrame>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-5">
      <h2 className="text-2xl font-bold text-foreground">{slide.title || 'Match the pairs'}</h2>
      {data.instruction && <p className="text-muted-foreground">{data.instruction}</p>}
      {grid}

      {reveal && (
        <div className="flex items-center justify-between pt-2">
          <span className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-5 h-5" /> Done!
          </span>
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-4 h-4" /> Try again
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchingLinesSlide;

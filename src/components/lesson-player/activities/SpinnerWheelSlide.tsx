import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SpeakingPractice from './SpeakingPractice';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface ActivityData {
  instruction?: string;
  wheel_segments: string[];
  prompt_template?: string;
}

interface Props {
  slide: any;
  hub?: 'playground' | 'academy' | 'success';
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onComplete?: () => void;
}

const ARCADE_COLORS = [ARCADE.pink, ARCADE.yellow, ARCADE.green, ARCADE.blue, ARCADE.purple, '#FF8FA3', '#FFE066', '#5CD9B4'];
const STANDARD_COLORS = ['#FE6A2F', '#6B21A8', '#059669', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6', '#EF4444'];

const SpinnerWheelSlide: React.FC<Props> = ({ slide, hub = 'playground', onCorrect, onComplete }) => {
  const data: ActivityData = (slide?.activity_data ?? slide?.interactive_data) || { wheel_segments: [] };
  const segments = data.wheel_segments.length > 0 ? data.wheel_segments : ['—'];
  const [rotation, setRotation] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [winFx, setWinFx] = useState(0);

  const sliceAngle = 360 / segments.length;
  const isArcade = hub === 'playground';
  const palette = isArcade ? ARCADE_COLORS : STANDARD_COLORS;

  const spin = () => {
    if (spinning) return;
    setChosen(null);
    setSpinning(true);
    const target = Math.floor(Math.random() * segments.length);
    const extra = 360 * 5 + (360 - target * sliceAngle - sliceAngle / 2);
    const next = rotation + extra;
    setRotation(next);
    setTimeout(() => {
      setChosen(segments[target]);
      setSpinning(false);
      if (isArcade) setWinFx((n) => n + 1);
    }, 3200);
  };

  const target = chosen
    ? (data.prompt_template ? data.prompt_template.replace('{segment}', chosen) : chosen)
    : '';

  const wheel = (
    <div className="relative mx-auto" style={{ width: 320, height: 320 }}>
      {/* Pointer */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0"
        style={{
          borderLeft: '16px solid transparent',
          borderRight: '16px solid transparent',
          borderTop: `28px solid ${isArcade ? ARCADE.pink : '#1A1A40'}`,
          filter: isArcade ? `drop-shadow(0 3px 0 ${ARCADE.yellow})` : 'none',
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={
          isArcade
            ? {
                padding: 6,
                background: `conic-gradient(${ARCADE.pink}, ${ARCADE.yellow}, ${ARCADE.green}, ${ARCADE.blue}, ${ARCADE.purple}, ${ARCADE.pink})`,
                boxShadow: `0 12px 30px -8px ${ARCADE.pink}66, 0 0 0 4px #fff inset`,
              }
            : { padding: 0 }
        }
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full rounded-full shadow-lg transition-transform duration-[3000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)`, background: '#fff' }}
        >
          {segments.map((seg, i) => {
            const a0 = (i * sliceAngle - 90) * (Math.PI / 180);
            const a1 = ((i + 1) * sliceAngle - 90) * (Math.PI / 180);
            const x0 = 50 + 50 * Math.cos(a0), y0 = 50 + 50 * Math.sin(a0);
            const x1 = 50 + 50 * Math.cos(a1), y1 = 50 + 50 * Math.sin(a1);
            const large = sliceAngle > 180 ? 1 : 0;
            const tx = 50 + 30 * Math.cos((a0 + a1) / 2);
            const ty = 50 + 30 * Math.sin((a0 + a1) / 2);
            const rot = (i * sliceAngle) + sliceAngle / 2;
            return (
              <g key={i}>
                <path
                  d={`M50,50 L${x0},${y0} A50,50 0 ${large} 1 ${x1},${y1} Z`}
                  fill={palette[i % palette.length]}
                  stroke="white"
                  strokeWidth={isArcade ? '1.2' : '0.5'}
                />
                <text
                  x={tx} y={ty}
                  fill="white"
                  fontSize="6"
                  fontWeight="900"
                  fontFamily={isArcade ? "'Fredoka','Quicksand',sans-serif" : undefined}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${rot} ${tx} ${ty})`}
                  style={isArcade ? { paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.35)', strokeWidth: 0.5 } : undefined}
                >
                  {seg.length > 10 ? seg.slice(0, 9) + '…' : seg}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* Center hub */}
      {isArcade && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
          style={{
            width: 56, height: 56,
            background: `radial-gradient(circle at 30% 30%, ${ARCADE.yellow}, ${ARCADE.pink})`,
            boxShadow: `0 0 0 4px #fff, 0 4px 0 ${ARCADE.purple}`,
          }}
        >
          <span className="text-2xl">🎯</span>
        </div>
      )}
    </div>
  );

  const body = (
    <div className="relative w-full max-w-2xl mx-auto space-y-5 text-center">
      <GameFX trigger={winFx} variant="sparkle" />
      {data.instruction && (
        <p style={{ color: isArcade ? ARCADE.navy : undefined, fontWeight: isArcade ? 700 : 400 }} className={!isArcade ? 'text-muted-foreground' : ''}>
          {data.instruction}
        </p>
      )}

      {wheel}

      {isArcade ? (
        <ArcadeButton tone={spinning ? 'purple' : 'pink'} size="lg" onClick={spin} disabled={spinning}>
          {spinning ? 'Spinning…' : chosen ? 'Spin Again!' : '🎡 Spin the Wheel!'}
        </ArcadeButton>
      ) : (
        <button
          onClick={spin}
          disabled={spinning}
          className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:scale-105 transition disabled:opacity-50"
        >
          {spinning ? 'Spinning…' : chosen ? 'Spin again' : 'Spin the wheel!'}
        </button>
      )}

      {chosen && !spinning && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="pt-4 space-y-3"
        >
          {isArcade && (
            <div className="flex justify-center">
              <ArcadeChip tone="yellow">🎯 You landed on</ArcadeChip>
            </div>
          )}
          <p
            className="text-lg font-bold"
            style={isArcade ? {
              color: ARCADE.navy,
              fontFamily: "'Fredoka','Quicksand',sans-serif",
              textShadow: `1px 1px 0 ${ARCADE.yellow}`,
            } : undefined}
          >
            {target}
          </p>
          <SpeakingPractice
            targetSentence={chosen}
            hub={hub === ('professional' as any) ? 'success' : hub}
            slideId={slide.id}
            lessonId={(slide as any).lesson_id}
            onComplete={() => { onCorrect?.(); onComplete?.(); }}
          />
        </motion.div>
      )}
    </div>
  );

  if (!isArcade) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 space-y-5 text-center">
        <h2 className="text-2xl font-bold text-foreground">{slide.title || 'Spin and say!'}</h2>
        {body}
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <ArcadeFrame title={slide.title || 'Spin & Say!'} emoji="🎡">
        {body}
      </ArcadeFrame>
    </div>
  );
};

export default SpinnerWheelSlide;

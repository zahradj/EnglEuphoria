import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useHeroTheme } from '@/contexts/HeroThemeContext';

/**
 * Pure-SVG radar (spider) chart with 6 axes.
 * Animates polygon scale on scroll-in, then cycles through 3 mastery profiles
 * (Beginner → Intermediate → Advanced) every 3.5s to visually communicate progress.
 * No chart libraries; all colors driven by the active hero theme.
 */
const AXES = ['speaking', 'listening', 'reading', 'writing', 'vocabulary', 'grammar'] as const;

const PROFILES: Record<'beginner' | 'intermediate' | 'advanced', number[]> = {
  beginner:     [0.30, 0.42, 0.55, 0.40, 0.48, 0.38],
  intermediate: [0.62, 0.70, 0.78, 0.65, 0.72, 0.66],
  advanced:     [0.88, 0.92, 0.95, 0.86, 0.90, 0.84],
};

const PROFILE_ORDER: Array<keyof typeof PROFILES> = ['beginner', 'intermediate', 'advanced'];

interface Props {
  size?: number;
}

export function SkillRadarChart({ size = 320 }: Props) {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { theme } = useHeroTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-100px' });
  const [profileIdx, setProfileIdx] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setProfileIdx((i) => (i + 1) % PROFILE_ORDER.length), 3500);
    return () => clearInterval(id);
  }, [inView]);

  const currentKey = PROFILE_ORDER[profileIdx];
  const values = PROFILES[currentKey];

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;

  // Calculate axis endpoint coordinates
  const point = (i: number, scale: number) => {
    const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius * scale,
      y: cy + Math.sin(angle) * radius * scale,
    };
  };

  const ringScales = [0.25, 0.5, 0.75, 1];

  // Polygon path for current values
  const polygonPoints = values
    .map((v, i) => {
      const p = point(i, v);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const gridStroke = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const labelColor = isDark ? 'fill-slate-400' : 'fill-slate-500';

  return (
    <div ref={ref} className="relative inline-block">
      {/* Profile label */}
      <div className="absolute top-2 start-2 z-10">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${
            isDark
              ? 'bg-white/[0.06] border border-white/[0.08] text-white'
              : 'bg-white/90 border border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: theme.cssFrom }}
          />
          {t(`lp.skills.profile.${currentKey}`)}
        </span>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <linearGradient id="radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.cssFrom} stopOpacity="0.55" />
            <stop offset="100%" stopColor={theme.cssTo} stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Concentric grid rings */}
        {ringScales.map((s) => (
          <polygon
            key={s}
            points={AXES.map((_, i) => {
              const p = point(i, s);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke={gridStroke}
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const p = point(i, 1);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke={gridStroke}
              strokeWidth={1}
            />
          );
        })}

        {/* Animated value polygon */}
        <motion.polygon
          points={polygonPoints}
          fill="url(#radar-fill)"
          stroke={theme.cssFrom}
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Vertex dots */}
        {values.map((v, i) => {
          const p = point(i, v);
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={theme.cssTo}
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
            />
          );
        })}

        {/* Axis labels */}
        {AXES.map((axis, i) => {
          const p = point(i, 1.18);
          return (
            <text
              key={axis}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-[10px] font-semibold uppercase tracking-wider ${labelColor}`}
            >
              {t(`lp.skills.${axis}`)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * AcademyQuestMap — "Lexi Land" concept.
 *
 * A Super Mario-style side-scrolling world map, fully in the Academy
 * purple → indigo → blue palette. Five level-nodes line a winding path
 * across rolling hills, past pipes, brick stacks, ? blocks, a castle and
 * the goal flag. Birds drift, clouds float, the companion bounces on
 * the path. Tapping any level opens <ZoneQuestModal /> with its
 * homework and recent loot.
 */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Coins, ScrollText, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAcademyZones, type AcademyZone, type AcademyZoneId } from '@/hooks/academy/useAcademyZones';
import ZoneQuestModal from './ZoneQuestModal';

// Academy-branded pixel-art hero (Pip is excluded from Academy hub).
// Chunky Mario-style sprite in purple → indigo → blue palette.
const AcademyHero: React.FC<{ size?: number }> = ({ size = 64 }) => {
  const outline = '#1E1B4B';
  const cap = '#7C3AED';
  const capDark = '#4C1D95';
  const skin = '#F5F3FF';
  const skinShade = '#DDD6FE';
  const overalls = '#3730A3';
  const overallsDark = '#1E1B4B';
  const shirt = '#A78BFA';
  const boots = '#1E3A8A';
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} shapeRendering="crispEdges" style={{ filter: 'drop-shadow(0 3px 0 rgba(30,27,75,0.4))' }}>
      {/* Cap brim */}
      <rect x="6" y="8" width="20" height="2" fill={capDark} />
      {/* Cap */}
      <rect x="8" y="3" width="16" height="5" fill={cap} />
      <rect x="8" y="3" width="16" height="1.2" fill={capDark} />
      {/* Star emblem */}
      <path d="M16 4 L17 6 L19 6 L17.5 7.2 L18 9 L16 8 L14 9 L14.5 7.2 L13 6 L15 6 Z" fill={skin} />
      {/* Cap outline */}
      <rect x="8" y="3" width="16" height="5" fill="none" stroke={outline} strokeWidth="0.6" />
      <rect x="6" y="8" width="20" height="2" fill="none" stroke={outline} strokeWidth="0.6" />
      {/* Face */}
      <rect x="9" y="10" width="14" height="7" fill={skin} stroke={outline} strokeWidth="0.6" />
      {/* Cheeks */}
      <rect x="10" y="14" width="2" height="1.5" fill={skinShade} />
      <rect x="20" y="14" width="2" height="1.5" fill={skinShade} />
      {/* Eyes */}
      <rect x="12" y="12" width="2" height="2.5" fill={outline} />
      <rect x="18" y="12" width="2" height="2.5" fill={outline} />
      <rect x="12.5" y="12.5" width="0.8" height="0.8" fill={skin} />
      <rect x="18.5" y="12.5" width="0.8" height="0.8" fill={skin} />
      {/* Smile */}
      <path d="M13 16 Q16 18 19 16" stroke={outline} strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Shirt sleeves */}
      <rect x="6" y="17" width="3" height="5" fill={shirt} stroke={outline} strokeWidth="0.6" />
      <rect x="23" y="17" width="3" height="5" fill={shirt} stroke={outline} strokeWidth="0.6" />
      {/* Overalls body */}
      <rect x="9" y="17" width="14" height="10" fill={overalls} stroke={outline} strokeWidth="0.6" />
      <rect x="9" y="17" width="14" height="1.5" fill={overallsDark} />
      {/* Strap buttons */}
      <circle cx="12" cy="19" r="0.8" fill={cap} stroke={outline} strokeWidth="0.3" />
      <circle cx="20" cy="19" r="0.8" fill={cap} stroke={outline} strokeWidth="0.3" />
      {/* Hands */}
      <rect x="6" y="21" width="3" height="3" fill={skin} stroke={outline} strokeWidth="0.6" />
      <rect x="23" y="21" width="3" height="3" fill={skin} stroke={outline} strokeWidth="0.6" />
      {/* Boots */}
      <rect x="9" y="27" width="6" height="3" fill={boots} stroke={outline} strokeWidth="0.6" />
      <rect x="17" y="27" width="6" height="3" fill={boots} stroke={outline} strokeWidth="0.6" />
    </svg>
  );
};

interface Props { isDarkMode?: boolean; }

// Chunky pixel-art icons (Mario-style). Filled shapes, bold outlines, no thin strokes.
export const ZoneIcon: React.FC<{ id: AcademyZoneId; color?: string; className?: string }> = ({ id, color = '#FFFFFF', className }) => {
  const outline = '#1E1B4B';
  const light = '#F5F3FF';
  const shadow = 'rgba(30,27,75,0.45)';
  switch (id) {
    case 'grammar':
      // Tiny castle crown — flat, chunky, pixel-stepped
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" className={className} shapeRendering="crispEdges">
          {/* base shadow */}
          <rect x="3" y="20" width="18" height="2" fill={shadow} />
          {/* keep body */}
          <rect x="4" y="11" width="16" height="10" fill={color} stroke={outline} strokeWidth="1.2" />
          {/* crenellations */}
          <rect x="4" y="9" width="3" height="3" fill={color} stroke={outline} strokeWidth="1.2" />
          <rect x="10.5" y="9" width="3" height="3" fill={color} stroke={outline} strokeWidth="1.2" />
          <rect x="17" y="9" width="3" height="3" fill={color} stroke={outline} strokeWidth="1.2" />
          {/* door */}
          <path d="M10 21 L10 16 Q12 14 14 16 L14 21 Z" fill={outline} />
          {/* windows */}
          <rect x="6" y="14" width="2" height="3" fill={outline} />
          <rect x="16" y="14" width="2" height="3" fill={outline} />
          {/* flag */}
          <rect x="11.5" y="3" width="1" height="6" fill={outline} />
          <path d="M12.5 3 L17 4.5 L12.5 6 Z" fill="#A855F7" stroke={outline} strokeWidth="0.8" />
          {/* highlight */}
          <rect x="4" y="11" width="16" height="1.2" fill={light} opacity="0.5" />
        </svg>
      );
    case 'sounds':
      // Mario pipe + sound waves
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" className={className} shapeRendering="crispEdges">
          <rect x="3" y="20" width="18" height="2" fill={shadow} />
          {/* pipe lip */}
          <rect x="6" y="8" width="12" height="4" fill={color} stroke={outline} strokeWidth="1.2" />
          {/* pipe body */}
          <rect x="8" y="12" width="8" height="9" fill={color} stroke={outline} strokeWidth="1.2" />
          {/* pipe highlight */}
          <rect x="9" y="13" width="1.5" height="7" fill={light} opacity="0.6" />
          <rect x="7" y="9" width="2" height="2" fill={light} opacity="0.6" />
          {/* sound waves */}
          <path d="M2 6 Q4 4 6 6" stroke={outline} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M1 4 Q4 1 7 4" stroke={outline} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M22 6 Q20 4 18 6" stroke={outline} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M23 4 Q20 1 17 4" stroke={outline} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'vocab':
      // Mario ? block
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" className={className} shapeRendering="crispEdges">
          <rect x="3" y="20" width="18" height="2" fill={shadow} />
          {/* block */}
          <rect x="3" y="4" width="18" height="18" rx="1" fill={color} stroke={outline} strokeWidth="1.4" />
          {/* inner panel */}
          <rect x="5" y="6" width="14" height="14" rx="0.5" fill="none" stroke={outline} strokeWidth="0.8" opacity="0.6" />
          {/* rivets */}
          <rect x="5" y="6" width="1.5" height="1.5" fill={outline} />
          <rect x="17.5" y="6" width="1.5" height="1.5" fill={outline} />
          <rect x="5" y="17.5" width="1.5" height="1.5" fill={outline} />
          <rect x="17.5" y="17.5" width="1.5" height="1.5" fill={outline} />
          {/* top highlight */}
          <rect x="3" y="4" width="18" height="2" fill={light} opacity="0.55" />
          {/* ? mark */}
          <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="900" fill={outline} fontFamily='"Press Start 2P", system-ui'>?</text>
        </svg>
      );
    case 'speaking':
      // Chunky retro mic
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" className={className} shapeRendering="crispEdges">
          <rect x="3" y="20" width="18" height="2" fill={shadow} />
          {/* mic capsule */}
          <rect x="8" y="3" width="8" height="11" rx="4" fill={color} stroke={outline} strokeWidth="1.4" />
          {/* grille lines */}
          <line x1="9.5" y1="6" x2="14.5" y2="6" stroke={outline} strokeWidth="0.8" />
          <line x1="9.5" y1="8" x2="14.5" y2="8" stroke={outline} strokeWidth="0.8" />
          <line x1="9.5" y1="10" x2="14.5" y2="10" stroke={outline} strokeWidth="0.8" />
          {/* highlight */}
          <rect x="9" y="4.5" width="1.5" height="8" fill={light} opacity="0.5" rx="0.5" />
          {/* stand arc */}
          <path d="M5 12 Q5 18 12 18 Q19 18 19 12" stroke={outline} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* stem */}
          <rect x="11" y="18" width="2" height="3" fill={outline} />
          {/* base */}
          <rect x="8" y="20" width="8" height="2" rx="1" fill={outline} />
        </svg>
      );
    case 'writing':
      // Quill on a scroll
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" className={className} shapeRendering="crispEdges">
          <rect x="3" y="20" width="18" height="2" fill={shadow} />
          {/* scroll */}
          <rect x="3" y="14" width="18" height="6" rx="1" fill={light} stroke={outline} strokeWidth="1.2" />
          <line x1="6" y1="16.5" x2="14" y2="16.5" stroke={outline} strokeWidth="0.8" opacity="0.6" />
          <line x1="6" y1="18" x2="12" y2="18" stroke={outline} strokeWidth="0.8" opacity="0.6" />
          {/* quill feather */}
          <path d="M18 2 L22 6 L9 19 L5 19 L5 15 Z" fill={color} stroke={outline} strokeWidth="1.4" strokeLinejoin="round" />
          {/* feather spine highlight */}
          <path d="M18 2 L9 19" stroke={light} strokeWidth="0.8" opacity="0.7" />
          {/* nib */}
          <path d="M5 15 L9 19 L7 19 Z" fill={outline} />
          {/* ink dot */}
          <circle cx="4" cy="20" r="1.2" fill="#A855F7" stroke={outline} strokeWidth="0.6" />
        </svg>
      );
  }
};


// All zones live inside the Academy palette: purple → indigo → blue family.
// `prop` decides which Mario-style scenery sits behind that level node.
type LevelProp = 'pipe' | 'bricks' | 'qblock' | 'cloud-platform' | 'castle';
export const ZONE_THEME: Record<AcademyZoneId, {
  placeName: string;
  gradient: string;
  ring: string;
  haloFrom: string;
  haloTo: string;
  body: string;
  bodyDark: string;
  rim: string;
  iconColor: string;
  prop: LevelProp;
}> = {
  grammar:  {
    placeName: 'World 1 · Grammar Keep',
    gradient: 'from-[#A78BFA] via-[#7C3AED] to-[#4C1D95]',
    ring: '#A78BFA', haloFrom: 'rgba(167,139,250,0.55)', haloTo: 'rgba(76,29,149,0)',
    body: '#A78BFA', bodyDark: '#4C1D95', rim: '#DDD6FE',
    iconColor: '#FFFFFF', prop: 'castle',
  },
  sounds:   {
    placeName: 'World 2 · Echo Tunnel',
    gradient: 'from-[#7DD3FC] via-[#3B82F6] to-[#1E3A8A]',
    ring: '#60A5FA', haloFrom: 'rgba(96,165,250,0.55)', haloTo: 'rgba(30,58,138,0)',
    body: '#60A5FA', bodyDark: '#1E3A8A', rim: '#BFDBFE',
    iconColor: '#FFFFFF', prop: 'pipe',
  },
  vocab:    {
    placeName: 'World 3 · Word Bazaar',
    gradient: 'from-[#C4B5FD] via-[#818CF8] to-[#3730A3]',
    ring: '#818CF8', haloFrom: 'rgba(129,140,248,0.55)', haloTo: 'rgba(55,48,163,0)',
    body: '#818CF8', bodyDark: '#3730A3', rim: '#E0E7FF',
    iconColor: '#FFFFFF', prop: 'qblock',
  },
  speaking: {
    placeName: 'World 4 · Sky Stage',
    gradient: 'from-[#D8B4FE] via-[#A855F7] to-[#581C87]',
    ring: '#C084FC', haloFrom: 'rgba(192,132,252,0.55)', haloTo: 'rgba(88,28,135,0)',
    body: '#C084FC', bodyDark: '#581C87', rim: '#F3E8FF',
    iconColor: '#FFFFFF', prop: 'cloud-platform',
  },
  writing:  {
    placeName: 'World 5 · Scribe Bricks',
    gradient: 'from-[#93C5FD] via-[#6366F1] to-[#312E81]',
    ring: '#818CF8', haloFrom: 'rgba(129,140,248,0.55)', haloTo: 'rgba(49,46,129,0)',
    body: '#6366F1', bodyDark: '#312E81', rim: '#C7D2FE',
    iconColor: '#FFFFFF', prop: 'bricks',
  },
};

// ── Mario-style scenery pieces, all in purple/indigo/blue ──────────────
const LevelProp: React.FC<{ kind: LevelProp; body: string; bodyDark: string; rim: string }> = ({ kind, body, bodyDark, rim }) => {
  switch (kind) {
    case 'pipe':
      return (
        <svg width="64" height="80" viewBox="0 0 64 80">
          <rect x="14" y="28" width="36" height="52" fill={bodyDark} />
          <rect x="14" y="28" width="36" height="52" fill={body} opacity="0.9" />
          <rect x="18" y="34" width="6" height="40" fill={rim} opacity="0.45" />
          <rect x="6" y="22" width="52" height="14" rx="2" fill={bodyDark} />
          <rect x="6" y="22" width="52" height="14" rx="2" fill={body} opacity="0.9" />
          <rect x="10" y="25" width="44" height="3" fill={rim} opacity="0.55" />
          <rect x="6" y="22" width="52" height="14" rx="2" fill="none" stroke="#1E1B4B" strokeWidth="1.5" />
          <rect x="14" y="28" width="36" height="52" fill="none" stroke="#1E1B4B" strokeWidth="1.5" />
        </svg>
      );
    case 'bricks':
      return (
        <svg width="84" height="56" viewBox="0 0 84 56">
          {[0, 1].map((row) => (
            [0, 1, 2].map((col) => (
              <g key={`${row}-${col}`}>
                <rect x={col * 28 + (row % 2 ? 4 : 0)} y={row * 26 + 4} width="26" height="22" rx="2" fill={bodyDark} />
                <rect x={col * 28 + 2 + (row % 2 ? 4 : 0)} y={row * 26 + 6} width="22" height="18" rx="1.5" fill={body} />
                <line x1={col * 28 + 13 + (row % 2 ? 4 : 0)} y1={row * 26 + 6} x2={col * 28 + 13 + (row % 2 ? 4 : 0)} y2={row * 26 + 24} stroke={rim} strokeOpacity="0.5" strokeWidth="0.8" />
              </g>
            ))
          ))}
        </svg>
      );
    case 'qblock':
      return (
        <svg width="56" height="56" viewBox="0 0 56 56">
          <rect x="4" y="4" width="48" height="48" rx="4" fill={bodyDark} />
          <rect x="6" y="6" width="44" height="44" rx="3" fill={body} />
          <rect x="6" y="6" width="44" height="6" fill={rim} opacity="0.55" />
          {[[10, 10], [42, 10], [10, 42], [42, 42]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2" fill={rim} opacity="0.7" />
          ))}
          <text x="28" y="38" textAnchor="middle" fontSize="28" fontWeight="900" fill="#FFFFFF" stroke={bodyDark} strokeWidth="1">?</text>
        </svg>
      );
    case 'cloud-platform':
      return (
        <svg width="100" height="48" viewBox="0 0 100 48">
          <ellipse cx="30" cy="28" rx="22" ry="14" fill={rim} />
          <ellipse cx="55" cy="22" rx="26" ry="16" fill={rim} />
          <ellipse cx="78" cy="28" rx="20" ry="13" fill={rim} />
          <ellipse cx="30" cy="32" rx="22" ry="10" fill={body} opacity="0.35" />
          <ellipse cx="78" cy="32" rx="20" ry="9" fill={body} opacity="0.35" />
        </svg>
      );
    case 'castle':
      return (
        <svg width="96" height="96" viewBox="0 0 96 96">
          <rect x="16" y="36" width="64" height="56" fill={bodyDark} />
          <rect x="16" y="36" width="64" height="56" fill={body} opacity="0.92" />
          {/* Crenellations */}
          {[16, 26, 36, 46, 56, 66, 76].map((x, i) => (
            <rect key={i} x={x} y={28} width="8" height="10" fill={bodyDark} />
          ))}
          {/* Central tower */}
          <rect x="36" y="14" width="24" height="30" fill={bodyDark} />
          <rect x="36" y="14" width="24" height="30" fill={body} opacity="0.92" />
          {[36, 44, 52].map((x, i) => (
            <rect key={i} x={x} y={8} width="6" height="8" fill={bodyDark} />
          ))}
          {/* Door */}
          <path d="M 38 92 L 38 70 Q 48 58 58 70 L 58 92 Z" fill="#1E1B4B" />
          <path d="M 42 92 L 42 72 Q 48 64 54 72 L 54 92 Z" fill={rim} opacity="0.85" />
          {/* Windows */}
          <rect x="24" y="52" width="6" height="10" rx="1" fill={rim} opacity="0.8" />
          <rect x="66" y="52" width="6" height="10" rx="1" fill={rim} opacity="0.8" />
          {/* Flag pole + flag */}
          <line x1="48" y1="14" x2="48" y2="0" stroke={bodyDark} strokeWidth="1.5" />
          <path d="M 48 2 L 60 5 L 48 9 Z" fill={rim} />
          <rect x="16" y="34" width="64" height="2" fill={rim} opacity="0.6" />
        </svg>
      );
  }
};

export const AcademyQuestMap: React.FC<Props> = ({ isDarkMode = false }) => {
  const { zones, loading } = useAcademyZones();
  const [openZone, setOpenZone] = useState<AcademyZone | null>(null);

  const totalProgress = useMemo(
    () => (zones.length ? zones.reduce((s, z) => s + z.progress, 0) / zones.length : 0),
    [zones],
  );
  const level = Math.max(1, Math.floor(totalProgress * 25) + 1);
  const xpInLevel = Math.round(((totalProgress * 25) % 1) * 100);
  const coins = zones.reduce((s, z) => s + z.recentCount * 5, 0);
  const totalHomework = zones.reduce((s, z) => s + z.homeworkCount, 0);
  const nextQuest = zones.find((z) => z.homeworkCount > 0) ?? zones.find((z) => z.progress < 1);

  // Place zones along a winding side-scroll path. X spreads edge-to-edge,
  // Y zig-zags so the level dots hop up and down like Super Mario World.
  const placed = useMemo(() => {
    const n = Math.max(zones.length, 1);
    return zones.map((z, i) => {
      const x = 10 + (i * (80 / Math.max(n - 1, 1)));         // 10% → 90%
      const y = i % 2 === 0 ? 62 : 48;                          // zig-zag
      return { ...z, x, y, idx: i, theme: ZONE_THEME[z.id] };
    });
  }, [zones]);

  // Companion sits on whichever level is "current" (first incomplete).
  const companionTarget = useMemo(() => {
    const t = placed.find((p) => p.homeworkCount > 0) ?? placed.find((p) => p.progress < 1) ?? placed[0];
    return t ?? null;
  }, [placed]);

  // Drifting clouds in the sky.
  const clouds = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({
      y: 6 + (i * 7) % 26,
      delay: i * 3,
      duration: 70 + i * 11,
      size: 60 + (i % 3) * 28,
      opacity: 0.6 + (i % 2) * 0.15,
    })),
    [],
  );

  // Birds drifting across the sky in both directions.
  const gulls = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({
      y: 4 + (i * 5) % 30,
      delay: i * 2.2,
      duration: 22 + (i % 5) * 4,
      flip: i % 2 === 0,
    })),
    [],
  );

  // Sparkle stars in the sky.
  const sparkles = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({
      x: (i * 41 + 7) % 100,
      y: 6 + ((i * 17) % 35),
      delay: (i * 0.4) % 5,
      size: 1.5 + (i % 3) * 0.6,
    })),
    [],
  );

  if (loading) {
    return <div className="h-[30rem] rounded-3xl bg-[#1E1B4B]/30 dark:bg-[#1a0b3a]/60 animate-pulse" />;
  }

  // Academy-branded sky: lavender → indigo → deep purple/blue.
  const skyBg = isDarkMode
    ? 'linear-gradient(180deg,#1a0b3a 0%,#2d1656 40%,#1E3A8A 80%,#312E81 100%)'
    : 'linear-gradient(180deg,#EDE9FE 0%,#C4B5FD 35%,#818CF8 70%,#6366F1 100%)';

  return (
    <>
      <div
        className={cn(
          'relative h-[30rem] rounded-3xl overflow-hidden select-none border-2',
          isDarkMode ? 'border-[#6B21A8]/50' : 'border-[#6B21A8]/30',
        )}
        style={{
          background: skyBg,
          fontFamily: '"Press Start 2P", "VT323", system-ui, sans-serif',
        }}
      >
        {/* ── Pixel-art mountains (SMB1 style, with smiling faces) ──── */}
        <svg className="absolute inset-x-0 bottom-[18%] h-[32%] w-full pointer-events-none" viewBox="0 0 320 80" preserveAspectRatio="xMidYMax meet">
          {[{ x: 10, s: 1 }, { x: 130, s: 1.2 }, { x: 235, s: 0.95 }].map((m, i) => {
            const mountainPurple = isDarkMode ? '#3d1c70' : '#7C3AED';
            const mountainShade = isDarkMode ? '#2d1656' : '#5B21B6';
            const eyeColor = '#1E1B4B';
            const cheek = isDarkMode ? '#A78BFA' : '#C4B5FD';
            const w = 80 * m.s, h = 56 * m.s;
            return (
              <g key={i} transform={`translate(${m.x} ${80 - h})`}>
                <polygon points={`${w * 0.5},0 ${w * 0.2},${h * 0.5} 0,${h} ${w},${h} ${w * 0.8},${h * 0.5}`} fill={mountainShade} />
                <polygon points={`${w * 0.5},${h * 0.1} ${w * 0.28},${h * 0.5} ${w * 0.08},${h} ${w * 0.92},${h} ${w * 0.72},${h * 0.5}`} fill={mountainPurple} />
                <polygon points={`${w * 0.5},0 ${w * 0.4},${h * 0.18} ${w * 0.6},${h * 0.18}`} fill={isDarkMode ? '#DDD6FE' : '#F5F3FF'} />
                <rect x={w * 0.36} y={h * 0.55} width={5} height={5} fill={eyeColor} />
                <rect x={w * 0.58} y={h * 0.55} width={5} height={5} fill={eyeColor} />
                <ellipse cx={w * 0.5} cy={h * 0.74} rx={w * 0.13} ry={h * 0.07} fill={eyeColor} />
                <circle cx={w * 0.3} cy={h * 0.72} r={3.5} fill={cheek} opacity="0.7" />
                <circle cx={w * 0.7} cy={h * 0.72} r={3.5} fill={cheek} opacity="0.7" />
              </g>
            );
          })}
        </svg>

        {/* ── Pixel bushes (SMB1 silhouette) ─────────────────────────── */}
        <svg className="absolute inset-x-0 bottom-[16%] h-[10%] w-full pointer-events-none" viewBox="0 0 320 24" preserveAspectRatio="none">
          {[{ x: 50, w: 44 }, { x: 180, w: 56 }, { x: 270, w: 40 }].map((b, i) => {
            const bushDark = isDarkMode ? '#4C1D95' : '#4338CA';
            const bushLight = isDarkMode ? '#6D28D9' : '#6366F1';
            return (
              <g key={i} transform={`translate(${b.x} 0)`}>
                <ellipse cx={b.w * 0.25} cy={16} rx={b.w * 0.25} ry={9} fill={bushDark} />
                <ellipse cx={b.w * 0.55} cy={12} rx={b.w * 0.3} ry={11} fill={bushDark} />
                <ellipse cx={b.w * 0.8} cy={16} rx={b.w * 0.22} ry={8} fill={bushDark} />
                <rect x={0} y={18} width={b.w} height={6} fill={bushDark} />
                <ellipse cx={b.w * 0.55} cy={11} rx={b.w * 0.25} ry={3} fill={bushLight} opacity="0.6" />
              </g>
            );
          })}
        </svg>

        {/* ── Sky sparkles ─────────────────────────────────────────── */}
        {sparkles.map((s, i) => (
          <motion.span
            key={`s-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.size, height: s.size,
              background: isDarkMode ? '#DDD6FE' : '#F5F3FF',
              boxShadow: `0 0 ${s.size * 2}px ${isDarkMode ? '#A78BFA' : '#FFFFFF'}`,
            }}
            animate={{ opacity: [0, 0.95, 0], scale: [0.6, 1.15, 0.6] }}
            transition={{ duration: 3 + s.delay, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}

        {/* ── Drifting SMB-style smiling clouds ─────────────────────── */}
        {clouds.map((c, i) => {
          const fill = isDarkMode ? '#DDD6FE' : '#FFFFFF';
          const eye = '#1E1B4B';
          const cheek = isDarkMode ? '#A78BFA' : '#C4B5FD';
          return (
            <motion.svg
              key={`c-${i}`}
              className="absolute pointer-events-none drop-shadow-sm"
              style={{ top: `${c.y}%`, left: '-20%' }}
              width={c.size} height={c.size * 0.55} viewBox="0 0 100 56"
              animate={{ left: ['-20%', '120%'] }}
              transition={{ duration: c.duration, repeat: Infinity, delay: c.delay, ease: 'linear' }}
            >
              {/* SMB cloud silhouette: three bumps + flat base */}
              <ellipse cx="28" cy="28" rx="20" ry="13" fill={fill} opacity={c.opacity} />
              <ellipse cx="52" cy="22" rx="24" ry="15" fill={fill} opacity={c.opacity} />
              <ellipse cx="74" cy="28" rx="18" ry="12" fill={fill} opacity={c.opacity} />
              <rect x="8" y="32" width="80" height="10" rx="5" fill={fill} opacity={c.opacity} />
              {/* outline */}
              <path d="M8 36 Q8 22 28 22 Q32 8 52 10 Q72 8 76 24 Q92 22 92 36" fill="none" stroke={isDarkMode ? '#4C1D95' : '#6366F1'} strokeWidth="1.2" opacity="0.35" />
              {/* face */}
              <rect x="42" y="22" width="3" height="4" fill={eye} />
              <rect x="58" y="22" width="3" height="4" fill={eye} />
              <path d="M44 30 Q50 34 60 30" stroke={eye} strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <circle cx="40" cy="29" r="2" fill={cheek} opacity="0.8" />
              <circle cx="62" cy="29" r="2" fill={cheek} opacity="0.8" />
            </motion.svg>
          );
        })}

        {/* ── Birds drifting in the sky ─────────────────────────────── */}
        {gulls.map((g, i) => (
          <motion.svg
            key={`gull-${i}`}
            className="absolute pointer-events-none"
            style={{ top: `${g.y}%`, left: g.flip ? '105%' : '-6%', transform: g.flip ? 'scaleX(-1)' : undefined }}
            width="20" height="10" viewBox="0 0 20 10"
            animate={
              g.flip
                ? { left: ['105%', '-6%'], top: [`${g.y}%`, `${g.y + 4}%`, `${g.y}%`] }
                : { left: ['-6%', '105%'], top: [`${g.y}%`, `${g.y + 4}%`, `${g.y}%`] }
            }
            transition={{ duration: g.duration, repeat: Infinity, delay: g.delay, ease: 'linear' }}
          >
            <path d="M1 6 Q5 1 10 5 Q15 1 19 6" stroke={isDarkMode ? '#DDD6FE' : '#1E1B4B'} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </motion.svg>
        ))}

        {/* ── Floating spinning coins above the path ────────────────── */}
        {[20, 42, 64].map((leftPct, i) => (
          <motion.div
            key={`coin-${i}`}
            className="absolute pointer-events-none z-10"
            style={{ left: `${leftPct}%`, bottom: `${42 + (i % 2) * 6}%` }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.8 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          >
            <motion.div
              animate={{ rotateY: [0, 180, 360] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="8" fill="#DDD6FE" stroke="#4C1D95" strokeWidth="1.5" />
                <circle cx="9" cy="9" r="5" fill="none" stroke="#7C3AED" strokeWidth="1" />
                <text x="9" y="12" textAnchor="middle" fontSize="8" fontWeight="900" fill="#4C1D95" fontFamily='"Press Start 2P", monospace'>L</text>
              </svg>
            </motion.div>
          </motion.div>
        ))}

        {/* ── Wandering Goomba-style critter on the floor ───────────── */}
        <motion.div
          className="absolute pointer-events-none z-10"
          style={{ bottom: '16%' }}
          animate={{ left: ['10%', '70%', '10%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          <motion.svg
            width="28" height="28" viewBox="0 0 28 28"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* body */}
            <ellipse cx="14" cy="13" rx="11" ry="10" fill="#6D28D9" stroke="#1E1B4B" strokeWidth="1.5" />
            {/* belly highlight */}
            <ellipse cx="14" cy="16" rx="7" ry="5" fill="#A78BFA" opacity="0.5" />
            {/* eyes */}
            <ellipse cx="10" cy="11" rx="2.5" ry="3" fill="#F5F3FF" />
            <ellipse cx="18" cy="11" rx="2.5" ry="3" fill="#F5F3FF" />
            <rect x="9" y="11" width="2" height="3" fill="#1E1B4B" />
            <rect x="17" y="11" width="2" height="3" fill="#1E1B4B" />
            {/* angry brows */}
            <path d="M7 8 L12 10 M21 8 L16 10" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" />
            {/* feet */}
            <ellipse cx="9" cy="25" rx="4" ry="2" fill="#312E81" stroke="#1E1B4B" strokeWidth="1" />
            <ellipse cx="19" cy="25" rx="4" ry="2" fill="#312E81" stroke="#1E1B4B" strokeWidth="1" />
          </motion.svg>
        </motion.div>

        {/* ── Pixel-tile brick floor (SMB1 iconic ground) ─────────────── */}
        <div
          className="absolute inset-x-0 bottom-0 h-[16%] pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${isDarkMode ? '#4C1D95' : '#6366F1'} 0%, ${isDarkMode ? '#1E1B4B' : '#312E81'} 100%)`,
            boxShadow: 'inset 0 4px 0 rgba(245,243,255,0.18), inset 0 -3px 0 rgba(0,0,0,0.35)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent 0 22px, rgba(30,27,75,0.7) 22px 24px),
                repeating-linear-gradient(90deg, transparent 0 28px, rgba(30,27,75,0.7) 28px 30px)
              `,
            }}
          />
        </div>
        {/* Grass top stripe on the floor */}
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            bottom: '16%',
            height: 8,
            background: `repeating-linear-gradient(90deg, #A78BFA 0 8px, #7C3AED 8px 16px)`,
            boxShadow: '0 -2px 0 rgba(245,243,255,0.4)',
          }}
        />

        {/* ── Pixel staircase climbing toward the castle (Mario world-end) ── */}
        <svg className="absolute bottom-[16%] right-2 pointer-events-none" width="160" height="110" viewBox="0 0 160 110">
          {[0, 1, 2, 3, 4].map((step) => {
            const size = 20;
            const x = step * size;
            const y = 110 - (step + 1) * size;
            return (
              <g key={step}>
                <rect x={x} y={y} width={size} height={110 - y} fill={isDarkMode ? '#4C1D95' : '#6366F1'} stroke="#1E1B4B" strokeWidth="1.5" />
                <rect x={x + 2} y={y + 2} width={size - 4} height={4} fill="#A78BFA" opacity="0.8" />
              </g>
            );
          })}
        </svg>

        {/* ── HUD: Mario-style score panel, all purple/blue ─────────── */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-30">
          <div className="flex items-center gap-2 pointer-events-none">
            <motion.div
              initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              className="relative w-12 h-12 rounded-md flex flex-col items-center justify-center border-[3px]"
              style={{
                background: 'linear-gradient(180deg,#A78BFA,#6B21A8)',
                borderColor: '#F5F3FF',
                boxShadow: '0 3px 0 #1E1B4B, inset 0 0 10px rgba(245,243,255,0.4)',
              }}
            >
              <span className="text-[8px] font-black text-[#F5F3FF] leading-none tracking-widest">LVL</span>
              <span className="text-base font-black text-[#F5F3FF] leading-none drop-shadow">{level}</span>
            </motion.div>
            <div className="flex flex-col gap-1">
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase"
                style={{
                  background: 'linear-gradient(180deg,#F5F3FF,#DDD6FE)',
                  color: '#4C1D95',
                  border: '2px solid #4C1D95',
                  boxShadow: '0 2px 0 #1E1B4B',
                }}
              >
                <Gamepad2 className="w-3 h-3" /> Lexi Land
              </div>
              <div
                className="relative w-44 h-3 rounded-sm overflow-hidden border-2"
                style={{ background: '#1E1B4B', borderColor: '#4C1D95', boxShadow: '0 2px 0 #1E1B4B' }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg,#A78BFA 0 6px,#7C3AED 6px 12px,#3B82F6 12px 18px)',
                  }}
                  initial={{ width: 0 }} animate={{ width: `${xpInLevel}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-[#F5F3FF] tracking-widest">
                  {xpInLevel}/100 XP
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 pointer-events-none">
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider"
                style={{ background: '#7C3AED', color: '#F5F3FF', border: '2px solid #4C1D95', boxShadow: '0 2px 0 #1E1B4B' }}
              >
                <Flame className="w-3 h-3" /> {Math.max(1, Math.round(totalProgress * 7))}d
              </span>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider"
                style={{ background: '#3B82F6', color: '#F5F3FF', border: '2px solid #1E3A8A', boxShadow: '0 2px 0 #1E1B4B' }}
              >
                <Coins className="w-3 h-3" /> ×{coins}
              </span>
              {totalHomework > 0 && (
                <motion.span
                  animate={{ y: [0, -1.5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider"
                  style={{ background: '#A855F7', color: '#F5F3FF', border: '2px solid #6B21A8', boxShadow: '0 2px 0 #1E1B4B' }}
                >
                  ⚑ {totalHomework}
                </motion.span>
              )}
            </div>
            {nextQuest && (
              <button
                onClick={() => setOpenZone(nextQuest)}
                className="pointer-events-auto max-w-[15rem] px-2.5 py-1 rounded-md text-[10px] font-black text-right transition hover:scale-[1.04] border-2"
                style={{
                  background: 'linear-gradient(180deg,#F5F3FF,#DDD6FE)',
                  color: '#4C1D95',
                  borderColor: '#4C1D95',
                  boxShadow: '0 2px 0 #1E1B4B',
                }}
              >
                <div className="opacity-70 uppercase tracking-[0.18em] text-[8px]">▶ press start</div>
                <div className="flex items-center justify-end gap-1">
                  <span className="w-3 h-3 inline-flex"><ZoneIcon id={nextQuest.id} color="currentColor" /></span>
                  {nextQuest.homeworkCount > 0 ? `Play ${nextQuest.short}` : `Enter ${nextQuest.short}`}
                </div>
              </button>
            )}
          </div>
        </div>

        {/* ── World map: levels + dotted path + companion ───────────── */}
        <div className="absolute inset-x-0 bottom-0 top-20 z-10">
          {/* Pixel-stamped travel path connecting all levels */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            {placed.length > 1 && (
              <>
                {/* Dark drop-shadow line */}
                <path
                  d={placed.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y + 0.8}`).join(' ')}
                  fill="none" stroke="#1E1B4B" strokeOpacity="0.55"
                  strokeWidth="1.4" strokeDasharray="0.1 2.4" strokeLinecap="round"
                />
                {/* Bright pixel footprints */}
                <path
                  d={placed.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke={isDarkMode ? '#DDD6FE' : '#F5F3FF'}
                  strokeOpacity="0.95"
                  strokeWidth="1.4"
                  strokeDasharray="0.1 2.4"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>

          {/* Level nodes */}
          {placed.map((n) => {
            const pct = Math.round(n.progress * 100);
            const stars3 = Math.round(n.progress * 3);
            const locked = n.progress === 0 && n.recentCount === 0 && n.homeworkCount === 0;
            const cleared = n.progress >= 1;
            return (
              <motion.button
                key={n.id}
                onClick={() => setOpenZone(n)}
                className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none group z-10"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.1 + n.idx * 0.08, type: 'spring', stiffness: 240, damping: 14 }}
                aria-label={`${n.theme.placeName} — ${pct}% cleared, ${n.homeworkCount} quests pending`}
              >
                {/* Soft halo */}
                <span
                  className="absolute inset-0 m-auto w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${n.theme.haloFrom}, ${n.theme.haloTo})`, filter: 'blur(6px)' }}
                />
                {/* Pulse for pending quests */}
                {n.homeworkCount > 0 && (
                  <motion.span
                    className="absolute inset-0 m-auto w-20 h-20 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${n.theme.ring}80, transparent 70%)` }}
                    animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0.1, 0.7] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}

                <div className="relative flex flex-col items-center">
                  {/* Mario-style prop sitting under/behind the disc */}
                  <motion.div
                    className="pointer-events-none"
                    style={{ marginBottom: -22 }}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2.6 + n.idx * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <LevelProp kind={n.theme.prop} body={n.theme.body} bodyDark={n.theme.bodyDark} rim={n.theme.rim} />
                  </motion.div>

                  {/* Level disc — Mario-style rounded button */}
                  <motion.div
                    className="relative w-[58px] h-[58px] rounded-full flex items-center justify-center border-[3px]"
                    style={{
                      background: locked
                        ? 'linear-gradient(180deg,#64748B,#334155)'
                        : `linear-gradient(180deg,${n.theme.body},${n.theme.bodyDark})`,
                      borderColor: '#F5F3FF',
                      boxShadow: '0 4px 0 #1E1B4B, inset 0 -3px 0 rgba(30,27,75,0.4), inset 0 3px 0 rgba(255,255,255,0.25)',
                    }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95, y: 1 }}
                  >
                    {/* Progress ring */}
                    <svg viewBox="0 0 60 60" className="absolute -inset-1 pointer-events-none" width="68" height="68">
                      <circle cx="30" cy="30" r="27" fill="none" stroke="rgba(245,243,255,0.3)" strokeWidth="2" />
                      <motion.circle
                        cx="30" cy="30" r="27" fill="none"
                        stroke={n.theme.rim} strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 27}
                        initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - n.progress) }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        transform="rotate(-90 30 30)"
                      />
                    </svg>

                    {/* Crest icon */}
                    <div style={{ width: 26, height: 26, color: n.theme.iconColor }}>
                      <ZoneIcon id={n.id} color={n.theme.iconColor} />
                    </div>

                    {/* World number badge */}
                    <span
                      className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2"
                      style={{
                        background: 'linear-gradient(180deg,#F5F3FF,#C4B5FD)',
                        color: '#4C1D95',
                        borderColor: '#4C1D95',
                        boxShadow: '0 2px 0 #1E1B4B',
                      }}
                    >
                      {n.idx + 1}
                    </span>

                    {/* Cleared check */}
                    {cleared && (
                      <span
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black border-2"
                        style={{ background: '#3B82F6', color: '#F5F3FF', borderColor: '#1E3A8A', boxShadow: '0 2px 0 #1E1B4B' }}
                      >
                        ✓
                      </span>
                    )}

                    {/* Quest flag count */}
                    {n.homeworkCount > 0 && (
                      <motion.span
                        className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-md text-[10px] font-black flex items-center justify-center border-2"
                        style={{ background: '#A855F7', color: '#F5F3FF', borderColor: '#4C1D95', boxShadow: '0 2px 0 #1E1B4B' }}
                        animate={{ y: [0, -1.5, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        ⚑{n.homeworkCount}
                      </motion.span>
                    )}
                  </motion.div>

                  {/* Stars (purple/lavender, no gold) */}
                  {!locked && (
                    <div className="flex gap-0.5 mt-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="text-[11px] leading-none"
                          style={{
                            color: i < stars3 ? '#DDD6FE' : 'rgba(245,243,255,0.25)',
                            textShadow: i < stars3 ? '0 0 4px #A78BFA, 0 1px 0 #1E1B4B' : 'none',
                          }}
                        >★</span>
                      ))}
                    </div>
                  )}

                  {/* Place name plaque */}
                  <div
                    className="mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-[0.14em] whitespace-nowrap border-2"
                    style={{
                      background: 'linear-gradient(180deg,#F5F3FF,#DDD6FE)',
                      color: '#4C1D95',
                      borderColor: '#4C1D95',
                      boxShadow: '0 2px 0 #1E1B4B',
                    }}
                  >
                    {n.short}
                  </div>
                </div>
              </motion.button>
            );
          })}

          {/* Companion — sits on the active level, bobbing like a Mario sprite */}
          {companionTarget && (
            <motion.button
              onClick={() => setOpenZone(companionTarget)}
              className="absolute -translate-x-1/2 focus:outline-none z-20"
              style={{ left: `${companionTarget.x}%`, top: `${companionTarget.y}%`, marginTop: -78 }}
              initial={{ scale: 0, y: -40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.4 }}
              aria-label="Open companion quest panel"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <AcademyHero size={64} />
              </motion.div>
              {/* Speech bubble */}
              <motion.div
                className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[9px] font-black whitespace-nowrap border-2"
                style={{
                  background: '#F5F3FF',
                  color: '#4C1D95',
                  borderColor: '#4C1D95',
                  boxShadow: '0 2px 0 #1E1B4B',
                }}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                LET'S-A GO!
              </motion.div>
            </motion.button>
          )}
        </div>

        {/* ── Goal flag at the right edge (Mario world-clear flag) ──── */}
        <div className="absolute bottom-[18%] right-4 z-10 pointer-events-none">
          <svg width="44" height="80" viewBox="0 0 44 80">
            <rect x="20" y="6" width="3" height="74" fill="#1E1B4B" />
            <motion.path
              d="M 23 8 L 40 14 L 23 20 Z"
              fill="#A78BFA"
              stroke="#4C1D95"
              strokeWidth="1.5"
              animate={{ scaleY: [1, 0.9, 1] }}
              style={{ transformOrigin: '23px 14px' }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <circle cx="21.5" cy="6" r="3" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="1" />
            <rect x="6" y="74" width="32" height="6" fill="#4C1D95" />
          </svg>
        </div>

        {/* ── Bottom legend ─────────────────────────────────────────── */}
        <div
          className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black tracking-widest uppercase pointer-events-none border-2"
          style={{
            background: 'linear-gradient(180deg,#F5F3FF,#DDD6FE)',
            color: '#4C1D95',
            borderColor: '#4C1D95',
            boxShadow: '0 2px 0 #1E1B4B',
          }}
        >
          <Gamepad2 className="w-3 h-3" /> tap a world · press start
        </div>
      </div>


      <ZoneQuestModal
        open={!!openZone}
        onClose={() => setOpenZone(null)}
        zone={openZone}
        theme={openZone ? ZONE_THEME[openZone.id] : { gradient: '', ring: '' }}
      />
    </>
  );
};

export default AcademyQuestMap;

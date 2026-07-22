/**
 * AcademyCityMap — anime-styled top-down living Academy City.
 *
 * Anime feel:
 *   • Sunset/night sky with anime sun rays
 *   • Falling sakura petals
 *   • Twinkling stars + occasional shooting star (dark)
 *   • Animated roads with glowing traffic dots + tail trails
 *   • NPC characters walking with bob + dust puffs
 *   • Districts with pulsing aura halos + arrival ki-burst rings
 *   • Hero avatar travels along a curved path between districts
 */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, BookOpen, Mic, Headphones, PenLine } from 'lucide-react';
import { useStudentSkills } from '@/hooks/useStudentSkills';
import { cn } from '@/lib/utils';

interface Props { isDarkMode?: boolean; }

const DISTRICTS = [
  { id: 'grammar',    label: 'Grammar Tower',   x: 22, y: 32, Icon: Building2,  color: 'from-violet-500 to-indigo-600',  emoji: '🏛️' },
  { id: 'vocabulary', label: 'Vocab Market',    x: 70, y: 24, Icon: BookOpen,   color: 'from-fuchsia-500 to-pink-600',   emoji: '📚' },
  { id: 'speaking',   label: 'Speaking Stage',  x: 78, y: 70, Icon: Mic,        color: 'from-amber-500 to-orange-600',   emoji: '🎤' },
  { id: 'listening',  label: 'Sound Studio',    x: 30, y: 72, Icon: Headphones, color: 'from-cyan-500 to-blue-600',      emoji: '🎧' },
  { id: 'writing',    label: 'Writers\' Loft',  x: 50, y: 50, Icon: PenLine,    color: 'from-emerald-500 to-teal-600',   emoji: '✍️' },
];

const ROADS = DISTRICTS.filter((d) => d.id !== 'writing').map((d) => ({
  id: `r-${d.id}`, x1: 50, y1: 50, x2: d.x, y2: d.y,
}));

const NPCS = [
  { emoji: '🚶', from: 0, to: 1 },
  { emoji: '🏃', from: 1, to: 2 },
  { emoji: '🚲', from: 2, to: 3 },
  { emoji: '🧍', from: 3, to: 0 },
];

export const AcademyCityMap: React.FC<Props> = ({ isDarkMode = false }) => {
  const { skills } = useStudentSkills();
  const [active, setActive] = useState('grammar');
  const target = DISTRICTS.find((d) => d.id === active) ?? DISTRICTS[0];

  const scoreFor = (id: string) => {
    const s = skills?.find((k) => k.skill?.toLowerCase().includes(id));
    return s?.current ?? 5;
  };

  const stars = useMemo(
    () => Array.from({ length: 28 }, (_, i) => ({
      x: (i * 37) % 100, y: (i * 19) % 40, delay: (i % 5) * 0.4, size: 1 + (i % 3) * 0.5,
    })),
    [],
  );

  const petals = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      x: (i * 67) % 100,
      delay: (i * 0.6) % 5,
      duration: 8 + (i % 4),
      drift: 18 + (i % 3) * 10,
      size: 7 + (i % 3) * 3,
    })),
    [],
  );

  return (
    <div
      className={cn(
        'relative h-80 rounded-xl overflow-hidden select-none',
        isDarkMode
          ? 'bg-gradient-to-br from-[#0a0a1f] via-[#2a1147] to-[#4a1b69]'
          : 'bg-gradient-to-br from-[#ffe0b2] via-[#ffb7c5] via-[#d1c4e9] to-[#b2ebf2]',
      )}
    >
      {/* === Sun + anime rays === */}
      <div className="absolute right-3 top-2 w-24 h-24 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="-50 -50 100 100" className="w-full h-full">
            {Array.from({ length: 10 }).map((_, i) => (
              <polygon
                key={i}
                points="0,-42 1.6,-14 -1.6,-14"
                fill={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,224,178,0.55)'}
                transform={`rotate(${i * 36})`}
              />
            ))}
          </svg>
        </motion.div>
        <motion.div
          className={cn(
            'absolute inset-5 rounded-full',
            isDarkMode
              ? 'bg-gradient-to-br from-slate-100 to-slate-300 shadow-[0_0_30px_rgba(255,255,255,0.4)]'
              : 'bg-gradient-to-br from-yellow-100 via-amber-300 to-orange-500 shadow-[0_0_40px_rgba(251,146,60,0.7)]',
          )}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* === Stars / clouds === */}
      {isDarkMode
        ? stars.map((s, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
              transition={{ duration: 2.5 + s.delay, repeat: Infinity, delay: s.delay }}
            />
          ))
        : (
          <motion.div
            className="absolute inset-x-0 top-0 h-16 pointer-events-none"
            animate={{ x: ['-3%', '3%', '-3%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute top-2 left-[10%] w-16 h-5 rounded-full bg-white/85 blur-sm" />
            <div className="absolute top-6 left-[45%] w-24 h-6 rounded-full bg-pink-100/90 blur-sm" />
            <div className="absolute top-3 left-[72%] w-20 h-5 rounded-full bg-white/85 blur-sm" />
          </motion.div>
        )}

      {/* === Shooting star (dark) === */}
      {isDarkMode && (
        <motion.div
          className="absolute top-[15%] pointer-events-none"
          animate={{ left: ['-10%', '110%'] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 5, ease: 'easeIn' }}
        >
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-white to-cyan-200 shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
        </motion.div>
      )}

      {/* === Grid floor === */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-25">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10}
            stroke={isDarkMode ? '#4c1d95' : '#a78bfa'} strokeWidth="0.15" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100"
            stroke={isDarkMode ? '#4c1d95' : '#a78bfa'} strokeWidth="0.15" />
        ))}
      </svg>

      {/* === Roads === */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        {ROADS.map((r) => (
          <g key={r.id}>
            <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
              stroke={isDarkMode ? '#1e1b4b' : '#cbd5e1'} strokeWidth="2.4" strokeLinecap="round" />
            <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
              stroke={isDarkMode ? '#a78bfa' : '#fbbf24'} strokeWidth="0.4" strokeDasharray="1.2 1.2" />
          </g>
        ))}
      </svg>

      {/* === Glowing traffic dots === */}
      {ROADS.map((r, idx) => (
        <motion.span
          key={`car-${r.id}`}
          className={cn(
            'absolute w-2 h-2 rounded-full pointer-events-none',
            isDarkMode ? 'bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,1)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]',
          )}
          animate={{
            left: [`${r.x1}%`, `${r.x2}%`, `${r.x1}%`],
            top:  [`${r.y1}%`, `${r.y2}%`, `${r.y1}%`],
          }}
          transition={{ duration: 5 + idx, repeat: Infinity, ease: 'linear', delay: idx * 0.6 }}
        />
      ))}

      {/* === Ambient pulse on center === */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isDarkMode ? [0.3, 0.55, 0.3] : [0.15, 0.32, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(244,114,182,0.4), transparent 55%)' }}
      />

      {/* === Falling sakura petals === */}
      {petals.map((p, i) => (
        <motion.span
          key={`petal-${i}`}
          className="absolute pointer-events-none"
          style={{ left: `${p.x}%`, top: '-5%' }}
          animate={{
            top: ['-5%', '110%'],
            x: [0, p.drift, 0, -p.drift, 0],
            rotate: [0, 360],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'linear' }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 10 10">
            <path d="M5,1 Q7,4 5,9 Q3,4 5,1 Z" fill={isDarkMode ? '#f9a8d4' : '#ffb7c5'} opacity="0.9" />
          </svg>
        </motion.span>
      ))}

      {/* === Wandering NPCs === */}
      {NPCS.map((npc, i) => {
        const a = DISTRICTS[npc.from];
        const b = DISTRICTS[npc.to];
        return (
          <motion.span
            key={`npc-${i}`}
            className="absolute text-sm pointer-events-none"
            animate={{
              left:  [`${a.x}%`, `${b.x}%`, `${a.x}%`],
              top:   [`${a.y}%`, `${b.y}%`, `${a.y}%`],
            }}
            transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
          >
            <motion.span
              className="inline-block"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {npc.emoji}
            </motion.span>
          </motion.span>
        );
      })}

      {/* === Districts === */}
      {DISTRICTS.map((d) => {
        const score = scoreFor(d.id);
        const isActive = d.id === active;
        return (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          >
            <motion.span
              className={cn('absolute inset-0 m-auto w-16 h-16 rounded-full blur-xl bg-gradient-to-br', d.color)}
              style={{ opacity: 0.55 }}
              animate={{ scale: isActive ? [1, 1.5, 1] : [1, 1.15, 1] }}
              transition={{ duration: isActive ? 1.4 : 3, repeat: Infinity }}
            />
            <motion.div
              whileHover={{ scale: 1.18, y: -4 }}
              animate={{ scale: isActive ? 1.2 : 1, y: isActive ? -2 : 0 }}
              className={cn(
                'relative w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-xl',
                d.color,
                isActive && 'ring-2 ring-amber-300 ring-offset-2 ring-offset-transparent',
              )}
            >
              <d.Icon className="w-5 h-5" />
              <motion.span
                className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-white text-slate-900 rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow"
                animate={{ y: [0, -1.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {Math.round(score)}
              </motion.span>
              {/* arrival ki rings */}
              {isActive && (
                <>
                  <motion.span
                    className="absolute inset-0 rounded-xl border-2 border-amber-300"
                    animate={{ scale: [1, 1.7, 1], opacity: [0.9, 0, 0.9] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <motion.span
                    className="absolute inset-0 rounded-xl border border-pink-300"
                    animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                  />
                </>
              )}
            </motion.div>
            <span className={cn(
              'absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[10px] font-bold px-1.5 py-0.5 rounded',
              isDarkMode ? 'bg-black/70 text-white' : 'bg-white/90 text-slate-800',
            )}>
              {d.emoji} {d.label}
            </span>
          </button>
        );
      })}

      {/* === Player avatar with aura === */}
      <motion.div
        className="absolute pointer-events-none -translate-x-1/2 -translate-y-[180%] z-10"
        animate={{ left: `${target.x}%`, top: `${target.y}%` }}
        transition={{ type: 'spring', stiffness: 55, damping: 14 }}
      >
        <motion.div
          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-tr from-amber-300/60 via-pink-400/40 to-cyan-300/40 blur-lg"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        <motion.div
          className="relative text-2xl drop-shadow-[0_3px_4px_rgba(0,0,0,0.5)]"
          animate={{ y: [0, -5, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          🧑‍🎓
        </motion.div>
      </motion.div>

      {/* === HUD === */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs z-20">
        <span className={cn(
          'px-2.5 py-1 rounded-full font-bold backdrop-blur',
          isDarkMode ? 'bg-violet-900/80 text-violet-100 border border-violet-700' : 'bg-white/90 text-violet-900 border border-violet-300',
        )}>
          🏙️ Academy City · {isDarkMode ? 'Night' : 'Dusk'}
        </span>
        <span className="px-2.5 py-1 rounded-full font-bold bg-gradient-to-r from-pink-500 via-violet-600 to-indigo-600 text-white shadow">
          → {target.label}
        </span>
      </div>
    </div>
  );
};

export default AcademyCityMap;

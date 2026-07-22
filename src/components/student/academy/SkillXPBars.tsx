import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';

interface Skill {
  name: string;
  emoji: string;
  current: number;
  max: number;
  color: string;
  glowColor: string;
}

interface SkillXPBarsProps {
  isDarkMode?: boolean;
}

const DEFAULT_SKILLS: Skill[] = [
  {
    name: 'Slang',
    emoji: '🔥',
    current: 340,
    max: 500,
    color: '#E879F9',
    glowColor: 'rgba(232,121,249,0.4)',
  },
  {
    name: 'Grammar',
    emoji: '📚',
    current: 580,
    max: 800,
    color: '#22D3EE',
    glowColor: 'rgba(34,211,238,0.4)',
  },
  {
    name: 'Fluency',
    emoji: '🎙️',
    current: 210,
    max: 500,
    color: '#FBBF24',
    glowColor: 'rgba(251,191,36,0.4)',
  },
];

const XPBar: React.FC<{ skill: Skill; delay: number; isDarkMode: boolean }> = ({ skill, delay, isDarkMode }) => {
  const pct = Math.min(100, Math.round((skill.current / skill.max) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <span>{skill.emoji}</span>
          <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{skill.name}</span>
        </span>
        <span className="text-xs font-mono" style={{ color: skill.color }}>
          {skill.current.toLocaleString()} / {skill.max.toLocaleString()} XP
        </span>
      </div>

      <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            backgroundColor: skill.color,
            boxShadow: `0 0 8px ${skill.glowColor}`,
          }}
        />
      </div>

      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {pct}% to next level · {skill.max - skill.current} XP remaining
      </p>
    </div>
  );
};

export const SkillXPBars: React.FC<SkillXPBarsProps> = ({ isDarkMode: isDarkModeProp }) => {
  const { resolvedTheme } = useThemeMode();
  const isDarkMode = isDarkModeProp ?? (resolvedTheme === 'dark');
  
  return (
    <div className="glass-card-hub glass-academy p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" fill="currentColor" />
          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Skill XP</span>
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isDarkMode ? 'bg-purple-600/20 text-purple-300' : 'bg-purple-100 text-purple-600'
        }`}>
          Season 3
        </span>
      </div>

      {/* Bars */}
      <div className="space-y-5">
        {DEFAULT_SKILLS.map((skill, i) => (
          <XPBar key={skill.name} skill={skill} delay={0.1 + i * 0.12} isDarkMode={isDarkMode} />
        ))}
      </div>

      {/* Total XP pill */}
      <div className={`mt-5 flex items-center justify-center gap-1.5 py-2 rounded-xl ${
        isDarkMode ? 'bg-gradient-to-r from-purple-900/40 to-cyan-900/40' : 'bg-white/50'
      }`}>
        <Zap className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {(340 + 580 + 210).toLocaleString()} total XP earned
        </span>
      </div>
    </div>
  );
};

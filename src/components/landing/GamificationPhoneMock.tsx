import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useHeroTheme } from '@/contexts/HeroThemeContext';
import { Flame, Trophy, Sparkles } from 'lucide-react';

/**
 * Flat phone-frame mockup — respects the Flat 2.0 anti-3D constraint.
 * Shows a sample student UI with a claymorphic "Grammar Wizard" badge,
 * a 23-day streak counter, and an XP bar that fills on scroll-in.
 */
export function GamificationPhoneMock() {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { theme } = useHeroTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });

  return (
    <div ref={ref} className="relative mx-auto" style={{ width: 280 }}>
      {/* Floating background blob */}
      <div
        className="absolute -inset-6 rounded-[44px] blur-3xl opacity-30"
        style={{ background: `radial-gradient(circle, ${theme.cssFrom}40, transparent 70%)` }}
      />

      {/* Phone frame */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className={`relative rounded-[36px] p-3 ${
          isDark
            ? 'bg-[#1A1A22] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
            : 'bg-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.25)]'
        }`}
      >
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl z-20" />

        {/* Screen */}
        <div className={`relative rounded-[28px] overflow-hidden aspect-[9/17] ${
          isDark ? 'bg-[#0B0B10]' : 'bg-gradient-to-b from-slate-50 to-white'
        }`}>
          {/* Status bar spacer */}
          <div className="h-8" />

          <div className="px-5 py-4 space-y-4">
            {/* Greeting */}
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {t('lp.game.mock.greeting')}
              </p>
              <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Hi, Alex 👋
              </p>
            </div>

            {/* Streak card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="rounded-2xl p-3.5 flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${theme.cssFrom}, ${theme.cssTo})`,
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold opacity-90">
                  {t('lp.game.streakLabel')}
                </p>
                <p className="text-white text-xl font-extrabold leading-tight">
                  23 <span className="text-xs font-medium opacity-80">{t('lp.game.daysShort')}</span>
                </p>
              </div>
            </motion.div>

            {/* Badge sticker — claymorphic flat */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.35, duration: 0.4 }}
              className={`rounded-2xl p-3 flex items-center gap-3 ${
                isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-slate-100 shadow-sm'
              }`}
            >
              {/* Claymorphic badge */}
              <div
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(145deg, #fef08a, #f59e0b)',
                  boxShadow: 'inset -2px -2px 4px rgba(180,83,9,0.4), inset 2px 2px 4px rgba(254,240,138,0.6)',
                }}
              >
                <Trophy className="w-6 h-6 text-amber-900" fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('lp.game.mock.badgeName')}
                </p>
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t('lp.game.mock.badgeUnlocked')}
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </motion.div>

            {/* XP bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('lp.game.xpLabel')}
                </span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  1,840 / 2,500
                </span>
              </div>
              <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${theme.cssFrom}, ${theme.cssTo})` }}
                  initial={{ width: '0%' }}
                  animate={inView ? { width: '74%' } : { width: '0%' }}
                  transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
                />
              </div>
              <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('lp.game.mock.xpHint')}
              </p>
            </motion.div>

            {/* Mini lesson tile */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.4 }}
              className={`rounded-2xl p-3 ${
                isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-50 border border-slate-100'
              }`}
            >
              <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {t('lp.game.mock.upNext')}
              </p>
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('lp.game.mock.nextLesson')}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Floating side ornaments */}
      <motion.div
        className="absolute -end-3 top-20 px-2.5 py-1.5 rounded-xl shadow-lg backdrop-blur-md text-[10px] font-bold flex items-center gap-1.5"
        style={{ background: theme.cssTo, color: 'white' }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        +50 XP
      </motion.div>
    </div>
  );
}

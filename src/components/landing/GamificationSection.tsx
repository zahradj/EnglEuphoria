import { motion } from 'framer-motion';
import { Trophy, Flame, Target, MessageCircle } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'react-i18next';
import { GamificationPhoneMock } from './GamificationPhoneMock';

export function GamificationSection() {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { t } = useTranslation();

  const gamificationCards = [
    {
      icon: Trophy,
      title: t('lp.game.badges.title'),
      description: t('lp.game.badges.desc'),
      accentDark: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      accentLight: 'text-amber-600 bg-amber-50 border-amber-200',
      glowDark: 'group-hover:shadow-[0_0_40px_rgba(251,191,36,0.15)]',
      floatDelay: 0,
    },
    {
      icon: Flame,
      title: t('lp.game.streaks.title'),
      description: t('lp.game.streaks.desc'),
      accentDark: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      accentLight: 'text-orange-600 bg-orange-50 border-orange-200',
      glowDark: 'group-hover:shadow-[0_0_40px_rgba(251,146,60,0.15)]',
      floatDelay: 0.3,
    },
    {
      icon: Target,
      title: t('lp.game.goals.title'),
      description: t('lp.game.goals.desc'),
      accentDark: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      accentLight: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      glowDark: 'group-hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]',
      floatDelay: 0.6,
    },
    {
      icon: MessageCircle,
      title: t('lp.game.challenges.title'),
      description: t('lp.game.challenges.desc'),
      accentDark: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      accentLight: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      glowDark: 'group-hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]',
      floatDelay: 0.9,
    },
  ];

  return (
    <section
      className={`py-20 md:py-28 relative transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-[#FAFAFA]'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className={`inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full ${
              isDark
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                : 'text-amber-600 bg-amber-50 border border-amber-200'
            }`}
          >
            {t('lp.game.eyebrow')}
          </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('lp.game.heading')}
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('lp.game.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {gamificationCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`group relative flex flex-col items-center text-center p-6 rounded-2xl backdrop-blur-xl transition-all duration-500 ${
                    isDark
                      ? `bg-white/5 border border-white/10 hover:border-white/20 ${card.glowDark}`
                      : 'bg-white border border-slate-200/60 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:border-slate-300'
                  }`}
                >
                  <motion.div
                    className={`p-3.5 rounded-xl mb-4 border ${isDark ? card.accentDark : card.accentLight}`}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: card.floatDelay }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <h3 className={`font-semibold text-base mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {card.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {card.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Phone mock — desktop only to keep mobile clean */}
          <div className="hidden lg:block">
            <GamificationPhoneMock />
          </div>
        </div>
      </div>
    </section>
  );
}

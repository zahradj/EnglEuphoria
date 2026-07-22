import { motion } from 'framer-motion';
import { Heart, GraduationCap, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useHeroTheme } from '@/contexts/HeroThemeContext';

/**
 * Interactive audience selector under the hero headline.
 * Maps to the 3 hub themes: Parent → kids (Playground), Student → teen (Academy), Pro → adult (Hub).
 * Selecting a tab pauses auto-rotation (sessionStorage flag) and re-themes the entire hero.
 */
const TABS = [
  { id: 'parent', icon: Heart, themeIdx: 0 },
  { id: 'student', icon: GraduationCap, themeIdx: 1 },
  { id: 'pro', icon: Briefcase, themeIdx: 2 },
] as const;

export function HeroAudienceSelector() {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { activeIndex, setActiveIndex } = useHeroTheme();

  const handleSelect = (themeIdx: number) => {
    try { sessionStorage.setItem('heroAutoRotatePaused', '1'); } catch {}
    setActiveIndex(themeIdx);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="mb-6 sm:mb-8"
    >
      <p className={`text-xs font-semibold uppercase tracking-widest mb-2.5 ${
        isDark ? 'text-slate-500' : 'text-slate-400'
      }`}>
        {t('lp.hero.who.label')}
      </p>
      <div
        role="tablist"
        aria-label={t('lp.hero.who.label')}
        className={`relative inline-flex p-1.5 rounded-2xl backdrop-blur-xl ${
          isDark
            ? 'bg-white/[0.04] border border-white/[0.08]'
            : 'bg-white/80 border border-slate-200/70 shadow-sm'
        }`}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeIndex === tab.themeIdx;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => handleSelect(tab.themeIdx)}
              className={`relative z-10 inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                active
                  ? 'text-white'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="audience-pill"
                  className="absolute inset-0 rounded-xl shadow-lg"
                  style={{
                    backgroundImage: `linear-gradient(135deg, var(--hero-from, #6366F1), var(--hero-to, #A855F7))`,
                  }}
                  transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                />
              )}
              <Icon className="relative w-4 h-4" />
              <span className="relative">{t(`lp.hero.who.${tab.id}`)}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

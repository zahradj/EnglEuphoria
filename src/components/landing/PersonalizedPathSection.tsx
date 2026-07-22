import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass, BookOpen, MessageCircle, GraduationCap } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'react-i18next';
import { SkillRadarChart } from './SkillRadarChart';

export function PersonalizedPathSection() {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const milestones = [
    {
      icon: Compass,
      step: '01',
      title: t('lp.path.m1.title'),
      description: t('lp.path.m1.desc'),
      accentDark: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30',
      accentLight: 'from-indigo-50 to-violet-50 border-indigo-200',
      iconColorDark: 'text-indigo-400',
      iconColorLight: 'text-indigo-600',
    },
    {
      icon: BookOpen,
      step: '02',
      title: t('lp.path.m2.title'),
      description: t('lp.path.m2.desc'),
      accentDark: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      accentLight: 'from-emerald-50 to-teal-50 border-emerald-200',
      iconColorDark: 'text-emerald-400',
      iconColorLight: 'text-emerald-600',
    },
    {
      icon: MessageCircle,
      step: '03',
      title: t('lp.path.m3.title'),
      description: t('lp.path.m3.desc'),
      accentDark: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      accentLight: 'from-amber-50 to-orange-50 border-amber-200',
      iconColorDark: 'text-amber-400',
      iconColorLight: 'text-amber-600',
    },
    {
      icon: GraduationCap,
      step: '04',
      title: t('lp.path.m4.title'),
      description: t('lp.path.m4.desc'),
      accentDark: 'from-rose-500/20 to-pink-500/20 border-rose-500/30',
      accentLight: 'from-rose-50 to-pink-50 border-rose-200',
      iconColorDark: 'text-rose-400',
      iconColorLight: 'text-rose-600',
    },
  ];

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 0.8', 'end 0.6'] });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className={`py-20 md:py-28 relative overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#09090B]' : 'bg-[#FAFAFA]'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className={`inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full ${
              isDark
                ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                : 'text-indigo-600 bg-indigo-50 border border-indigo-200'
            }`}
          >
            {t('lp.path.eyebrow')}
          </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('lp.path.heading')}
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('lp.path.subtitle')}
          </p>
        </motion.div>

        {/* Skill Tracker preview — radar chart with cycling profiles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className={`max-w-5xl mx-auto mb-20 rounded-3xl p-6 md:p-10 ${
            isDark
              ? 'bg-white/[0.03] border border-white/[0.06]'
              : 'bg-white border border-slate-100 shadow-[0_8px_32px_rgba(15,23,42,0.04)]'
          }`}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className={`inline-block text-[11px] font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full ${
                isDark ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
              }`}>
                {t('lp.skills.eyebrow')}
              </span>
              <h3 className={`text-2xl md:text-3xl font-extrabold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('lp.skills.heading')}
              </h3>
              <p className={`text-base leading-relaxed mb-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('lp.skills.desc')}
              </p>
              <ul className="space-y-2.5">
                {(['speaking','listening','reading','writing','vocabulary','grammar'] as const).map((s) => (
                  <li key={s} className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
                    {t(`lp.skills.${s}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <SkillRadarChart size={320} />
            </div>
          </div>
        </motion.div>
        <div className="hidden lg:block relative">
          <div className="absolute top-[72px] start-[10%] end-[10%] h-1">
            <svg viewBox="0 0 800 40" preserveAspectRatio="none" className="w-full h-10 overflow-visible">
              <motion.path
                d="M 0 20 C 100 0, 200 40, 400 20 C 600 0, 700 40, 800 20"
                fill="none"
                stroke={isDark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.25)'}
                strokeWidth="3"
                strokeLinecap="round"
                style={{ pathLength }}
              />
            </svg>
          </div>

          <div className="grid grid-cols-4 gap-8 relative z-10">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <motion.div
                  key={milestone.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`w-[88px] h-[88px] rounded-2xl bg-gradient-to-br border flex items-center justify-center mb-5 backdrop-blur-xl ${
                      isDark ? milestone.accentDark : milestone.accentLight
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${isDark ? milestone.iconColorDark : milestone.iconColorLight}`} />
                  </motion.div>
                  <span className={`text-xs font-bold tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t('lp.path.step')} {milestone.step}
                  </span>
                  <h3 className={`font-semibold text-lg mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {milestone.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {milestone.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile / Tablet: Vertical path */}
        <div className="lg:hidden relative">
          <div
            className={`absolute start-6 top-0 bottom-0 w-0.5 ${
              isDark
                ? 'bg-gradient-to-b from-indigo-500/40 via-emerald-500/40 to-rose-500/40'
                : 'bg-gradient-to-b from-indigo-300 via-emerald-300 to-rose-300'
            }`}
          />
          <div className="space-y-10">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <motion.div
                  key={milestone.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-5 ps-14 relative"
                >
                  <div
                    className={`absolute start-3 top-2 w-7 h-7 rounded-full bg-gradient-to-br border flex items-center justify-center ${
                      isDark ? milestone.accentDark : milestone.accentLight
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isDark ? milestone.iconColorDark : milestone.iconColorLight}`} />
                  </div>
                  <div>
                    <span className={`text-xs font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t('lp.path.step')} {milestone.step}
                    </span>
                    <h3 className={`font-semibold text-base mt-0.5 mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {milestone.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

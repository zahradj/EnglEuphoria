import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, BookOpen, Target, Trophy, Headphones, MessageCircle, BarChart3 } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useHeroTheme } from '@/contexts/HeroThemeContext';
import { useTranslation } from 'react-i18next';

/* ── Animated Skill Rings ── */
function useSkillData() {
  const { t } = useTranslation();
  return [
    { label: t('lp.bento.skill.speaking'), value: 85, color: '#6366F1' },
    { label: t('lp.bento.skill.listening'), value: 72, color: '#A855F7' },
    { label: t('lp.bento.skill.reading'), value: 90, color: '#10B981' },
    { label: t('lp.bento.skill.writing'), value: 68, color: '#F59E0B' },
    { label: t('lp.bento.skill.vocab'), value: 80, color: '#EC4899' },
  ];
}

function SkillRings({ isDark }: { isDark: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const skillData = useSkillData();
  const { t } = useTranslation();
  const size = 180;
  const center = size / 2;
  const ringWidth = 8;
  const gap = 4;

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {skillData.map((skill, i) => {
          const r = center - (ringWidth + gap) * i - ringWidth / 2 - 8;
          const circumference = 2 * Math.PI * r;
          const offset = circumference - (circumference * (isInView ? skill.value : 0)) / 100;

          return (
            <g key={skill.label}>
              <circle
                cx={center} cy={center} r={r}
                fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                strokeWidth={ringWidth}
              />
              <motion.circle
                cx={center} cy={center} r={r}
                fill="none"
                stroke={skill.color}
                strokeWidth={ringWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, delay: 0.15 * i, ease: 'easeOut' }}
                style={{ filter: `drop-shadow(0 0 6px ${skill.color}40)` }}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          79%
        </motion.span>
        <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {t('lp.bento.skill.overall')}
        </span>
      </div>
    </div>
  );
}

function SkillLegend({ isDark }: { isDark: boolean }) {
  const skillData = useSkillData();
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
      {skillData.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</span>
          <span className={`text-xs font-bold ms-auto ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.value}%</span>
        </div>
      ))}
    </div>
  );
}

/* ── Cursor Glow ── */
function useCursorGlow(isDark: boolean) {
  const [glow, setGlow] = useState({ x: 0, y: 0, visible: false });
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlow({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
  }, []);
  const onMouseLeave = useCallback(() => setGlow((p) => ({ ...p, visible: false })), []);
  const glowStyle: React.CSSProperties = {
    position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
    opacity: glow.visible ? 1 : 0, transition: 'opacity 0.3s ease',
    background: `radial-gradient(280px circle at ${glow.x}px ${glow.y}px, ${isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)'}, transparent 70%)`,
  };
  return { onMouseMove, onMouseLeave, glowStyle };
}

const teacherAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } } };

/* ── Section ── */
export function BentoGridSection() {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { theme } = useHeroTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  const features = [
    { icon: Target, title: t('lp.bento.feature.adaptive.title'), desc: t('lp.bento.feature.adaptive.desc'), iconBg: 'bg-violet-500/10 text-violet-500' },
    { icon: Headphones, title: t('lp.bento.feature.audio.title'), desc: t('lp.bento.feature.audio.desc'), iconBg: 'bg-cyan-500/10 text-cyan-500' },
    { icon: BookOpen, title: t('lp.bento.feature.cefr.title'), desc: t('lp.bento.feature.cefr.desc'), iconBg: 'bg-amber-500/10 text-amber-500' },
    { icon: Trophy, title: t('lp.bento.feature.gamified.title'), desc: t('lp.bento.feature.gamified.desc'), iconBg: 'bg-emerald-500/10 text-emerald-500' },
  ];

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const parallaxSlow = useTransform(scrollYProgress, [0, 1], [0, -12]);

  const glows = [useCursorGlow(isDark), useCursorGlow(isDark), useCursorGlow(isDark), useCursorGlow(isDark), useCursorGlow(isDark), useCursorGlow(isDark)];

  const cardBase = `backdrop-blur-xl rounded-[24px] relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${
    isDark
      ? 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15]'
      : 'bg-white/80 border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-xl'
  }`;

  return (
    <section ref={sectionRef} id="features" className={`relative py-28 px-6 md:px-12 lg:px-24 overflow-hidden scroll-mt-20 transition-colors duration-300 ${
      isDark ? 'bg-[#09090B]' : 'bg-[#FAFAFA]'
    }`}>
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: theme.cssFrom, opacity: isDark ? 0.07 : 0.04 }} />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: theme.cssTo, opacity: isDark ? 0.07 : 0.04 }} />

      <div className="relative max-w-7xl mx-auto">
        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 transition-all duration-700"
            style={{ background: `linear-gradient(to right, ${theme.cssFrom}15, ${theme.cssTo}15)`, color: theme.cssFrom, border: `1px solid ${theme.cssFrom}30` }}
          >
            <Zap className="w-3.5 h-3.5" />
            {t('lp.bento.eyebrow')}
          </motion.div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('lp.bento.heading')}{' '}
            <span className="bg-clip-text text-transparent transition-all duration-700" style={{ backgroundImage: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})` }}>
              {t('lp.bento.headingAccent')}
            </span>?
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('lp.bento.subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-6 gap-5 auto-rows-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* ── Card 1: Skill Rings (large) ── */}
          <motion.div
            className={`${cardBase} md:col-span-2 md:row-span-2 p-8`}
            variants={itemVariants}
            onMouseMove={glows[0].onMouseMove}
            onMouseLeave={glows[0].onMouseLeave}
          >
            <div style={glows[0].glowStyle} />
            <div className="relative z-[1]">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('lp.bento.skill.title')}
                </h3>
              </div>
              <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('lp.bento.skill.desc')}
              </p>
              <SkillRings isDark={isDark} />
              <SkillLegend isDark={isDark} />
            </div>
          </motion.div>

          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className={`${cardBase} md:col-span-2 p-6`}
              variants={itemVariants}
              onMouseMove={glows[i + 1].onMouseMove}
              onMouseLeave={glows[i + 1].onMouseLeave}
            >
              <div style={glows[i + 1].glowStyle} />
              <div className="relative z-[1]">
                <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center mb-4`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{f.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* Mentors */}
          <motion.div
            className={`${cardBase} md:col-span-2 p-8 flex flex-col items-center justify-center text-center`}
            variants={itemVariants}
            onMouseMove={glows[5].onMouseMove}
            onMouseLeave={glows[5].onMouseLeave}
          >
            <div style={glows[5].glowStyle} />
            <div className="relative z-[1]">
              <div className="flex -space-x-3 mb-5 justify-center">
                {teacherAvatars.map((src, i) => (
                  <motion.img
                    key={i} src={src} alt="Teacher"
                    className={`w-12 h-12 rounded-full border-2 object-cover grayscale hover:grayscale-0 transition-all duration-500 ${isDark ? 'border-[#09090B]' : 'border-[#FAFAFA]'}`}
                    initial={{ x: -10, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  />
                ))}
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isDark ? 'border-[#09090B] bg-amber-500/20 text-amber-400' : 'border-[#FAFAFA] bg-amber-50 text-amber-600'}`}>
                  +50
                </div>
              </div>
              <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('lp.bento.mentors.title')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('lp.bento.mentors.desc')}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom CTA Banner */}
        <motion.div
          className="mt-8 rounded-[24px] p-8 md:p-10 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500"
          style={{ background: `linear-gradient(135deg, ${theme.cssFrom}, ${theme.cssTo})`, y: parallaxSlow }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px]" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] bg-white/10" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {t('lp.bento.cta.heading')}
              </h3>
              <p className="text-white/70">{t('lp.bento.cta.subtitle')}</p>
            </div>
            <Link
              to="/student-signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-2xl text-slate-900 font-bold text-lg hover:bg-slate-100 transition-colors shadow-xl group/btn shrink-0"
            >
              {t('lp.bento.cta.button')}
              <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

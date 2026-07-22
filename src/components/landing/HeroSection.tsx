import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Play, ArrowRight, Globe, Users, Award, CheckCircle2 } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'react-i18next';
import heroKid from '@/assets/hero-kid.png';
import heroTeen from '@/assets/hero-teen.png';
import heroAdult from '@/assets/hero-adult.png';
import { useHeroTheme } from '@/contexts/HeroThemeContext';
import { HeroAudienceSelector } from './HeroAudienceSelector';

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return { ref, count };
}

const GROUP_THEMES = [
  {
    id: 'kids',
    label: 'The Playground',
    ageLabel: 'Kids 5–12',
    tagline: 'Learn Through Play!',
    src: heroKid,
    alt: 'Happy child learning English on tablet',
    gradient: 'from-[#FF9F1C] to-[#FFBF00]',
    gradientHover: 'hover:from-[#FFB340] hover:to-[#FFD040]',
    shadow: 'shadow-[#FF9F1C]/25 hover:shadow-[#FF9F1C]/35',
    glowColor: 'bg-[#FF9F1C]',
    glowColorAlt: 'bg-[#FFBF00]',
    dotActive: 'bg-[#FF9F1C]',
    iconBg: { dark: 'bg-[#FF9F1C]/15', light: 'bg-orange-50' },
    iconColor: { dark: 'text-[#FF9F1C]', light: 'text-orange-600' },
    accentText: { dark: 'text-[#FF9F1C]', light: 'text-orange-600' },
    badgeBg: { dark: 'bg-[#FF9F1C]/10 border-[#FF9F1C]/20 text-[#FFBF00]', light: 'bg-orange-50 border-orange-200 text-orange-700' },
    chipBg: 'bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-white',
  },
  {
    id: 'teen',
    label: 'The Academy',
    ageLabel: 'Teens 13–17',
    tagline: 'Level Up Your English!',
    src: heroTeen,
    alt: 'Confident teenager learning English with laptop',
    gradient: 'from-[#6366F1] to-[#A855F7]',
    gradientHover: 'hover:from-[#7578F3] hover:to-[#B96AF8]',
    shadow: 'shadow-[#6366F1]/25 hover:shadow-[#6366F1]/35',
    glowColor: 'bg-[#6366F1]',
    glowColorAlt: 'bg-[#A855F7]',
    dotActive: 'bg-[#6366F1]',
    iconBg: { dark: 'bg-[#6366F1]/15', light: 'bg-indigo-50' },
    iconColor: { dark: 'text-[#6366F1]', light: 'text-indigo-600' },
    accentText: { dark: 'text-[#A855F7]', light: 'text-indigo-600' },
    badgeBg: { dark: 'bg-[#6366F1]/10 border-[#6366F1]/20 text-[#A855F7]', light: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    chipBg: 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white',
  },
  {
    id: 'adult',
    label: 'The Hub',
    ageLabel: 'Adults 18+',
    tagline: 'Professional Growth Starts Here.',
    src: heroAdult,
    alt: 'Professional adult learning Business English',
    gradient: 'from-[#10B981] to-[#059669]',
    gradientHover: 'hover:from-[#34D399] hover:to-[#10B981]',
    shadow: 'shadow-[#10B981]/25 hover:shadow-[#10B981]/35',
    glowColor: 'bg-[#10B981]',
    glowColorAlt: 'bg-[#059669]',
    dotActive: 'bg-[#10B981]',
    iconBg: { dark: 'bg-[#10B981]/15', light: 'bg-emerald-50' },
    iconColor: { dark: 'text-[#10B981]', light: 'text-emerald-600' },
    accentText: { dark: 'text-[#10B981]', light: 'text-emerald-600' },
    badgeBg: { dark: 'bg-[#10B981]/10 border-[#10B981]/20 text-[#34D399]', light: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    chipBg: 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white',
  },
];

export function HeroSection() {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const sectionRef = useRef<HTMLElement>(null);
  const { activeIndex: activeImage, setActiveIndex: setActiveImage } = useHeroTheme();
  const theme = GROUP_THEMES[activeImage];
  const { t } = useTranslation();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const students = useCountUp(2500);
  const countries = useCountUp(45);
  const lessons = useCountUp(50000);

  useEffect(() => {
    // Pause auto-rotation if the user has already chosen an audience this session.
    const interval = setInterval(() => {
      try {
        if (sessionStorage.getItem('heroAutoRotatePaused') === '1') return;
      } catch {}
      setActiveImage((prev) => (prev + 1) % GROUP_THEMES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Per-audience subheadline override (falls back to generic).
  const subKey = `lp.hero.subFor.${theme.id}`;
  const tSub = t(subKey);
  const subline = tSub === subKey ? t('lp.hero.subheadline') : tSub;

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-[100svh] md:min-h-dvh flex items-center overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#09090B]' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30'
      }`}
    >
      {/* Decorative glows — desktop only (perf + flat 2.0 on mobile) */}
      <div
        className={`hidden md:block absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[120px] transition-colors duration-700 ${theme.glowColor} ${
          isDark ? 'opacity-[0.08]' : 'opacity-[0.06]'
        }`}
      />
      <div
        className={`hidden md:block absolute top-20 right-20 w-72 h-72 rounded-full blur-[100px] transition-colors duration-700 ${theme.glowColorAlt} ${
          isDark ? 'opacity-[0.06]' : 'opacity-[0.05]'
        }`}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-12 sm:py-28 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-center min-h-[auto] lg:min-h-[85vh]">

          {/* Left: Content — second on mobile (image first), first on desktop */}
          <div className="order-2 lg:order-1">

            {/* Headline with dynamic gradient accent */}
            <motion.h1
              className={`text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-4 sm:mb-6 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              {t('lp.hero.headline')}
              <br />
              <span className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent transition-all duration-700`}>
                {theme.tagline}
              </span>
            </motion.h1>

            {/* Audience selector — drives the entire hero theme */}
            <HeroAudienceSelector />

            {/* Subheadline — switches per audience */}
            <AnimatePresence mode="wait">
              <motion.p
                key={subline}
                className={`text-base sm:text-xl leading-relaxed mb-6 sm:mb-8 max-w-lg ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                {subline}
              </motion.p>
            </AnimatePresence>

            {/* CTA Buttons — gradient matches active group */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Link
                to="/student-signup"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r ${theme.gradient} ${theme.gradientHover} text-white font-bold text-base sm:text-lg shadow-xl ${theme.shadow} transition-all duration-500 hover:-translate-y-0.5`}
              >
                {t('lp.hero.ctaPrimary')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <Play className="w-5 h-5" />
                {t('lp.hero.ctaSecondary')}
              </button>
            </motion.div>

            {/* Stats Row — icons colored per group */}
            <motion.div
              className="flex flex-wrap gap-4 sm:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              {[
                { ref: students.ref, count: students.count, suffix: '+', label: t('lp.hero.statsStudents'), icon: Users },
                { ref: countries.ref, count: countries.count, suffix: '+', label: t('lp.hero.statsCountries'), icon: Globe },
                { ref: lessons.ref, count: lessons.count, suffix: '+', label: t('lp.hero.statsLessons'), icon: Award },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-700 ${
                    isDark ? theme.iconBg.dark : theme.iconBg.light
                  }`}>
                    <stat.icon className={`w-5 h-5 transition-colors duration-700 ${isDark ? theme.iconColor.dark : theme.iconColor.light}`} />
                  </div>
                  <div>
                    <span ref={stat.ref} className={`text-lg sm:text-2xl font-extrabold block leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {stat.count.toLocaleString()}{stat.suffix}
                    </span>
                    <span className={`text-[10px] sm:text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Hero Image — first on mobile (sits right under the logo), right column on desktop */}
          <motion.div
            className="order-1 lg:order-2 relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ y: bgY }}
          >
            <div className="relative mx-auto max-w-xs sm:max-w-lg lg:max-w-none">
              {/* Colored glow behind image */}
              <div
                className={`absolute inset-0 rounded-full blur-[80px] transition-colors duration-700 ${theme.glowColor} ${
                  isDark ? 'opacity-[0.15]' : 'opacity-[0.12]'
                }`}
                style={{ top: '10%', bottom: '10%', left: '10%', right: '10%' }}
              />

              {/* Image container — no heavy overlay, object-contain for transparent PNGs */}
              <div className="relative aspect-[4/3] sm:aspect-[4/5] flex items-end justify-center max-h-[35vh] sm:max-h-[50vh] lg:max-h-none">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={theme.src}
                    alt={theme.alt}
                    className="relative z-[2] w-full h-full object-contain drop-shadow-2xl"
                    loading="eager"
                    decoding="async"
                    // @ts-expect-error fetchpriority is a valid HTML attr not yet in React types
                    fetchpriority="high"
                    width={800}
                    height={1024}
                    initial={{ opacity: 0, scale: 1.05, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.6 }}
                  />
                </AnimatePresence>
              </div>

              {/* Group label chip — positioned lower so it's not hidden behind CTAs */}
              <motion.div
                className={`absolute top-1/2 right-4 z-10 px-4 py-1.5 rounded-full text-sm font-bold ${theme.chipBg} shadow-lg`}
                key={`chip-${activeImage}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {theme.ageLabel}
              </motion.div>

              {/* Image selector dots — active dot colored per group */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {GROUP_THEMES.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      i === activeImage
                        ? `w-8 ${g.dotActive}`
                        : `w-2.5 ${isDark ? 'bg-white/30 hover:bg-white/50' : 'bg-slate-300 hover:bg-slate-400'}`
                    }`}
                    aria-label={`Show ${g.label}`}
                  />
                ))}
              </div>


              {/* Floating card — Free Trial */}
              <motion.div
                className={`hidden sm:block absolute -right-4 bottom-20 lg:-right-12 backdrop-blur-xl rounded-2xl px-5 py-4 z-10 ${
                  isDark
                    ? 'bg-slate-900/80 border border-white/10 shadow-xl'
                    : 'bg-white/90 border border-slate-200/60 shadow-xl shadow-slate-200/50'
                }`}
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center transition-all duration-700`}>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('lp.hero.freeTrial')}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('lp.hero.noCard')}</p>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full" preserveAspectRatio="none">
          <path
            d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80 Z"
            fill={isDark ? '#0F172A' : '#FAFAFA'}
          />
        </svg>
      </div>
    </section>
  );
}

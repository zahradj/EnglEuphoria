import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useHeroTheme, GROUP_THEMES } from '@/contexts/HeroThemeContext';
import heroKid from '@/assets/hero-kid.png';
import heroTeen from '@/assets/hero-teen.png';
import heroAdult from '@/assets/hero-adult.png';
import { useEffect } from 'react';

const HERO_IMAGES = [heroKid, heroTeen, heroAdult];

const TeacherHero = () => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { activeIndex, setActiveIndex, theme } = useHeroTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % GROUP_THEMES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [setActiveIndex]);

  return (
    <section className={`relative min-h-[90vh] flex items-center overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#09090B]' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30'
    }`}>
      {/* Decorative glows */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px] transition-all duration-700"
        style={{ backgroundColor: theme.cssFrom, opacity: isDark ? 0.08 : 0.06 }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full blur-[100px] transition-all duration-700"
        style={{ backgroundColor: theme.cssTo, opacity: isDark ? 0.06 : 0.04 }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border transition-colors duration-300 ${
                isDark
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm font-medium">Join Our Team</span>
            </motion.div>

            <motion.h1
              className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Inspire the
              <br />
              <span
                className="bg-clip-text text-transparent transition-all duration-700"
                style={{ backgroundImage: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})` }}
              >
                Next Generation.
              </span>
            </motion.h1>

            <motion.p
              className={`text-xl leading-relaxed mb-10 max-w-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Teach kids, teens, and adults worldwide. Enjoy flexible hours,
              competitive pay, and premium resources — all from home.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all duration-700 hover:shadow-2xl hover:-translate-y-0.5"
                style={{ background: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})` }}
              >
                Apply Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>

          {/* Right: Character carousel */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative mx-auto max-w-md lg:max-w-lg">
              <motion.div
                className="absolute inset-0 rounded-full blur-[100px] transition-all duration-700"
                style={{
                  background: `radial-gradient(circle, ${theme.cssFrom}${isDark ? '30' : '20'} 0%, transparent 70%)`,
                  inset: '5%',
                }}
              />

              <div className="relative aspect-[3/4] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className="absolute w-[70%] h-[70%] rounded-full blur-[60px] transition-all duration-700"
                      style={{
                        background: `radial-gradient(circle, ${theme.cssFrom}${isDark ? '25' : '18'} 0%, ${theme.cssTo}${isDark ? '10' : '08'} 50%, transparent 70%)`,
                      }}
                    />
                    <motion.img
                      src={HERO_IMAGES[activeIndex]}
                      alt={GROUP_THEMES[activeIndex].label}
                      className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Label */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`lbl-${activeIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center z-20"
                  >
                    <span
                      className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${theme.cssFrom}, ${theme.cssTo})` }}
                    >
                      {GROUP_THEMES[activeIndex].label}
                    </span>
                    <span className={`block text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {GROUP_THEMES[activeIndex].ageLabel}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Thumbnails */}
              <div className="flex items-center justify-center gap-4 mt-4">
                {GROUP_THEMES.map((g, i) => (
                  <button key={i} onClick={() => setActiveIndex(i)} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                        i === activeIndex ? 'scale-110 shadow-lg' : `scale-90 opacity-50 ${isDark ? 'border-white/10' : 'border-slate-200'}`
                      }`}
                      style={{
                        borderColor: i === activeIndex ? g.cssFrom : undefined,
                        boxShadow: i === activeIndex ? `0 0 20px ${g.cssFrom}40` : undefined,
                      }}
                    >
                      <img src={HERO_IMAGES[i]} alt={g.label} className="w-full h-full object-cover object-top" />
                    </div>
                    <div
                      className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-6' : 'w-2'}`}
                      style={{ backgroundColor: i === activeIndex ? g.cssFrom : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full" preserveAspectRatio="none">
          <path d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80 Z" fill={isDark ? '#0F172A' : '#FAFAFA'} />
        </svg>
      </div>
    </section>
  );
};

export default TeacherHero;

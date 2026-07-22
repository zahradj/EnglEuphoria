import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Target, Users, Globe } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useRef, useState, useEffect } from 'react';
import { useInView } from 'framer-motion';
import { useHeroTheme, GROUP_THEMES } from '@/contexts/HeroThemeContext';
import heroKid from '@/assets/hero-kid.png';
import heroTeen from '@/assets/hero-teen.png';
import heroAdult from '@/assets/hero-adult.png';

const HERO_IMAGES = [heroKid, heroTeen, heroAdult];

const GROUP_META = [
  { label: 'The Playground', ageLabel: 'Kids 5–12', cssFrom: '#FF9F1C', cssTo: '#FFBF00' },
  { label: 'The Academy', ageLabel: 'Teens 13–17', cssFrom: '#6366F1', cssTo: '#A855F7' },
  { label: 'The Hub', ageLabel: 'Adults 18+', cssFrom: '#10B981', cssTo: '#059669' },
];

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

const MissionHeader = () => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const sectionRef = useRef<HTMLElement>(null);
  const { activeIndex, setActiveIndex, theme } = useHeroTheme();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const founded = useCountUp(2020);
  const countries = useCountUp(45);
  const students = useCountUp(2500);

  // Auto-rotate synced with global context
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % GROUP_THEMES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [setActiveIndex]);

  const meta = GROUP_META[activeIndex];

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-dvh flex items-center overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#09090B]' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30'
      }`}
    >
      {/* Decorative glows */}
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[120px] transition-all duration-700"
        style={{
          backgroundColor: meta.cssFrom,
          opacity: isDark ? 0.08 : 0.06,
        }}
      />
      <div
        className="absolute top-20 right-20 w-72 h-72 rounded-full blur-[100px] transition-all duration-700"
        style={{
          backgroundColor: meta.cssTo,
          opacity: isDark ? 0.06 : 0.04,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[85vh]">

          {/* Left: Content */}
          <div className="order-2 lg:order-1">
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
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Our Story</span>
            </motion.div>

            <motion.h1
              className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Learning,
              <br />
              <span
                className="bg-clip-text text-transparent transition-all duration-700"
                style={{
                  backgroundImage: `linear-gradient(to right, ${meta.cssFrom}, ${meta.cssTo})`,
                }}
              >
                Reimagined.
              </span>
            </motion.h1>

            <motion.p
              className={`text-xl leading-relaxed mb-8 max-w-lg ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Engleuphoria isn't just a school. It's three distinct worlds 
              designed to meet you exactly where you are.
            </motion.p>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {[
                { ref: founded.ref, count: founded.count, suffix: '', label: 'Founded', icon: Target },
                { ref: countries.ref, count: countries.count, suffix: '+', label: 'Countries', icon: Globe },
                { ref: students.ref, count: students.count, suffix: '+', label: 'Students', icon: Users },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    isDark ? 'bg-white/5' : 'bg-slate-100'
                  }`}>
                    <stat.icon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <span ref={stat.ref} className={`text-2xl font-extrabold block leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {stat.count.toLocaleString()}{stat.suffix}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Hero character carousel */}
          <motion.div
            className="order-1 lg:order-2 relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ y: bgY }}
          >
            <div className="relative mx-auto max-w-md lg:max-w-lg">
              {/* Large radial glow behind active character */}
              <motion.div
                className="absolute inset-0 rounded-full blur-[100px] transition-all duration-700"
                style={{
                  background: `radial-gradient(circle, ${meta.cssFrom}${isDark ? '30' : '20'} 0%, transparent 70%)`,
                  top: '5%',
                  bottom: '5%',
                  left: '5%',
                  right: '5%',
                }}
              />

              {/* Character images with crossfade */}
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
                    {/* Colored ring glow */}
                    <div
                      className="absolute w-[70%] h-[70%] rounded-full blur-[60px] transition-all duration-700"
                      style={{
                        background: `radial-gradient(circle, ${meta.cssFrom}${isDark ? '25' : '18'} 0%, ${meta.cssTo}${isDark ? '10' : '08'} 50%, transparent 70%)`,
                      }}
                    />
                    <motion.img
                      src={HERO_IMAGES[activeIndex]}
                      alt={meta.label}
                      className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Label overlay */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`label-${activeIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center z-20"
                  >
                    <span
                      className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${meta.cssFrom}, ${meta.cssTo})`,
                      }}
                    >
                      {meta.label}
                    </span>
                    <span className={`block text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {meta.ageLabel}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mini avatar thumbnails + dots */}
              <div className="flex items-center justify-center gap-4 mt-4">
                {GROUP_META.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                        i === activeIndex
                          ? 'scale-110 shadow-lg'
                          : `scale-90 opacity-50 ${isDark ? 'border-white/10' : 'border-slate-200'}`
                      }`}
                      style={{
                        borderColor: i === activeIndex ? g.cssFrom : undefined,
                        boxShadow: i === activeIndex ? `0 0 20px ${g.cssFrom}40` : undefined,
                      }}
                    >
                      <img
                        src={HERO_IMAGES[i]}
                        alt={g.label}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === activeIndex ? 'w-6' : 'w-2'
                      }`}
                      style={{
                        backgroundColor: i === activeIndex ? g.cssFrom : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                      }}
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
          <path
            d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80 Z"
            fill={isDark ? '#0F172A' : '#FAFAFA'}
          />
        </svg>
      </div>
    </section>
  );
};

export default MissionHeader;

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorTrail } from '@/components/landing/CursorTrail';
import { useHeroTheme, GROUP_THEMES } from '@/contexts/HeroThemeContext';
import { ThemeModeToggle } from '@/components/ui/ThemeModeToggle';
import logoBlack from '@/assets/logo-black.png';
import logoWhite from '@/assets/logo-white.png';
import { useThemeMode } from '@/hooks/useThemeMode';
import heroKid from '@/assets/hero-kid.png';
import heroTeen from '@/assets/hero-teen.png';
import heroAdult from '@/assets/hero-adult.png';

const HERO_IMAGES = [heroKid, heroTeen, heroAdult];
const TAGLINES = [
  'Where kids discover the joy of English!',
  'Level up your English, level up your future.',
  'Professional English for the real world.',
];

interface AuthPageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'teacher' | 'student';
  backLink?: { to: string; label: string };
  showProgress?: React.ReactNode;
}

export function AuthPageLayout({
  children,
  title,
  subtitle,
  icon: Icon,
  variant = 'default',
  backLink = { to: '/', label: 'Back to Home' },
  showProgress,
}: AuthPageLayoutProps) {
  const { activeIndex, setActiveIndex, theme } = useHeroTheme();
  const { resolvedTheme } = useThemeMode();

  // Auto-rotate demographics
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, [setActiveIndex]);

  return (
    <div className="relative min-h-dvh flex flex-col lg:flex-row bg-white dark:bg-[#09090B] transition-colors duration-300">
      <CursorTrail />
      {/* ── Left Panel: Branding & Hero Carousel — compact on mobile ── */}
      <div className="relative lg:w-[48%] flex flex-col items-center justify-center overflow-hidden px-6 py-6 lg:p-12">
        {/* Ambient radial glows */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: `radial-gradient(circle at 50% 40%, ${theme.cssFrom}22 0%, transparent 70%), radial-gradient(circle at 30% 80%, ${theme.cssTo}18 0%, transparent 60%)`,
          }}
          transition={{ duration: 1 }}
        />

        {/* Floating decorative dots — hidden on mobile */}
        <motion.div
          className="hidden lg:block absolute top-16 right-16 w-3 h-3 rounded-full opacity-40"
          style={{ backgroundColor: theme.cssFrom }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="hidden lg:block absolute bottom-24 left-12 w-2 h-2 rounded-full opacity-30"
          style={{ backgroundColor: theme.cssTo }}
          animate={{ y: [0, 10, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5 mb-4 lg:mb-12">
          <motion.div
            className="w-9 h-9 rounded-xl p-0.5 flex items-center justify-center"
            animate={{
              background: `linear-gradient(135deg, ${theme.cssFrom}, ${theme.cssTo})`,
            }}
            transition={{ duration: 0.8 }}
            style={{
              background: `linear-gradient(135deg, ${theme.cssFrom}, ${theme.cssTo})`,
            }}
          >
            <img src={resolvedTheme === 'dark' ? logoBlack : logoWhite} alt="EnglEuphoria" className="w-full h-full object-contain rounded-[10px]" />
          </motion.div>
          <motion.span
            className="text-xl font-bold bg-clip-text text-transparent"
            animate={{
              backgroundImage: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})`,
            }}
            transition={{ duration: 0.8 }}
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})`,
              WebkitBackgroundClip: 'text',
            }}
          >
            EnglEuphoria
          </motion.span>
        </Link>

        {/* Character Image Carousel — smaller on mobile */}
        <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 lg:w-72 lg:h-72 mb-3 lg:mb-6">
          {/* Glow ring behind character */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl opacity-30"
            animate={{
              background: `radial-gradient(circle, ${theme.cssFrom}66, ${theme.cssTo}33, transparent)`,
            }}
            transition={{ duration: 0.8 }}
          />
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              src={HERO_IMAGES[activeIndex]}
              alt={GROUP_THEMES[activeIndex].label}
              className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -6, 0],
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 },
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          </AnimatePresence>
        </div>

        {/* Tagline — hidden on very small screens */}
        <AnimatePresence mode="wait">
          <motion.p
            key={activeIndex}
            className="relative z-10 text-center text-sm lg:text-lg font-medium text-foreground/80 max-w-xs hidden sm:block"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {TAGLINES[activeIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Mini avatar selectors */}
        <div className="relative z-10 flex items-center gap-3 mt-3 lg:mt-6">
          {HERO_IMAGES.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-10 h-10 lg:w-12 lg:h-12 ring-2 scale-110'
                  : 'w-7 h-7 lg:w-9 lg:h-9 opacity-50 hover:opacity-80 hover:scale-105'
              }`}
              style={{
                ['--tw-ring-color' as string]: i === activeIndex ? theme.cssFrom : undefined,
                borderColor: i === activeIndex ? theme.cssFrom : 'transparent',
              }}
            >
              <img
                src={img}
                alt={GROUP_THEMES[i].label}
                className="w-full h-full object-contain rounded-full"
              />
              {i === activeIndex && (
                <motion.div
                  layoutId="auth-avatar-ring"
                  className="absolute -inset-0.5 rounded-full border-2"
                  style={{ borderColor: theme.cssFrom }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right Panel: Auth Form ── */}
      <div className="relative flex-1 flex flex-col">
        {/* Top bar — hidden on mobile (logo already visible) */}
        <div className="hidden lg:flex items-center justify-end p-4 sm:p-6">
          <ThemeModeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted" />
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            {showProgress && <div className="mb-4">{showProgress}</div>}

            {/* Card */}
            <div className="relative bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/40 rounded-2xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
              {/* Top border glow synced with theme */}
              <motion.div
                className="absolute top-0 left-8 right-8 h-px"
                animate={{
                  background: `linear-gradient(to right, transparent, ${theme.cssFrom}80, ${theme.cssTo}80, transparent)`,
                }}
                transition={{ duration: 0.8 }}
              />

              {/* Header */}
              <div className="text-center mb-6">
                {Icon && (
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5, delay: 0.1 }}
                      className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${theme.cssFrom}, ${theme.cssTo})`,
                      }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>
                  </div>
                )}
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})`,
                  }}
                >
                  {title}
                </motion.h1>
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground mt-2 text-sm"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>

              {/* Form Content */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                {children}
              </motion.div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground/60 mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

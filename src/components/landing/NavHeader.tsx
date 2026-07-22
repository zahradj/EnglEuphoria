import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, GraduationCap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeModeToggle } from '@/components/ui/ThemeModeToggle';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useHeroTheme } from '@/contexts/HeroThemeContext';
import { useTranslation } from 'react-i18next';
import logoBlack from '@/assets/logo-black.png';
import logoWhite from '@/assets/logo-white.png';

export function NavHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { theme } = useHeroTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: t('lp.nav.howItWorks'), id: 'how-it-works' },
    { label: t('lp.nav.pricing'), id: 'pricing' },
  ];

  const navLinks = [
    { label: t('lp.nav.aboutUs'), to: '/about' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo — color synced with hero */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9">
                <div
                  className="absolute inset-0 rounded-xl opacity-80 group-hover:opacity-100 transition-all duration-700 blur-[1px]"
                  style={{ background: `linear-gradient(135deg, ${theme.cssFrom}, ${theme.cssTo})` }}
                />
                <img
                  src={isDark ? logoBlack : logoWhite}
                  alt="EnglEuphoria"
                  className="relative w-9 h-9 object-contain rounded-xl p-0.5"
                />
              </div>
              <span
                className="text-xl font-bold bg-clip-text text-transparent transition-all duration-700"
                style={{ backgroundImage: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})` }}
              >
                EnglEuphoria
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-white/5'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-white/5'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/for-teachers"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                {t('lp.nav.teachWithUs')}
              </Link>
            </nav>

            {/* Desktop Right — CTA synced with hero */}
            <div className="hidden lg:flex items-center gap-3">
              <div className={isDark
                ? '[&_button]:text-white/70 [&_button]:hover:text-white [&_button]:hover:bg-white/10 [&_button]:border-white/20'
                : '[&_button]:text-slate-500 [&_button]:hover:text-slate-900 [&_button]:hover:bg-slate-100 [&_button]:border-slate-200'
              }>
                <LanguageSwitcher />
              </div>
              <ThemeModeToggle className={isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} />
              <Link to="/login">
                <Button variant="ghost" className={`text-sm font-medium ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}>
                  {t('lp.nav.logIn')}
                </Button>
              </Link>
              <Link to="/student-signup">
                <Button
                  className={`text-white font-semibold px-6 shadow-lg rounded-xl transition-all duration-700 bg-gradient-to-r ${theme.gradient} ${theme.shadow}`}
                >
                  {t('lp.nav.getStarted')}
                </Button>
              </Link>
            </div>

            {/* Mobile Right — keep Language + CTA visible, collapse rest */}
            <div className="lg:hidden flex items-center gap-2">
              <div className={`scale-90 origin-right ${isDark
                ? '[&_button]:text-white/80 [&_button]:hover:text-white [&_button]:hover:bg-white/10 [&_button]:border-white/20'
                : '[&_button]:text-slate-600 [&_button]:hover:text-slate-900 [&_button]:hover:bg-slate-100 [&_button]:border-slate-200'
              }`}>
                <LanguageSwitcher />
              </div>
              <Link to="/student-signup" className="hidden sm:block">
                <Button
                  size="sm"
                  className={`text-white font-semibold text-xs px-3 py-2 h-9 shadow-md rounded-xl transition-all duration-700 bg-gradient-to-r ${theme.gradient} ${theme.shadow}`}
                >
                  {t('lp.nav.getStarted')}
                </Button>
              </Link>
              <button
                className={`p-2 rounded-lg ${isDark ? 'text-white/80 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 lg:hidden ${
                isDark ? 'bg-[#09090B] border-l border-white/10' : 'bg-white border-l border-slate-200'
              }`}
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-10">
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('lp.nav.menu')}</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-2 rounded-xl ${isDark ? 'text-white/60 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex-1 space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-left font-medium transition-colors ${
                        isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </button>
                  ))}
                  {navLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-left font-medium transition-colors ${
                        isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </Link>
                  ))}
                  <Link
                    to="/for-teachers"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-left font-medium transition-colors ${
                      isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      {t('lp.nav.teachWithUs')}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </Link>
                </nav>

                <div className={`space-y-3 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between px-4 mb-3">
                    <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('lp.nav.language')}</span>
                    <LanguageSwitcher />
                  </div>
                  <div className="flex items-center justify-between px-4 mb-3">
                    <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('lp.nav.theme')}</span>
                    <ThemeModeToggle className={isDark ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-slate-900'} />
                  </div>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <Button variant="outline" className={`w-full ${
                      isDark ? 'border-white/20 text-white' : 'border-slate-200 text-slate-700'
                    }`}>
                      {t('lp.nav.logIn')}
                    </Button>
                  </Link>
                  <Link to="/student-signup" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <Button className={`w-full text-white font-semibold transition-all duration-700 bg-gradient-to-r ${theme.gradient}`}>
                      {t('lp.nav.getStarted')}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

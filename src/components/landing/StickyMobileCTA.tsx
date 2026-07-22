import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useHeroTheme } from '@/contexts/HeroThemeContext';

/**
 * Sticky bottom CTA — visible on mobile only.
 * Appears after the user scrolls past the hero so it never blocks the
 * primary in-hero CTA, and slides away on the final CTA / footer.
 */
export function StickyMobileCTA() {
  const { t } = useTranslation();
  const { theme } = useHeroTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      // Show after first viewport, hide near footer (last ~700px)
      const past = y > vh * 0.6;
      const nearEnd = y + vh > docH - 700;
      setVisible(past && !nearEnd);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 240 }}
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 pointer-events-none"
        >
          <div className="pointer-events-auto mx-auto max-w-md backdrop-blur-xl bg-white/85 dark:bg-[#0B0B10]/85 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.18)] p-2">
            <Link
              to="/student-signup"
              className={`flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl text-white font-bold text-base bg-gradient-to-r ${theme.gradient} ${theme.shadow} shadow-lg active:scale-[0.98] transition-transform`}
            >
              {t('lp.nav.getStarted')}
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

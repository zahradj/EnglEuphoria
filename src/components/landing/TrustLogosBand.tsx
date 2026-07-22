import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '@/hooks/useThemeMode';
import { ShieldCheck, Lock, Languages, CreditCard, Accessibility } from 'lucide-react';

/**
 * Slim grayscale trust band shown directly under the hero.
 * Uses inline icon-and-text "badges" — no third-party logo licensing exposure.
 * Marquee on mobile, static centered row on desktop.
 */
const BADGES = [
  { icon: Languages, label: 'CEFR Aligned' },
  { icon: CreditCard, label: 'Powered by Stripe' },
  { icon: ShieldCheck, label: 'GDPR Compliant' },
  { icon: Accessibility, label: 'WCAG 2.1 AA' },
  { icon: Lock, label: 'SSL Encrypted' },
];

export function TrustLogosBand() {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';

  // Doubled list for seamless marquee loop
  const marquee = [...BADGES, ...BADGES];

  return (
    <section
      aria-label={t('lp.trust.standards')}
      className={`py-8 border-y transition-colors duration-300 ${
        isDark
          ? 'bg-[#0B0B10] border-white/[0.04]'
          : 'bg-white border-slate-100'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <p className={`text-center text-[11px] font-semibold uppercase tracking-[0.2em] mb-5 ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {t('lp.trust.standards')}
        </p>

        {/* Mobile marquee */}
        <div className="md:hidden relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
          >
            {marquee.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={`${b.label}-${i}`}
                  className={`inline-flex items-center gap-2 shrink-0 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-wide">{b.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Desktop static row */}
        <div className="hidden md:flex items-center justify-center gap-10 lg:gap-14 flex-wrap">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.label}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`group inline-flex items-center gap-2 transition-colors duration-300 ${
                  isDark
                    ? 'text-slate-500 hover:text-indigo-300'
                    : 'text-slate-400 hover:text-indigo-600'
                }`}
              >
                <Icon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-[-4deg]" />
                <span className="text-sm font-semibold tracking-wide">{b.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

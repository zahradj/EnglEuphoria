import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SUPPORTED = ['en', 'es', 'ar', 'fr', 'tr', 'it'] as const;
type Lang = typeof SUPPORTED[number];

const SUGGEST_COPY: Record<Lang, { msg: string; cta: string }> = {
  en: { msg: 'Prefer English?', cta: 'Switch language' },
  es: { msg: '¿Prefieres español?', cta: 'Cambiar idioma' },
  ar: { msg: 'هل تفضل العربية؟', cta: 'تغيير اللغة' },
  fr: { msg: 'Préférez-vous le français ?', cta: 'Changer de langue' },
  tr: { msg: 'Türkçe tercih eder misiniz?', cta: 'Dili değiştir' },
  it: { msg: 'Preferisci l’italiano?', cta: 'Cambia lingua' },
};

const LANG_NAME: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  fr: 'Français',
  tr: 'Türkçe',
  it: 'Italiano',
};

const STORAGE_KEY = 'autoLangToastDismissed';

export function AutoLanguageToast() {
  const { i18n } = useTranslation();
  const [suggested, setSuggested] = useState<Lang | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    // If user already chose a language explicitly (stored), skip.
    if (localStorage.getItem('i18nextLng-userpicked')) return;

    const browser = (navigator.language || 'en').split('-')[0].toLowerCase() as Lang;
    const current = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0].toLowerCase() as Lang;
    if (SUPPORTED.includes(browser) && browser !== current) {
      const t = setTimeout(() => setSuggested(browser), 2500);
      return () => clearTimeout(t);
    }
  }, [i18n]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setSuggested(null);
  };

  const accept = () => {
    if (!suggested) return;
    localStorage.setItem('i18nextLng-userpicked', '1');
    localStorage.setItem(STORAGE_KEY, '1');
    i18n.changeLanguage(suggested);
    setSuggested(null);
  };

  return (
    <AnimatePresence>
      {suggested && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-24 lg:bottom-6 w-[min(92vw,420px)]"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#0F0F14] border border-slate-200 dark:border-white/10 shadow-2xl p-3 pe-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {SUGGEST_COPY[suggested].msg}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {LANG_NAME[suggested]}
              </p>
            </div>
            <button
              onClick={accept}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:opacity-95 active:scale-95 transition"
            >
              {SUGGEST_COPY[suggested].cta}
            </button>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { englishTranslations } from '@/translations/english';
import { spanishTranslations } from '@/translations/spanish';
import { arabicTranslations } from '@/translations/arabic';
import { frenchTranslations } from '@/translations/french';
import { turkishTranslations } from '@/translations/turkish';
import { italianTranslations } from '@/translations/italian';

const resources = {
  en: { translation: englishTranslations },
  es: { translation: spanishTranslations },
  ar: { translation: arabicTranslations },
  fr: { translation: frenchTranslations },
  tr: { translation: turkishTranslations },
  it: { translation: italianTranslations },
};

const RTL_LANGS = new Set(['ar']);

/**
 * Sync <html dir> and <html lang> with the active language so RTL flips
 * happen instantly on first load AND on every switch — no click required.
 */
const applyDirection = (lng: string | undefined) => {
  if (typeof document === 'undefined') return;
  const root = lng ? lng.split('-')[0].toLowerCase() : 'en';
  const dir = RTL_LANGS.has(root) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = root;
  // Provide a global hook for RTL-only CSS overrides if needed.
  document.documentElement.classList.toggle('rtl', dir === 'rtl');
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'ar', 'fr', 'tr', 'it'],
    // Map regional variants (ar-SA, ar-DZ, fr-CA, es-MX, …) to root codes
    // so the detector resolves to one of our 6 core dictionaries.
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    detection: {
      // localStorage (returning user) → browser navigator (first visit) → <html lang>
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  .then(() => {
    // Apply direction on initial load using the auto-detected language.
    applyDirection(i18n.resolvedLanguage || i18n.language);
  });

// Re-apply direction on every subsequent language change (switcher, etc.).
i18n.on('languageChanged', (lng) => {
  applyDirection(lng);
});

export default i18n;

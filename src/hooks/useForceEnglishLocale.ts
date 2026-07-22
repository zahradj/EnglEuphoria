import React from 'react';
import i18n from '@/lib/i18n';

/**
 * Force the surface to render in English (LTR) regardless of the user's
 * chosen platform language. Restores both the previous language and the
 * previous document direction on unmount.
 *
 * Applied to: Content Creator, all Hub Creators (Playground/Academy/Success),
 * lesson surfaces, teacher dashboard, and classroom surfaces — per project
 * rule: "all hub creators and lessons should be in English" and to prevent
 * RTL flipping of authoring/teaching/lesson UI.
 */
export const useForceEnglishLocale = () => {
  React.useEffect(() => {
    const previousLang = i18n.language;
    const html = typeof document !== 'undefined' ? document.documentElement : null;
    const previousDir = html?.dir ?? 'ltr';
    const previousHtmlLang = html?.lang ?? 'en';
    const hadRtlClass = html?.classList.contains('rtl') ?? false;

    if (previousLang && !previousLang.toLowerCase().startsWith('en')) {
      void i18n.changeLanguage('en');
    }
    // Force LTR direction immediately — independent of i18n — so layout
    // does not flip even if language change is async or skipped.
    if (html) {
      html.dir = 'ltr';
      html.lang = 'en';
      html.classList.remove('rtl');
    }

    return () => {
      if (previousLang && previousLang !== i18n.language) {
        void i18n.changeLanguage(previousLang);
      }
      if (html) {
        html.dir = previousDir;
        html.lang = previousHtmlLang;
        if (hadRtlClass) html.classList.add('rtl');
      }
    };
  }, []);
};

export default useForceEnglishLocale;

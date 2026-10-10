/**
 * Which language does a visitor see?  The order, strongest first:
 *   1. a language they chose themselves (language menu, profile, onboarding) — remembered here;
 * 2. the language of their region (URL prefix → saved region → geo-IP → browser language, see marketRegion.ts);
 *   3. English — the main language, and the fallback for any place we have no translation for.
 * The region never overrides step 1: a student in Algeria who picks English keeps English.
 */

const PICKED_KEY = 'i18nextLng-userpicked';

/** Languages written right-to-left. */
export const RTL_LANGS = new Set(['ar']);

export const rootLang = (lng: string | undefined | null): string => (lng || 'en').split('-')[0].toLowerCase();

export const dirFor = (lng: string | undefined | null): 'ltr' | 'rtl' => (RTL_LANGS.has(rootLang(lng)) ? 'rtl' : 'ltr');

export function markLanguagePicked(): void {
  try { localStorage.setItem(PICKED_KEY, '1'); } catch { /* private mode */ }
}

export function clearLanguagePicked(): void {
  try { localStorage.removeItem(PICKED_KEY); } catch { /* private mode */ }
}

export function hasPickedLanguage(): boolean {
  try { return !!localStorage.getItem(PICKED_KEY); } catch { return false; }
}

import { describe, it, expect } from 'vitest';
import { studentScreensTranslations as en } from './english/studentScreens';
import { studentScreensTranslations as ar } from './arabic/studentScreens';
import { studentScreensTranslations as es } from './spanish/studentScreens';
import { studentScreensTranslations as fr } from './french/studentScreens';
import { studentScreensTranslations as tr } from './turkish/studentScreens';
import { studentScreensTranslations as it_ } from './italian/studentScreens';
import { englishTranslations } from './english';
import { arabicTranslations } from './arabic';
import { spanishTranslations } from './spanish';
import { frenchTranslations } from './french';
import { turkishTranslations } from './turkish';
import { italianTranslations } from './italian';

const LANGS: Record<string, Record<string, string>> = { ar, es, fr, tr, it: it_ };
const tokens = (s: string) => (s.match(/\{\{\s*\w+\s*\}\}/g) ?? []).map((t) => t.replace(/\s/g, '')).sort().join(',');

describe('daily student-dashboard screens are translated in every language', () => {
  for (const [code, dict] of Object.entries(LANGS)) {
    it(`${code}: every English key, filled in, same {{placeholders}}`, () => {
      const missing = Object.keys(en).filter((k) => !dict[k] || !dict[k].trim());
      const extra = Object.keys(dict).filter((k) => !(k in en));
      const badTokens = Object.keys(en).filter((k) => dict[k] && tokens(dict[k]) !== tokens((en as Record<string, string>)[k]));
      expect({ missing, extra, badTokens }).toEqual({ missing: [], extra: [], badTokens: [] });
    });
  }
  it('is wired into every language dictionary', () => {
    for (const [name, dict] of Object.entries({ en: englishTranslations, ar: arabicTranslations, es: spanishTranslations, fr: frenchTranslations, tr: turkishTranslations, it: italianTranslations })) {
      expect((dict as Record<string, unknown>)['st.credit.buyMore'], name).toBeTruthy();
    }
  });
});

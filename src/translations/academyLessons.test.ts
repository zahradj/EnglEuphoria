import { describe, it, expect } from 'vitest';
import { academyLessonsTranslations as en } from './english/academyLessons';
import { academyLessonsTranslations as ar } from './arabic/academyLessons';
import { academyLessonsTranslations as es } from './spanish/academyLessons';
import { academyLessonsTranslations as fr } from './french/academyLessons';
import { academyLessonsTranslations as tr } from './turkish/academyLessons';
import { academyLessonsTranslations as it_ } from './italian/academyLessons';
import { englishTranslations } from './english';
import { arabicTranslations } from './arabic';
import { spanishTranslations } from './spanish';
import { frenchTranslations } from './french';
import { turkishTranslations } from './turkish';
import { italianTranslations } from './italian';

// The Academy My Lessons tab (buy packs) is translated into every language the app offers.
const LANGS: Record<string, Record<string, string>> = { ar, es, fr, tr, it: it_ };
const tokens = (s: string) => (s.match(/\{\{\s*\w+\s*\}\}/g) ?? []).map((t) => t.replace(/\s/g, '')).sort().join(',');

describe('Academy My Lessons tab is translated in every language', () => {
  for (const [code, dict] of Object.entries(LANGS)) {
    it(`${code}: every English key, filled in, same {{placeholders}}`, () => {
      const missing = Object.keys(en).filter((k) => !dict[k] || !dict[k].trim());
      const extra = Object.keys(dict).filter((k) => !(k in en));
      const badTokens = Object.keys(en).filter((k) => dict[k] && tokens(dict[k]) !== tokens((en as Record<string, string>)[k]));
      expect({ missing, extra, badTokens }).toEqual({ missing: [], extra: [], badTokens: [] });
    });
  }

  it('is wired into every language dictionary', () => {
    for (const [name, dict] of Object.entries({
      en: englishTranslations, ar: arabicTranslations, es: spanishTranslations,
      fr: frenchTranslations, tr: turkishTranslations, it: italianTranslations,
    })) {
      expect((dict as Record<string, unknown>)['pk.buyFor'], name).toBeTruthy();
    }
  });
});

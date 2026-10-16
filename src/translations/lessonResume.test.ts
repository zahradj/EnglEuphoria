import { describe, it, expect } from 'vitest';
import { lessonResumeTranslations as en } from './english/lessonResume';
import { lessonResumeTranslations as ar } from './arabic/lessonResume';
import { lessonResumeTranslations as es } from './spanish/lessonResume';
import { lessonResumeTranslations as fr } from './french/lessonResume';
import { lessonResumeTranslations as tr } from './turkish/lessonResume';
import { lessonResumeTranslations as it_ } from './italian/lessonResume';
import { englishTranslations } from './english';
import { arabicTranslations } from './arabic';
import { spanishTranslations } from './spanish';
import { frenchTranslations } from './french';
import { turkishTranslations } from './turkish';
import { italianTranslations } from './italian';

const LANGS: Record<string, Record<string, string>> = { ar, es, fr, tr, it: it_ };
const tokens = (s: string) => (s.match(/\{\{\s*\w+\s*\}\}/g) ?? []).map((t) => t.replace(/\s/g, '')).sort().join(',');

describe('"continue where I stopped" is translated in every language', () => {
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
      expect((dict as Record<string, unknown>)['lr.continue'], name).toBeTruthy();
    }
  });
});

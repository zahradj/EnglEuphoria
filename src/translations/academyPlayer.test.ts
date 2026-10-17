import { describe, it, expect } from 'vitest';
import { academyPlayerTranslations as en } from './english/academyPlayer';
import { academyPlayerTranslations as ar } from './arabic/academyPlayer';
import { academyPlayerTranslations as es } from './spanish/academyPlayer';
import { academyPlayerTranslations as fr } from './french/academyPlayer';
import { academyPlayerTranslations as tr } from './turkish/academyPlayer';
import { academyPlayerTranslations as it_ } from './italian/academyPlayer';
import { englishTranslations } from './english';
import { arabicTranslations } from './arabic';
import { spanishTranslations } from './spanish';
import { frenchTranslations } from './french';
import { turkishTranslations } from './turkish';
import { italianTranslations } from './italian';

// The Academy player v2 chrome is translated into every language the app offers (owner rule: every page is translated).
const LANGS: Record<string, Record<string, string>> = { ar, es, fr, tr, it: it_ };
const tokens = (s: string) => (s.match(/\{\{\s*\w+\s*\}\}/g) ?? []).map((t) => t.replace(/\s/g, '')).sort().join(',');

describe('Academy player chrome is translated in every language', () => {
  for (const [code, dict] of Object.entries(LANGS)) {
    it(`${code}: every English key, filled in, same {{placeholders}}`, () => {
      const missing = Object.keys(en).filter((k) => !dict[k] || !dict[k].trim());
      const extra = Object.keys(dict).filter((k) => !(k in en));
      const bad = Object.keys(en).filter((k) => dict[k] && tokens(dict[k]) !== tokens((en as Record<string, string>)[k]));
      expect({ missing, extra, bad }).toEqual({ missing: [], extra: [], bad: [] });
    });
  }
  it('is wired into every language dictionary', () => {
    for (const [name, dict] of Object.entries({ en: englishTranslations, ar: arabicTranslations, es: spanishTranslations, fr: frenchTranslations, tr: turkishTranslations, it: italianTranslations })) {
      expect((dict as Record<string, unknown>)['ap.chapter'], name).toBeTruthy();
    }
  });
});

import { describe, it, expect } from 'vitest';
import { classroomMediaTranslations as en } from './english/classroomMedia';
import { classroomMediaTranslations as ar } from './arabic/classroomMedia';
import { classroomMediaTranslations as es } from './spanish/classroomMedia';
import { classroomMediaTranslations as fr } from './french/classroomMedia';
import { classroomMediaTranslations as tr } from './turkish/classroomMedia';
import { classroomMediaTranslations as it_ } from './italian/classroomMedia';
import { englishTranslations } from './english';
import { arabicTranslations } from './arabic';
import { spanishTranslations } from './spanish';
import { frenchTranslations } from './french';
import { turkishTranslations } from './turkish';
import { italianTranslations } from './italian';

const LANGS: Record<string, Record<string, string>> = { ar, es, fr, tr, it: it_ };
const tokens = (s: string) => (s.match(/\{\{\s*\w+\s*\}\}/g) ?? []).map((t) => t.replace(/\s/g, '')).sort().join(',');

describe('live-class camera messages are translated in every language', () => {
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
      expect((dict as Record<string, unknown>)['cm.camera.retry'], name).toBeTruthy();
    }
  });
});

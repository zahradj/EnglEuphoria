import { describe, it, expect } from 'vitest';
import { waitingRoomTranslations as en } from './english/waitingRoom';
import { waitingRoomTranslations as ar } from './arabic/waitingRoom';
import { waitingRoomTranslations as es } from './spanish/waitingRoom';
import { waitingRoomTranslations as fr } from './french/waitingRoom';
import { waitingRoomTranslations as tr } from './turkish/waitingRoom';
import { waitingRoomTranslations as it_ } from './italian/waitingRoom';
import { englishTranslations } from './english';
import { arabicTranslations } from './arabic';
import { spanishTranslations } from './spanish';
import { frenchTranslations } from './french';
import { turkishTranslations } from './turkish';
import { italianTranslations } from './italian';

// The waiting room (device check before class) is translated into every language the app offers
// (English is the source and the fallback). A new key must come with all six translations.
const LANGS: Record<string, Record<string, string>> = { ar, es, fr, tr, it: it_ };
const tokens = (s: string) => (s.match(/\{\{\s*\w+\s*\}\}/g) ?? []).map((t) => t.replace(/\s/g, '')).sort().join(',');

describe('the waiting room is translated in every language', () => {
  for (const [code, dict] of Object.entries(LANGS)) {
    it(`${code}: has every English key, filled in, with the same {{placeholders}}`, () => {
      const missing = Object.keys(en).filter((k) => !dict[k] || !dict[k].trim());
      const extra = Object.keys(dict).filter((k) => !(k in en));
      const badTokens = Object.keys(en).filter((k) => dict[k] && tokens(dict[k]) !== tokens((en as Record<string, string>)[k]));
      expect({ missing, extra, badTokens }).toEqual({ missing: [], extra: [], badTokens: [] });
    });
  }

  it('every language dictionary actually includes the waiting-room keys (wired into its index)', () => {
    for (const [name, dict] of Object.entries({
      en: englishTranslations, ar: arabicTranslations, es: spanishTranslations,
      fr: frenchTranslations, tr: turkishTranslations, it: italianTranslations,
    })) {
      expect((dict as Record<string, unknown>)['wr.join'], name).toBeTruthy();
    }
  });

  it('non-English text really differs from English (no copy-pasted English)', () => {
    for (const [code, dict] of Object.entries(LANGS)) {
      const same = Object.keys(en).filter((k) => dict[k] === (en as Record<string, string>)[k]);
      // Brand-ish or universal strings may match; most must not.
      expect(same.length, `${code}: ${same.join(', ')}`).toBeLessThan(10);
    }
  });
});

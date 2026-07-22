import { englishTranslations } from './english';
import { spanishTranslations } from './spanish';
import { arabicTranslations } from './arabic';
import { frenchTranslations } from './french';
import { turkishTranslations } from './turkish';
import { italianTranslations } from './italian';

export type TranslationKey = keyof typeof englishTranslations;

export const translations = {
  english: englishTranslations,
  spanish: spanishTranslations,
  arabic: arabicTranslations,
  french: frenchTranslations,
  turkish: turkishTranslations,
  italian: italianTranslations,
};

export type LanguageOption = keyof typeof translations;

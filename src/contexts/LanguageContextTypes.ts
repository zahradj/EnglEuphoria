
import { ReactNode } from 'react';
import { LanguageOption } from '../translations';

// We're not using TranslationKey anymore as it's causing typing issues
// with the dynamic nature of our translations
export type TranslationValues = Record<string, any>;

export type LanguageContextType = {
  language: LanguageOption;
  languageText: TranslationValues;
  setLanguage: (language: LanguageOption) => void;
};

export interface LanguageProviderProps {
  children: ReactNode;
}

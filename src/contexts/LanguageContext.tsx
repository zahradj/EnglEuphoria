import { createContext, useState, useContext, useEffect, useCallback, ReactNode } from "react";
import { translations, LanguageOption } from "../translations";
import { LanguageContextType, LanguageProviderProps } from "./LanguageContextTypes";
import i18n from "@/lib/i18n";

const i18nToOption: Record<string, LanguageOption> = {
  en: "english",
  es: "spanish",
  ar: "arabic",
  fr: "french",
  tr: "turkish",
  it: "italian",
};

const optionToI18n: Record<LanguageOption, string> = {
  english: "en",
  spanish: "es",
  arabic: "ar",
  french: "fr",
  turkish: "tr",
  italian: "it",
};

const getLanguageOption = (lng: string): LanguageOption =>
  i18nToOption[lng?.substring(0, 2)] || "english";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<LanguageOption>(
    getLanguageOption(i18n.language)
  );

  useEffect(() => {
    const handler = (lng: string) => setLanguageState(getLanguageOption(lng));
    i18n.on("languageChanged", handler);
    return () => { i18n.off("languageChanged", handler); };
  }, []);

  const setLanguage = useCallback((opt: LanguageOption) => {
    setLanguageState(opt);
    i18n.changeLanguage(optionToI18n[opt]);
  }, []);

  const value = {
    language,
    languageText: translations[language],
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import i18n from '@/lib/i18n';
import { useTranslation } from 'react-i18next';

export type LanguageCode = 'en' | 'es' | 'ar' | 'fr' | 'tr' | 'it';

const LANGUAGES: { code: LanguageCode; flag: string; nativeName: string; englishName: string }[] = [
  { code: 'en', flag: '🇬🇧', nativeName: 'English', englishName: 'English' },
  { code: 'es', flag: '🇪🇸', nativeName: 'Español', englishName: 'Spanish' },
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français', englishName: 'French' },
  { code: 'ar', flag: '🇸🇦', nativeName: 'العربية', englishName: 'Arabic' },
  { code: 'tr', flag: '🇹🇷', nativeName: 'Türkçe', englishName: 'Turkish' },
  { code: 'it', flag: '🇮🇹', nativeName: 'Italiano', englishName: 'Italian' },
];

interface LanguageStepProps {
  initial?: LanguageCode;
  onComplete: (lang: LanguageCode) => void | Promise<void>;
  isSaving?: boolean;
}

export const LanguageStep: React.FC<LanguageStepProps> = ({ initial, onComplete, isSaving }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<LanguageCode>(
    initial || ((i18n.language?.substring(0, 2) as LanguageCode) ?? 'en')
  );

  const handleSelect = (code: LanguageCode) => {
    setSelected(code);
    // Live preview — switch the UI immediately
    i18n.changeLanguage(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Globe className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('sd.lang.title', 'Choose your language')}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('sd.lang.subtitle', "We'll translate your dashboard so you feel right at home.")}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {LANGUAGES.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <Card
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                'cursor-pointer p-4 transition-all hover:scale-[1.02] hover:shadow-md relative',
                isSelected
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'hover:border-primary/40'
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="text-3xl mb-2" aria-hidden>{lang.flag}</div>
              <div className="font-semibold text-sm">{lang.nativeName}</div>
              <div className="text-xs text-muted-foreground">{lang.englishName}</div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => onComplete(selected)}
          disabled={isSaving}
          className="min-w-[200px]"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> ...</>
          ) : (
            t('sd.lang.continue', 'Continue')
          )}
        </Button>
      </div>
    </motion.div>
  );
};

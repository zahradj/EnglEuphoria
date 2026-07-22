import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

const RTL_LANGS = new Set(['ar']);

const applyDirection = (lng: string) => {
  const isRtl = RTL_LANGS.has(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.classList.toggle('rtl', isRtl);
};

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default';
  align?: 'start' | 'center' | 'end';
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'outline',
  size = 'sm',
  align = 'end',
  compact = false,
  className,
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  // Sync direction on mount and on every language change.
  useEffect(() => {
    applyDirection(i18n.language);
    const onChange = (lng: string) => applyDirection(lng);
    i18n.on('languageChanged', onChange);
    return () => {
      i18n.off('languageChanged', onChange);
    };
  }, [i18n]);

  const changeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
    applyDirection(lng);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) ||
    languages.find((lang) => i18n.language?.startsWith(lang.code)) ||
    languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn('gap-2', className)}>
          <Globe className="h-4 w-4" />
          {compact ? (
            <span>{currentLanguage.flag}</span>
          ) : (
            <>
              <span className="hidden sm:inline">
                {currentLanguage.flag} {currentLanguage.name}
              </span>
              <span className="sm:hidden">{currentLanguage.flag}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[180px]">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider opacity-70">
          {t('nav.language', { defaultValue: 'Language' })}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((language) => {
          const isActive = i18n.language === language.code;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={cn(
                'cursor-pointer flex items-center gap-2',
                isActive ? 'bg-accent font-semibold' : ''
              )}
            >
              <span className="text-base leading-none">{language.flag}</span>
              <span className="flex-1">{language.name}</span>
              {isActive && <Check className="h-3.5 w-3.5 opacity-70" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;

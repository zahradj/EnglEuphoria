import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import React from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeModeContextType {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setThemeMode: (newMode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('theme-mode');
    return (stored as ThemeMode) || 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme-mode') as ThemeMode || 'light';
    if (stored === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return stored;
  });

  useEffect(() => {
    const updateTheme = () => {
      let theme: 'light' | 'dark';

      if (mode === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        theme = mode;
      }

      setResolvedTheme(theme);

      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [resolvedTheme, setThemeMode]);

  return React.createElement(
    ThemeModeContext.Provider,
    { value: { mode, resolvedTheme, setThemeMode, toggleTheme } },
    children
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
}

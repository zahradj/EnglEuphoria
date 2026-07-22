import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SystemId, SYSTEM_THEMES, SystemTheme } from '@/types/multiTenant';

interface SystemThemeContextType {
  systemId: SystemId;
  theme: SystemTheme;
  setSystemId: (id: SystemId) => void;
  isDemo: boolean;
  setDemoMode: (demo: boolean) => void;
}

const SystemThemeContext = createContext<SystemThemeContextType | undefined>(undefined);

interface SystemThemeProviderProps {
  children: React.ReactNode;
  initialSystemId?: SystemId;
  demoMode?: boolean;
}

export const SystemThemeProvider: React.FC<SystemThemeProviderProps> = ({
  children,
  initialSystemId = 'kids',
  demoMode = false,
}) => {
  const [systemId, setSystemIdState] = useState<SystemId>(initialSystemId);
  const [isDemo, setIsDemo] = useState(demoMode);

  const theme = SYSTEM_THEMES[systemId];

  const applyTheme = useCallback((currentTheme: SystemTheme) => {
    const root = document.documentElement;
    
    // Apply CSS variables for the theme
    root.style.setProperty('--tenant-primary', currentTheme.colors.primary);
    root.style.setProperty('--tenant-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--tenant-accent', currentTheme.colors.accent);
    root.style.setProperty('--tenant-background', currentTheme.colors.background);
    root.style.setProperty('--tenant-foreground', currentTheme.colors.foreground);
    root.style.setProperty('--tenant-card', currentTheme.colors.card);
    root.style.setProperty('--tenant-card-foreground', currentTheme.colors.cardForeground);
    root.style.setProperty('--tenant-radius', currentTheme.borderRadius);
    root.style.setProperty('--tenant-font', currentTheme.fontFamily);

    // Add/remove dark class for teen theme
    if (currentTheme.id === 'teen') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setSystemId = (id: SystemId) => {
    setSystemIdState(id);
    if (isDemo) {
      localStorage.setItem('demo_system_id', id);
    }
  };

  const setDemoMode = (demo: boolean) => {
    setIsDemo(demo);
  };

  return (
    <SystemThemeContext.Provider
      value={{
        systemId,
        theme,
        setSystemId,
        isDemo,
        setDemoMode,
      }}
    >
      {children}
    </SystemThemeContext.Provider>
  );
};

export const useSystemTheme = () => {
  const context = useContext(SystemThemeContext);
  if (!context) {
    throw new Error('useSystemTheme must be used within a SystemThemeProvider');
  }
  return context;
};

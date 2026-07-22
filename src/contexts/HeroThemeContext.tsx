import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const GROUP_THEMES = [
  {
    id: 'kids',
    label: 'The Playground',
    ageLabel: 'Kids 5–12',
    gradient: 'from-[#FF9F1C] to-[#FFBF00]',
    gradientHover: 'hover:from-[#FFB340] hover:to-[#FFD040]',
    shadow: 'shadow-[#FF9F1C]/25',
    cssFrom: '#FF9F1C',
    cssTo: '#FFBF00',
  },
  {
    id: 'teen',
    label: 'The Academy',
    ageLabel: 'Teens 13–17',
    gradient: 'from-[#6366F1] to-[#A855F7]',
    gradientHover: 'hover:from-[#7578F3] hover:to-[#B96AF8]',
    shadow: 'shadow-[#6366F1]/25',
    cssFrom: '#6366F1',
    cssTo: '#A855F7',
  },
  {
    id: 'adult',
    label: 'The Hub',
    ageLabel: 'Adults 18+',
    gradient: 'from-[#10B981] to-[#059669]',
    gradientHover: 'hover:from-[#34D399] hover:to-[#10B981]',
    shadow: 'shadow-[#10B981]/25',
    cssFrom: '#10B981',
    cssTo: '#059669',
  },
] as const;

interface HeroThemeContextType {
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  theme: typeof GROUP_THEMES[number];
}

const HeroThemeContext = createContext<HeroThemeContextType>({
  activeIndex: 0,
  setActiveIndex: () => {},
  theme: GROUP_THEMES[0],
});

export function HeroThemeProvider({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = GROUP_THEMES[activeIndex];

  // Expose live hub colors as CSS variables so any descendant (segmented pill,
  // radar chart, phone mock, etc.) can theme itself without prop drilling.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--hero-from', theme.cssFrom);
    root.style.setProperty('--hero-to', theme.cssTo);
  }, [theme.cssFrom, theme.cssTo]);

  return (
    <HeroThemeContext.Provider value={{ activeIndex, setActiveIndex, theme }}>
      {children}
    </HeroThemeContext.Provider>
  );
}

export const useHeroTheme = () => useContext(HeroThemeContext);

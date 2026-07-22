import type { HubType } from '@/components/creator-studio/CreatorContext';

/**
 * Hybrid Hub Theme Engine — structural Tailwind classes per Hub.
 * Colors come from CSS variables (`.theme-{hub}` in index.css);
 * shapes/animations come from these dictionary values.
 */
export interface HubThemeStructure {
  /** Wrapper class that activates the Hub's CSS color tokens. */
  themeClass: `theme-${HubType}`;
  /** Headline + body font stack class. */
  font: string;
  /** Default border radius for cards & containers. */
  radius: string;
  /** Default card shadow (mood-setting glow vs flat). */
  cardShadow: string;
  /** Bouncy / minimal / neon button finishing classes. */
  buttonStyle: string;
  /** Background overlay for the rendered slide canvas. */
  surface: string;
  /** Friendly label for UI affordances. */
  label: string;
  /** Mascot emoji shown on Playground instruction slides. */
  mascot?: string;
}

export const HUB_THEMES: Record<HubType, HubThemeStructure> = {
  playground: {
    themeClass: 'theme-playground',
    font: "font-['Nunito',_'Quicksand',_'Varela_Round',_sans-serif]",
    radius: 'rounded-3xl',
    cardShadow: 'shadow-xl',
    buttonStyle:
      'border-b-4 border-black/20 active:translate-y-1 active:border-b-0 transition-all',
    surface: 'bg-[hsl(var(--hub-bg))]',
    label: 'Playground',
    mascot: '🐧',
  },
  academy: {
    themeClass: 'theme-academy',
    font: "font-['Poppins',_'Inter',_sans-serif]",
    radius: 'rounded-xl',
    cardShadow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    buttonStyle: 'hover:scale-105 hover:shadow-lg transition-transform',
    surface: 'bg-[hsl(var(--hub-bg))]',
    label: 'Academy',
  },
  success: {
    themeClass: 'theme-success',
    font: "font-['Inter',_system-ui,_sans-serif]",
    radius: 'rounded-md',
    cardShadow: 'shadow-sm',
    buttonStyle: 'hover:bg-opacity-90 transition-opacity',
    surface: 'bg-[hsl(var(--hub-bg))]',
    label: 'Success',
  },
};

/** Safe lookup with Playground as the friendly default. */
export function getHubTheme(hub: HubType | undefined | null): HubThemeStructure {
  return HUB_THEMES[(hub ?? 'playground') as HubType] ?? HUB_THEMES.playground;
}

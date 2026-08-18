/**
 * Hub theming for the unified pilot player.
 *
 * The reused Playground game components (playground-games.tsx) read their
 * accent colors from CSS custom properties with hardcoded fallbacks equal to
 * the original literal Playground values — so any existing Playground
 * callsite (which never sets these vars) renders byte-for-byte identical to
 * before. Only <GameThemeScope> (below) ever sets non-default values, and
 * only inside the unified pilot player.
 */
import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';

export type Hub = 'playground' | 'academy' | 'success';

export interface HubIdentity {
  hub: Hub;
  accent: string;
  accent2: string;
  characterName: string;
  characterTagline: string;
  characterAvatarEmoji: string;
  /** Full-bleed backdrop for the whole player, evoking a "place" rather than a form. */
  sceneGradient: string;
  /** Radial glow color used behind the character badge and hero elements. */
  glow: string;
}

const HUB_IDENTITY: Record<Hub, HubIdentity> = {
  playground: {
    hub: 'playground',
    accent: '#FE6A2F',
    accent2: '#FEBE4C',
    characterName: 'Pip',
    characterTagline: 'Playground guide',
    characterAvatarEmoji: '🦊',
    sceneGradient: 'linear-gradient(180deg, #FFF3B0 0%, #FFD34E 35%, #FF8A3D 70%, #E5561A 100%)',
    glow: 'rgba(254,106,47,0.55)',
  },
  academy: {
    hub: 'academy',
    accent: '#3b82f6',
    accent2: '#818cf8',
    characterName: 'Vee',
    characterTagline: 'Academy mentor',
    characterAvatarEmoji: '🎧',
    sceneGradient: 'linear-gradient(180deg, #bfdbfe 0%, #60a5fa 35%, #4f46e5 75%, #1e1b4b 100%)',
    glow: 'rgba(96,165,250,0.55)',
  },
  success: {
    hub: 'success',
    accent: '#059669',
    accent2: '#14b8a6',
    characterName: 'Sol',
    characterTagline: 'Success coach',
    characterAvatarEmoji: '💼',
    sceneGradient: 'linear-gradient(180deg, #a7f3d0 0%, #10b981 35%, #0f766e 75%, #042f2e 100%)',
    glow: 'rgba(16,185,129,0.55)',
  },
};

const HubThemeContext = createContext<HubIdentity>(HUB_IDENTITY.playground);

export function HubThemeProvider({ hub, children }: { hub: Hub; children: ReactNode }) {
  return <HubThemeContext.Provider value={HUB_IDENTITY[hub]}>{children}</HubThemeContext.Provider>;
}

export function useHubTheme(): HubIdentity {
  return useContext(HubThemeContext);
}

/**
 * CSS custom properties consumed by playground-games.tsx's reused game
 * components. Every var has a `var(--x, <fallback>)` fallback baked into the
 * component's own classes equal to Playground's original literal value, so
 * this table's `playground` row is never actually needed at runtime — it's
 * listed for clarity only. Academy/Success rows are the only ones that
 * change rendered output.
 */
const GAME_THEME_VARS: Record<Hub, CSSProperties> = {
  playground: {
    ['--pg-accent' as string]: '#FE6A2F',
    ['--pg-accent-dark' as string]: '#c54c1d',
    ['--pg-accent-500' as string]: '#f97316',
    ['--pg-accent-400' as string]: '#fb923c',
    ['--pg-accent-300' as string]: '#fdba74',
    ['--pg-accent-200' as string]: '#fed7aa',
    ['--pg-accent-100' as string]: '#ffedd5',
    ['--pg-accent-600' as string]: '#ea580c',
    ['--pg-accent-50' as string]: '#fff7ed',
    ['--pg-accent-50-80' as string]: 'rgba(255,247,237,0.8)',
    ['--pg-accent-50-50' as string]: 'rgba(255,247,237,0.5)',
    ['--pg-accent-alpha-50' as string]: 'rgba(254,106,47,0.5)',
    ['--pg-accent-soft-text' as string]: 'rgba(254,106,47,0.8)',
    ['--pg-gradient-to' as string]: '#f59e0b',
  },
  academy: {
    ['--pg-accent' as string]: '#3b82f6',
    ['--pg-accent-dark' as string]: '#1d4ed8',
    ['--pg-accent-500' as string]: '#3b82f6',
    ['--pg-accent-400' as string]: '#60a5fa',
    ['--pg-accent-300' as string]: '#93c5fd',
    ['--pg-accent-200' as string]: '#bfdbfe',
    ['--pg-accent-100' as string]: '#dbeafe',
    ['--pg-accent-600' as string]: '#2563eb',
    ['--pg-accent-50' as string]: '#eff6ff',
    ['--pg-accent-50-80' as string]: 'rgba(239,246,255,0.8)',
    ['--pg-accent-50-50' as string]: 'rgba(239,246,255,0.5)',
    ['--pg-accent-alpha-50' as string]: 'rgba(59,130,246,0.5)',
    ['--pg-accent-soft-text' as string]: 'rgba(59,130,246,0.8)',
    ['--pg-gradient-to' as string]: '#0ea5e9',
  },
  success: {
    ['--pg-accent' as string]: '#059669',
    ['--pg-accent-dark' as string]: '#065f46',
    ['--pg-accent-500' as string]: '#10b981',
    ['--pg-accent-400' as string]: '#34d399',
    ['--pg-accent-300' as string]: '#6ee7b7',
    ['--pg-accent-200' as string]: '#a7f3d0',
    ['--pg-accent-100' as string]: '#d1fae5',
    ['--pg-accent-600' as string]: '#059669',
    ['--pg-accent-50' as string]: '#ecfdf5',
    ['--pg-accent-50-80' as string]: 'rgba(236,253,245,0.8)',
    ['--pg-accent-50-50' as string]: 'rgba(236,253,245,0.5)',
    ['--pg-accent-alpha-50' as string]: 'rgba(5,150,105,0.5)',
    ['--pg-accent-soft-text' as string]: 'rgba(5,150,105,0.8)',
    ['--pg-gradient-to' as string]: '#14b8a6',
  },
};

/** Wrap reused Playground game components in this to apply hub theming. */
export function GameThemeScope({ hub, children }: { hub: Hub; children: ReactNode }) {
  return <div style={GAME_THEME_VARS[hub]}>{children}</div>;
}

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
    // Matches PlacementChoice.tsx's actual Academy hub theme exactly:
    // CTA gradient from-violet-600 to-fuchsia-600, ring-violet-300,
    // bg from-violet-50 via-indigo-50 to-fuchsia-50. Indigo in the middle
    // keeps a "bluish" note without inventing a plain-blue accent.
    accent: '#7c3aed',
    accent2: '#c026d3',
    characterName: 'Vee',
    characterTagline: 'Academy mentor',
    characterAvatarEmoji: '🎧',
    sceneGradient: 'linear-gradient(180deg, #ddd6fe 0%, #818cf8 28%, #7c3aed 60%, #4c1d95 100%)',
    glow: 'rgba(124,58,237,0.5)',
  },
  success: {
    hub: 'success',
    // Matches PlacementChoice.tsx's actual Success hub theme exactly:
    // CTA gradient from-emerald-600 to-teal-600, ring-emerald-300, bg
    // from-emerald-50 via-teal-50 to-cyan-50. Kept in the teal/emerald
    // family throughout (not faded to near-black) so it reads as a rich
    // jewel-toned teal rather than the murky dark green from before.
    accent: '#059669',
    accent2: '#0d9488',
    characterName: 'Sol',
    characterTagline: 'Success coach',
    characterAvatarEmoji: '💼',
    sceneGradient: 'linear-gradient(180deg, #a5f3fc 0%, #2dd4bf 30%, #0d9488 62%, #134e4a 100%)',
    glow: 'rgba(13,148,136,0.5)',
  },
};

/** Non-context accessor for pages that don't (or can't) mount HubThemeProvider. */
export function getHubIdentity(hub: Hub): HubIdentity {
  return HUB_IDENTITY[hub];
}

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
    ['--pg-accent' as string]: '#7c3aed',
    ['--pg-accent-dark' as string]: '#5b21b6',
    ['--pg-accent-500' as string]: '#8b5cf6',
    ['--pg-accent-400' as string]: '#a78bfa',
    ['--pg-accent-300' as string]: '#c4b5fd',
    ['--pg-accent-200' as string]: '#ddd6fe',
    ['--pg-accent-100' as string]: '#ede9fe',
    ['--pg-accent-600' as string]: '#6d28d9',
    ['--pg-accent-50' as string]: '#f5f3ff',
    ['--pg-accent-50-80' as string]: 'rgba(245,243,255,0.8)',
    ['--pg-accent-50-50' as string]: 'rgba(245,243,255,0.5)',
    ['--pg-accent-alpha-50' as string]: 'rgba(124,58,237,0.5)',
    ['--pg-accent-soft-text' as string]: 'rgba(124,58,237,0.8)',
    ['--pg-gradient-to' as string]: '#c026d3',
  },
  success: {
    ['--pg-accent' as string]: '#059669',
    ['--pg-accent-dark' as string]: '#065f46',
    ['--pg-accent-500' as string]: '#10b981',
    ['--pg-accent-400' as string]: '#34d399',
    ['--pg-accent-300' as string]: '#6ee7b7',
    ['--pg-accent-200' as string]: '#a7f3d0',
    ['--pg-accent-100' as string]: '#d1fae5',
    ['--pg-accent-600' as string]: '#047857',
    ['--pg-accent-50' as string]: '#ecfdf5',
    ['--pg-accent-50-80' as string]: 'rgba(236,253,245,0.8)',
    ['--pg-accent-50-50' as string]: 'rgba(236,253,245,0.5)',
    ['--pg-accent-alpha-50' as string]: 'rgba(5,150,105,0.5)',
    ['--pg-accent-soft-text' as string]: 'rgba(5,150,105,0.8)',
    ['--pg-gradient-to' as string]: '#0d9488',
  },
};

/** Wrap reused Playground game components in this to apply hub theming. */
export function GameThemeScope({ hub, children }: { hub: Hub; children: ReactNode }) {
  return <div style={GAME_THEME_VARS[hub]}>{children}</div>;
}

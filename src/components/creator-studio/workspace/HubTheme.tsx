import React, { createContext, useContext, useMemo } from 'react';

/**
 * HubTheme — Creator Studio workspace theme provider.
 *
 * Drives the Midnight Indigo workspace + per-hub micro-personality
 * (accent / radius / motion / ornament). All visual variation across the
 * three hub creators flows through the `.hub-*` CSS class on the shell,
 * which switches the CSS variables defined in `src/index.css` under
 * `.creator-studio`.
 *
 * Hubs share the same chrome, fonts, and component primitives. Only the
 * accent, ornament, motion register, and density signature change.
 */

export type CreatorHub = 'playground' | 'academy' | 'success';

export interface HubThemeMeta {
  hub: CreatorHub;
  label: string;
  /** Short tagline shown in the top-bar crest */
  tagline: string;
  /** Hub-specific accent (mirrors the CSS var, exposed for inline use) */
  accentHex: string;
  accentSoftHex: string;
  /** Default density signature for body content */
  density: 'comfortable' | 'balanced' | 'dense';
  /** Whether the hub shows the Pip mascot in the dock header */
  showsMascot: boolean;
}

const META: Record<CreatorHub, HubThemeMeta> = {
  playground: {
    hub: 'playground',
    label: 'Playground',
    tagline: 'Early years · Pre-A1 → B1',
    accentHex: '#FE6A2F',
    accentSoftHex: '#FEFBDD',
    density: 'comfortable',
    showsMascot: true,
  },
  academy: {
    hub: 'academy',
    label: 'Academy',
    tagline: 'Teens · Pre-A1 → C1',
    accentHex: '#6B21A8',
    accentSoftHex: '#F5F3FF',
    density: 'balanced',
    showsMascot: false,
  },
  success: {
    hub: 'success',
    label: 'Success',
    tagline: 'Professional · Pre-A1 → C1',
    accentHex: '#059669',
    accentSoftHex: '#F0FDFA',
    density: 'dense',
    showsMascot: false,
  },
};

const HubThemeContext = createContext<HubThemeMeta>(META.academy);

export const useHubTheme = () => useContext(HubThemeContext);

export const getHubMeta = (hub: CreatorHub): HubThemeMeta => META[hub];

interface HubThemeProviderProps {
  hub: CreatorHub;
  children: React.ReactNode;
}

export const HubThemeProvider: React.FC<HubThemeProviderProps> = ({ hub, children }) => {
  const meta = useMemo(() => META[hub], [hub]);
  return <HubThemeContext.Provider value={meta}>{children}</HubThemeContext.Provider>;
};

/**
 * Returns the workspace shell class list for a given hub. Apply on the
 * outermost element of the Creator Studio. Drives the CSS variable cascade
 * defined in `src/index.css` under `.creator-studio` + `.hub-*`.
 */
export const hubShellClass = (hub: CreatorHub): string =>
  `creator-studio hub-${hub} font-studio-body`;

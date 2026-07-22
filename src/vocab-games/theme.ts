/**
 * Vocab Games — hub theming.
 *
 * Returns semantic CSS variables the games apply via inline style so the host
 * lesson layout is never touched. Colors follow project hub branding
 * (Playground yellow/orange, Academy blue/purple, Success green/teal) but use
 * design-token-friendly HSL, not hex, so dark-mode inheritance still works
 * where the host defines those tokens.
 */

import type { Hub } from './types';

export interface HubTheme {
  '--vg-primary': string;
  '--vg-accent': string;
  '--vg-bg': string;
  '--vg-card': string;
  '--vg-text': string;
  '--vg-correct': string;
  '--vg-wrong': string;
  /** Suggested game-card corner radius. */
  '--vg-radius': string;
  /** Semi-realistic anime vs editorial flat vs kawaii comic. */
  visualStyle: 'kawaii' | 'anime' | 'editorial';
  /** Playground never shows leaderboards; Success avoids childish copy. */
  copyRegister: 'child' | 'teen' | 'adult';
}

export const HUB_THEMES: Record<Hub, HubTheme> = {
  playground: {
    '--vg-primary': '24 96% 59%',       // orange
    '--vg-accent': '48 100% 89%',       // pale yellow
    '--vg-bg': '48 100% 96%',
    '--vg-card': '0 0% 100%',
    '--vg-text': '24 20% 18%',
    '--vg-correct': '142 71% 45%',
    '--vg-wrong': '0 84% 60%',
    '--vg-radius': '22px',
    visualStyle: 'kawaii',
    copyRegister: 'child',
  },
  academy: {
    '--vg-primary': '267 74% 40%',      // purple
    '--vg-accent': '221 83% 53%',       // blue
    '--vg-bg': '250 40% 98%',
    '--vg-card': '0 0% 100%',
    '--vg-text': '230 22% 18%',
    '--vg-correct': '158 64% 42%',
    '--vg-wrong': '0 72% 51%',
    '--vg-radius': '14px',
    visualStyle: 'anime',
    copyRegister: 'teen',
  },
  success: {
    '--vg-primary': '160 84% 32%',      // emerald
    '--vg-accent': '175 60% 40%',       // teal
    '--vg-bg': '160 20% 98%',
    '--vg-card': '0 0% 100%',
    '--vg-text': '160 22% 14%',
    '--vg-correct': '160 84% 32%',
    '--vg-wrong': '0 72% 45%',
    '--vg-radius': '10px',
    visualStyle: 'editorial',
    copyRegister: 'adult',
  },
};

export function themeStyle(hub: Hub): React.CSSProperties {
  const t = HUB_THEMES[hub] ?? HUB_THEMES.academy;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(t)) {
    if (k.startsWith('--')) out[k] = String(v);
  }
  return out as React.CSSProperties;
}

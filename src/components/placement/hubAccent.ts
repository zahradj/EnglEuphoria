// Centralized hub-aware accent classes for every placement-flow component
// (chat avatar, user bubbles, progress bar, audio CTA, etc.). Keeps the
// Success funnel green instead of inheriting the legacy violet/fuchsia palette.

import type { Hub } from './questionBanks';

export interface HubAccent {
  /** bg-gradient classes for the circular guide avatar */
  avatar: string;
  /** bg-gradient classes for the user reply bubble */
  userBubble: string;
  /** bg-gradient classes for the progress bar fill */
  progress: string;
  /** bg-gradient classes for primary CTAs (audio play, submit) */
  cta: string;
  /** shadow color matched to the CTA */
  ctaShadow: string;
  /** ring color for soft glows */
  ring: string;
  /** border color for focused inputs */
  inputBorder: string;
  /** selected-state bg + border + glow trio for choice chips */
  selected: string;
}

export const HUB_ACCENT: Record<Hub, HubAccent> = {
  playground: {
    avatar: 'from-orange-500 to-amber-500',
    userBubble: 'from-orange-500/80 to-amber-500/80',
    progress: 'from-orange-400 via-amber-400 to-yellow-400',
    cta: 'from-orange-500 via-amber-500 to-yellow-500',
    ctaShadow: 'shadow-amber-500/30',
    ring: 'ring-orange-400/40',
    inputBorder: 'focus:border-orange-400',
    selected: 'bg-orange-500/40 border-orange-400 text-white shadow-[0_0_12px_rgba(254,106,47,0.35)]',
  },
  academy: {
    avatar: 'from-violet-500 to-fuchsia-500',
    userBubble: 'from-violet-600/80 to-fuchsia-600/80',
    progress: 'from-violet-400 via-fuchsia-400 to-pink-400',
    cta: 'from-violet-500 via-fuchsia-500 to-pink-500',
    ctaShadow: 'shadow-fuchsia-500/30',
    ring: 'ring-violet-400/40',
    inputBorder: 'focus:border-violet-400',
    selected: 'bg-violet-500/40 border-violet-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]',
  },
  professional: {
    avatar: 'from-emerald-500 to-teal-500',
    userBubble: 'from-emerald-600/80 to-teal-600/80',
    progress: 'from-emerald-400 via-teal-400 to-cyan-400',
    cta: 'from-emerald-500 via-teal-500 to-cyan-500',
    ctaShadow: 'shadow-emerald-500/30',
    ring: 'ring-emerald-400/40',
    inputBorder: 'focus:border-emerald-400',
    selected: 'bg-emerald-500/40 border-emerald-400 text-white shadow-[0_0_12px_rgba(5,150,105,0.35)]',
  },
};

export const accentFor = (hub: Hub | undefined): HubAccent =>
  HUB_ACCENT[hub ?? 'academy'];

import { useMemo } from 'react';

export type HubType = 'playground' | 'academy' | 'professional';

export interface HubClassroomTheme {
  hub: HubType;
  /** Primary HSL triplet (no hsl() wrapper) for inline style fallbacks. */
  primaryHsl: string;
  /** Tailwind utility for an accent text color using the theme primary. */
  accentText: string;
  /** Tailwind utility for an accent background. */
  accentBg: string;
  /** Tailwind ring class used to frame the live slide stage. */
  ringClass: string;
  /** Inline style for a soft hub mesh-gradient background. */
  meshGradient: React.CSSProperties;
  /** Inline style for a punchy hub gradient (buttons, pills). */
  buttonGradient: React.CSSProperties;
  /** Inline style for a glowing shadow tinted with the hub color. */
  glowShadow: React.CSSProperties;
  /** Border radius preference per hub. */
  radiusClass: string;
  /** Short human label (Playground / Academy / Success). */
  label: string;
}

/**
 * Returns hub-aware theme tokens for the classroom. Driven by workspace brand
 * rules (Playground=#FE6A2F, Academy=#6B21A8, Success=#059669).
 */
export const useHubClassroomTheme = (hub: HubType = 'academy'): HubClassroomTheme => {
  return useMemo<HubClassroomTheme>(() => {
    if (hub === 'playground') {
      return {
        hub,
        primaryHsl: '20 99% 59%',
        accentText: 'text-orange-500',
        accentBg: 'bg-orange-500',
        ringClass: 'ring-2 ring-orange-300/60',
        meshGradient: {
          background: '#ffffff',
        },
        buttonGradient: { background: 'linear-gradient(135deg, #FE6A2F, #F59E0B)' },
        glowShadow: { boxShadow: '0 12px 40px -12px rgba(254,106,47,0.45)' },
        radiusClass: 'rounded-3xl',
        label: 'Playground',
      };
    }
    if (hub === 'professional') {
      return {
        hub,
        primaryHsl: '160 84% 30%',
        accentText: 'text-emerald-500',
        accentBg: 'bg-emerald-500',
        ringClass: 'ring-2 ring-emerald-300/60',
        meshGradient: {
          background:
            'radial-gradient(120% 80% at 0% 0%, hsl(160 60% 92% / 0.55), transparent 60%), radial-gradient(120% 80% at 100% 100%, hsl(174 70% 88% / 0.55), transparent 55%)',
        },
        buttonGradient: { background: 'linear-gradient(135deg, #059669, #10B981)' },
        glowShadow: { boxShadow: '0 12px 40px -12px rgba(5,150,105,0.45)' },
        radiusClass: 'rounded-xl',
        label: 'Success',
      };
    }
    return {
      hub: 'academy',
      primaryHsl: '270 67% 39%',
      accentText: 'text-purple-500',
      accentBg: 'bg-purple-500',
      ringClass: 'ring-2 ring-purple-300/60',
      meshGradient: {
        background:
          'radial-gradient(120% 80% at 0% 0%, hsl(258 90% 94% / 0.55), transparent 60%), radial-gradient(120% 80% at 100% 100%, hsl(280 90% 92% / 0.55), transparent 55%)',
      },
      buttonGradient: { background: 'linear-gradient(135deg, #6B21A8, #A855F7)' },
      glowShadow: { boxShadow: '0 12px 40px -12px rgba(107,33,168,0.45)' },
      radiusClass: 'rounded-2xl',
      label: 'Academy',
    };
  }, [hub]);
};

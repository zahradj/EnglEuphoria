import type { CSSProperties } from 'react';

export type FamilyHub = 'playground' | 'academy' | 'professional';

/**
 * Per-hub colours for the family dashboard. `color` is the strong accent (buttons, bars) and is
 * chosen to keep white text readable (>= 4.5:1); `tint` is the soft card wash. The Playground orange
 * is deliberately deeper than the brand orange for that reason.
 */
const HUB_THEME: Record<FamilyHub, { label: string; color: string; tint: string; glow: string }> = {
  playground: { label: 'Playground', color: '#D9480F', tint: '#FFEFE2', glow: '#FE6A2F' },
  academy: { label: 'Academy', color: '#6B21A8', tint: '#F1E6FD', glow: '#9B5CE0' },
  professional: { label: 'Success Hub', color: '#047857', tint: '#E3F6EE', glow: '#14B8A6' },
};

export function hubTheme(hub: string | null | undefined) {
  const key: FamilyHub = hub === 'academy' || hub === 'professional' || hub === 'success'
    ? (hub === 'success' ? 'professional' : hub)
    : 'playground';
  return HUB_THEME[key];
}

/** CSS custom properties consumed by .fd-child (see family-dashboard.css). */
export function hubStyle(hub: string | null | undefined): CSSProperties {
  const t = hubTheme(hub);
  return { ['--hub' as any]: t.color, ['--hub-tint' as any]: t.tint, ['--hub-glow' as any]: t.glow };
}

export function firstName(fullName: string | null | undefined): string {
  const n = (fullName ?? '').trim();
  return n ? n.split(/\s+/)[0] : '';
}

/**
 * Hub-branded classroom theme tokens.
 *
 * Single source of truth for the light hub-tinted look that every
 * classroom surface (top bar, center stage, side panels, navigator,
 * chat, etc.) shares. Re-expresses the hex values from
 * `src/utils/hubTheme.ts` as Tailwind class strings scoped to the
 * classroom.
 *
 * - Playground = light orange
 * - Academy    = light purple
 * - Success    = light green  (alias: `professional`)
 */

export type ClassroomHubKey = 'playground' | 'academy' | 'success' | 'professional';

export interface ClassroomHubTheme {
  /** Full-shell background wash. */
  pageBg: string;
  /** Panel / dock background. */
  panelBg: string;
  /** Panel / dock border. */
  panelBorder: string;
  /** Strong accent text color. */
  accentText: string;
  /** Soft accent background (chips, hover states). */
  accentSoftBg: string;
  /** Accent ring for current/active items. */
  accentRing: string;
  /** 2-stop soft gradient for the top bar background. */
  headerGradient: string;
  /** Solid hex gradient used inline (logo dot, progress bar). */
  hexGradient: string;
  /** Accent hex (for inline styles like progress). */
  accentHex: string;
  /** Progress bar background classes. */
  progressBar: string;
  /** Chip background + text. */
  chipBg: string;
  chipText: string;
  /** Primary CTA classes (Send, etc.). End-class stays destructive red. */
  buttonPrimary: string;
  /** Border color hex (for inline borders). */
  borderHex: string;
}

const PLAYGROUND: ClassroomHubTheme = {
  pageBg: 'bg-white',
  panelBg: 'bg-white/90 backdrop-blur-md',
  panelBorder: 'border-orange-200',
  accentText: 'text-orange-700',
  accentSoftBg: 'bg-orange-100',
  accentRing: 'ring-orange-400',
  headerGradient: 'bg-white',
  hexGradient: 'linear-gradient(135deg, #FE6A2F, #F59E0B)',
  accentHex: '#FE6A2F',
  progressBar: 'bg-gradient-to-r from-orange-500 to-amber-400',
  chipBg: 'bg-orange-100',
  chipText: 'text-orange-800',
  buttonPrimary: 'bg-orange-500 hover:bg-orange-600 text-white',
  borderHex: '#FED7AA',
};

const ACADEMY: ClassroomHubTheme = {
  pageBg: 'bg-gradient-to-br from-purple-50 via-violet-50/40 to-white',
  panelBg: 'bg-white/90 backdrop-blur-md',
  panelBorder: 'border-purple-200',
  accentText: 'text-purple-700',
  accentSoftBg: 'bg-purple-100',
  accentRing: 'ring-purple-400',
  headerGradient: 'bg-gradient-to-r from-purple-50 via-white to-violet-50',
  hexGradient: 'linear-gradient(135deg, #6B21A8, #A855F7)',
  accentHex: '#6B21A8',
  progressBar: 'bg-gradient-to-r from-purple-600 to-violet-500',
  chipBg: 'bg-purple-100',
  chipText: 'text-purple-800',
  buttonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
  borderHex: '#DDD6FE',
};

const SUCCESS: ClassroomHubTheme = {
  pageBg: 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white',
  panelBg: 'bg-white/90 backdrop-blur-md',
  panelBorder: 'border-emerald-200',
  accentText: 'text-emerald-700',
  accentSoftBg: 'bg-emerald-100',
  accentRing: 'ring-emerald-400',
  headerGradient: 'bg-gradient-to-r from-emerald-50 via-white to-teal-50',
  hexGradient: 'linear-gradient(135deg, #059669, #10B981)',
  accentHex: '#059669',
  progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  chipBg: 'bg-emerald-100',
  chipText: 'text-emerald-800',
  buttonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  borderHex: '#A7F3D0',
};

export const CLASSROOM_HUB_THEME: Record<ClassroomHubKey, ClassroomHubTheme> = {
  playground: PLAYGROUND,
  academy: ACADEMY,
  success: SUCCESS,
  professional: SUCCESS,
};

export function getClassroomHubTheme(hub?: string | null): ClassroomHubTheme {
  const key = (hub ?? 'academy') as ClassroomHubKey;
  return CLASSROOM_HUB_THEME[key] ?? ACADEMY;
}

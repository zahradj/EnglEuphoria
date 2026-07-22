/**
 * Hub-specific color theming and pricing configuration.
 * Single source of truth for visual identity and pricing across all hubs.
 */

export type HubId = 'playground' | 'academy' | 'professional';

export interface HubTheme {
  id: HubId;
  label: string;
  tagline: string;
  // Day mode colors
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  cardBorder: string;
  cardShadow: string;
  activeBg: string;
  activeText: string;
  headerGradient: string;
  buttonGradient: string;
  progressGradient: string;
  // Dark mode colors (amber shift for playground, midnight for academy, forest for success)
  darkPrimary: string;
  darkSecondary: string;
  darkBg: string;
  darkCardBg: string;
  darkCardBorder: string;
  darkHeaderGradient: string;
  darkButtonGradient: string;
  darkProgressGradient: string;
  // Pricing
  duration: number; // minutes per session
  priceMultiplier: number; // 1 = full price, 0.5 = half price
  icon: string;
}

export const HUB_THEMES: Record<HubId, HubTheme> = {
  playground: {
    id: 'playground',
    label: 'Playground',
    tagline: 'Fun & Energetic',
    icon: '🌈',
    duration: 30,
    priceMultiplier: 0.5,
    // Day
    primary: '#FFC107',
    secondary: '#FF5722',
    accent: '#FFE082',
    gradient: 'from-amber-400 to-orange-500',
    cardBorder: 'border-l-4 border-l-orange-400',
    cardShadow: 'shadow-[0_4px_20px_rgba(255,193,7,0.15)]',
    activeBg: 'bg-amber-50',
    activeText: 'text-orange-600',
    headerGradient: 'from-amber-400 via-orange-400 to-red-400',
    buttonGradient: 'from-orange-400 to-amber-400',
    progressGradient: 'from-amber-400 to-yellow-400',
    // Dark (Amber shift)
    darkPrimary: '#FF8F00',
    darkSecondary: '#E65100',
    darkBg: '#1A1200',
    darkCardBg: 'bg-amber-950/40',
    darkCardBorder: 'border-l-4 border-l-amber-600',
    darkHeaderGradient: 'from-amber-800 via-orange-800 to-red-900',
    darkButtonGradient: 'from-amber-700 to-orange-700',
    darkProgressGradient: 'from-amber-600 to-orange-600',
  },
  academy: {
    id: 'academy',
    label: 'Academy Hub',
    tagline: 'Academic & Professional',
    icon: '📘',
    duration: 60,
    priceMultiplier: 1,
    // Day
    primary: '#6B21A8',
    secondary: '#4A148C',
    accent: '#7C4DFF',
    gradient: 'from-blue-900 to-purple-900',
    cardBorder: 'border-l-4 border-l-indigo-600',
    cardShadow: 'shadow-[0_4px_20px_rgba(26,35,126,0.12)]',
    activeBg: 'bg-indigo-50',
    activeText: 'text-indigo-700',
    headerGradient: 'from-indigo-800 via-blue-800 to-purple-800',
    buttonGradient: 'from-indigo-600 to-purple-600',
    progressGradient: 'from-indigo-500 to-purple-500',
    // Dark (Midnight shift)
    darkPrimary: '#3949AB',
    darkSecondary: '#6A1B9A',
    darkBg: '#0A0A1E',
    darkCardBg: 'bg-indigo-950/50',
    darkCardBorder: 'border-l-4 border-l-indigo-500',
    darkHeaderGradient: 'from-indigo-950 via-blue-950 to-purple-950',
    darkButtonGradient: 'from-indigo-700 to-purple-700',
    darkProgressGradient: 'from-indigo-600 to-purple-600',
  },
  professional: {
    id: 'professional',
    label: 'Success Hub',
    tagline: 'Growth & Mentorship',
    icon: '🎯',
    duration: 60,
    priceMultiplier: 1,
    // Day
    primary: '#1B5E20',
    secondary: '#009688',
    accent: '#4DB6AC',
    gradient: 'from-green-800 to-teal-600',
    cardBorder: 'border-l-4 border-l-emerald-500',
    cardShadow: 'shadow-[0_4px_20px_rgba(27,94,32,0.12)]',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
    headerGradient: 'from-emerald-700 via-green-700 to-teal-600',
    buttonGradient: 'from-emerald-600 to-teal-500',
    progressGradient: 'from-emerald-500 to-teal-400',
    // Dark (Forest shift)
    darkPrimary: '#2E7D32',
    darkSecondary: '#00796B',
    darkBg: '#0D1A0F',
    darkCardBg: 'bg-emerald-950/40',
    darkCardBorder: 'border-l-4 border-l-emerald-600',
    darkHeaderGradient: 'from-emerald-950 via-green-950 to-teal-950',
    darkButtonGradient: 'from-emerald-800 to-teal-700',
    darkProgressGradient: 'from-emerald-600 to-teal-500',
  },
};

/**
 * Calculate session price for a given hub.
 * Playground = half price (30 min = 50% of hourly rate).
 * @param hourlyRate - base hourly rate in EUR
 * @param hubId - which hub
 */
export function getSessionPrice(hourlyRate: number, hubId: HubId): number {
  const theme = HUB_THEMES[hubId];
  return Math.round(hourlyRate * theme.priceMultiplier * 100) / 100;
}

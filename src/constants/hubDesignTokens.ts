// Centralized design tokens for each hub experience level

export const HUB_TOKENS = {
  academy: {
    primary: '271 81% 40%',         // #6B21A8 royal purple
    primaryHex: '#6B21A8',
    accent: '#F5F3FF',              // lavender accent
    success: '122 39% 49%',         // #4CAF50 forest green
    successHex: '#4CAF50',
    bg: '#F5F3FF',
    bgSecondary: '#EDE9FE',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#DDD6FE',
    radius: '8px',
    font: "'Inter', system-ui, sans-serif",
    cardShadow: '0 1px 3px rgba(107,33,168,0.08), 0 1px 2px rgba(107,33,168,0.06)',
    cardHoverShadow: '0 4px 12px rgba(107,33,168,0.12)',
    gradient: 'linear-gradient(135deg, #6B21A8, #A855F7)',
    meshGradient: 'radial-gradient(ellipse at 20% 50%, rgba(107,33,168,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(245,243,255,0.8) 0%, transparent 50%)',
  },
  playground: {
    primary: '20 99% 59%',          // #FE6A2F warm orange
    primaryHex: '#FE6A2F',
    accent: '#FEFBDD',              // yellow accent
    success: '122 39% 49%',         // #4CAF50
    successHex: '#4CAF50',
    bg: {
      day: '#FFF7ED',
      night: '#1A1040',
    },
    bgSecondary: {
      day: '#FEFBDD',
      night: '#2D1B69',
    },
    text: {
      day: '#1A1A2E',
      night: '#E8E0F0',
    },
    textMuted: {
      day: '#92400E',
      night: '#FDBA74',
    },
    border: {
      day: '#FED7AA',
      night: '#4A148C',
    },
    radius: '24px',
    font: "'Inter', system-ui, sans-serif",
    gradient: 'linear-gradient(135deg, #FE6A2F, #F59E0B)',
    meshGradient: 'radial-gradient(ellipse at 20% 50%, rgba(254,106,47,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(254,251,221,0.8) 0%, transparent 50%)',
    skyBlue: '#87CEEB',
    deepPurple: '#2D1B69',
  },
  professional: {
    primary: '160 84% 39%',         // #059669 emerald
    primaryHex: '#059669',
    accent: '#F0FDFA',              // mint accent
    success: '160 84% 39%',
    successHex: '#059669',
    bg: '#F0FDFA',
    bgSecondary: '#ECFDF5',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#A7F3D0',
    radius: '8px',
    font: "'Inter', system-ui, sans-serif",
    cardShadow: '0 1px 3px rgba(5,150,105,0.06)',
    gradient: 'linear-gradient(135deg, #059669, #10B981)',
    meshGradient: 'radial-gradient(ellipse at 20% 50%, rgba(5,150,105,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(240,253,250,0.8) 0%, transparent 50%)',
  },
} as const;

export type HubType = keyof typeof HUB_TOKENS;

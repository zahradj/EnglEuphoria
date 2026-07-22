// Adaptive Theme System - Age-appropriate design configurations

export type AgeGroup = 'kids' | 'teens' | 'adults';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  success: string;
  warning: string;
  error: string;
}

export interface TypographyScale {
  baseFontSize: string;
  headingFontFamily: string;
  bodyFontFamily: string;
  headingWeight: string;
  bodyWeight: string;
}

export interface CharacterConfig {
  enabled: boolean;
  visibility: 'always' | 'occasional' | 'minimal';
  characterType: 'cute-animal' | 'cool-avatar' | 'professional-assistant';
  defaultEmotion: string;
}

export interface AnimationIntensity {
  transitions: 'bouncy' | 'smooth' | 'subtle';
  confettiEnabled: boolean;
  characterMovements: 'exaggerated' | 'moderate' | 'minimal';
  duration: 'slow' | 'normal' | 'fast';
}

export interface AdaptiveTheme {
  ageGroup: AgeGroup;
  colors: ColorPalette;
  typography: TypographyScale;
  mascot: CharacterConfig;
  animations: AnimationIntensity;
  borderRadius: string;
  spacing: 'generous' | 'normal' | 'compact';
}

// Kids Theme (5-11 years)
const kidsTheme: AdaptiveTheme = {
  ageGroup: 'kids',
  colors: {
    primary: '270 80% 60%',      // Bright purple
    secondary: '200 90% 55%',    // Bright blue
    accent: '45 100% 55%',       // Sunny yellow
    background: '0 0% 100%',     // Pure white
    foreground: '240 10% 20%',   // Dark gray
    success: '140 80% 50%',      // Bright green
    warning: '35 100% 60%',      // Orange
    error: '0 80% 60%'           // Red
  },
  typography: {
    baseFontSize: '18px',
    headingFontFamily: "'Fredoka', 'Comic Neue', cursive",
    bodyFontFamily: "'Nunito', 'Comic Sans MS', sans-serif",
    headingWeight: '700',
    bodyWeight: '500'
  },
  mascot: {
    enabled: true,
    visibility: 'always',
    characterType: 'cute-animal',
    defaultEmotion: 'happy'
  },
  animations: {
    transitions: 'bouncy',
    confettiEnabled: true,
    characterMovements: 'exaggerated',
    duration: 'slow'
  },
  borderRadius: '24px',
  spacing: 'generous'
};

// Teens Theme (12-17 years)
const teensTheme: AdaptiveTheme = {
  ageGroup: 'teens',
  colors: {
    primary: '260 70% 65%',      // Softer purple
    secondary: '200 70% 60%',    // Cool blue
    accent: '180 60% 55%',       // Cyan
    background: '240 10% 98%',   // Off-white
    foreground: '240 10% 15%',   // Almost black
    success: '145 65% 50%',      // Green
    warning: '40 90% 55%',       // Amber
    error: '0 70% 55%'           // Red
  },
  typography: {
    baseFontSize: '16px',
    headingFontFamily: "'Inter', 'Poppins', sans-serif",
    bodyFontFamily: "'Inter', sans-serif",
    headingWeight: '700',
    bodyWeight: '400'
  },
  mascot: {
    enabled: true,
    visibility: 'occasional',
    characterType: 'cool-avatar',
    defaultEmotion: 'wave'
  },
  animations: {
    transitions: 'smooth',
    confettiEnabled: true,
    characterMovements: 'moderate',
    duration: 'normal'
  },
  borderRadius: '16px',
  spacing: 'normal'
};

// Adults Theme (18+ years)
const adultsTheme: AdaptiveTheme = {
  ageGroup: 'adults',
  colors: {
    primary: '260 60% 60%',      // Professional purple
    secondary: '210 50% 50%',    // Navy blue
    accent: '200 55% 55%',       // Sky blue
    background: '0 0% 100%',     // White
    foreground: '240 10% 10%',   // Black
    success: '145 60% 45%',      // Professional green
    warning: '40 85% 50%',       // Amber
    error: '0 65% 50%'           // Red
  },
  typography: {
    baseFontSize: '16px',
    headingFontFamily: "'Inter', sans-serif",
    bodyFontFamily: "'Inter', sans-serif",
    headingWeight: '600',
    bodyWeight: '400'
  },
  mascot: {
    enabled: true,
    visibility: 'minimal',
    characterType: 'professional-assistant',
    defaultEmotion: 'thinking'
  },
  animations: {
    transitions: 'subtle',
    confettiEnabled: false,
    characterMovements: 'minimal',
    duration: 'fast'
  },
  borderRadius: '12px',
  spacing: 'normal'
};

// Theme Registry
const themes: Record<AgeGroup, AdaptiveTheme> = {
  kids: kidsTheme,
  teens: teensTheme,
  adults: adultsTheme
};

/**
 * Get adaptive theme based on age group
 */
export function getAdaptiveTheme(ageGroup: AgeGroup): AdaptiveTheme {
  return themes[ageGroup];
}

/**
 * Detect age group from age range string
 */
export function detectAgeGroup(ageRange: string): AgeGroup {
  const lower = ageRange.toLowerCase();
  
  if (lower.includes('4-7') || lower.includes('5-7') || lower.includes('8-11') || lower.includes('young') || lower.includes('elementary')) {
    return 'kids';
  }
  
  if (lower.includes('12-14') || lower.includes('10-13') || lower.includes('14-17') || lower.includes('teen') || lower.includes('pre-teen')) {
    return 'teens';
  }
  
  return 'adults';
}

/**
 * Apply theme to CSS variables
 */
export function applyThemeToDOM(theme: AdaptiveTheme): void {
  const root = document.documentElement;
  
  // Apply colors
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  
  // Apply typography
  root.style.setProperty('--font-size-base', theme.typography.baseFontSize);
  root.style.setProperty('--font-heading', theme.typography.headingFontFamily);
  root.style.setProperty('--font-body', theme.typography.bodyFontFamily);
  
  // Apply border radius
  root.style.setProperty('--radius', theme.borderRadius);
}

/**
 * Generate age-appropriate content adjustments
 */
export function getContentAdjustments(ageGroup: AgeGroup): {
  vocabularyComplexity: 'simple' | 'moderate' | 'advanced';
  sentenceLength: 'short' | 'medium' | 'long';
  culturalReferences: 'child-friendly' | 'teen-relevant' | 'adult-appropriate';
  exampleTypes: 'cartoons' | 'pop-culture' | 'real-world';
} {
  const adjustments = {
    kids: {
      vocabularyComplexity: 'simple' as const,
      sentenceLength: 'short' as const,
      culturalReferences: 'child-friendly' as const,
      exampleTypes: 'cartoons' as const
    },
    teens: {
      vocabularyComplexity: 'moderate' as const,
      sentenceLength: 'medium' as const,
      culturalReferences: 'teen-relevant' as const,
      exampleTypes: 'pop-culture' as const
    },
    adults: {
      vocabularyComplexity: 'advanced' as const,
      sentenceLength: 'long' as const,
      culturalReferences: 'adult-appropriate' as const,
      exampleTypes: 'real-world' as const
    }
  };
  
  return adjustments[ageGroup];
}

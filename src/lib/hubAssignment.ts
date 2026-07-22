// Single source of truth for age → hub mapping used by the registration wizard
// and the My Path reveal page. Mirrors workspace rules:
//   • Playground: age <= 12, 30 min lessons, 3 lessons/week
//   • Academy:    age 13–17, 55 min lessons, 2 hours/week
//   • Professional (Success Hub): age 18+, 55 min lessons, Flexible

export type HubType = 'playground' | 'academy' | 'professional';
export type LearningReason = 'school' | 'career' | 'travel' | 'fun';

export interface HubAssignment {
  hub_type: HubType;
  lesson_duration: 30 | 55;
  weekly_goal: string;
}

export const HUB_BRAND: Record<HubType, {
  label: string;
  primary: string;       // hex
  accent: string;        // hex
  gradient: string;      // tailwind from-/to- pair using arbitrary values
  ringClass: string;
  textClass: string;
  bgSoftClass: string;
  emoji: string;
  tagline: string;
}> = {
  playground: {
    label: 'Playground',
    primary: '#FE6A2F',
    accent: '#FEFBDD',
    gradient: 'from-[#FE6A2F] to-[#FEAF15]',
    ringClass: 'ring-[#FE6A2F]/40',
    textClass: 'text-[#FE6A2F]',
    bgSoftClass: 'bg-[#FEFBDD]',
    emoji: '🎨',
    tagline: 'Learn through play',
  },
  academy: {
    label: 'Academy',
    primary: '#6B21A8',
    accent: '#F5F3FF',
    gradient: 'from-[#6B21A8] to-[#3B82F6]',
    ringClass: 'ring-[#6B21A8]/40',
    textClass: 'text-[#6B21A8]',
    bgSoftClass: 'bg-[#F5F3FF]',
    emoji: '🎓',
    tagline: 'Master the fundamentals',
  },
  professional: {
    label: 'Success Hub',
    primary: '#059669',
    accent: '#F0FDFA',
    gradient: 'from-[#059669] to-[#14B8A6]',
    ringClass: 'ring-[#059669]/40',
    textClass: 'text-[#059669]',
    bgSoftClass: 'bg-[#F0FDFA]',
    emoji: '🚀',
    tagline: 'Speak with confidence',
  },
};

export function assignHubFromAge(age: number): HubAssignment {
  // Strict brackets: 4-9 → Playground, 10-17 → Academy, 18+ → Success.
  if (age < 10) {
    return { hub_type: 'playground', lesson_duration: 30, weekly_goal: '3 lessons/week' };
  }
  if (age < 18) {
    return { hub_type: 'academy', lesson_duration: 55, weekly_goal: '2 hours/week' };
  }
  return { hub_type: 'professional', lesson_duration: 55, weekly_goal: 'Flexible' };
}

export function calculateAgeFromDob(dobIso: string): number {
  const today = new Date();
  const dob = new Date(dobIso);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function hubToDashboardRoute(hub: HubType): string {
  if (hub === 'academy') return '/dashboard/academy';
  if (hub === 'professional') return '/dashboard/hub';
  return '/dashboard/playground';
}

export const LEARNING_REASONS: { value: LearningReason; label: string; emoji: string; blurb: string }[] = [
  { value: 'school',  label: 'School',  emoji: '🏫', blurb: 'Ace exams & assignments' },
  { value: 'career',  label: 'Career',  emoji: '💼', blurb: 'Grow at work or land a new role' },
  { value: 'travel',  label: 'Travel',  emoji: '✈️', blurb: 'Speak confidently abroad' },
  { value: 'fun',     label: 'Fun',     emoji: '🎉', blurb: 'Movies, music & making friends' },
];

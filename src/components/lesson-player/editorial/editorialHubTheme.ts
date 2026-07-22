import { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';

export interface EditorialHubTheme {
  primary: string;
  primaryLight: string;
  background: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  buttonClass: string;
  progressClass: string;
  label: string;
}

export const EDITORIAL_HUB_THEMES: Record<string, EditorialHubTheme> = {
  playground: {
    primary: '#F59E0B',
    primaryLight: '#FEF3C7',
    background: '#FFFBEB',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-700',
    buttonClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    progressClass: 'bg-amber-400',
    label: 'Playground',
  },
  academy: {
    primary: '#3B82F6',
    primaryLight: '#DBEAFE',
    background: '#EFF6FF',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-700',
    buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
    progressClass: 'bg-blue-400',
    label: 'Academy',
  },
  professional: {
    primary: '#10B981',
    primaryLight: '#D1FAE5',
    background: '#ECFDF5',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    progressClass: 'bg-emerald-400',
    label: 'Success Hub',
  },
};

export function getEditorialTheme(hub?: string): EditorialHubTheme {
  return EDITORIAL_HUB_THEMES[hub || 'academy'] || EDITORIAL_HUB_THEMES.academy;
}

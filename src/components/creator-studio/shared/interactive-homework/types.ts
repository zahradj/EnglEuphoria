import type { HomeworkTask } from '@/coherence/types';

export type HomeworkPreviewHub = 'playground' | 'academy' | 'success';

export interface HomeworkActivityProps {
  hub: HomeworkPreviewHub;
  task: HomeworkTask;
  onComplete?: () => void;
}

export const HUB_THEME: Record<HomeworkPreviewHub, {
  frame: string;
  panel: string;
  text: string;
  badge: string;
  button: string;
  accent: string;
  ring: string;
  bubble: string;
}> = {
  playground: {
    frame: 'border-orange-200 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100',
    panel: 'border-orange-200 bg-white',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800',
    button: 'bg-orange-500 hover:bg-orange-400 text-white',
    accent: 'text-orange-600',
    ring: 'ring-orange-300',
    bubble: 'bg-orange-500 text-white',
  },
  academy: {
    frame: 'border-purple-200 bg-gradient-to-br from-purple-100 via-violet-50 to-slate-100',
    panel: 'border-purple-200 bg-white',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    button: 'bg-purple-600 hover:bg-purple-500 text-white',
    accent: 'text-purple-600',
    ring: 'ring-purple-300',
    bubble: 'bg-purple-600 text-white',
  },
  success: {
    frame: 'border-emerald-200 bg-gradient-to-br from-emerald-100 via-teal-50 to-slate-100',
    panel: 'border-emerald-200 bg-white',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    accent: 'text-emerald-600',
    ring: 'ring-emerald-300',
    bubble: 'bg-emerald-600 text-white',
  },
};

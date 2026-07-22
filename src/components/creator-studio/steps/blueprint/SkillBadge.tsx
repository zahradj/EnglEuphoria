import React from 'react';
import { SkillFocus } from '../../CreatorContext';
import { cn } from '@/lib/utils';

const STYLES: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  Grammar:            { dot: 'bg-sky-500',     text: 'text-sky-700 dark:text-sky-300',     bg: 'bg-sky-500/10',     border: 'border-sky-500/30' },
  Vocabulary:         { dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-500/10',   border: 'border-amber-500/30' },
  'Reading/Listening':{ dot: 'bg-rose-500',    text: 'text-rose-700 dark:text-rose-300',   bg: 'bg-rose-500/10',    border: 'border-rose-500/30' },
  Speaking:           { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  Review:             { dot: 'bg-violet-500',  text: 'text-violet-700 dark:text-violet-300',   bg: 'bg-violet-500/10',  border: 'border-violet-500/30' },
};

const FALLBACK = { dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-400/30' };

export const SkillBadge: React.FC<{ skill?: SkillFocus | string; className?: string }> = ({ skill, className }) => {
  const s = STYLES[skill as string] || FALLBACK;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
      s.bg, s.text, s.border, className
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {skill || 'Unknown'}
    </span>
  );
};

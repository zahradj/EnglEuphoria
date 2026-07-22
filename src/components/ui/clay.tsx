import React from 'react';
import { cn } from '@/lib/utils';

// ============= SUBJECT COLOR MAP =============
export type ClaySubject = 'phonics' | 'vocab' | 'grammar' | 'neutral' | 'gold' | 'streak';

const subjectStyles: Record<ClaySubject, { bg: string; icon: string; text: string; accent: string }> = {
  phonics: {
    bg: 'clay-phonics',
    icon: 'bg-gradient-to-br from-amber-300 to-yellow-400',
    text: 'text-amber-800',
    accent: 'hsl(45, 95%, 55%)',
  },
  vocab: {
    bg: 'clay-vocab',
    icon: 'bg-gradient-to-br from-emerald-300 to-green-400',
    text: 'text-emerald-800',
    accent: 'hsl(150, 55%, 45%)',
  },
  grammar: {
    bg: 'clay-grammar',
    icon: 'bg-gradient-to-br from-blue-300 to-sky-400',
    text: 'text-blue-800',
    accent: 'hsl(215, 70%, 55%)',
  },
  neutral: {
    bg: 'clay',
    icon: 'bg-gradient-to-br from-slate-200 to-slate-300',
    text: 'text-slate-700',
    accent: 'hsl(220, 15%, 60%)',
  },
  gold: {
    bg: 'clay-phonics',
    icon: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    text: 'text-amber-900',
    accent: 'hsl(40, 90%, 50%)',
  },
  streak: {
    bg: 'clay',
    icon: 'bg-gradient-to-br from-orange-400 to-red-400',
    text: 'text-orange-800',
    accent: 'hsl(20, 90%, 55%)',
  },
};

export const getClaySubjectStyle = (subject: ClaySubject) => subjectStyles[subject];

// ============= CLAY ICON =============
interface ClayIconProps {
  subject?: ClaySubject;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
};

export const ClayIcon: React.FC<ClayIconProps> = ({ subject = 'neutral', size = 'md', children, className }) => {
  const style = subjectStyles[subject];
  return (
    <div
      className={cn(
        'clay-icon flex items-center justify-center',
        style.icon,
        sizeMap[size],
        className
      )}
    >
      {children}
    </div>
  );
};

// ============= CLAY BADGE =============
interface ClayBadgeProps {
  subject?: ClaySubject;
  label: string;
  icon?: React.ReactNode;
  unlocked?: boolean;
  className?: string;
}

export const ClayBadge: React.FC<ClayBadgeProps> = ({
  subject = 'neutral',
  label,
  icon,
  unlocked = true,
  className,
}) => {
  const style = subjectStyles[subject];
  return (
    <div
      className={cn(
        'clay-badge inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all',
        unlocked ? style.bg : 'clay opacity-50 grayscale',
        unlocked ? style.text : 'text-muted-foreground',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </div>
  );
};

// ============= CLAY CARD =============
interface ClayCardProps {
  subject?: ClaySubject;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ClayCard: React.FC<ClayCardProps> = ({ subject = 'neutral', children, className, onClick }) => {
  return (
    <div
      className={cn(
        subjectStyles[subject].bg,
        'p-4 transition-transform duration-200',
        onClick && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// ============= CLAY CHARACTER =============
// Simple, friendly SVG character faces for reduced cognitive load
interface ClayCharacterProps {
  emotion?: 'happy' | 'thinking' | 'excited' | 'encouraging';
  subject?: ClaySubject;
  size?: number;
  className?: string;
}

export const ClayCharacter: React.FC<ClayCharacterProps> = ({
  emotion = 'happy',
  subject = 'neutral',
  size = 48,
  className,
}) => {
  const style = subjectStyles[subject];

  const eyes: Record<string, JSX.Element> = {
    happy: (
      <>
        <circle cx="18" cy="20" r="2.5" fill="#333" />
        <circle cx="30" cy="20" r="2.5" fill="#333" />
      </>
    ),
    thinking: (
      <>
        <circle cx="18" cy="20" r="2.5" fill="#333" />
        <circle cx="30" cy="20" r="2.5" fill="#333" />
        <circle cx="19" cy="18.5" r="1" fill="#fff" />
        <circle cx="31" cy="18.5" r="1" fill="#fff" />
      </>
    ),
    excited: (
      <>
        <ellipse cx="18" cy="20" rx="3" ry="3.5" fill="#333" />
        <ellipse cx="30" cy="20" rx="3" ry="3.5" fill="#333" />
        <circle cx="19" cy="18" r="1.2" fill="#fff" />
        <circle cx="31" cy="18" r="1.2" fill="#fff" />
      </>
    ),
    encouraging: (
      <>
        <path d="M15 20 Q18 17 21 20" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M27 20 Q30 17 33 20" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ),
  };

  const mouths: Record<string, JSX.Element> = {
    happy: <path d="M18 28 Q24 34 30 28" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />,
    thinking: <circle cx="24" cy="30" r="2.5" fill="#333" />,
    excited: <ellipse cx="24" cy="30" rx="4" ry="3" fill="#333" />,
    encouraging: <path d="M19 28 Q24 33 29 28" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />,
  };

  const cheeks = (
    <>
      <circle cx="13" cy="26" r="3" fill="hsl(0, 70%, 85%)" opacity="0.6" />
      <circle cx="35" cy="26" r="3" fill="hsl(0, 70%, 85%)" opacity="0.6" />
    </>
  );

  return (
    <div className={cn('clay-icon flex-shrink-0', style.icon, className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size * 0.75} height={size * 0.75}>
        {eyes[emotion]}
        {mouths[emotion]}
        {cheeks}
      </svg>
    </div>
  );
};

// ============= CLAY PROGRESS BAR =============
interface ClayProgressProps {
  value: number; // 0-100
  subject?: ClaySubject;
  height?: number;
  className?: string;
}

export const ClayProgress: React.FC<ClayProgressProps> = ({ value, subject = 'vocab', height = 10, className }) => {
  const style = subjectStyles[subject];
  return (
    <div
      className={cn('clay-pressed overflow-hidden', className)}
      style={{ height, background: 'hsl(220, 15%, 92%)' }}
    >
      <div
        className={cn('h-full rounded-xl transition-all duration-500', style.icon)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

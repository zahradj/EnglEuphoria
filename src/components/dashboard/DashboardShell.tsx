import { ReactNode } from 'react';
import { useStudentLevel, type StudentLevel } from '@/hooks/useStudentLevel';
import { cn } from '@/lib/utils';

const HUB_GRADIENT: Record<StudentLevel, string> = {
  playground: 'from-orange-500/20 via-amber-300/20 to-yellow-200/20',
  academy: 'from-purple-600/20 via-violet-500/15 to-indigo-500/20',
  professional: 'from-emerald-600/20 via-teal-500/15 to-cyan-500/20',
};

const HUB_ACCENT: Record<StudentLevel, string> = {
  playground: 'text-orange-600 dark:text-orange-400',
  academy: 'text-purple-600 dark:text-purple-400',
  professional: 'text-emerald-600 dark:text-emerald-400',
};

const HUB_BG_SOLID: Record<StudentLevel, string> = {
  playground: 'bg-orange-500',
  academy: 'bg-purple-600',
  professional: 'bg-emerald-600',
};

export function useHubTheme() {
  const { studentLevel } = useStudentLevel();
  const hub = (studentLevel ?? 'academy') as StudentLevel;
  return {
    hub,
    gradient: HUB_GRADIENT[hub],
    accent: HUB_ACCENT[hub],
    solid: HUB_BG_SOLID[hub],
  };
}

interface DashboardShellProps {
  children: ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  const { gradient } = useHubTheme();
  return (
    <div className={cn('min-h-dvh bg-gradient-to-br', gradient, className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {children}
      </div>
    </div>
  );
}

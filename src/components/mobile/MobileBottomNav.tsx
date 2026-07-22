import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Route as RouteIcon, BookMarked, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentLevel } from '@/hooks/useStudentLevel';

export type StudentNavTab =
  | 'dashboard'
  | 'learning-path'
  | 'homework'
  | 'profile';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: StudentNavTab) => void;
  className?: string;
}

const NAV_ITEMS: { id: StudentNavTab; icon: typeof Home; labelKey: string }[] = [
  { id: 'dashboard', icon: Home, labelKey: 'sd.nav.home' },
  { id: 'learning-path', icon: RouteIcon, labelKey: 'sd.menu.learningPath' },
  { id: 'homework', icon: BookMarked, labelKey: 'sd.menu.homework' },
  { id: 'profile', icon: User, labelKey: 'sd.nav.profile' },
];

const HUB_THEME: Record<string, { active: string; activeBg: string; ring: string }> = {
  playground: {
    active: 'text-orange-600 dark:text-orange-400',
    activeBg: 'bg-orange-500/15',
    ring: 'ring-orange-500/30',
  },
  academy: {
    active: 'text-indigo-600 dark:text-indigo-400',
    activeBg: 'bg-indigo-500/15',
    ring: 'ring-indigo-500/30',
  },
  professional: {
    active: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-500/15',
    ring: 'ring-emerald-500/30',
  },
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  const { t } = useTranslation();
  const { studentLevel } = useStudentLevel();
  const theme = HUB_THEME[studentLevel || 'playground'];

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 md:hidden',
        'bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800',
        'shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.15)]',
        className
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={t('sd.nav.aria')}
    >
      <ul className="grid grid-cols-4 gap-1 px-2 pt-2 pb-2">
        {NAV_ITEMS.map(({ id, icon: Icon, labelKey }) => {
          const isActive = activeTab === id;
          const label = t(labelKey);
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onTabChange(id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 w-full min-h-[52px] rounded-xl',
                  'transition-all duration-200 touch-manipulation select-none',
                  'active:scale-95',
                  isActive
                    ? cn(theme.active, theme.activeBg, 'ring-1', theme.ring)
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
              >
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                <span className="text-[10px] font-semibold tracking-tight">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

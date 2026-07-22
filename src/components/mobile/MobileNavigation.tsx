import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, Calendar, User, Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAutoHideTaskbar } from '@/hooks/useAutoHideTaskbar';
import { useAuth } from '@/contexts/AuthContext';

const getNavigationItems = (userRole: string | null) => {
  if (userRole === 'student') {
    return [
      { href: '/student', icon: Home, label: 'Dashboard' },
      { href: '/student/speaking-practice', icon: MessageCircle, label: 'Speaking' },
      { href: '/classroom', icon: BookOpen, label: 'Classroom' },
      { href: '/student/schedule', icon: Calendar, label: 'Schedule' },
      { href: '/student', icon: User, label: 'Profile' },
    ];
  }
  
  if (userRole === 'teacher') {
    return [
      { href: '/teacher', icon: Home, label: 'Dashboard' },
      { href: '/teacher/schedule', icon: Calendar, label: 'Schedule' },
      { href: '/classroom', icon: BookOpen, label: 'Classroom' },
      { href: '/discover-teachers', icon: Users, label: 'Discover' },
      { href: '/teacher', icon: User, label: 'Profile' },
    ];
  }
  
  // Default/guest navigation
  return [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/pricing', icon: Trophy, label: 'Pricing' },
    { href: '/about', icon: Users, label: 'About' },
    { href: '/login', icon: User, label: 'Login' },
  ];
};

export const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isVisible, handleTaskbarHover } = useAutoHideTaskbar({
    enabled: true,
    hideDelay: 3000,
    hideOnCalendarInteraction: location.pathname.includes('/teacher')
  });

  const navigationItems = getNavigationItems(user?.role || null);

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden pb-safe",
        "transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
      onMouseEnter={() => handleTaskbarHover(true)}
      onMouseLeave={() => handleTaskbarHover(false)}
    >
      <div className="flex justify-around items-center py-2 px-4">
        {navigationItems.map(({ href, icon: Icon, label }) => {
          const isActive = location.pathname === href;
          
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200",
                "min-w-0 flex-1 touch-manipulation",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-xs font-medium truncate w-full text-center">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { ThemeModeToggle } from '@/components/ui/ThemeModeToggle';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ScrollHeaderProps {
  className?: string;
  threshold?: number;
}

export const ScrollHeader: React.FC<ScrollHeaderProps> = ({
  className,
  threshold = 100
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out',
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0 pointer-events-none',
        className
      )}
    >
      <div className="bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo 
            size="small" 
            onClick={() => navigate('/')}
            className="cursor-pointer"
          />
          <div className="flex items-center gap-2">
            {user && <NotificationBell />}
            <ThemeModeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
};

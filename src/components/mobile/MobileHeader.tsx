import React from 'react';
import { ChevronLeft, Bell, Menu } from 'lucide-react';
import { TouchFriendlyButton } from './TouchFriendlyButton';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  showNotifications = false,
  notificationCount = 0,
  onNotificationClick,
  showMenu = false,
  onMenuClick,
  rightContent,
  className
}) => {
  return (
    <header className={cn(
      "sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border",
      "h-14 flex items-center justify-between px-4",
      "md:hidden", // Only show on mobile
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {showBackButton && (
          <TouchFriendlyButton
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            className="p-2 -ml-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </TouchFriendlyButton>
        )}
        
        {showMenu && (
          <TouchFriendlyButton
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2 -ml-2"
          >
            <Menu className="h-5 w-5" />
          </TouchFriendlyButton>
        )}
      </div>

      {/* Center Section */}
      <div className="flex-1 text-center">
        {title && (
          <h1 className="text-base font-semibold text-foreground truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {rightContent}
        
        {showNotifications && (
          <TouchFriendlyButton
            variant="ghost"
            size="sm"
            onClick={onNotificationClick}
            className="relative p-2"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </TouchFriendlyButton>
        )}
      </div>
    </header>
  );
};
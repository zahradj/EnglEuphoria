import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchFriendlyButtonProps extends ButtonProps {
  hapticFeedback?: boolean;
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  className,
  hapticFeedback = false,
  onClick,
  children,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Haptic feedback for supported devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    onClick?.(event);
  };

  return (
    <Button
      className={cn(
        // Minimum touch target size (44px recommended)
        "min-h-[44px] min-w-[44px]",
        // Enhanced touch feedback
        "active:scale-95 transition-transform duration-150",
        // Better spacing for touch
        "px-6 py-3",
        // Touch-specific styles
        "touch-manipulation select-none",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  className
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  const refreshProgress = Math.min(pullDistance / threshold, 1);
  const shouldTriggerRefresh = refreshProgress >= 1;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center",
          "transition-all duration-200 ease-out",
          "bg-background/80 backdrop-blur-sm border-b border-border"
        )}
        style={{
          height: `${Math.min(pullDistance, threshold)}px`,
          transform: `translateY(-${Math.min(pullDistance, threshold)}px)`
        }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw
            size={20}
            className={cn(
              "transition-all duration-200",
              isRefreshing && "animate-spin",
              shouldTriggerRefresh && !isRefreshing && "text-primary"
            )}
            style={{
              transform: `rotate(${refreshProgress * 180}deg)`
            }}
          />
          <span className="text-sm font-medium">
            {isRefreshing
              ? "Refreshing..."
              : shouldTriggerRefresh
              ? "Release to refresh"
              : "Pull to refresh"
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};
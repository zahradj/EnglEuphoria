import { useState, useEffect, useCallback, useRef } from 'react';

interface AutoHideOptions {
  enabled?: boolean;
  hideDelay?: number;
  showOnEdgeDistance?: number;
  hideOnCalendarInteraction?: boolean;
}

export const useAutoHideTaskbar = (options: AutoHideOptions = {}) => {
  const {
    enabled = true,
    hideDelay = 3000,
    showOnEdgeDistance = 100,
    hideOnCalendarInteraction = true
  } = options;

  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isCalendarActive, setIsCalendarActive] = useState(false);
  
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetHideTimer = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    if (enabled && !isHovered && !isCalendarActive) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    }
  }, [enabled, hideDelay, isHovered, isCalendarActive]);

  const showTaskbar = useCallback(() => {
    setIsVisible(true);
    lastActivityRef.current = Date.now();
    resetHideTimer();
  }, [resetHideTimer]);

  const hideTaskbar = useCallback(() => {
    if (enabled && !isHovered) {
      setIsVisible(false);
    }
  }, [enabled, isHovered]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return;
    
    const { clientY, clientX } = event;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // Show taskbar if mouse is near bottom edge
    if (windowHeight - clientY <= showOnEdgeDistance) {
      showTaskbar();
    }
    
    // Also show if mouse is near corners
    if ((clientX <= 50 || clientX >= windowWidth - 50) && 
        (clientY <= 50 || clientY >= windowHeight - 50)) {
      showTaskbar();
    }
    
    lastActivityRef.current = Date.now();
  }, [enabled, showOnEdgeDistance, showTaskbar]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled) return;
    
    const touch = event.touches[0];
    const windowHeight = window.innerHeight;
    
    // Show taskbar if touch is near bottom edge
    if (windowHeight - touch.clientY <= showOnEdgeDistance) {
      showTaskbar();
    }
  }, [enabled, showOnEdgeDistance, showTaskbar]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Toggle taskbar with 'H' key
    if (event.key === 'h' || event.key === 'H') {
      event.preventDefault();
      setIsVisible(prev => !prev);
    }
    
    // Show taskbar with Escape key
    if (event.key === 'Escape') {
      showTaskbar();
    }
  }, [enabled, showTaskbar]);

  const handleCalendarInteraction = useCallback((active: boolean) => {
    setIsCalendarActive(active);
    if (active && hideOnCalendarInteraction) {
      hideTaskbar();
    } else if (!active) {
      showTaskbar();
    }
  }, [hideOnCalendarInteraction, hideTaskbar, showTaskbar]);

  const handleTaskbarHover = useCallback((hovered: boolean) => {
    setIsHovered(hovered);
    if (hovered) {
      setIsVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    } else {
      resetHideTimer();
    }
  }, [resetHideTimer]);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    const throttledMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastActivityRef.current > 50) {
        handleMouseMove(event);
      }
    };

    document.addEventListener('mousemove', throttledMouseMove);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('keydown', handleKeyDown);
    
    // Initial timer
    resetHideTimer();

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('keydown', handleKeyDown);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [enabled, handleMouseMove, handleTouchStart, handleKeyDown, resetHideTimer]);

  return {
    isVisible,
    showTaskbar,
    hideTaskbar,
    handleCalendarInteraction,
    handleTaskbarHover,
    setIsVisible
  };
};
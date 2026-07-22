import { useEffect, useRef, useCallback } from 'react';

// Performance monitoring hook
export const usePerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
    }
  });

  const measureTime = useCallback((operationName: string) => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (process.env.NODE_ENV === 'development' && duration > 16) {
        console.warn(`⚠️ ${componentName}.${operationName} took ${duration.toFixed(2)}ms (>16ms)`);
      }
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    measureTime
  };
};

// Debounce hook for performance
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Animation frame hook for smooth animations
export const useAnimationFrame = (callback: () => void, deps: any[]) => {
  const requestRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      callback();
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, deps);
};

// Import useState for useDebounce
import { useState } from 'react';
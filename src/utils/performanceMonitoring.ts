/**
 * Performance monitoring utilities for production
 */

// Log slow queries to console in development
export const logSlowQuery = (queryName: string, duration: number) => {
  if (duration > 500) {
    console.warn(`⚠️ Slow query detected: ${queryName} took ${duration}ms`);
  }
};

// Measure query performance
export const measureQueryPerformance = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;
    
    logSlowQuery(queryName, duration);
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ Query failed: ${queryName} after ${duration}ms`, error);
    throw error;
  }
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Track component render times
export const measureRenderTime = (componentName: string) => {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    if (duration > 16) { // Slower than 60fps (16.67ms per frame)
      console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
};

// Virtual scrolling helper - calculate visible items
export const calculateVisibleRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } => {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);

  return { start, end };
};

import React, { useEffect } from 'react';
import { collectBundleMetrics, preloadCriticalResources } from '@/utils/bundleOptimization';

export const Analytics: React.FC = () => {
  useEffect(() => {
    // Initialize performance monitoring
    collectBundleMetrics();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Basic performance tracking
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
          }
        }
      });
      
      if ('observe' in observer) {
        observer.observe({ entryTypes: ['navigation'] });
      }
    }
  }, []);

  return null;
};
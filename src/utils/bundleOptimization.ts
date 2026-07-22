// Bundle optimization utilities

// Tree-shaking friendly imports
export const loadLucideIcon = async (iconName: string) => {
  try {
    const iconModule = await import(`lucide-react/${iconName}`);
    return iconModule.default;
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`);
    return null;
  }
};

// Dynamic imports for heavy libraries
export const loadChart = async () => {
  const module = await import('recharts');
  return module;
};

export const loadDatePicker = async () => {
  const module = await import('react-day-picker');
  return module;
};

// Service worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
        })
        .catch((registrationError) => {
        });
    });
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap';
  fontLink.as = 'style';
  document.head.appendChild(fontLink);
  
  // Preload critical images
  const criticalImages = ['/placeholder.svg'];
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

// Bundle analyzer data collection
export const collectBundleMetrics = () => {
  if (process.env.NODE_ENV === 'development') {
    // Collect performance metrics
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navigation = entry as PerformanceNavigationTiming;
          console.log('Bundle Performance Metrics:', {
            loadEventEnd: navigation.loadEventEnd,
            domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
            responseEnd: navigation.responseEnd,
            transferSize: (navigation as any).transferSize
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
  }
};
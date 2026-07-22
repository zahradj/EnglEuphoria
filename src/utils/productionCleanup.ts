import { devLog } from './production';

// Remove development-only code from production builds
export const removeConsoleStatements = () => {
  if (import.meta.env.PROD) {
    // Override console methods in production
    const noop = () => {};
    console.log = noop;
    console.debug = noop;
    console.info = noop;
    console.warn = noop;
    // Keep console.error for critical errors
  }
};

// Clean up development artifacts
export const cleanupDevelopmentArtifacts = () => {
  if (import.meta.env.PROD) {
    // Remove any development-only DOM elements
    const devElements = document.querySelectorAll('[data-dev-only]');
    devElements.forEach(element => element.remove());
    
    // Remove development-only CSS classes
    document.body.classList.remove('development');
    
    // Clear development-only localStorage items
    const devKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('dev_') || key.startsWith('debug_')
    );
    devKeys.forEach(key => localStorage.removeItem(key));
  }
};

// Clear all app caches and storage
export const clearAllCaches = async () => {
  try {
    // Clear localStorage (except auth tokens)
    const preservedKeys = ['supabase.auth.token', 'sb-auth-token', 'i18nextLng', 'theme-mode', 'cache_version'];
    const keysToRemove = Object.keys(localStorage).filter(
      key => !preservedKeys.some(pk => key.includes(pk))
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
};

// Production optimization
export const optimizeForProduction = () => {
  if (import.meta.env.PROD) {
    // Remove console statements
    removeConsoleStatements();
    
    // Clean up development artifacts
    cleanupDevelopmentArtifacts();
    
    // Set production flags
    (window as any).__PRODUCTION__ = true;
    (window as any).__DEV__ = false;
    
    devLog.log('Production optimizations applied');
  }
};


/**
 * Development Bypass Hook
 * SECURITY: Only works in development mode with specific query parameter
 * Production builds will tree-shake this code entirely
 */
export const useDevBypass = () => {
  const isDev = import.meta.env.DEV;
  
  if (!isDev) {
    return {
      isDevBypassActive: false,
      bypassRole: null
    };
  }
  
  const params = new URLSearchParams(window.location.search);
  const hasDevParam = params.get('dev_bypass') === 'true';
  const bypassRole = params.get('as_role') || 'student';
  
  return {
    isDevBypassActive: isDev && hasDevParam,
    bypassRole: bypassRole as 'student' | 'teacher' | 'admin' | 'parent'
  };
};

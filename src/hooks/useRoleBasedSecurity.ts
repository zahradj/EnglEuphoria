import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * SECURITY NOTE
 * ─────────────
 * `user.role` used throughout this hook is the value set by AuthContext
 * after a server-side query to the `user_roles` table via
 * `fetchUserRoleFromDatabase()`. It is NOT read from localStorage or any
 * other client-controlled source.
 *
 * `clearInsecureRoleStorage()` runs at app startup to purge any legacy
 * role keys (e.g. 'role', 'userType') that may have been stored client-side.
 *
 * ⚠️  Do NOT replace `user.role` with localStorage reads or URL params —
 *     these are untrusted and can be manipulated by the user.
 */
export function useRoleBasedSecurity() {
  const { user } = useAuth();
  const [isSecureConnection, setIsSecureConnection] = useState(false);

  useEffect(() => {
    // Check if connection is secure (HTTPS)
    setIsSecureConnection(window.location.protocol === 'https:' || window.location.hostname === 'localhost');
  }, []);

  const hasPermission = (requiredRole: string): boolean => {
    if (!user) return false;
    
    const roleHierarchy = {
      'student': 1,
      'teacher': 2, 
      'admin': 3
    };

    // SECURITY: user.role is the server-validated role from AuthContext.
    // It is fetched from the user_roles table and never sourced from client storage.
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  };

  const checkResourceAccess = (resourceType: string, resourceId: string): boolean => {
    if (!user) return false;

    switch (resourceType) {
      case 'lesson':
        return true; // Implement actual check
      case 'profile':
        // SECURITY: user.id and user.role are from server-validated AuthContext
        return user.id === resourceId || user.role === 'admin';
      default:
        return hasPermission('student');
    }
  };

  return {
    hasPermission,
    checkResourceAccess,
    isSecureConnection,
    userRole: user?.role || null
  };
}

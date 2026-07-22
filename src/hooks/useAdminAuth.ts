/**
 * useAdminAuth — server-validated admin status hook.
 *
 * SECURITY NOTE: Admin status is determined by `validateUserRole()` which
 * queries the `user_roles` table server-side. The result is never sourced
 * from localStorage, URL params, or any client-controlled storage.
 * `(user as any).role` from AuthContext is itself populated from the server
 * and used only as a fallback when `validateUserRole()` returns nothing.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateUserRole } from '@/utils/roleValidation';
import { logger } from '@/utils/logger';

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageTeachers: boolean;
  canAssignTeachers: boolean;
  canViewAnalytics: boolean;
  canModerateContent: boolean;
  canGenerateReports: boolean;
  canAccessSystemSettings: boolean;
}

const NO_PERMISSIONS: AdminPermissions = {
  canManageUsers: false,
  canManageTeachers: false,
  canAssignTeachers: false,
  canViewAnalytics: false,
  canModerateContent: false,
  canGenerateReports: false,
  canAccessSystemSettings: false,
};

export const useAdminAuth = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<AdminPermissions>(NO_PERMISSIONS);

  useEffect(() => {
    const checkAdminStatus = async () => {
      logger.debug('Admin auth check starting');
      
      if (!user?.id) {
        logger.debug('No user, setting non-admin status');
        setIsAdmin(false);
        setPermissions(NO_PERMISSIONS);
        setIsLoading(false);
        return;
      }

      // SECURITY: Validate role server-side only
      const validatedRole = await validateUserRole(user.id);
      const userRole = (user as any)?.role as string | undefined;
      
      // Use server-validated role if available, otherwise use AuthContext role
      const effectiveRole = validatedRole || userRole || 'student';
      
      const adminStatus = effectiveRole === 'admin';
      
      logger.debug('Admin status determined', { adminStatus, effectiveRole, userId: user.id });
      
      setIsAdmin(adminStatus);
      setPermissions(adminStatus ? {
        canManageUsers: true,
        canManageTeachers: true,
        canAssignTeachers: true,
        canViewAnalytics: true,
        canModerateContent: true,
        canGenerateReports: true,
        canAccessSystemSettings: true,
      } : NO_PERMISSIONS);
      
      setIsLoading(false);
      logger.debug('Admin auth check complete');
    };

    checkAdminStatus();
  }, [user]);

  return {
    isAdmin,
    isLoading,
    permissions,
    user,
  };
};

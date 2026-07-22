/**
 * SECURITY: Server-side role validation utilities
 * Never trust client-side role information - always validate against database
 */

import { supabase } from '@/lib/supabase';

/**
 * Validates user role from server-side user_roles table
 * @param userId - The user ID to check
 * @returns The validated role or null if not found
 */
export async function validateUserRole(userId: string): Promise<string | null> {
  try {
    // Fetch all roles for user (a user may have multiple roles)
    const ROLE_PRIORITY = ['admin', 'marketing', 'content_creator', 'teacher', 'student'];
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error validating user role:', error);
      return null;
    }

    if (userRoles && userRoles.length > 0) {
      // Return highest-priority role
      const roles = userRoles.map(r => r.role);
      return ROLE_PRIORITY.find(r => roles.includes(r)) || roles[0];
    }

    // Fallback to users table if user_roles doesn't have entry
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    return userData?.role || null;
  } catch (error) {
    console.error('Role validation error:', error);
    return null;
  }
}

/**
 * Checks if user has admin role
 * @param userId - The user ID to check
 * @returns true if user is admin, false otherwise
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const role = await validateUserRole(userId);
  return role === 'admin';
}

/**
 * Checks if user has teacher role
 * @param userId - The user ID to check
 * @returns true if user is teacher or admin, false otherwise
 */
export async function isUserTeacher(userId: string): Promise<boolean> {
  const role = await validateUserRole(userId);
  return role === 'teacher' || role === 'admin';
}

/**
 * Checks if user has student role
 * @param userId - The user ID to check
 * @returns true if user is student, false otherwise
 */
export async function isUserStudent(userId: string): Promise<boolean> {
  const role = await validateUserRole(userId);
  return role === 'student';
}

/**
 * SECURITY WARNING: This function clears insecure localStorage role data
 * Call this on app initialization to remove legacy client-side role storage
 */
export function clearInsecureRoleStorage(): void {
  if (typeof window !== 'undefined') {
    // Remove all insecure role-related localStorage items
    const insecureKeys = ['userType', 'role', 'adminName', 'teacherName', 'studentName'];
    insecureKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.warn(`🔒 Removing insecure localStorage key: ${key}`);
        localStorage.removeItem(key);
      }
    });
  }
}

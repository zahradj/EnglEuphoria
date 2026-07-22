import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns true if the current user has content editing privileges.
 * Only admin and content_creator roles can edit slides, use AI tools,
 * and save/publish lessons. Teachers get read-only presenter mode.
 */
export function useCanEditContent(): boolean {
  const { user } = useAuth();
  if (!user) return false;
  const role = (user as any).role;
  return role === 'admin' || role === 'content_creator';
}

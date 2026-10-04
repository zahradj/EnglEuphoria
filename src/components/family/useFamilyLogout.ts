import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Sign out, clear cached data (so the next person on a shared device never sees the previous family's
 * information) and go to the login page. Shared by the parent top bar and the child's floating pill.
 */
export function useFamilyLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signOut();
    } catch {
      /* signOut clears local state itself; carry on to the login page */
    } finally {
      queryClient.clear();
      navigate('/login', { replace: true });
    }
  };

  return { logout, busy };
}

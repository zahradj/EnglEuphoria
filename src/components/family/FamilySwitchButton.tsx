import { Link, useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Floating "Switch" pill for managed child profiles, so a sibling (or the parent, via PIN) can take over
 * the shared device without anyone logging out. Dashboards only - never over a lesson.
 */
export function FamilySwitchButton() {
  const { session } = useAuth();
  const { pathname } = useLocation();

  const isManagedChild = session?.user?.user_metadata?.managed_child === true;
  if (!isManagedChild || !pathname.startsWith('/dashboard')) return null;

  return (
    <Link
      to="/who-is-learning"
      className="fixed bottom-4 left-4 z-40 flex min-h-[44px] items-center gap-2 rounded-full border bg-card/95 px-4 text-sm font-medium shadow-lg backdrop-blur hover:bg-card"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Users className="h-4 w-4" /> Switch
    </Link>
  );
}

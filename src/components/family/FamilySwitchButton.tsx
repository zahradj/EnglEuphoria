import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Lock, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyError, switchProfile } from '@/lib/familyProfiles';
import { PinDialog } from './PinDialog';
import { useFamilyLogout } from './useFamilyLogout';

/**
 * Floating pills for managed child profiles, on dashboards only (never over a lesson):
 *  - Switch: a sibling takes over the shared device, no logout needed.
 *  - Parent: the lock opens the PIN box and returns to the family dashboard (only a grown-up knows the PIN).
 *  - Log out: ends the session.
 */
export function FamilySwitchButton() {
  const { session } = useAuth();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { logout, busy } = useFamilyLogout();
  const [pinOpen, setPinOpen] = useState(false);

  const isManagedChild = session?.user?.user_metadata?.managed_child === true;
  if (!isManagedChild || !pathname.startsWith('/dashboard')) return null;

  const pill =
    'flex min-h-[44px] items-center gap-2 rounded-full border bg-card/95 px-4 text-sm font-medium shadow-lg backdrop-blur hover:bg-card';

  const unlockParent = async (pin: string) => {
    try {
      // Full page load into the parent's account so nothing from the child's session survives.
      window.location.assign(await switchProfile('parent', pin));
    } catch (e) {
      if (e instanceof FamilyError && e.triesLeft !== undefined && e.triesLeft > 0) {
        throw new FamilyError(`${e.message} ${e.triesLeft} ${e.triesLeft === 1 ? 'try' : 'tries'} left.`);
      }
      throw e;
    }
  };

  return (
    <>
      <div
        className="fixed bottom-4 start-4 z-40 flex flex-wrap items-center gap-2"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Link to="/who-is-learning" className={pill}>
          <Users className="h-4 w-4" aria-hidden /> {t('pd.nav.switch')}
        </Link>
        <button type="button" onClick={() => setPinOpen(true)} className={pill}>
          <Lock className="h-4 w-4" aria-hidden /> {t('pd.nav.parent')}
        </button>
        <button type="button" onClick={logout} disabled={busy} className={pill}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4 rtl:rotate-180" aria-hidden />}
          {t('pd.nav.logout')}
        </button>
      </div>

      <PinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        title="Parent PIN"
        description="Ask a grown-up to enter the 4-digit family PIN."
        submitLabel="Unlock"
        onSubmit={unlockParent}
      />
    </>
  );
}

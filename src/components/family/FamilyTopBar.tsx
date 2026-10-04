import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFamilyLogout } from './useFamilyLogout';

interface Props {
  /** Where "Back" goes when there is no in-app history to return to (e.g. the page was opened directly). */
  backTo?: string;
  className?: string;
}

/**
 * Back + Log out for the parent screens. "Back" returns to the previous in-app page, or to `backTo` when the
 * page was the first one opened.
 */
export function FamilyTopBar({ backTo = '/', className }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, busy } = useFamilyLogout();

  // 'default' is the key of the very first entry: nothing to go back to inside the app.
  const hasHistory = location.key !== 'default';
  const goBack = () => (hasHistory ? navigate(-1) : navigate(backTo, { replace: true }));

  return (
    <div className={cn('mx-auto flex w-full max-w-6xl items-center justify-between gap-2', className)}>
      <Button variant="ghost" onClick={goBack} className="min-h-[44px] gap-2 px-3">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        {t('pd.nav.back')}
      </Button>
      <Button variant="outline" onClick={logout} disabled={busy} className="min-h-[44px] gap-2 px-4">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4 rtl:rotate-180" aria-hidden />}
        {t('pd.nav.logout')}
      </Button>
    </div>
  );
}

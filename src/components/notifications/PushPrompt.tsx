import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const DISMISS_KEY = 'push-prompt-dismissed';

const wasDismissed = () => {
  try { return window.localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
};

/**
 * A small dismissible card on the student and teacher dashboards: "Turn on notifications".
 * Shows only when push can be turned on (or, on an iPhone, needs the app added to the Home Screen).
 */
export const PushPrompt: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { status, busy, enable } = usePushNotifications(user?.id);
  const [dismissed, setDismissed] = useState(wasDismissed);

  if (!user || dismissed || (status !== 'ready' && status !== 'needs-install')) return null;

  const dismiss = () => {
    setDismissed(true);
    try { window.localStorage.setItem(DISMISS_KEY, '1'); } catch { /* storage unavailable */ }
  };

  const turnOn = async () => {
    try {
      const next = await enable();
      if (next === 'blocked') {
        toast({ title: t('pn.blocked', 'Notifications are blocked. Allow them in your browser settings to turn them on.'), variant: 'destructive' });
      } else if (next === 'on') {
        toast({ title: t('pn.enabled', 'Notifications are on') });
        dismiss();
      }
    } catch {
      toast({ title: t('pn.error', 'Could not turn on notifications. Please try again.'), variant: 'destructive' });
    }
  };

  return (
    <div
      role="region"
      aria-label={t('pn.title', 'Get lesson alerts')}
      className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
        <Bell className="h-5 w-5 text-primary" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{t('pn.title', 'Get lesson alerts')}</p>
        <p className="text-xs text-muted-foreground">
          {status === 'needs-install'
            ? t('pn.iosHint', 'On iPhone, first add EnglEuphoria to your Home Screen, then turn notifications on.')
            : t('pn.body', 'Turn on notifications so you never miss a lesson, a change or a message.')}
        </p>
      </div>
      {status === 'ready' && (
        <Button size="sm" onClick={turnOn} disabled={busy} className="shrink-0">
          {t('pn.enable', 'Turn on notifications')}
        </Button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('pn.later', 'Not now')}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

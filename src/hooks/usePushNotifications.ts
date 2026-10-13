import { useCallback, useEffect, useState } from 'react';
import { disablePush, enablePush, getPushStatus, syncPushOwner, type PushStatus } from '@/lib/pushNotifications';

export function usePushNotifications(userId?: string | null) {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) { setStatus(null); return; }
    let cancelled = false;
    void (async () => {
      await syncPushOwner().catch(() => {});
      const s = await getPushStatus();
      if (!cancelled) setStatus(s);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const s = await enablePush();
      setStatus(s);
      return s;
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      await disablePush();
      setStatus(await getPushStatus());
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, enable, disable };
}

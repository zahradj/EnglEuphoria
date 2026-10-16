import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CameraOff, Loader2 } from 'lucide-react';
import type { CameraIssueCode } from '@/lib/classroom/mediaHealth';

const KEY: Record<CameraIssueCode, { key: string; text: string }> = {
  denied: { key: 'cm.camera.denied', text: 'The browser is blocking your camera. Click the lock icon in the address bar, allow the camera, then try again.' },
  in_use: { key: 'cm.camera.inUse', text: 'Another app or tab is using your camera. Close it, then try again.' },
  not_found: { key: 'cm.camera.notFound', text: 'No camera was found. Check that it is plugged in and switched on, then try again.' },
  lost: { key: 'cm.camera.lost', text: 'Your camera stopped working. Try again.' },
  unknown: { key: 'cm.camera.unknown', text: 'Your camera is not working. Try again.' },
};

interface Props {
  issue: CameraIssueCode | null;
  /** Resolves true when the camera is back (and has been sent to the call). */
  onRetry: () => Promise<boolean>;
  className?: string;
}

/**
 * Tells the person WHY their video is missing and lets them fix it without leaving the lesson. Before this the student joined
 * audio-only in silence and the teacher saw an empty tile with no idea whether it was the camera or the internet.
 */
export function CameraIssueBanner({ issue, onRetry, className = '' }: Props) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<'back' | 'still' | null>(null);

  // A new problem starts a fresh banner.
  useEffect(() => { if (issue) setNote(null); }, [issue]);
  // "Camera is back" disappears by itself.
  useEffect(() => {
    if (note !== 'back') return;
    const id = window.setTimeout(() => setNote(null), 3500);
    return () => window.clearTimeout(id);
  }, [note]);

  if (!issue && note !== 'back') return null;

  if (!issue) {
    return (
      <div role="status" className={`rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg ${className}`}>
        {t('cm.camera.back', 'Your camera is back!')}
      </div>
    );
  }

  const copy = KEY[issue];
  const retry = async () => {
    setBusy(true);
    const ok = await onRetry();
    setBusy(false);
    setNote(ok ? 'back' : 'still');
  };

  return (
    <div role="alert" className={`flex max-w-md items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-amber-950 shadow-xl ${className}`}>
      <CameraOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-extrabold">{t('cm.camera.title', "Your camera isn't on")}</p>
        <p className="mt-0.5 leading-snug">{t(copy.key, copy.text)}</p>
        {note === 'still' && <p className="mt-1 text-xs font-semibold text-amber-700">{t('cm.camera.still', 'Still no camera. Your lesson can go on with sound only.')}</p>}
        <button
          type="button"
          onClick={retry}
          disabled={busy}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
          {busy ? t('cm.camera.retrying', 'Trying…') : t('cm.camera.retry', 'Try again')}
        </button>
      </div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { CameraOff, WifiOff } from 'lucide-react';
import { parsePeerMediaStatus, type CameraIssueCode } from '@/lib/classroom/mediaHealth';
import { usePeerMediaStatus } from '@/lib/classroom/mediaStatusStore';

const REASON: Record<CameraIssueCode, { key: string; text: string }> = {
  denied: { key: 'cm.reason.denied', text: 'the browser is blocking it' },
  in_use: { key: 'cm.reason.inUse', text: 'another app is using it' },
  not_found: { key: 'cm.reason.notFound', text: 'no camera was found' },
  lost: { key: 'cm.reason.lost', text: 'it stopped working' },
  unknown: { key: 'cm.reason.unknown', text: 'reason unknown' },
};

/**
 * Tells one side of the call what is wrong on the OTHER side: a camera problem (and why) or a weak connection, so an empty video
 * tile is never a mystery and the teacher can help the student fix it instead of guessing.
 */
export function PeerMediaNotice({ peerRole, className = '' }: { peerRole: 'student' | 'teacher'; className?: string }) {
  const { t } = useTranslation();
  const notice = parsePeerMediaStatus(usePeerMediaStatus());
  if (!notice) return null;

  const who = peerRole === 'student' ? t('cm.peer.student', 'The student') : t('cm.peer.teacher', 'Your teacher');
  const Icon = notice.kind === 'no-camera' ? CameraOff : WifiOff;
  const text =
    notice.kind === 'no-camera'
      ? t('cm.peer.noCamera', {
          who,
          reason: t(REASON[notice.reason ?? 'unknown'].key, REASON[notice.reason ?? 'unknown'].text),
          defaultValue: "{{who}}'s camera isn't working: {{reason}}.",
        })
      : t('cm.peer.poorLink', { who, defaultValue: "{{who}}'s internet connection is weak, so the video may freeze." });

  return (
    <div role="status" className={`flex max-w-md items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 shadow-lg ${className}`}>
      <Icon className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <span>{text}</span>
    </div>
  );
}

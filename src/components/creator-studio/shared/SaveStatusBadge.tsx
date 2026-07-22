import { Cloud, CloudOff, Loader2, CheckCircle2, Pencil } from 'lucide-react';
import type { AutoSaveStatus } from '@/hooks/useAutoSaveAndHistory';
import { cn } from '@/lib/utils';

interface Props {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}

function timeAgo(d: Date | null): string {
  if (!d) return '';
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function SaveStatusBadge({ status, lastSavedAt, className }: Props) {
  let icon = <Cloud className="w-3.5 h-3.5" />;
  let text = 'Idle';
  let tone = 'text-muted-foreground bg-muted/40';

  if (status === 'dirty') {
    icon = <Pencil className="w-3.5 h-3.5" />;
    text = 'Editing…';
    tone = 'text-amber-700 bg-amber-100/80 dark:text-amber-300 dark:bg-amber-950/40';
  } else if (status === 'saving') {
    icon = <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    text = 'Saving…';
    tone = 'text-blue-700 bg-blue-100/80 dark:text-blue-300 dark:bg-blue-950/40';
  } else if (status === 'saved') {
    icon = <CheckCircle2 className="w-3.5 h-3.5" />;
    text = `Saved ${timeAgo(lastSavedAt)}`;
    tone = 'text-emerald-700 bg-emerald-100/80 dark:text-emerald-300 dark:bg-emerald-950/40';
  } else if (status === 'error') {
    icon = <CloudOff className="w-3.5 h-3.5" />;
    text = 'Save failed';
    tone = 'text-red-700 bg-red-100/80 dark:text-red-300 dark:bg-red-950/40';
  } else if (lastSavedAt) {
    icon = <CheckCircle2 className="w-3.5 h-3.5" />;
    text = `Saved ${timeAgo(lastSavedAt)}`;
    tone = 'text-emerald-700 bg-emerald-100/80 dark:text-emerald-300 dark:bg-emerald-950/40';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        tone,
        className,
      )}
      title={lastSavedAt ? `Last save: ${lastSavedAt.toLocaleTimeString()}` : ''}
    >
      {icon} {text}
    </span>
  );
}

import { Link } from 'react-router-dom';
import { Mic2 } from 'lucide-react';
import { useHubTheme } from '@/components/dashboard/DashboardShell';

/**
 * Ambient SRS prompt. Replaces nagging toasts with a single chip that pulses
 * softly when speaking practice is due. One tap → 1-minute speaking warm-up.
 */
export function WarmupChip({ due = true }: { due?: boolean }) {
  const { hub } = useHubTheme();
  if (!due) return null;

  const speakingPath = `/dashboard/${hub === 'professional' ? 'hub' : hub}/speaking`;
  return (
    <Link
      to={speakingPath}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
      aria-label="Start a 1-minute speaking warm-up"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <Mic2 className="h-3.5 w-3.5" />
      Warm-up · 1 min
    </Link>
  );
}

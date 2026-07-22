import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Sparkles } from 'lucide-react';
import { useResumeTarget } from '@/hooks/useResumeTarget';
import { useHubTheme } from '@/components/dashboard/DashboardShell';

/**
 * One clear next action. Replaces multi-tile dashboard scanning with a single
 * primary CTA: Resume → Start next → (idle copy).
 */
export function NextActionCard() {
  const { data, isLoading } = useResumeTarget();
  const { solid } = useHubTheme();

  if (isLoading) {
    return <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />;
  }

  const resume = data?.kind === 'resume';
  const next = data?.kind === 'next';
  const idle = !resume && !next;

  const title = resume
    ? `Resume: ${data?.lessonTitle ?? 'Your lesson'}`
    : next
      ? `Start next: ${data?.lessonTitle ?? 'New lesson'}`
      : 'You\'re all caught up';
  const subtitle = resume
    ? 'Pick up right where you left off.'
    : next
      ? 'One lesson to keep your momentum.'
      : 'Try a 1-minute speaking warm-up to stay sharp.';

  const href = data?.lessonId ? `/lesson/${data.lessonId}` : '/dashboard';

  return (
    <Card className="p-5 border-border bg-card">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-2xl ${solid} flex items-center justify-center text-white shrink-0`}>
          {idle ? <Sparkles className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {resume ? 'Continue' : next ? 'Up next' : 'Today'}
          </div>
          <div className="text-base font-semibold text-foreground truncate">{title}</div>
          <div className="text-sm text-muted-foreground truncate">{subtitle}</div>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link to={idle ? '/dashboard' : href}>
            {resume ? 'Resume' : next ? 'Start' : 'Warm up'}
          </Link>
        </Button>
      </div>
    </Card>
  );
}

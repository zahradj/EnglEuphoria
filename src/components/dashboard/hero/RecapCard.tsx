import { Link } from 'react-router-dom';
import { useActiveTheme } from '@/hooks/useActiveTheme';
import { useHubTheme } from '@/components/dashboard/DashboardShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Mic2, BookOpen } from 'lucide-react';

export function RecapCard() {
  const { data: theme } = useActiveTheme();
  const { hub, accent } = useHubTheme();

  if (!theme) return null;

  const speakingPath = `/dashboard/${hub === 'professional' ? 'hub' : hub}/speaking`;
  const vocabPath = `/dashboard/${hub === 'professional' ? 'hub' : hub}/vocab`;

  return (
    <Card className="p-5 space-y-4 bg-background/60 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Sparkles className={`h-4 w-4 ${accent}`} />
        <h3 className="font-semibold">Last Class Recap</h3>
        {theme.source === 'feedback' && (
          <span className="ml-auto text-xs text-muted-foreground">From your teacher</span>
        )}
      </div>

      {theme.feedbackContent ? (
        <p className="text-sm text-foreground/80 line-clamp-3">{theme.feedbackContent}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No recent recap yet — your teacher's notes will appear here after your next class.
        </p>
      )}

      <div className="rounded-xl bg-muted/50 p-3 space-y-1">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Active Theme this week
        </div>
        <div className={`text-base font-semibold capitalize ${accent}`}>
          {theme.theme}
        </div>
        {theme.homework && (
          <div className="text-xs text-foreground/70 mt-2">
            <span className="font-medium">Homework:</span> {theme.homework}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="default">
          <Link to={vocabPath}>
            <BookOpen className="h-4 w-4 mr-1.5" />
            Start Vocab
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to={speakingPath}>
            <Mic2 className="h-4 w-4 mr-1.5" />
            Record Homework
          </Link>
        </Button>
      </div>
    </Card>
  );
}

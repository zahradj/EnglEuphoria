import { useAuth } from '@/contexts/AuthContext';
import { CEFRBar } from './CEFRBar';
import { XPStreakWidget } from './XPStreakWidget';
import { RecapCard } from './RecapCard';
import { NextActionCard } from './NextActionCard';
import { WarmupChip } from './WarmupChip';
import { useActiveTheme } from '@/hooks/useActiveTheme';
import { Card } from '@/components/ui/card';
import { useHubTheme } from '@/components/dashboard/DashboardShell';

export function DashboardHero() {
  const { user } = useAuth();
  const { data: theme } = useActiveTheme();
  const { gradient } = useHubTheme();

  const name =
    (user as any)?.user_metadata?.first_name ||
    (user as any)?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';

  return (
    <div className="space-y-4">
      {/* Greeting band — compact, no longer dominates */}
      <Card className={`p-4 bg-gradient-to-br ${gradient} border-0`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Welcome back, {name}!
            </h1>
            {theme && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Active Theme: <span className="font-medium capitalize">{theme.theme}</span>
              </p>
            )}
          </div>
          <WarmupChip />
        </div>
      </Card>

      {/* Primary action — one clear next step */}
      <NextActionCard />

      {/* Demoted stats strip */}
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <CEFRBar />
        <XPStreakWidget />
      </div>

      <RecapCard />
    </div>
  );
}

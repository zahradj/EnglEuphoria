import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeModeToggle } from '@/components/ui/ThemeModeToggle';
import { Logo } from '@/components/Logo';
import { LogOut, ShieldCheck, Megaphone } from 'lucide-react';
import { MarketingDashboardContent } from '@/components/marketing/MarketingDashboardContent';

const MarketingDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = (user as any)?.role === 'admin';

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="relative overflow-hidden border-b border-border/60 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="small" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Megaphone className="h-4 w-4" />
                </span>
                Marketing Dashboard
                {isAdmin && <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> Admin view</Badge>}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Growth, acquisition, and brand reach.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeModeToggle />
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/super-admin')}>
                Admin dashboard
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <MarketingDashboardContent />
      </main>
    </div>
  );
};

export default MarketingDashboard;

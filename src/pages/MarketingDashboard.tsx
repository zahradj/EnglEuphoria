import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeModeToggle } from '@/components/ui/ThemeModeToggle';
import { Logo } from '@/components/Logo';
import { LogOut, ShieldCheck } from 'lucide-react';
import { MarketingDashboardContent } from '@/components/marketing/MarketingDashboardContent';

const MarketingDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = (user as any)?.role === 'admin';

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="small" />
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                Marketing Dashboard
                {isAdmin && <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> Admin view</Badge>}
              </h1>
              <p className="text-sm text-muted-foreground">Growth, acquisition, and brand reach.</p>
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

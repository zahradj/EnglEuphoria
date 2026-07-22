import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  BookOpen,
  User,
  Users,
  HelpCircle,
  LogOut,
  Menu,
} from 'lucide-react';

type TabType = 'dashboard' | 'schedule' | 'library' | 'creator' | 'analytics' | 'methodology' | 'account' | 'teacher-hub' | 'help';

interface MobileTeacherBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const primaryItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
  { id: 'account', label: 'Profile', icon: User },
];

const extraItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'methodology', label: 'Methodology', icon: BookOpen },
  { id: 'teacher-hub', label: 'Teacher Hub', icon: Users },
  { id: 'help', label: 'Help & Guide', icon: HelpCircle },
];

export const MobileTeacherBottomNav: React.FC<MobileTeacherBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handlePick = (tab: TabType) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border shadow-lg pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              {item.label}
            </button>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground">
              <Menu className="w-5 h-5" />
              More
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <div className="space-y-2 py-2">
              {extraItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start h-12"
                    onClick={() => handlePick(item.id)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

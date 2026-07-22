import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard, Users, FileText, Calendar, BarChart3, Sparkles,
  LogOut, ChevronDown, User, Settings, HeartPulse, DollarSign,
} from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';
import { useThemeMode } from '@/hooks/useThemeMode';
import logoBlack from '@/assets/logo-black.png';

export type ProfessionalTab =
  | 'command-center'
  | 'diagnostic-lab'
  | 'success-hub'
  | 'reports'
  | 'schedule'
  | 'analytics'
  | 'lesson-architect'
  | 'earnings'
  | 'account';

interface ProfessionalNavProps {
  activeTab: ProfessionalTab;
  onTabChange: (tab: ProfessionalTab) => void;
  teacherName: string;
  profileImageUrl?: string;
  onLogout: () => void;
}

const navItems: { id: ProfessionalTab; label: string; icon: React.ElementType }[] = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
  { id: 'diagnostic-lab', label: 'Diagnostic Lab', icon: Users },
  { id: 'success-hub', label: 'Success Hub', icon: HeartPulse },
  { id: 'lesson-architect', label: 'Lesson Architect', icon: Sparkles },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'earnings', label: 'My Earnings', icon: DollarSign },
];

export const ProfessionalNav: React.FC<ProfessionalNavProps> = ({
  activeTab,
  onTabChange,
  teacherName,
  profileImageUrl,
  onLogout,
}) => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div
                className="absolute inset-0 rounded-full opacity-90 blur-[1px]"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }}
              />
              <img
                src={isDark ? logoBlack : logoWhite}
                alt="EnglEuphoria"
                className="relative w-8 h-8 object-contain rounded-full p-0.5"
              />
            </div>
            <span
              className="hidden lg:inline text-lg font-bold bg-clip-text text-transparent leading-tight"
              style={{ backgroundImage: 'linear-gradient(to right, #7C3AED, #9333EA)' }}
            >
              EnglEuphoria
            </span>
          </div>

          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={`gap-1.5 text-xs font-medium rounded-lg px-3 h-9 transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 h-9">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={profileImageUrl} alt={teacherName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(teacherName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-xs font-medium text-foreground">
                  {teacherName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onTabChange('account')}>
                <User className="w-4 h-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  User, 
  Users, 
  LogOut,
  ChevronDown,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import { Logo } from '@/components/Logo';

type TabType = 'dashboard' | 'schedule' | 'library' | 'creator' | 'analytics' | 'methodology' | 'account' | 'teacher-hub' | 'help';

interface TeacherTopNavProps {
  teacherName: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  profileImageUrl?: string;
}

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'methodology', label: 'Methodology', icon: BookOpen },
  { id: 'account', label: 'Account', icon: User },
  { id: 'teacher-hub', label: 'Teacher Hub', icon: Users },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

export const TeacherTopNav: React.FC<TeacherTopNavProps> = ({
  teacherName,
  activeTab,
  onTabChange,
  profileImageUrl
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Logo size="small" />

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={`gap-2 ${isActive ? '' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profileImageUrl} alt={teacherName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(teacherName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">{teacherName}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onTabChange('account')}>
                <User className="w-4 h-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
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

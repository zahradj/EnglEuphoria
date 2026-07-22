import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrganization } from '@/hooks/useOrganization';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { 
  BarChart3, 
  Brain, 
  Settings, 
  Users, 
  Building2, 
  Zap,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  {
    name: 'Organization Dashboard',
    href: '/enterprise',
    icon: BarChart3,
    permission: 'view_analytics'
  },
  {
    name: 'Predictive Analytics',
    href: '/enterprise/analytics',
    icon: Brain,
    permission: 'view_analytics'
  },
  {
    name: 'User Management',
    href: '/enterprise/users',
    icon: Users,
    permission: 'manage_users'
  },
  {
    name: 'Integration Hub',
    href: '/enterprise/integrations',
    icon: Zap,
    permission: 'view_integrations'
  },
  {
    name: 'Organization Settings',
    href: '/enterprise/settings',
    icon: Settings,
    permission: 'manage_organization'
  }
];

export const EnterpriseLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { currentOrganization, organizations, switchOrganization, hasPermission } = useOrganization();
  const { isEnabled } = useFeatureFlags();

  const filteredNavigation = navigation.filter(item => 
    hasPermission(item.permission) && 
    (item.name !== 'Predictive Analytics' || isEnabled('advanced_analytics'))
  );

  return (
    <div className="flex h-dvh bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-card border-r">
          <SidebarContent 
            navigation={filteredNavigation}
            currentPath={location.pathname}
            currentOrganization={currentOrganization}
            organizations={organizations}
            switchOrganization={switchOrganization}
            closeSidebar={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 bg-card border-r">
          <SidebarContent 
            navigation={filteredNavigation}
            currentPath={location.pathname}
            currentOrganization={currentOrganization}
            organizations={organizations}
            switchOrganization={switchOrganization}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Top header */}
        <header className="bg-card border-b px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">Enterprise Portal</h1>
            </div>

            <div className="flex items-center gap-2">
              {currentOrganization && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{currentOrganization.name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigation: any[];
  currentPath: string;
  currentOrganization: any;
  organizations: any[];
  switchOrganization: (orgId: string) => void;
  closeSidebar?: () => void;
}

const SidebarContent = ({ 
  navigation, 
  currentPath, 
  currentOrganization, 
  organizations, 
  switchOrganization,
  closeSidebar 
}: SidebarContentProps) => {
  return (
    <div className="flex h-full flex-col">
      {/* Logo/Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-semibold">Enterprise</span>
        </div>
        {closeSidebar && (
          <Button variant="ghost" size="sm" onClick={closeSidebar}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Organization Selector */}
      {organizations.length > 1 && (
        <div className="p-4 border-b">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="truncate">{currentOrganization?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => switchOrganization(org.id)}
                  className={cn(
                    currentOrganization?.id === org.id && "bg-accent"
                  )}
                >
                  {org.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p>Enterprise Portal v2.0</p>
          <p>Advanced Analytics & Management</p>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNotificationCenter } from './AdminNotificationCenter';
import { ThemeModeToggle } from '@/components/ui/ThemeModeToggle';
import { Logo } from '@/components/Logo';

export const AdminHeader = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size="small" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your English learning platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="border-border hover:bg-primary/5">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          
          <ThemeModeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted" />
          <AdminNotificationCenter />
          
          <div className="flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-muted-foreground">Administrator</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="border-border hover:bg-primary/5">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
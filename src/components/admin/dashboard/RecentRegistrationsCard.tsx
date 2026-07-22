import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, GraduationCap, Users, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Registration {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface RecentRegistrationsCardProps {
  /** Switches the parent AdminDashboard's active tab in place. Preferred over
   *  a URL navigation to /admin?tab=... — that path is a legacy `<Navigate>`
   *  redirect to /super-admin which drops the query string, so the tab never
   *  actually switched. */
  onNavigate: (tab: string) => void;
}

export const RecentRegistrationsCard = ({ onNavigate }: RecentRegistrationsCardProps) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [unviewedCount, setUnviewedCount] = useState(0);

  useEffect(() => {
    fetchRecentRegistrations();

    // Subscribe to real-time updates for both students and teachers
    const channel = supabase
      .channel('new_registrations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          const newUser = payload.new as Registration;
          if (newUser.role === 'student' || newUser.role === 'teacher') {
            setRegistrations(prev => [newUser, ...prev].slice(0, 10));
            setUnviewedCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentRegistrations = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, created_at')
        .in('role', ['student', 'teacher'])
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching recent registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (user: Registration) => {
    onNavigate(user.role === 'teacher' ? 'teachers' : 'students');
    setUnviewedCount(0);
  };

  const getRoleIcon = (role: string) => {
    if (role === 'teacher') {
      return <GraduationCap className="w-4 h-4 text-primary" />;
    }
    return <Users className="w-4 h-4 text-success" />;
  };

  const getRoleBadge = (role: string) => {
    if (role === 'teacher') {
      return (
        <Badge className="text-xs bg-primary/20 text-primary border-0">
          Teacher
        </Badge>
      );
    }
    return (
      <Badge className="text-xs bg-success/20 text-success border-0">
        Student
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Recent Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-success flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-white" />
          </div>
          Recent Registrations
          {unviewedCount > 0 && (
            <Badge className="bg-warning text-warning-foreground">
              {unviewedCount} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No new registrations in the last 7 days</p>
        ) : (
          <div className="space-y-3">
            {registrations.map((user) => {
              const registrationDate = new Date(user.created_at);
              const timeAgo = getTimeAgo(registrationDate);

              return (
                <div
                  key={user.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    user.role === 'teacher' ? 'bg-primary/20' : 'bg-success/20'
                  }`}>
                    {getRoleIcon(user.role)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-foreground truncate">{user.full_name}</p>
                      {getRoleBadge(user.role)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-1">{user.email}</p>
                    <p className="text-xs text-muted-foreground/70">{timeAgo}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewProfile(user)}
                      className="h-8"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              size="sm"
              onClick={() => onNavigate('students')}
            >
              <Users className="w-3 h-3 mr-1" />
              Students
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="sm"
              onClick={() => onNavigate('teachers')}
            >
              <GraduationCap className="w-3 h-3 mr-1" />
              Teachers
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}

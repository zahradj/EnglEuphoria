import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Activity, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SecurityEvent {
  id: string;
  action: string;
  resource_type: string;
  created_at: string;
  metadata: Record<string, any>;
}

interface SecurityMetrics {
  totalEvents: number;
  recentAlertsCount: number;
  authenticationAttempts: number;
  suspiciousActivities: number;
}

export const SecurityMonitor: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    recentAlertsCount: 0,
    authenticationAttempts: 0,
    suspiciousActivities: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
    
    // Set up real-time monitoring
    const channel = supabase
      .channel('security-monitoring')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'security_audit_logs' },
        () => fetchSecurityData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSecurityData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch recent security events
      const { data: events } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (events) {
        setSecurityEvents(events);
        
        // Calculate metrics
        const totalEvents = events.length;
        const recentAlertsCount = events.filter(e => 
          new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;
        
        const authenticationAttempts = events.filter(e => 
          e.action.includes('auth') || e.action.includes('login')
        ).length;
        
        const suspiciousActivities = events.filter(e => 
          e.action.includes('failed') || 
          e.action.includes('blocked') ||
          e.action.includes('suspicious')
        ).length;

        setMetrics({
          totalEvents,
          recentAlertsCount,
          authenticationAttempts,
          suspiciousActivities
        });
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventSeverity = (action: string): 'low' | 'medium' | 'high' => {
    if (action.includes('failed') || action.includes('blocked')) return 'high';
    if (action.includes('update') || action.includes('delete')) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recentAlertsCount}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auth Attempts</CardTitle>
            <Lock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.authenticationAttempts}</div>
            <p className="text-xs text-muted-foreground">Authentication events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">Potential threats</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No security events recorded yet</p>
              </div>
            ) : (
              securityEvents.map((event) => {
                const severity = getEventSeverity(event.action);
                return (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(severity)}>
                          {severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{event.action}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Resource: {event.resource_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(event.created_at)}
                      </p>
                    </div>
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <details className="cursor-pointer">
                          <summary>Details</summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-xs">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Activity, 
  Users,
  Key,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'permission_change' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'resolved' | 'investigating' | 'open';
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'authentication' | 'authorization' | 'data_protection' | 'monitoring';
  severity: 'info' | 'warning' | 'critical';
}

export const SecurityDashboard = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [securityScore, setSecurityScore] = useState(85);
  const [loading, setLoading] = useState(true);
  const { currentOrganization, hasPermission } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    if (currentOrganization && hasPermission('view_security')) {
      loadSecurityData();
    }
  }, [currentOrganization]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSecurityEvents(),
        loadSecurityPolicies()
      ]);
      calculateSecurityScore();
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', currentOrganization?.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transform audit logs to security events
      const events: SecurityEvent[] = data?.map(log => ({
        id: log.id,
        type: getEventType(log.action, log.resource_type),
        severity: getEventSeverity(log.action, log.resource_type),
        description: `${log.action} on ${log.resource_type} ${log.resource_id}`,
        userId: log.user_id,
        ipAddress: log.ip_address || 'Unknown',
        userAgent: log.user_agent || 'Unknown',
        timestamp: log.created_at,
        status: 'open'
      })) || [];

      setSecurityEvents(events);
    } catch (error) {
      console.error('Error loading security events:', error);
    }
  };

  const loadSecurityPolicies = () => {
    // In a real implementation, these would be loaded from the database
    const policies: SecurityPolicy[] = [
      {
        id: '1',
        name: 'Two-Factor Authentication',
        description: 'Require 2FA for all admin accounts',
        enabled: true,
        category: 'authentication',
        severity: 'critical'
      },
      {
        id: '2',
        name: 'Password Complexity',
        description: 'Enforce strong password requirements',
        enabled: true,
        category: 'authentication',
        severity: 'warning'
      },
      {
        id: '3',
        name: 'Session Timeout',
        description: 'Automatic logout after 30 minutes of inactivity',
        enabled: true,
        category: 'authentication',
        severity: 'info'
      },
      {
        id: '4',
        name: 'Data Encryption',
        description: 'Encrypt sensitive data at rest and in transit',
        enabled: true,
        category: 'data_protection',
        severity: 'critical'
      },
      {
        id: '5',
        name: 'Audit Logging',
        description: 'Log all user actions and system changes',
        enabled: true,
        category: 'monitoring',
        severity: 'warning'
      },
      {
        id: '6',
        name: 'Role-based Access Control',
        description: 'Restrict access based on user roles and permissions',
        enabled: true,
        category: 'authorization',
        severity: 'critical'
      }
    ];

    setSecurityPolicies(policies);
  };

  const calculateSecurityScore = () => {
    // Simple security score calculation based on enabled policies
    const enabledPolicies = securityPolicies.filter(p => p.enabled);
    const totalPolicies = securityPolicies.length;
    const score = totalPolicies > 0 ? Math.round((enabledPolicies.length / totalPolicies) * 100) : 0;
    setSecurityScore(score);
  };

  const getEventType = (action: string, resourceType: string): SecurityEvent['type'] => {
    if (action === 'INSERT' && resourceType === 'users') return 'login';
    if (action === 'UPDATE' && resourceType === 'organization_members') return 'permission_change';
    if (action === 'SELECT' && resourceType.includes('sensitive')) return 'data_access';
    return 'system_change';
  };

  const getEventSeverity = (action: string, resourceType: string): SecurityEvent['severity'] => {
    if (resourceType === 'users' || resourceType === 'organization_members') return 'high';
    if (action === 'DELETE') return 'critical';
    if (action === 'UPDATE') return 'medium';
    return 'low';
  };

  const toggleSecurityPolicy = async (policyId: string) => {
    if (!hasPermission('manage_security')) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage security policies.",
        variant: "destructive"
      });
      return;
    }

    setSecurityPolicies(prev => prev.map(policy => 
      policy.id === policyId 
        ? { ...policy, enabled: !policy.enabled }
        : policy
    ));

    // Recalculate security score
    calculateSecurityScore();

    toast({
      title: "Security Policy Updated",
      description: "Security policy has been updated successfully."
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!hasPermission('view_security')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">You need security permissions to view this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage your organization's security posture
          </p>
        </div>
        <Button onClick={loadSecurityData} disabled={loading}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Score Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
              {securityScore}%
            </div>
            <Progress value={securityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityEvents.filter(e => e.severity === 'critical' && e.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">Critical security events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityEvents.filter(e => e.type === 'failed_login').length}
            </div>
            <p className="text-xs text-muted-foreground">In the last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {securityPolicies.filter(p => p.enabled).length}/{securityPolicies.length}
            </div>
            <p className="text-xs text-muted-foreground">Policies enabled</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Monitor and investigate security-related activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {event.severity === 'critical' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {event.severity === 'high' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                        {event.severity === 'medium' && <Eye className="h-5 w-5 text-yellow-500" />}
                        {event.severity === 'low' && <Activity className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{event.description}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleString()} • IP: {event.ipAddress}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge variant="outline">
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Investigate
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4">
            {['authentication', 'authorization', 'data_protection', 'monitoring'].map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category.replace('_', ' ')} Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityPolicies
                      .filter(policy => policy.category === category)
                      .map((policy) => (
                        <div key={policy.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">{policy.name}</div>
                              <div className="text-sm text-muted-foreground">{policy.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={getSeverityColor(policy.severity)}>
                              {policy.severity}
                            </Badge>
                            <Switch
                              checked={policy.enabled}
                              onCheckedChange={() => toggleSecurityPolicy(policy.id)}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  GDPR Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Data Processing Records</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Privacy Policy</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Subject Rights</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Breach Notification</span>
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  SOC 2 Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Security Controls</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Availability Monitoring</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Processing Integrity</span>
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confidentiality</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Compliance Alert</AlertTitle>
            <AlertDescription>
              Your SOC 2 audit is due in 30 days. Ensure all security controls are documented and tested.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Reports</CardTitle>
                <CardDescription>Generate comprehensive security reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Security Assessment Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  User Access Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Incident Response Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Vulnerability Assessment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Configure automatic security reporting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Weekly Security Summary</div>
                    <div className="text-sm text-muted-foreground">Every Monday at 9 AM</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Monthly Compliance Report</div>
                    <div className="text-sm text-muted-foreground">First day of each month</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Incident Alerts</div>
                    <div className="text-sm text-muted-foreground">Real-time notifications</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
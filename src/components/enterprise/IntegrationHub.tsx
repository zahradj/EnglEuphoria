import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useOrganization } from '@/hooks/useOrganization';
import { 
  Book, 
  Calendar, 
  Mail, 
  MessageSquare, 
  Video, 
  Users, 
  Zap, 
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Integration {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: any;
  status: 'active' | 'inactive' | 'error';
  config: any;
  lastSync?: string;
}

export const IntegrationHub = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const { currentOrganization, hasPermission } = useOrganization();
  const { toast } = useToast();

  const availableIntegrations = [
    {
      type: 'canvas',
      name: 'Canvas LMS',
      description: 'Sync courses, assignments, and grades with Canvas Learning Management System',
      icon: Book,
      features: ['Course Sync', 'Grade Passback', 'Assignment Import', 'Student Roster']
    },
    {
      type: 'google_classroom',
      name: 'Google Classroom',
      description: 'Import classes, students, and assignments from Google Classroom',
      icon: Users,
      features: ['Class Import', 'Student Management', 'Assignment Sync', 'Grade Export']
    },
    {
      type: 'zoom',
      name: 'Zoom',
      description: 'Create and manage Zoom meetings for virtual lessons',
      icon: Video,
      features: ['Meeting Creation', 'Recording Access', 'Attendance Tracking', 'Breakout Rooms']
    },
    {
      type: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sync lesson schedules with Google Calendar',
      icon: Calendar,
      features: ['Event Sync', 'Reminder Notifications', 'Availability Check', 'Meeting Links']
    },
    {
      type: 'slack',
      name: 'Slack',
      description: 'Send notifications and updates to Slack channels',
      icon: MessageSquare,
      features: ['Lesson Reminders', 'Progress Updates', 'Alert Notifications', 'Team Communication']
    },
    {
      type: 'sendgrid',
      name: 'SendGrid',
      description: 'Advanced email delivery and marketing automation',
      icon: Mail,
      features: ['Email Templates', 'Bulk Messaging', 'Analytics', 'Automated Campaigns']
    }
  ];

  useEffect(() => {
    if (currentOrganization) {
      loadIntegrations();
    }
  }, [currentOrganization]);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('organization_id', currentOrganization?.id);

      if (error) throw error;

      const integrationsWithDetails = data?.map(config => {
        const details = availableIntegrations.find(ai => ai.type === config.integration_type);
        return {
          id: config.id,
          type: config.integration_type,
          name: details?.name || config.integration_type,
          description: details?.description || '',
          icon: details?.icon || Zap,
          status: (config.is_active ? 'active' : 'inactive') as 'active' | 'inactive' | 'error',
          config: config.config_data,
          lastSync: config.last_sync_at
        };
      }) || [];

      setIntegrations(integrationsWithDetails);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (integration: Integration) => {
    if (!hasPermission('manage_integrations')) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage integrations.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newStatus = integration.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('integration_configs')
        .update({ 
          is_active: newStatus === 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', integration.id);

      if (error) throw error;

      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: newStatus }
          : int
      ));

      toast({
        title: "Integration Updated",
        description: `${integration.name} has been ${newStatus === 'active' ? 'enabled' : 'disabled'}.`
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration status.",
        variant: "destructive"
      });
    }
  };

  const configureIntegration = async (type: string, config: any) => {
    if (!hasPermission('manage_integrations')) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage integrations.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('integration_configs')
        .upsert([{
          organization_id: currentOrganization?.id,
          integration_type: type,
          config_data: config,
          is_active: true
        }]);

      if (error) throw error;

      await loadIntegrations();
      setSelectedIntegration(null);

      toast({
        title: "Integration Configured",
        description: "Integration has been successfully configured."
      });
    } catch (error) {
      console.error('Error configuring integration:', error);
      toast({
        title: "Error",
        description: "Failed to configure integration.",
        variant: "destructive"
      });
    }
  };

  const IntegrationCard = ({ integration, available = false }: { integration: any; available?: boolean }) => {
    const IconComponent = integration.icon;
    const isConfigured = !available;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconComponent className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                {isConfigured && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                      {integration.status}
                    </Badge>
                    {integration.lastSync && (
                      <span className="text-xs text-muted-foreground">
                        Last sync: {new Date(integration.lastSync).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {isConfigured && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={integration.status === 'active'}
                  onCheckedChange={() => toggleIntegration(integration)}
                />
                <Button variant="outline" size="sm" onClick={() => setSelectedIntegration(integration)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">{integration.description}</CardDescription>
          {integration.features && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Features:</p>
              <div className="flex flex-wrap gap-1">
                {integration.features.map((feature: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {available && (
            <Button 
              className="w-full mt-4" 
              onClick={() => setSelectedIntegration({ ...integration, status: 'inactive', config: {} })}
            >
              Configure Integration
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const ConfigurationForm = ({ integration }: { integration: Integration }) => {
    const [config, setConfig] = useState(integration.config || {});

    const handleSave = () => {
      configureIntegration(integration.type, config);
    };

    const renderConfigFields = () => {
      switch (integration.type) {
        case 'canvas':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="canvas_url">Canvas URL</Label>
                <Input
                  id="canvas_url"
                  placeholder="https://your-institution.instructure.com"
                  value={config.canvas_url || ''}
                  onChange={(e) => setConfig({...config, canvas_url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="api_token">API Token</Label>
                <Input
                  id="api_token"
                  type="password"
                  placeholder="Canvas API Token"
                  value={config.api_token || ''}
                  onChange={(e) => setConfig({...config, api_token: e.target.value})}
                />
              </div>
            </div>
          );

        case 'zoom':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder="Zoom API Key"
                  value={config.api_key || ''}
                  onChange={(e) => setConfig({...config, api_key: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="api_secret">API Secret</Label>
                <Input
                  id="api_secret"
                  type="password"
                  placeholder="Zoom API Secret"
                  value={config.api_secret || ''}
                  onChange={(e) => setConfig({...config, api_secret: e.target.value})}
                />
              </div>
            </div>
          );

        case 'slack':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={config.webhook_url || ''}
                  onChange={(e) => setConfig({...config, webhook_url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="default_channel">Default Channel</Label>
                <Input
                  id="default_channel"
                  placeholder="#general"
                  value={config.default_channel || ''}
                  onChange={(e) => setConfig({...config, default_channel: e.target.value})}
                />
              </div>
            </div>
          );

        default:
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="config_json">Configuration (JSON)</Label>
                <Textarea
                  id="config_json"
                  placeholder='{"key": "value"}'
                  value={JSON.stringify(config, null, 2)}
                  onChange={(e) => {
                    try {
                      setConfig(JSON.parse(e.target.value));
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                />
              </div>
            </div>
          );
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Configure {integration.name}</CardTitle>
          <CardDescription>
            Set up the connection parameters for this integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderConfigFields()}
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save Configuration</Button>
            <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!hasPermission('view_integrations')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">You need permission to view integrations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integration Hub</h2>
          <p className="text-muted-foreground">
            Connect with external services to enhance your platform
          </p>
        </div>
        <Button onClick={loadIntegrations} disabled={loading}>
          Refresh
        </Button>
      </div>

      {selectedIntegration ? (
        <ConfigurationForm integration={selectedIntegration} />
      ) : (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Integrations</TabsTrigger>
            <TabsTrigger value="available">Available Integrations</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {integrations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Integrations</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't configured any integrations yet. Browse available integrations to get started.
                  </p>
                  <Button onClick={() => setSelectedIntegration(null)}>
                    Browse Integrations
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableIntegrations
                .filter(ai => !integrations.some(i => i.type === ai.type))
                .map((integration) => (
                  <IntegrationCard key={integration.type} integration={integration} available />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integration Marketplace</CardTitle>
                <CardDescription>
                  Discover more integrations and custom solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Custom Integrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Need a specific integration? Our team can build custom solutions for your organization.
                      </p>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Request Custom Integration
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">API Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Build your own integrations using our comprehensive API documentation.
                      </p>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View API Docs
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
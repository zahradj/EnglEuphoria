import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CollaborativeWhiteboard } from './CollaborativeWhiteboard';
import { GlobalPerformanceMonitor } from './GlobalPerformanceMonitor';
import { BusinessIntelligenceDashboard } from './BusinessIntelligenceDashboard';
import { ComplianceSecurityDashboard } from './ComplianceSecurityDashboard';
import { RealTimeCollaboration } from '../RealTimeCollaboration';
import { 
  Globe, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Video,
  BarChart3,
  Lock,
  Settings,
  Activity
} from 'lucide-react';

interface EnterpriseMetrics {
  globalUsers: number;
  regionsActive: number;
  avgLatency: number;
  uptime: number;
  revenue: number;
  compliance: number;
}

export const EnhancedEnterpriseHub = () => {
  const [activeRoom] = useState('enterprise-hub-demo');
  const [metrics] = useState<EnterpriseMetrics>({
    globalUsers: 12847,
    regionsActive: 15,
    avgLatency: 45,
    uptime: 99.98,
    revenue: 234567,
    compliance: 94
  });

  const features = [
    {
      title: 'Global Infrastructure',
      description: 'Multi-regional deployment with intelligent routing',
      icon: Globe,
      status: 'active',
      metrics: `${metrics.regionsActive} regions • ${metrics.avgLatency}ms avg latency`
    },
    {
      title: 'Real-Time Collaboration',
      description: 'WebRTC-powered video, whiteboard, and presence',
      icon: Video,
      status: 'active',
      metrics: `${metrics.globalUsers} active users • ${metrics.uptime}% uptime`
    },
    {
      title: 'Business Intelligence',
      description: 'AI-powered analytics and predictive insights',
      icon: BarChart3,
      status: 'active',
      metrics: `$${metrics.revenue.toLocaleString()} revenue • +18.2% growth`
    },
    {
      title: 'Compliance & Security',
      description: 'Enterprise-grade security and global compliance',
      icon: Shield,
      status: 'active',
      metrics: `${metrics.compliance}% compliance score • Zero breaches`
    }
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Enterprise Command Center</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Phase 8 Complete: Global Infrastructure, AI-Powered Analytics, and Enterprise Security
          </p>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <Activity className="h-3 w-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.metrics}</p>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Main Dashboard */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Global Operations Dashboard
                </CardTitle>
                <CardDescription>
                  Real-time monitoring and management across all enterprise systems
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Phase 8 Complete
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="collaboration" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
              </TabsList>

              <TabsContent value="collaboration" className="mt-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Real-Time Global Collaboration</h3>
                    <p className="text-muted-foreground">
                      Enhanced WebRTC infrastructure with adaptive quality and global presence
                    </p>
                  </div>
                  <RealTimeCollaboration roomId={activeRoom} />
                </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Global Performance Monitoring</h3>
                    <p className="text-muted-foreground">
                      Real-time infrastructure metrics and optimization across all regions
                    </p>
                  </div>
                  <GlobalPerformanceMonitor />
                </div>
              </TabsContent>

              <TabsContent value="intelligence" className="mt-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">AI-Powered Business Intelligence</h3>
                    <p className="text-muted-foreground">
                      Predictive analytics, revenue forecasting, and market intelligence
                    </p>
                  </div>
                  <BusinessIntelligenceDashboard />
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="mt-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Enterprise Security & Compliance</h3>
                    <p className="text-muted-foreground">
                      Global compliance monitoring and enterprise-grade security
                    </p>
                  </div>
                  <ComplianceSecurityDashboard />
                </div>
              </TabsContent>

              <TabsContent value="whiteboard" className="mt-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Collaborative Whiteboard</h3>
                    <p className="text-muted-foreground">
                      Real-time collaborative drawing with presence indicators and version control
                    </p>
                  </div>
                  <CollaborativeWhiteboard 
                    roomId={activeRoom}
                    userId="demo-user"
                    userName="Demo User"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Phase Summary */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 text-green-700 dark:text-green-300">
                <TrendingUp className="h-6 w-6" />
                <h3 className="text-xl font-semibold">Phase 8: Global Scale & Advanced AI Integration - Complete</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium">✅ AI-Powered Learning Engine</p>
                  <p className="text-muted-foreground">Personalized paths, tutoring, analytics</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">✅ Global Infrastructure</p>
                  <p className="text-muted-foreground">WebRTC, CDN, multi-regional</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">✅ Business Intelligence</p>
                  <p className="text-muted-foreground">Predictive analytics, forecasting</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">✅ Enterprise Security</p>
                  <p className="text-muted-foreground">Global compliance, zero-trust</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                <Users className="h-4 w-4 mr-2" />
                Ready for Phase 9: Advanced Collaboration & Community
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
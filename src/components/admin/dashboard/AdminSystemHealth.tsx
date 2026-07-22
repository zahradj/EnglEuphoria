import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  AlertTriangle,
  ShieldAlert,
  ClipboardList,
  Gift,
  Users,
  Activity,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ElementType;
  description: string;
}

interface AdminSystemHealthProps {
  metrics?: {
    /** Round-trip time of a real live Supabase query, in ms — the one thing
     *  a browser client can genuinely measure about backend health. */
    dbLatencyMs: number | null;
    dbHealthy: boolean;
    /** sentinel_incidents awaiting review (status pending/needs_human). */
    openIncidents: number;
    /** Teachers flagged by KPI alerts (score < 55 for 2+ consecutive weeks). */
    atRiskTeachers: number;
    /** Teacher profile approvals + hiring applications awaiting review. */
    pendingApprovals: number;
    /** Bonus payouts awaiting admin approval. */
    pendingBonuses: number;
    totalUsers: number;
  };
  loading?: boolean;
}

/** Below-threshold-is-bad style status (used for queue/backlog counts). */
const queueStatus = (value: number, warnAt: number, criticalAt: number): SystemMetric['status'] => {
  if (value >= criticalAt) return 'critical';
  if (value >= warnAt) return 'warning';
  return 'healthy';
};

export const AdminSystemHealth = ({ metrics, loading }: AdminSystemHealthProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return XCircle;
      default:
        return Activity;
    }
  };

  const dbLatencyMs = metrics?.dbLatencyMs ?? null;
  const dbHealthy = metrics?.dbHealthy ?? true;
  const dbStatus: SystemMetric['status'] = !dbHealthy
    ? 'critical'
    : dbLatencyMs == null
      ? 'warning'
      : dbLatencyMs <= 500
        ? 'healthy'
        : dbLatencyMs <= 1500
          ? 'warning'
          : 'critical';

  const systemMetrics: SystemMetric[] = [
    {
      name: 'Database Latency',
      value: dbLatencyMs ?? 0,
      unit: 'ms',
      status: dbStatus,
      icon: Database,
      description: dbHealthy ? 'Live round-trip time to Supabase' : 'Last query failed',
    },
    {
      name: 'Open Incidents',
      value: metrics?.openIncidents ?? 0,
      status: queueStatus(metrics?.openIncidents ?? 0, 1, 3),
      icon: ShieldAlert,
      description: 'Sentinel error reports awaiting review',
    },
    {
      name: 'At-Risk Teachers',
      value: metrics?.atRiskTeachers ?? 0,
      status: queueStatus(metrics?.atRiskTeachers ?? 0, 1, 3),
      icon: AlertTriangle,
      description: 'KPI alerts, 2+ consecutive weeks',
    },
    {
      name: 'Pending Approvals',
      value: metrics?.pendingApprovals ?? 0,
      status: queueStatus(metrics?.pendingApprovals ?? 0, 3, 8),
      icon: ClipboardList,
      description: 'Teacher profiles + applications in review',
    },
    {
      name: 'Pending Bonus Payouts',
      value: metrics?.pendingBonuses ?? 0,
      status: queueStatus(metrics?.pendingBonuses ?? 0, 3, 8),
      icon: Gift,
      description: 'Awaiting admin approval',
    },
    {
      name: 'Total Users',
      value: metrics?.totalUsers ?? 0,
      status: 'healthy',
      icon: Users,
      description: 'Registered on the platform',
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallHealth = systemMetrics.reduce((acc, metric) => {
    const score = metric.status === 'healthy' ? 100 : metric.status === 'warning' ? 75 : 50;
    return acc + score;
  }, 0) / systemMetrics.length;

  const overallStatus = overallHealth >= 90 ? 'healthy' : overallHealth >= 75 ? 'warning' : 'critical';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            System Health
          </CardTitle>
          <Badge className={getStatusColor(overallStatus)}>
            {overallHealth.toFixed(1)}% Healthy
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            const StatusIcon = getStatusIcon(metric.status);

            return (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-sm">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${metric.status === 'healthy' ? 'text-green-500' : metric.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
                    <span className="font-semibold text-sm">
                      {metric.value.toLocaleString()}{metric.unit ?? ''}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

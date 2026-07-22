import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  GraduationCap, 
  FileText, 
  BarChart3,
  Shield,
  Settings,
  Bell,
  MessageSquare,
  Calendar,
  Download,
  ArrowRight
} from 'lucide-react';

interface QuickAction {
  label: string;
  count?: number;
  icon: React.ElementType;
  onClick: () => void;
  variant: 'default' | 'urgent' | 'success' | 'warning';
  description?: string;
}

interface AdminQuickActionsProps {
  actions: {
    onManageUsers: () => void;
    onManageTeachers: () => void;
    onViewReports: () => void;
    onViewAnalytics: () => void;
    onModerateContent: () => void;
    onSystemSettings: () => void;
  };
  counts?: {
    pendingUsers: number;
    pendingTeachers: number;
    pendingReports: number;
    systemAlerts: number;
  };
}

export const AdminQuickActions = ({ actions, counts }: AdminQuickActionsProps) => {
  const quickActions: QuickAction[] = [
    {
      label: 'Manage Users',
      count: counts?.pendingUsers,
      icon: UserPlus,
      onClick: actions.onManageUsers,
      variant: counts?.pendingUsers ? 'urgent' : 'default',
      description: 'Add, edit, or remove users'
    },
    {
      label: 'Manage Teachers',
      count: counts?.pendingTeachers,
      icon: GraduationCap,
      onClick: actions.onManageTeachers,
      variant: counts?.pendingTeachers ? 'warning' : 'default',
      description: 'Review teacher applications'
    },
    {
      label: 'View Reports',
      count: counts?.pendingReports,
      icon: FileText,
      onClick: actions.onViewReports,
      variant: counts?.pendingReports ? 'urgent' : 'default',
      description: 'Generate platform reports'
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      onClick: actions.onViewAnalytics,
      variant: 'success',
      description: 'View platform analytics'
    },
    {
      label: 'Content Moderation',
      icon: Shield,
      onClick: actions.onModerateContent,
      variant: 'default',
      description: 'Review flagged content'
    },
    {
      label: 'System Settings',
      count: counts?.systemAlerts,
      icon: Settings,
      onClick: actions.onSystemSettings,
      variant: counts?.systemAlerts ? 'urgent' : 'default',
      description: 'Configure system settings'
    }
  ];

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'urgent':
        return {
          card: 'border-red-200 hover:border-red-300 bg-red-50/50',
          icon: 'bg-red-100 text-red-600',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          card: 'border-yellow-200 hover:border-yellow-300 bg-yellow-50/50',
          icon: 'bg-yellow-100 text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'success':
        return {
          card: 'border-green-200 hover:border-green-300 bg-green-50/50',
          icon: 'bg-green-100 text-green-600',
          button: 'bg-green-600 hover:bg-green-700 text-white'
        };
      default:
        return {
          card: 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50',
          icon: 'bg-blue-100 text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            const classes = getVariantClasses(action.variant);
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md group cursor-pointer ${classes.card}`}
                onClick={action.onClick}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${classes.icon}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{action.label}</h3>
                        {action.count && action.count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {action.count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Bell className="w-3 h-3 mr-1" />
              Notifications
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              Messages
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Export Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
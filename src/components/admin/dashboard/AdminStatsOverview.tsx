import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  GraduationCap,
  BookOpen,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  UserCheck,
  DollarSign,
} from 'lucide-react';

interface StatCard {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  format?: 'number' | 'percentage' | 'rating' | 'currency';
}

interface AdminStatsOverviewProps {
  stats?: {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    activeLessons: number;
    averageRating: number;
    userGrowth?: number;
    studentGrowth?: number;
    teacherGrowth?: number;
    lessonGrowth?: number;
    ratingChange?: number;
    monthlyRevenue?: number;
    revenueGrowth?: number;
  };
  loading?: boolean;
}

export const AdminStatsOverview = ({ stats, loading }: AdminStatsOverviewProps) => {
  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'rating':
        return value.toFixed(1);
      case 'currency':
        return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (change?: number) => {
    if (!change) return Minus;
    return change > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  const getTrendBgColor = (change?: number) => {
    if (!change) return 'bg-gray-50';
    return change > 0 ? 'bg-green-50' : 'bg-red-50';
  };

  const statCards: StatCard[] = [
    {
      title: 'Monthly Revenue',
      value: stats?.monthlyRevenue || 0,
      change: stats?.revenueGrowth,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      format: 'currency',
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      change: stats?.studentGrowth,
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Teachers',
      value: stats?.totalTeachers || 0,
      change: stats?.teacherGrowth,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Lessons',
      value: stats?.activeLessons || 0,
      change: stats?.lessonGrowth,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating || 0,
      change: stats?.ratingChange,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      format: 'rating',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        const TrendIcon = getTrendIcon(stat.change);
        
        return (
          <Card 
            key={index} 
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-transparent hover:border-l-blue-500"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {formatValue(stat.value, stat.format)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              
              {stat.change !== undefined && (
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`${getTrendBgColor(stat.change)} ${getTrendColor(stat.change)} border-0 font-medium`}
                  >
                    <TrendIcon className="w-3 h-3 mr-1" />
                    {Math.abs(stat.change)}%
                  </Badge>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
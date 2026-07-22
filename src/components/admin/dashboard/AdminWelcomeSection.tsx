import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Settings, TrendingUp } from 'lucide-react';

interface AdminWelcomeSectionProps {
  adminName?: string;
  stats?: {
    totalUsers: number;
    totalTeachers: number;
    activeLessons: number;
    systemHealth: number;
  };
}

export const AdminWelcomeSection = ({ adminName = 'Administrator', stats }: AdminWelcomeSectionProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-500';
    if (health >= 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-admin via-admin-accent to-admin-dark text-white relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      
      <CardContent className="p-8 relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
              <Crown className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {getGreeting()}, {adminName}
              </h1>
              <p className="text-white/80 text-lg">
                Welcome to your admin control center
              </p>
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
            <Shield className="w-4 h-4 mr-1" />
            Admin Access
          </Badge>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-300 text-sm font-semibold">{stats.totalUsers}</span>
                </div>
                <span className="text-sm text-white/80">Total Users</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-300 text-sm font-semibold">{stats.totalTeachers}</span>
                </div>
                <span className="text-sm text-white/80">Teachers</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalTeachers.toLocaleString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-orange-300" />
                </div>
                <span className="text-sm text-white/80">Active Lessons</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeLessons.toLocaleString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-purple-300" />
                </div>
                <span className="text-sm text-white/80">System Health</span>
              </div>
              <p className={`text-2xl font-bold ${getHealthColor(stats.systemHealth)}`}>
                {stats.systemHealth}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
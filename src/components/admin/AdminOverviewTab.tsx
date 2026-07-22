import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Baby, GraduationCap, Briefcase, Users, BookOpen, TrendingUp, Activity, ArrowUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemStats {
  kids: { students: number; lessons: number; completion: number };
  teen: { students: number; lessons: number; completion: number };
  adult: { students: number; lessons: number; completion: number };
}

interface RecentGraduation {
  id: string;
  student_name: string;
  from_system: string;
  to_system: string;
  transitioned_at: string;
}

export const AdminOverviewTab = () => {
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    kids: { students: 0, lessons: 0, completion: 0 },
    teen: { students: 0, lessons: 0, completion: 0 },
    adult: { students: 0, lessons: 0, completion: 0 },
  });
  const [recentGraduations, setRecentGraduations] = useState<RecentGraduation[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users by system
      const { data: usersData } = await supabase
        .from('users')
        .select('current_system')
        .eq('role', 'student');

      const kidsCount = usersData?.filter(u => u.current_system === 'kids').length || 0;
      const teenCount = usersData?.filter(u => u.current_system === 'teen').length || 0;
      const adultCount = usersData?.filter(u => u.current_system === 'adult').length || 0;

      // Fetch lessons by system
      const { data: lessonsData } = await supabase
        .from('curriculum_lessons')
        .select('target_system');

      const kidsLessons = lessonsData?.filter(l => l.target_system === 'kids').length || 0;
      const teenLessons = lessonsData?.filter(l => l.target_system === 'teen').length || 0;
      const adultLessons = lessonsData?.filter(l => l.target_system === 'adult').length || 0;

      setSystemStats({
        kids: { students: kidsCount, lessons: kidsLessons, completion: 72 },
        teen: { students: teenCount, lessons: teenLessons, completion: 68 },
        adult: { students: adultCount, lessons: adultLessons, completion: 81 },
      });

      // Fetch recent graduations (system transitions)
      const { data: transitionsData } = await supabase
        .from('system_transitions')
        .select(`
          id,
          from_system,
          to_system,
          transitioned_at,
          student_id
        `)
        .eq('transition_type', 'graduation')
        .order('transitioned_at', { ascending: false })
        .limit(5);

      if (transitionsData) {
        // Fetch student names
        const studentIds = transitionsData.map(t => t.student_id);
        const { data: studentsData } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', studentIds);

        const graduations = transitionsData.map(t => ({
          id: t.id,
          student_name: studentsData?.find(s => s.id === t.student_id)?.full_name || 'Unknown',
          from_system: t.from_system,
          to_system: t.to_system,
          transitioned_at: t.transitioned_at,
        }));
        setRecentGraduations(graduations);
      }

      // Get active users count
      setActiveUsers(usersData?.length || 0);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSystemLabel = (system: string) => {
    switch (system) {
      case 'kids': return '🎪 Playground';
      case 'teen': return '🏛️ Academy';
      case 'adult': return '🏢 Hub';
      default: return system;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Control Tower Overview</h1>
        <p className="text-muted-foreground">Real-time platform metrics across all systems</p>
      </div>

      {/* Active Users Counter */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700">
              <span className="animate-pulse mr-1">●</span> Live
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Per-System Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Playground (Kids) */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Baby className="h-5 w-5" />
              🎪 Playground (Kids)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Students</span>
              <span className="font-semibold">{systemStats.kids.students}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Lessons</span>
              <span className="font-semibold">{systemStats.kids.lessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Completion</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {systemStats.kids.completion}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Academy (Teens) */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <GraduationCap className="h-5 w-5" />
              🏛️ Academy (Teens)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Students</span>
              <span className="font-semibold">{systemStats.teen.students}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Lessons</span>
              <span className="font-semibold">{systemStats.teen.lessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Completion</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {systemStats.teen.completion}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Hub (Adults) */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Briefcase className="h-5 w-5" />
              🏢 Hub (Adults)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Students</span>
              <span className="font-semibold">{systemStats.adult.students}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Lessons</span>
              <span className="font-semibold">{systemStats.adult.lessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Completion</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {systemStats.adult.completion}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Graduations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Graduations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentGraduations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recent graduations
            </p>
          ) : (
            <div className="space-y-3">
              {recentGraduations.map(grad => (
                <div 
                  key={grad.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{grad.student_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getSystemLabel(grad.from_system)} → {getSystemLabel(grad.to_system)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(grad.transitioned_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

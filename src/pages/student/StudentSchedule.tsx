import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackNavigation } from '@/components/navigation/BackNavigation';
import { NavigationBreadcrumb } from '@/components/navigation/Breadcrumb';
import { ClassroomConnection } from '@/components/classroom/ClassroomConnection';
import { useAuth } from '@/contexts/AuthContext';
import { lessonService } from '@/services/lessonService';
import { useToast } from '@/hooks/use-toast';

const StudentSchedule = () => {
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const breadcrumbs = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Schedule', path: '/student/schedule' }
  ];

  useEffect(() => {
    fetchUpcomingLessons();
  }, [user]);

  const fetchUpcomingLessons = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const lessons = await lessonService.getStudentUpcomingLessons(user.id);
      setUpcomingLessons(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error",
        description: "Failed to load your lessons. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClassroom = () => {
    // Refresh lessons after joining to update status
    setTimeout(() => {
      fetchUpcomingLessons();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <BackNavigation />
          <NavigationBreadcrumb items={breadcrumbs} />
          
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Schedule</h1>
          </div>

          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <BackNavigation />
        <NavigationBreadcrumb items={breadcrumbs} />
        
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Schedule</h1>
        </div>

        {upcomingLessons.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Upcoming Lessons</h3>
              <p className="text-gray-500">You don't have any lessons scheduled at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {upcomingLessons.map((lesson) => (
              <ClassroomConnection
                key={lesson.id}
                lesson={lesson}
                userRole="student"
                onJoinClassroom={handleJoinClassroom}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;
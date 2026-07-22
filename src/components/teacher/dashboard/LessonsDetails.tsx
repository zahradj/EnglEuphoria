import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, User, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const LessonsDetails = () => {
  const { user } = useAuth();
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [pastLessons, setPastLessons] = useState<any[]>([]);
  const [lessonsWithoutFeedback, setLessonsWithoutFeedback] = useState<any[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!user?.id) return;

      // Upcoming lessons
      const { data: upcoming } = await supabase
        .from('lessons')
        .select(`
          *,
          student:users!lessons_student_id_fkey(
            email,
            full_name
          )
        `)
        .eq('teacher_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(10);

      // Past lessons
      const { data: past } = await supabase
        .from('lessons')
        .select(`
          *,
          student:users!lessons_student_id_fkey(
            email,
            full_name
          )
        `)
        .eq('teacher_id', user.id)
        .lt('scheduled_at', new Date().toISOString())
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })
        .limit(10);

      // Lessons without feedback (mock for now)
      const { data: noFeedback } = await supabase
        .from('lessons')
        .select(`
          *,
          student:users!lessons_student_id_fkey(
            email,
            full_name
          )
        `)
        .eq('teacher_id', user.id)
        .eq('status', 'completed')
        .is('feedback', null)
        .order('scheduled_at', { ascending: false })
        .limit(5);

      setUpcomingLessons(upcoming || []);
      setPastLessons(past || []);
      setLessonsWithoutFeedback(noFeedback || []);
    };

    fetchLessons();
  }, [user?.id]);

  const LessonItem = ({ lesson, showFeedbackLink = false }: { lesson: any, showFeedbackLink?: boolean }) => {
    const lessonDate = new Date(lesson.scheduled_at);
    const timeStr = lessonDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = lessonDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const studentName = lesson.student_name || lesson.student?.full_name || lesson.student?.email;

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-600">{dateStr} • {timeStr}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-3 w-3 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{lesson.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-600">{studentName}</span>
            {lesson.student_id && (
              <span className="text-xs text-gray-400">
                #{lesson.student_id.slice(-6).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        {showFeedbackLink && (
          <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
            Show
          </button>
        )}
      </div>
    );
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900">
          Lessons details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="upcoming" className="text-xs">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="text-xs">
              Past lessons
            </TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs relative">
              Without feedback
              {lessonsWithoutFeedback.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1 text-xs">
                  {lessonsWithoutFeedback.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-2 mt-4">
            {upcomingLessons.length > 0 ? (
              upcomingLessons.map((lesson) => (
                <LessonItem key={lesson.id} lesson={lesson} />
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming lessons</p>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-2 mt-4">
            {pastLessons.length > 0 ? (
              pastLessons.map((lesson) => (
                <LessonItem key={lesson.id} lesson={lesson} />
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No past lessons</p>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-2 mt-4">
            {lessonsWithoutFeedback.length > 0 ? (
              lessonsWithoutFeedback.map((lesson) => (
                <LessonItem key={lesson.id} lesson={lesson} showFeedbackLink />
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">All lessons have feedback</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

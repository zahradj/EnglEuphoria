import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Video, MessageSquare, ChevronRight, CalendarRange, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/ui/empty-state';
import { FeedbackReportDialog } from '@/components/classroom/FeedbackReportDialog';
import { LessonWrapUpDialog } from '@/components/classroom/LessonWrapUpDialog';

interface Lesson {
  id: string;
  scheduledAt: Date;
  title: string;
  studentName: string;
  studentAge: number | null;
  status: 'upcoming' | 'completed' | 'needs-feedback';
  classroomId: string | null;
  studentId: string | null;
}

interface LessonItemProps {
  lesson: Lesson;
  showEnterButton?: boolean;
  onEnter?: (lesson: Lesson) => void;
  onOpenFeedback?: (lesson: Lesson) => void;
  onWriteFeedback?: (lesson: Lesson) => void;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, showEnterButton, onEnter, onOpenFeedback, onWriteFeedback }) => {
  const clickable = lesson.status === 'completed' || lesson.status === 'needs-feedback';
  const handleRowClick = () => {
    if (lesson.status === 'completed') onOpenFeedback?.(lesson);
    else if (lesson.status === 'needs-feedback') onWriteFeedback?.(lesson);
  };
  return (
    <div
      className={`flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors ${clickable ? 'cursor-pointer' : ''}`}
      onClick={clickable ? handleRowClick : undefined}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-foreground truncate">{lesson.title}</p>
          {lesson.status === 'needs-feedback' && (
            <Badge variant="destructive" className="text-xs">Needs Feedback</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(lesson.scheduledAt, 'MMM d')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(lesson.scheduledAt, 'h:mm a')}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {lesson.studentName}{lesson.studentAge ? ` (${lesson.studentAge}y)` : ''}
          </span>
        </div>
      </div>

      {showEnterButton && (
        <Button size="sm" className="gap-1 shrink-0" onClick={(e) => { e.stopPropagation(); onEnter?.(lesson); }}>
          <Video className="w-4 h-4" />
          Enter
        </Button>
      )}

      {lesson.status === 'needs-feedback' && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1 shrink-0"
          onClick={(e) => { e.stopPropagation(); onWriteFeedback?.(lesson); }}
        >
          <MessageSquare className="w-4 h-4" />
          Feedback
        </Button>
      )}

      {lesson.status === 'completed' && (
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0"
          onClick={(e) => { e.stopPropagation(); onOpenFeedback?.(lesson); }}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export const LessonsListCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackLesson, setFeedbackLesson] = useState<Lesson | null>(null);
  const [wrapUpOpen, setWrapUpOpen] = useState(false);
  const [wrapUpLesson, setWrapUpLesson] = useState<Lesson | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadLessonsRef = React.useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadLessons = async () => {
      try {
        const { data, error } = await supabase
          .from('class_bookings')
          .select('id, classroom_id, scheduled_at, status, hub_type, notes, student_id')
          .eq('teacher_id', user.id)
          .order('scheduled_at', { ascending: true });

        if (error) throw error;
        if (cancelled) return;

        const studentIds = Array.from(new Set((data ?? []).map((r: any) => r.student_id).filter(Boolean)));
        let studentMap: Record<string, { name: string }> = {};
        if (studentIds.length) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', studentIds);
          studentMap = (profiles ?? []).reduce((acc: any, p: any) => {
            acc[p.id] = { name: p.full_name || 'Student' };
            return acc;
          }, {});
        }

        const mapped: Lesson[] = (data ?? []).map((row: any) => {
          const scheduledAt = new Date(row.scheduled_at);
          let status: Lesson['status'] = 'upcoming';
          if (row.status === 'completed') status = 'completed';
          else if (row.status === 'needs_feedback') status = 'needs-feedback';
          else if (scheduledAt.getTime() < Date.now() - 60 * 60 * 1000) status = 'needs-feedback';
          return {
            id: row.id,
            scheduledAt,
            title: row.notes || `${row.hub_type ? row.hub_type[0].toUpperCase() + row.hub_type.slice(1) + ' ' : ''}Lesson`,
            studentName: studentMap[row.student_id]?.name || 'Student',
            studentAge: null,
            status,
            classroomId: row.classroom_id ?? null,
            studentId: row.student_id ?? null,
          };
        });
        setLessons(mapped);
      } catch (err) {
        console.error('Failed to load lessons:', err);
        if (!cancelled) setLessons([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLessonsRef.current = loadLessons;
    loadLessons();

    // Realtime: refetch when this teacher's bookings change so newly booked
    // lessons appear in "Next lesson" without a manual refresh.
    const channel = supabase
      .channel(`teacher-bookings-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'class_bookings',
          filter: `teacher_id=eq.${user.id}`,
        },
        () => {
          if (!cancelled) loadLessons();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const upcomingLessons = lessons.filter(l => l.status === 'upcoming');
  const pastLessons = lessons.filter(l => l.status === 'completed');
  const needsFeedback = lessons.filter(l => l.status === 'needs-feedback');

  const handleEnter = (lesson: Lesson) => {
    if (lesson.classroomId) navigate(`/classroom/${lesson.classroomId}`);
    else navigate(`/classroom/${lesson.id}`);
  };

  const handleOpenFeedback = (lesson: Lesson) => {
    setFeedbackLesson(lesson);
    setFeedbackOpen(true);
  };

  const handleWriteFeedback = (lesson: Lesson) => {
    // Open the wrap-up dialog directly from the dashboard
    setWrapUpLesson(lesson);
    setWrapUpOpen(true);
  };

  const handleWrapUpChange = (open: boolean) => {
    setWrapUpOpen(open);
    if (!open) {
      // Refresh after submission so the row moves from "No Feedback" to "Past"
      setWrapUpLesson(null);
      // Re-fetch by toggling user dependency — simplest: reload lessons inline
      if (user?.id) {
        supabase
          .from('class_bookings')
          .select('id, status')
          .eq('teacher_id', user.id)
          .then(({ data }) => {
            if (!data) return;
            setLessons(prev =>
              prev.map(l => {
                const updated = data.find((d: any) => d.id === l.id);
                if (!updated) return l;
                let status: Lesson['status'] = l.status;
                if (updated.status === 'completed') status = 'completed';
                else if (updated.status === 'needs_feedback') status = 'needs-feedback';
                return { ...l, status };
              })
            );
          });
      }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lessons Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
              Upcoming ({upcomingLessons.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="text-xs sm:text-sm">
              Past ({pastLessons.length})
            </TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs sm:text-sm">
              No Feedback ({needsFeedback.length})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading lessons…</span>
            </div>
          ) : (
            <>
              <TabsContent value="upcoming" className="space-y-2">
                {upcomingLessons.length > 0 ? (
                  upcomingLessons.map(lesson => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      showEnterButton
                      onEnter={handleEnter}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={CalendarRange}
                    title="No upcoming lessons"
                    description="Once students book a session with you, it will appear here."
                    actionLabel="Manage availability"
                    onAction={() => navigate('/teacher/availability')}
                    compact
                  />
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-2">
                {pastLessons.length > 0 ? (
                  pastLessons.map(lesson => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      onOpenFeedback={handleOpenFeedback}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={Clock}
                    title="No past lessons yet"
                    description="Completed lessons will be archived here for your records."
                    compact
                  />
                )}
              </TabsContent>

              <TabsContent value="feedback" className="space-y-2">
                {needsFeedback.length > 0 ? (
                  needsFeedback.map(lesson => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      onWriteFeedback={handleWriteFeedback}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={MessageSquare}
                    title="All caught up!"
                    description="Every lesson has feedback. Great work mentoring your students."
                    compact
                  />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>

      <FeedbackReportDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        lessonId={feedbackLesson?.id ?? null}
        lessonTitle={feedbackLesson?.title}
      />

      <LessonWrapUpDialog
        open={wrapUpOpen}
        onOpenChange={handleWrapUpChange}
        lessonId={wrapUpLesson?.id}
        studentId={wrapUpLesson?.studentId ?? undefined}
        teacherId={user?.id}
      />
    </Card>
  );
};

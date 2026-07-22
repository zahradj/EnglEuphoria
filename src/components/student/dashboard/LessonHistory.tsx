import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, User, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { FeedbackReportDialog } from '@/components/classroom/FeedbackReportDialog';

interface LessonRow {
  id: string;
  title: string;
  scheduled_at: string;
  duration: number;
  status: string;
  teacher_name?: string;
  payment_amount?: number;
  teacher_share?: number;
  platform_share?: number;
  has_feedback?: boolean;
}

export function LessonHistory() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackLesson, setFeedbackLesson] = useState<LessonRow | null>(null);

  const fetchLessonHistory = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // 1. Pull this student's bookings
      const { data: bookings, error } = await supabase
        .from('class_bookings')
        .select('id, scheduled_at, duration_minutes, status, hub_type, notes, teacher_id, price_paid')
        .eq('student_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      const bookingIds = (bookings ?? []).map(b => b.id);
      const teacherIds = Array.from(new Set((bookings ?? []).map(b => b.teacher_id).filter(Boolean)));

      // 2. Teacher names
      let teacherMap: Record<string, string> = {};
      if (teacherIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', teacherIds);
        teacherMap = (profs ?? []).reduce((acc: any, p: any) => {
          acc[p.id] = p.full_name || 'Teacher';
          return acc;
        }, {});
      }

      // 3. Payments
      let payMap: Record<string, any> = {};
      if (bookingIds.length) {
        const { data: pays } = await supabase
          .from('lesson_payments')
          .select('lesson_id, amount_charged, teacher_payout, platform_profit')
          .in('lesson_id', bookingIds);
        (pays ?? []).forEach((p: any) => { payMap[p.lesson_id] = p; });
      }

      // 4. Feedback availability
      let feedbackSet = new Set<string>();
      if (bookingIds.length) {
        const { data: fbs } = await supabase
          .from('lesson_feedback_submissions')
          .select('lesson_id')
          .in('lesson_id', bookingIds);
        (fbs ?? []).forEach((f: any) => feedbackSet.add(f.lesson_id));
      }

      const formatted: LessonRow[] = (bookings ?? []).map((b: any) => ({
        id: b.id,
        title: b.notes || `${b.hub_type ? b.hub_type[0].toUpperCase() + b.hub_type.slice(1) + ' ' : ''}Lesson`,
        scheduled_at: b.scheduled_at,
        duration: b.duration_minutes ?? 30,
        status: b.status,
        teacher_name: teacherMap[b.teacher_id],
        payment_amount: payMap[b.id]?.amount_charged ?? b.price_paid ?? undefined,
        teacher_share: payMap[b.id]?.teacher_payout,
        platform_share: payMap[b.id]?.platform_profit,
        has_feedback: feedbackSet.has(b.id),
      }));

      setLessons(formatted);
    } catch (error) {
      console.error('Error fetching lesson history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lesson history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonHistory();
  }, [user?.id]);

  // Realtime: refresh when feedback or booking status changes
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('student-lesson-history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_bookings', filter: `student_id=eq.${user.id}` },
        () => fetchLessonHistory())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lesson_feedback_submissions', filter: `student_id=eq.${user.id}` },
        () => {
          toast({ title: 'New Feedback Report', description: 'Your teacher submitted a session report.' });
          fetchLessonHistory();
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    if (status === 'completed') return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Completed</Badge>;
    if (status === 'cancelled') return <Badge variant="destructive">Cancelled</Badge>;
    if (status === 'scheduled' || status === 'confirmed') return <Badge variant="outline">Scheduled</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const completedLessons = lessons.filter(l => l.status === 'completed');
  const totalSpent = completedLessons.reduce((sum, l) => sum + (l.payment_amount || 0), 0);
  const totalTeacherPayments = completedLessons.reduce((sum, l) => sum + (l.teacher_share || 0), 0);
  const totalPlatformFees = completedLessons.reduce((sum, l) => sum + (l.platform_share || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {completedLessons.length} completed lessons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teacher Payments</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalTeacherPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Paid directly to teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Service</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalPlatformFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Platform service fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Lesson History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson History</CardTitle>
          <CardDescription>Your lessons with payment breakdowns and feedback reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : lessons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No lessons found
                    </TableCell>
                  </TableRow>
                ) : (
                  lessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell>{format(new Date(lesson.scheduled_at), 'MMM dd, HH:mm')}</TableCell>
                      <TableCell className="font-medium">{lesson.title}</TableCell>
                      <TableCell>{lesson.teacher_name || 'Unknown'}</TableCell>
                      <TableCell><Badge variant="outline">{lesson.duration} min</Badge></TableCell>
                      <TableCell>{getStatusBadge(lesson.status)}</TableCell>
                      <TableCell className="font-medium">
                        {lesson.payment_amount ? (
                          <span>€{Number(lesson.payment_amount).toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lesson.has_feedback ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => { setFeedbackLesson(lesson); setFeedbackOpen(true); }}
                          >
                            <MessageSquare className="w-3 h-3" />
                            View Report
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <FeedbackReportDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        lessonId={feedbackLesson?.id ?? null}
        lessonTitle={feedbackLesson?.title}
      />
    </div>
  );
}

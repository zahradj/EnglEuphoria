import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackReportDialog } from '@/components/classroom/FeedbackReportDialog';
import { cn } from '@/lib/utils';

interface RecentLesson {
  id: string;
  title: string;
  scheduledAt: string;
  teacherId: string;
  teacherName: string;
  teacherPhoto: string | null;
  hasFeedback: boolean;
}

interface Props {
  /** Visual variant per hub */
  hubId?: 'playground' | 'academy' | 'professional';
  /** Limit the number of items shown (default 3) */
  limit?: number;
}

const HUB_ACCENT: Record<string, string> = {
  playground: 'text-orange-500',
  academy: 'text-indigo-500',
  professional: 'text-emerald-500',
};

export const RecentLessonReports: React.FC<Props> = ({ hubId = 'academy', limit = 3 }) => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<RecentLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selected, setSelected] = useState<RecentLesson | null>(null);

  const load = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: bookings } = await supabase
        .from('class_bookings')
        .select('id, scheduled_at, status, hub_type, notes, teacher_id')
        .eq('student_id', user.id)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })
        .limit(limit);

      const teacherIds = Array.from(new Set((bookings ?? []).map(b => b.teacher_id).filter(Boolean)));
      const bookingIds = (bookings ?? []).map(b => b.id);

      // Teacher profiles + photos
      let teacherMap: Record<string, { name: string; photo: string | null }> = {};
      if (teacherIds.length) {
        const [{ data: profs }, { data: tprofs }] = await Promise.all([
          supabase.from('profiles').select('id, full_name, avatar_url').in('id', teacherIds),
          supabase.from('teacher_profiles').select('user_id, profile_image_url').in('user_id', teacherIds),
        ]);
        const photoByTeacher: Record<string, string | null> = {};
        (tprofs ?? []).forEach((t: any) => { photoByTeacher[t.user_id] = t.profile_image_url || null; });
        (profs ?? []).forEach((p: any) => {
          teacherMap[p.id] = {
            name: p.full_name || 'Teacher',
            photo: photoByTeacher[p.id] || p.avatar_url || null,
          };
        });
      }

      // Feedback availability
      let feedbackSet = new Set<string>();
      if (bookingIds.length) {
        const { data: fbs } = await supabase
          .from('lesson_feedback_submissions')
          .select('lesson_id')
          .in('lesson_id', bookingIds);
        (fbs ?? []).forEach((f: any) => feedbackSet.add(f.lesson_id));
      }

      const mapped: RecentLesson[] = (bookings ?? []).map((b: any) => ({
        id: b.id,
        title: b.notes || `${b.hub_type ? b.hub_type[0].toUpperCase() + b.hub_type.slice(1) + ' ' : ''}Lesson`,
        scheduledAt: b.scheduled_at,
        teacherId: b.teacher_id,
        teacherName: teacherMap[b.teacher_id]?.name || 'Teacher',
        teacherPhoto: teacherMap[b.teacher_id]?.photo ?? null,
        hasFeedback: feedbackSet.has(b.id),
      }));

      setLessons(mapped);
    } catch (err) {
      console.error('[RecentLessonReports] failed to load', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Realtime: refresh on new feedback or completed booking
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`recent-reports-${user.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lesson_feedback_submissions', filter: `student_id=eq.${user.id}` },
        () => load())
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'class_bookings', filter: `student_id=eq.${user.id}` },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const accent = HUB_ACCENT[hubId] || 'text-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card-hub p-4 backdrop-blur-md', `glass-${hubId}`)}
    >
      <div className="flex items-center gap-2 mb-3">
        <ClipboardCheck className={cn('w-5 h-5', accent)} />
        <h3 className="font-bold text-sm">Recent Lesson Reports</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-xs">Loading…</span>
        </div>
      ) : lessons.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          No completed lessons yet. Your teacher's reports will appear here after class.
        </p>
      ) : (
        <ul className="space-y-2">
          {lessons.map(l => (
            <li
              key={l.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-background/40 hover:bg-background/60 transition-colors"
            >
              <Avatar className="h-10 w-10 shrink-0 border border-border/40">
                {l.teacherPhoto ? (
                  <AvatarImage src={l.teacherPhoto} alt={l.teacherName} className="object-cover" />
                ) : null}
                <AvatarFallback className="text-xs font-bold">
                  {l.teacherName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{l.teacherName}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {format(new Date(l.scheduledAt), 'MMM d')} · {l.title}
                </p>
              </div>

              {l.hasFeedback ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px] gap-1 shrink-0"
                  onClick={() => { setSelected(l); setFeedbackOpen(true); }}
                >
                  <MessageSquare className="w-3 h-3" />
                  Report
                </Button>
              ) : (
                <Badge variant="secondary" className="text-[10px] shrink-0">Pending</Badge>
              )}
            </li>
          ))}
        </ul>
      )}

      <FeedbackReportDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        lessonId={selected?.id ?? null}
        lessonTitle={selected ? `${selected.teacherName} · ${selected.title}` : undefined}
      />
    </motion.div>
  );
};

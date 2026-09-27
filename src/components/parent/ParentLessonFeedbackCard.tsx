import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ThumbsUp, ThumbsDown, MessageCircleHeart } from 'lucide-react';

interface ParentLessonFeedbackCardProps {
  studentId: string;
  studentName: string;
}

/**
 * Compact "how did the last lesson go?" prompt for a parent, mirroring the
 * student's own end-of-lesson thumbs up/down (PostClassFeedbackModal) —
 * a separate row in the same post_class_feedback table, tagged
 * submitted_by_role: 'parent', so a parent's take is never conflated with
 * the student's own. Looks at the most recent PAST booking (scheduled_at
 * before now) rather than a specific status string, since booking status
 * tracking isn't consistently reliable across every path that ends a
 * class.
 */
export function ParentLessonFeedbackCard({ studentId, studentName }: ParentLessonFeedbackCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [thumbsUp, setThumbsUp] = useState<boolean | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: lastLesson, isLoading } = useQuery({
    queryKey: ['parent-last-lesson', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_bookings')
        .select('id, teacher_id, scheduled_at, teacher:users!class_bookings_teacher_id_fkey(full_name)')
        .eq('student_id', studentId)
        .lt('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const teacher = Array.isArray(data.teacher) ? data.teacher[0] : data.teacher;
      return {
        bookingId: data.id as string,
        teacherId: data.teacher_id as string,
        teacherName: teacher?.full_name || 'the teacher',
      };
    },
    enabled: !!studentId,
  });

  const { data: alreadySubmitted, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['parent-feedback-exists', studentId, lastLesson?.bookingId, user?.id],
    queryFn: async () => {
      if (!lastLesson || !user?.id) return false;
      const { data, error } = await supabase
        .from('post_class_feedback')
        .select('id')
        .eq('student_id', studentId)
        .eq('lesson_id', lastLesson.bookingId)
        .eq('submitted_by_user_id', user.id)
        .eq('submitted_by_role', 'parent')
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!lastLesson && !!user?.id,
  });

  if (isLoading || isLoadingExisting || !lastLesson) return null;

  if (alreadySubmitted) {
    return (
      <Card className="p-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/30">
        <MessageCircleHeart className="h-4 w-4 shrink-0" />
        <span>Thanks for sharing your feedback on {studentName}'s last lesson.</span>
      </Card>
    );
  }

  const handleSubmit = async () => {
    if (thumbsUp === null || !user?.id) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('post_class_feedback').insert({
        student_id: studentId,
        teacher_id: lastLesson.teacherId,
        lesson_id: lastLesson.bookingId,
        thumbs_up: thumbsUp,
        submitted_by_role: 'parent',
        submitted_by_user_id: user.id,
        improvement_suggestion: !thumbsUp ? (suggestion.trim() || null) : null,
      });
      if (error) throw error;
      toast({ title: 'Thank you! 🎉', description: 'Your feedback helps us improve every session.' });
      queryClient.invalidateQueries({ queryKey: ['parent-feedback-exists', studentId] });
    } catch (err) {
      console.error('Parent feedback submission error:', err);
      toast({ title: 'Could not save feedback', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <p className="text-sm font-medium text-foreground">
        How was {studentName}'s last session with {lastLesson.teacherName}?
      </p>
      <div className="flex gap-3">
        <Button
          type="button"
          variant={thumbsUp === true ? 'default' : 'outline'}
          size="sm"
          onClick={() => setThumbsUp(true)}
          className="flex-1"
        >
          <ThumbsUp className={`h-4 w-4 me-1.5 ${thumbsUp === true ? 'fill-current' : ''}`} />
          Good
        </Button>
        <Button
          type="button"
          variant={thumbsUp === false ? 'default' : 'outline'}
          size="sm"
          onClick={() => setThumbsUp(false)}
          className="flex-1"
        >
          <ThumbsDown className={`h-4 w-4 me-1.5 ${thumbsUp === false ? 'fill-current' : ''}`} />
          Not great
        </Button>
      </div>
      {thumbsUp === false && (
        <Textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value.slice(0, 500))}
          placeholder="One thing that could be better (optional)"
          className="resize-none h-16 text-sm"
          maxLength={500}
        />
      )}
      <Button onClick={handleSubmit} disabled={thumbsUp === null || isSubmitting} size="sm" className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </Card>
  );
}

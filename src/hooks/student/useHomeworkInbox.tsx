/**
 * useHomeworkInbox — student-side realtime listener that pops a friendly toast
 * when a teacher dispatches a new homework_assignment to them via
 * homework_assignment_students.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

export function useHomeworkInbox(studentId: string | null | undefined) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentId) return;
    const channel = supabase
      .channel(`homework-inbox:${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'homework_assignment_students',
          filter: `student_id=eq.${studentId}`,
        },
        async (payload) => {
          const assignmentId = (payload.new as any)?.assignment_id;
          if (!assignmentId) return;
          // Fetch title for the toast
          const { data } = await supabase
            .from('homework_assignments')
            .select('title, source')
            .eq('id', assignmentId)
            .maybeSingle();
          const title = data?.title ?? 'New homework';
          const isSmart = data?.source === 'smart_homework';
          toast.success(isSmart ? 'New Custom Practice from your Teacher!' : 'New homework assigned', {
            description: title,
            duration: 8000,
            icon: <Sparkles className="h-4 w-4 text-amber-500" />,
            action: {
              label: 'Open',
              onClick: () => navigate(`/homework/${assignmentId}`),
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, navigate]);
}

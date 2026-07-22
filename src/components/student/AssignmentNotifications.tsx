import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function AssignmentNotifications() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const loadHomeworkCounts = async () => {
      if (!user?.id) return;

      try {
        // Get pending homework count
        const { count: pendingCount, error: pendingError } = await supabase
          .from('homework')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('status', 'assigned');

        if (pendingError) throw pendingError;

        // Get overdue homework count
        const now = new Date().toISOString();
        const { count: overdueCount, error: overdueError } = await supabase
          .from('homework')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('status', 'assigned')
          .lt('due_date', now);

        if (overdueError) throw overdueError;

        setPendingCount(pendingCount || 0);
        setOverdueCount(overdueCount || 0);
      } catch (error) {
        console.error('Error loading homework counts:', error);
      }
    };

    loadHomeworkCounts();

    // Set up real-time subscription for homework changes
    const channel = supabase
      .channel('homework-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homework',
          filter: `student_id=eq.${user?.id}`
        },
        () => {
          loadHomeworkCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const totalCount = pendingCount + overdueCount;

  if (totalCount === 0) return null;

  return (
    <div className="flex items-center gap-1 ml-auto">
      {overdueCount > 0 && (
        <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center p-0 px-1.5">
          {overdueCount}
        </Badge>
      )}
      {pendingCount > 0 && overdueCount === 0 && (
        <Badge variant="secondary" className="h-5 min-w-5 flex items-center justify-center p-0 px-1.5">
          {pendingCount}
        </Badge>
      )}
    </div>
  );
}

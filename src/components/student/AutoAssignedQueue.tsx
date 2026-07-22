import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import BonusQuestBadge from './BonusQuestBadge';

interface QueueRow {
  id: string;
  lesson_id: string;
  scheduled_for: string | null;
  status: string;
  auto_assigned: boolean | null;
  badge: string | null;
}

/**
 * Auto-Assigned Lessons queue — pins Bonus Quest (remedial) lessons to the top
 * of the student's path. Zero teacher intervention: rows appear via
 * `useUnitProgression` after a failed Mastery Quiz.
 */
export default function AutoAssignedQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<QueueRow[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from('scheduled_lessons')
        .select('id, lesson_id, scheduled_for, status, auto_assigned, badge')
        .eq('student_id', uid)
        .in('status', ['pending', 'auto_assigned'])
        .order('auto_assigned', { ascending: false } as never)
        .order('scheduled_for', { ascending: true });
      if (active) setRows(((data as unknown) as QueueRow[]) ?? []);
    })();
    return () => { active = false; };
  }, []);

  const autoRows = rows.filter((r) => r.auto_assigned);
  if (autoRows.length === 0) return null;

  return (
    <div className="space-y-2">
      {autoRows.map((r) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <BonusQuestBadge />
            <div>
              <div className="text-sm font-semibold text-foreground">Extra Practice ready for you</div>
              <div className="text-xs text-muted-foreground">Auto-assigned to keep your streak strong.</div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/student/lesson/${r.lesson_id}`)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
          >
            Start
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

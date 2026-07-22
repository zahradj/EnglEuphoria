import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import type { RemedialLessonRow } from '@/lib/remediation/types';

/**
 * "Extra Practice Unlocked!" — supportive rescue-state card shown on the
 * Student Dashboard when the learner has a pending remedial lesson. Framed
 * as a bonus quest (success-green/orange) rather than a punishment.
 */
export default function ExtraPracticeCard() {
  const navigate = useNavigate();
  const [row, setRow] = useState<RemedialLessonRow | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from('remedial_lessons')
        .select('*')
        .eq('student_id', uid)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (active) setRow((data as unknown as RemedialLessonRow) ?? null);
    })();
    return () => { active = false; };
  }, []);

  if (!row || !row.generated_lesson_id) return null;

  const start = () => {
    navigate(`/student/lesson/${row.generated_lesson_id}?remedial=${row.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border-2 border-emerald-300/60 bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-50 p-6 shadow-md"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl" />
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Bonus Quest
          </div>
          <h3 className="mt-1 text-xl font-bold text-foreground">Extra Practice Unlocked!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pip put together a quick, focused practice round on a few tricky bits — finish it to unlock your next unit.
          </p>
          {row.failed_tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {row.failed_tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800"
                >
                  {t.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
          <Button
            onClick={start}
            className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
          >
            Start Extra Practice
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

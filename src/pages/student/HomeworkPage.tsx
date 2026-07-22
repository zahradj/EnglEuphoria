/**
 * /homework/:assignmentId — student-facing wrapper that loads the
 * homework_assignments row and hands its `content` to <HomeworkPlayer />.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import HomeworkPlayer from '@/components/student/homework/HomeworkPlayer';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomeworkPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!assignmentId) return;
      const { data, error } = await supabase
        .from('homework_assignments')
        .select('content, title')
        .eq('id', assignmentId)
        .maybeSingle();
      if (cancelled) return;
      if (error) { setError(error.message); return; }
      if (!data?.content) { setError('Homework content not found.'); return; }
      const c = data.content as any;
      if (!c.activity_1_recognition || !c.activity_2_syntax || !c.activity_3_production) {
        setError('This homework is in an older format and cannot be played interactively.');
        return;
      }
      setContent(c);
    })();
    return () => { cancelled = true; };
  }, [assignmentId]);

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center gap-3">
        <p className="text-red-600 font-bold">{error}</p>
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      </div>
    );
  }
  if (!content || !assignmentId) {
    return <div className="min-h-dvh flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  return <HomeworkPlayer assignmentId={assignmentId} content={content} />;
}

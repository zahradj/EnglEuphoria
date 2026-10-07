/**
 * /homework/:assignmentId — student-facing wrapper that loads the
 * homework_assignments row and hands its `content` to <HomeworkPlayer />.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import HomeworkPlayer from '@/components/student/homework/HomeworkPlayer';
import HomeworkQuest from '@/components/homework-quest/HomeworkQuest';
import { getHomeworkQuest } from '@/content/homework-quests/registry';
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
        .select('content, title, source')
        .eq('id', assignmentId)
        .maybeSingle();
      if (cancelled) return;
      if (error) { setError(error.message); return; }
      if (!data?.content) { setError('Homework content not found.'); return; }
      const c = data.content as any;
      // The old auto-generated 3-activity homework is retired: a student who opens an old link is sent to
      // their Homework Quests instead of the retired format.
      if (data.source === 'lep1-auto' && c?.type !== 'quest') {
        navigate('/dashboard', { replace: true });
        return;
      }
      // Gamified quest homework: content = { type: 'quest', questId }.
      if (c?.type === 'quest' && getHomeworkQuest(c.questId)) { setContent(c); return; }
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
  if (content.type === 'quest') {
    const quest = getHomeworkQuest(content.questId)!;
    return (
      <HomeworkQuest quest={quest} onExit={() => navigate(-1)} onComplete={async (r) => {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        await supabase.from('homework_submissions').insert({
          assignment_id: assignmentId, student_id: auth.user.id, status: 'submitted',
          submitted_at: new Date().toISOString(), points_earned: r.stars, text_response: JSON.stringify(r.levels),
        } as any).then(({ error }) => { if (error) console.warn('[quest] submission save failed', error); });
      }} />
    );
  }
  return <HomeworkPlayer assignmentId={assignmentId} content={content} />;
}

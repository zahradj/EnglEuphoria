import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMY_RECALL_NODES, PRE_A1_RECALL_NODES } from '../../curriculum/academy';
import { loadPractice, recordLesson, savePractice } from '../../academy-deck/practiceStore';
import { syncPractice } from '@/services/academyPracticeService';
import { LessonPlayer } from '../LessonPlayer';
import { hasScript, loadScript } from '../lessonScripts';
import type { LessonScript } from '../types';

/** Full-screen player for one Academy lesson. English only and left-to-right (owner, 2026-10-17): no translation calls here, whatever language the app is in. Students come from My Lessons, creators from the Academy Library. */
export default function AcademyPlayerLessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [script, setScript] = useState<LessonScript | null>(null);
  const role = (user as { role?: string } | null)?.role;
  const isCreator = role === 'content_creator' || role === 'admin';
  const back = () => navigate(isCreator ? '/academy-library' : role === 'teacher' ? '/teacher-dashboard' : '/dashboard/academy');
  const known = !!id && hasScript(id);

  useEffect(() => {
    let alive = true;
    setScript(null);
    if (id) void loadScript(id)?.then((s) => { if (alive) setScript(s); });
    return () => { alive = false; };
  }, [id]);

  // a finished lesson feeds the student's Daily 10: its new items come back on the spaced schedule
  const finish = () => {
    if (!script || !id) return;
    const node = [...ACADEMY_RECALL_NODES, ...PRE_A1_RECALL_NODES].find((n) => n.id === script.blueprintId);
    if (!node) return;
    const key = (user as { id?: string } | null)?.id ?? 'device';
    savePractice(key, recordLesson(loadPractice(key), id, [...new Set(node.items)], new Date().toISOString().slice(0, 10), 0));
    if (key !== 'device') void syncPractice(key);
  };

  return (
    <div className="relative h-screen bg-[#f7f3ff]" dir="ltr" lang="en">
      <button type="button" onClick={back} className="absolute right-3 top-14 z-50 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-violet-800 shadow ring-1 ring-violet-200 hover:bg-white sm:top-3">
        <ArrowLeft className="h-4 w-4 " /> Back to lessons
      </button>
      {!known ? (
        <p className="p-10 text-center font-bold">This lesson isn’t available.</p>
      ) : !script ? (
        <div className="flex items-center justify-center p-16 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <LessonPlayer script={script} role={role === 'teacher' || isCreator ? 'teacher' : 'solo'} onFinish={finish} />
      )}
    </div>
  );
}

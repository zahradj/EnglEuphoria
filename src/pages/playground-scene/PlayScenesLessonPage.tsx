import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScenePlayer, Scene } from '@/components/playground-scene/ScenePlayer';

/**
 * Loads a curriculum_lessons row whose content was authored in the
 * scene-player format (ai_metadata.contentFormat === 'scene-player')
 * and plays it with <ScenePlayer>. This is the "play" counterpart to
 * PlaygroundCreator for the new Playground Library content — the two
 * editors intentionally don't share a data shape (see task history),
 * so scene-format lessons route here instead of /playground-creator.
 */
export default function PlayScenesLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<Scene[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hub, setHub] = useState('playground');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!lessonId) return;
      const { data, error: fetchError } = await supabase
        .from('curriculum_lessons')
        .select('content, target_system')
        .eq('id', lessonId)
        .maybeSingle();
      if (cancelled) return;
      if (fetchError || !data) {
        setError(fetchError?.message ?? 'Lesson not found.');
        return;
      }
      const slides = (data.content as any)?.slides;
      if (!Array.isArray(slides) || slides.length === 0) {
        setError('This lesson has no scene content yet.');
        return;
      }
      setScenes(slides as Scene[]);
      setHub(data.target_system === 'kids' ? 'playground' : data.target_system ?? 'playground');
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const backToLibrary = () => navigate('/content-creator/library?hub=playground');

  if (error) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-slate-100 text-center">
        <p className="text-sm font-bold text-slate-600">{error}</p>
        <button onClick={backToLibrary} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white">
          Back to Library
        </button>
      </div>
    );
  }

  if (!scenes) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return <ScenePlayer scenes={scenes} hub={hub} onExit={backToLibrary} onComplete={backToLibrary} />;
}

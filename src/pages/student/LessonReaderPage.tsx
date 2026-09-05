import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ImmersiveLessonReader } from '@/components/student/lesson-reader/ImmersiveLessonReader';
import LessonPlayerContainer from '@/components/lesson-player/LessonPlayerContainer';
import { StoryBookViewer, StoryLayout } from '@/components/student/story-viewer/StoryBookViewer';
import { normalizeSlidesToStoryPages, resolveStoryVisualStyle } from '@/components/student/story-viewer/storyPageUtils';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HubType, GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { SpeakingIntentPrompt } from '@/components/student/SpeakingIntentPrompt';
import { useSpeakingIntent } from '@/hooks/useSpeakingIntent';
import { PlaygroundCurriculumView } from '@/components/playground-player/PlaygroundCurriculumView';

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  content: any;
  difficulty_level: string;
  target_system: string;
  duration_minutes: number | null;
  ai_metadata: any;
}

import { useForceEnglishLocale } from '@/hooks/useForceEnglishLocale';

const LessonReaderPage: React.FC = () => {
  useForceEnglishLocale();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { intent, setIntent, hydrated: intentHydrated } = useSpeakingIntent(id);

  useEffect(() => {
    if (!id) return;
    const fetchLesson = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('curriculum_lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        setError('Lesson not found');
      } else {
        setLesson(data as LessonData);
      }
      setLoading(false);
    };
    fetchLesson();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-lg text-muted-foreground">{error || 'Lesson not found'}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  // ── Speaking-first gate: 2-second intent prompt, once per session per lesson ──
  if (intentHydrated && !intent) {
    return <SpeakingIntentPrompt onChoose={setIntent} />;
  }


  // ── Playground (kids) lessons ALWAYS use the Animal Adventure Academy template ──
  if (lesson.target_system === 'kids') {
    return (
      <PlaygroundCurriculumView
        lessonId={lesson.id}
        title={lesson.title}
        cefr={(lesson as any).slot_cefr_level || lesson.difficulty_level}
        content={lesson.content}
        onExit={() => navigate('/dashboard')}
      />
    );
  }

  // ── Story-kind lessons get the dedicated immersive viewer ──
  const isStory = lesson.ai_metadata?.kind === 'story';
  const slides: GeneratedSlide[] | null = lesson.content?.slides || null;
  const hub: HubType = (lesson.content?.hub || lesson.target_system || 'playground') as HubType;

  if (isStory && slides && slides.length > 0) {
    const meta = lesson.ai_metadata || {};
    const visualStyle = resolveStoryVisualStyle(meta.visual_style, hub);
    const storyLayout: StoryLayout = meta.story_layout === 'classic' ? 'classic' : 'immersive';
    const pages = normalizeSlidesToStoryPages(slides as any[]);
    const cover = meta.coverImageUrl || pages.find((p) => p.imageUrl)?.imageUrl;
    return (
      <StoryBookViewer
        title={lesson.title}
        pages={pages}
        layout={storyLayout}
        visualStyle={visualStyle}
        coverImageUrl={cover}
        onExit={() => navigate(-1)}
      />
    );
  }

  if (slides && slides.length > 0) {
    const homeworkPack =
      lesson.content?.homework_pack ??
      lesson.content?.coherence?.homework ??
      lesson.ai_metadata?.homework_pack ??
      null;
    return (
      <LessonPlayerContainer
        slides={slides}
        hub={hub}
        lessonTitle={lesson.title}
        lessonId={lesson.id}
        studentId={user?.id}
        homeworkPack={homeworkPack}
        onComplete={(score) => {
          if (user?.id) {
            supabase
              .from('student_assignments')
              .update({ status: 'completed', completed_at: new Date().toISOString() })
              .eq('lesson_id', lesson.id)
              .eq('student_id', user.id)
              .then(() => {});
          }
          navigate('/dashboard');
        }}
        onExit={() => navigate('/dashboard')}
      />
    );
  }

  // ── Fallback: markdown-based immersive reader ──
  const markdownContent = typeof lesson.content === 'string'
    ? lesson.content
    : lesson.content?.markdown || lesson.content?.text || JSON.stringify(lesson.content, null, 2);

  const track = lesson.target_system === 'kids' ? 'kids'
    : lesson.target_system === 'teen' ? 'teens'
    : 'adults';

  const coverImageUrl = lesson.ai_metadata?.coverImageUrl || null;

  return (
    <ImmersiveLessonReader
      lessonId={lesson.id}
      title={lesson.title}
      content={markdownContent}
      track={track}
      level={lesson.difficulty_level}
      coverImageUrl={coverImageUrl}
      durationMinutes={lesson.duration_minutes}
      onBack={() => navigate(-1)}
    />
  );
};

// Helpers moved to '@/components/student/story-viewer/storyPageUtils'

export default LessonReaderPage;


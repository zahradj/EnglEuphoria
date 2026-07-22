import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LessonBlockEditor } from '@/components/teacher/creator/LessonBlockEditor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { BackButton } from '@/components/common/BackButton';

interface TeacherCreatorPageProps {
  teacherId: string;
}

export const TeacherCreatorPage: React.FC<TeacherCreatorPageProps> = ({ teacherId }) => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId?: string }>();
  const [lessons, setLessons] = useState<Array<{ id: string; title: string; updated_at: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lessonId) return;
    let alive = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('curriculum_lessons')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false })
        .limit(30);
      if (alive) {
        setLessons((data as any) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lessonId]);

  if (lessonId) {
    return (
      <div className="space-y-3">
        <BackButton to="/teacher" label="Back to dashboard" />
        <LessonBlockEditor lessonId={lessonId} teacherId={teacherId} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackButton to="/teacher" label="Back to dashboard" />
      <div>
        <h2 className="text-2xl font-bold text-foreground">Curriculum Director</h2>
        <p className="text-sm text-muted-foreground">Pick a lesson to open the visual block editor.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {lessons.map((l) => (
            <Card key={l.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <p className="font-medium text-foreground truncate">{l.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated {new Date(l.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" onClick={() => navigate(`/teacher/creator/${l.id}`)}>
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
          {lessons.length === 0 && (
            <div className="col-span-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-10 text-center text-muted-foreground">
              No lessons yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherCreatorPage;

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Rocket, Search, BookOpen, Loader2 } from 'lucide-react';
import { AssignLessonModal } from './AssignLessonModal';
import { useNavigate } from 'react-router-dom';
import { getLibraryLessons, toLibraryLessonCard, type LibraryLessonCard } from '@/services/lessonLibraryService';

const HUB_META: Record<LibraryLessonCard['hub'], { label: string; color: string }> = {
  playground: { label: 'Playground', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  academy: { label: 'Academy', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  professional: { label: 'Success Hub', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
};


export const TeacherLessonLibrary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [assignLesson, setAssignLesson] = useState<LibraryLessonCard | null>(null);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['teacher-master-library-lessons'],
    queryFn: async () => {
      const data = await getLibraryLessons();
      return data.map(toLibraryLessonCard);
    },
    enabled: !!user?.id,
  });

  const displayLessons = lessons || [];

  const filtered = displayLessons.filter(l =>
    [l.title, l.description, l.difficulty_level, l.hub]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">📚 My Lesson Library</h2>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2 flex-wrap">
            <span>{displayLessons.length} lessons available</span>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              <Eye className="w-3 h-3 mr-1" /> View only
            </Badge>
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? 'No lessons match your search.' : 'No published master lessons yet.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(lesson => {
            const hub = HUB_META[lesson.hub];

            return (
              <Card
                key={lesson.id}
                onClick={() => navigate(`/lesson/${lesson.id}`)}
                className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                {/* Thumbnail placeholder */}
                <div className="h-36 bg-gradient-to-br from-primary/10 via-accent/5 to-muted flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-primary/40" />
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
                      {lesson.title}
                    </h3>
                    <Badge variant="secondary" className={`shrink-0 text-xs ${hub.color}`}>
                      {hub.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Level: {lesson.difficulty_level}</span>
                    <span>•</span>
                    <span>{lesson.slide_count} slides</span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Created {new Date(lesson.created_at).toLocaleDateString()}
                  </p>
                </CardContent>

                {/* Hover overlay (read-only: preview + assign) */}
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={(e) => { e.stopPropagation(); navigate(`/lesson/${lesson.id}`); }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Lesson
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={(e) => { e.stopPropagation(); setAssignLesson(lesson); }}
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    Assign
                  </Button>
                </div>
              </Card>

            );
          })}
        </div>
      )}

      {/* Assign Modal */}
      {assignLesson && (
        <AssignLessonModal
          lesson={assignLesson}
          onClose={() => setAssignLesson(null)}
        />
      )}
    </div>
  );
};

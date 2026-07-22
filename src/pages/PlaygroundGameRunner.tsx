/**
 * Playground Game Runner — strict 3-layer entry point:
 *   1) React loads lesson JSON (sample OR Supabase fetch via :lessonId)
 *   2) LessonEngine.compile() turns it into a SceneConfig sequence
 *   3) GameCanvasHost boots Phaser with that compiled sequence
 *
 * React never touches Phaser scenes; Phaser never parses raw JSON.
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameCanvasHost } from '@/components/playground-runtime/GameCanvasHost';
import { ProgressTrackerPanel } from '@/components/playground-runtime/ProgressTrackerPanel';
import { LessonPickerPanel } from '@/components/playground-runtime/LessonPickerPanel';
import { LessonEngine, loadSampleLesson } from '@/game-runtime';
import { slidesToLesson } from '@/game-runtime/bridge';
import type { CompiledLesson, LessonJSON, SceneResult } from '@/game-runtime';
import { getLessonById, getLibraryLessonSlides } from '@/services/lessonLibraryService';

export default function PlaygroundGameRunner() {
  const { lessonId } = useParams<{ lessonId?: string }>();
  const [lesson, setLesson] = useState<LessonJSON | null>(null);
  const [loading, setLoading] = useState<boolean>(!!lessonId);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<{ index: number; type: string }[]>([]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<SceneResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load lesson from URL or fall back to sample.
  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setSkipped([]);
    if (!lessonId) {
      setLesson(loadSampleLesson());
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const row = await getLessonById(lessonId);
        const slides = getLibraryLessonSlides(row);
        if (!slides.length) {
          throw new Error('This lesson has no slides yet.');
        }
        const { lesson: built, skipped } = slidesToLesson(slides as any, {
          id: row.id,
          title: row.title || 'Lesson',
          cefr: row.difficulty_level || 'A1',
          hub: 'playground',
        });
        if (cancelled) return;
        setLesson(built);
        setSkipped(skipped);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message ?? 'Failed to load lesson');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const compiled: CompiledLesson | null = useMemo(() => {
    setError(null);
    setCurrentIdx(0);
    setDone(false);
    setResults([]);
    if (!lesson) return null;
    const check = LessonEngine.validate(lesson);
    if (!check.ok) {
      setError(check.errors.join(' • '));
      return null;
    }
    return LessonEngine.compile(lesson);
  }, [lesson]);

  return (
    <main className="min-h-dvh bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Playground Game Runtime</h1>
            <p className="text-sm text-muted-foreground">
              React → LessonEngine → Phaser.{' '}
              {lessonId ? `Lesson ${lessonId.slice(0, 8)}…` : 'Sample lesson loaded.'}
            </p>
          </div>
          {lessonId && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/playground-creator?lessonId=${lessonId}`}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to creator
              </Link>
            </Button>
          )}
        </header>

        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <aside className="space-y-4">
            {!lessonId && <LessonPickerPanel onPick={setLesson} />}
            {compiled && (
              <Card className="p-4">
                <ProgressTrackerPanel
                  current={currentIdx}
                  total={compiled.sequence.length}
                  title={compiled.title}
                />
              </Card>
            )}
            {skipped.length > 0 && (
              <Card className="p-3 border-amber-300 bg-amber-50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {skipped.length} slide{skipped.length === 1 ? '' : 's'} skipped
                </div>
                <div className="text-[11px] text-amber-700">
                  {Array.from(new Set(skipped.map((s) => s.type))).join(', ')}
                </div>
              </Card>
            )}
            {done && (
              <Card className="p-4">
                <div className="text-sm font-semibold text-foreground mb-1">Lesson complete</div>
                <div className="text-xs text-muted-foreground">
                  {results.filter((r) => r.correct).length} / {results.length} correct
                </div>
              </Card>
            )}
          </aside>

          <section className="min-h-[560px]">
            {loading && (
              <Card className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading lesson…
              </Card>
            )}
            {loadError && !loading && (
              <Card className="p-6">
                <div className="text-sm font-semibold text-destructive mb-2">
                  Could not load lesson
                </div>
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground">{loadError}</pre>
              </Card>
            )}
            {error && !loading && (
              <Card className="p-6">
                <div className="text-sm font-semibold text-destructive mb-2">
                  Lesson JSON failed validation
                </div>
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground">{error}</pre>
              </Card>
            )}
            {compiled && !error && !loading && (
              <Card className="p-2 h-[640px]">
                <GameCanvasHost
                  compiled={compiled}
                  hooks={{
                    onSceneStart: setCurrentIdx,
                    onSceneComplete: (r) => setResults((prev) => [...prev, r]),
                    onLessonComplete: (r) => { setResults(r); setDone(true); },
                    onError: (m) => setError(m),
                  }}
                  className="w-full h-full rounded-xl overflow-hidden"
                />
              </Card>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

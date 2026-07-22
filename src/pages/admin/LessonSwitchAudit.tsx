import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Row {
  id: string;
  created_at: string;
  user_id: string | null;
  resource_id: string | null;
  old_values: any;
  new_values: any;
}

/**
 * Admin-only lesson switch audit trail.
 * Reads audit_logs where action='lesson_switched' (written by LessonSwitcher).
 */
export default function LessonSwitchAudit() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-lesson-switch-audit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, created_at, user_id, resource_id, old_values, new_values')
        .eq('action', 'lesson_switched')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">Lesson Switch Audit</h1>
            <p className="text-sm text-muted-foreground">
              Teacher-initiated Master Library lesson swaps. Most recent 200 events.
            </p>
          </div>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Card className="p-4 text-sm text-destructive">
            Failed to load audit log: {(error as Error).message}
          </Card>
        )}

        {!isLoading && !error && (data?.length ?? 0) === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No lesson switches recorded yet.
          </Card>
        )}

        <div className="space-y-2">
          {data?.map((row) => {
            const oldId = row.old_values?.curriculum_lesson_id ?? null;
            const newId = row.new_values?.curriculum_lesson_id ?? null;
            const title = row.new_values?.lesson_title ?? '(no title)';
            const wasLive = row.old_values?.class_started === true;
            return (
              <Card key={row.id} className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <code className="text-[11px] font-mono text-muted-foreground">
                        {oldId ? oldId.slice(0, 8) : '—'}
                      </code>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <code className="text-[11px] font-mono text-muted-foreground">
                        {newId ? newId.slice(0, 8) : '—'}
                      </code>
                      <span className="truncate font-medium">{title}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>
                        Teacher{' '}
                        <code className="font-mono">
                          {row.user_id ? row.user_id.slice(0, 8) : 'unknown'}
                        </code>
                      </span>
                      <span>·</span>
                      <span>
                        Booking{' '}
                        <code className="font-mono">
                          {row.resource_id ? row.resource_id.slice(0, 8) : '—'}
                        </code>
                      </span>
                      <span>·</span>
                      <span>
                        {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  {wasLive && (
                    <Badge variant="destructive" className="shrink-0">
                      Mid-lesson
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

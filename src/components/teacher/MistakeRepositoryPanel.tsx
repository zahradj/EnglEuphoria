import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, AlertTriangle, Mic, Loader2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MistakeRow {
  id: string;
  user_id: string;
  mistake_type: string;
  target_content: string;
  attempted_content: string | null;
  context: string | null;
  severity: 'low' | 'medium' | 'high';
  source_lesson_id: string | null;
  source_slide_id: string | null;
  resolved: boolean;
  attempts_count: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

type SeverityFilter = 'all' | 'high' | 'medium' | 'low';

interface Props {
  /** Optional — restrict to a single student. If omitted, shows all (teacher/admin RLS gates this). */
  studentId?: string;
  pageSize?: number;
}

const severityTone: Record<string, string> = {
  high: 'bg-rose-100 text-rose-700 border-rose-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const MistakeRepositoryPanel = ({ studentId, pageSize = 25 }: Props) => {
  const [rows, setRows] = useState<MistakeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [severity, setSeverity] = useState<SeverityFilter>('all');

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from('mistake_repository')
      .select('*')
      .eq('resolved', false)
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(pageSize);
    if (studentId) q = q.eq('user_id', studentId);
    const { data, error } = await q;
    if (error) {
      console.error('[MistakeRepo] load failed:', error);
      toast.error('Could not load mistakes');
    } else {
      setRows((data ?? []) as MistakeRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, pageSize]);

  const visible = useMemo(
    () => (severity === 'all' ? rows : rows.filter((r) => r.severity === severity)),
    [rows, severity],
  );

  const markResolved = async (id: string) => {
    setResolvingId(id);
    const { error } = await supabase
      .from('mistake_repository')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id);
    setResolvingId(null);
    if (error) {
      toast.error('Failed to resolve');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success('Marked as resolved');
  };

  return (
    <Card className="p-4 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Mistake Repository
          </h3>
          <p className="text-xs text-muted-foreground">
            Pending speech & practice errors awaiting review.
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Filter className="h-3 w-3 text-muted-foreground" />
          {(['all', 'high', 'medium', 'low'] as SeverityFilter[]).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={severity === s ? 'default' : 'ghost'}
              className="h-7 px-2 capitalize"
              onClick={() => setSeverity(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          🎉 No pending mistakes. Students are on track.
        </div>
      ) : (
        <ScrollArea className="max-h-[520px] pr-2">
          <ul className="space-y-2">
            {visible.map((r) => {
              const scores = (r.metadata as any)?.scores;
              const isSpeech = r.mistake_type.startsWith('speaking');
              return (
                <li
                  key={r.id}
                  className="rounded-lg border bg-card p-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isSpeech && <Mic className="h-3.5 w-3.5 text-primary" />}
                        <span className="text-xs font-medium text-muted-foreground">
                          {r.mistake_type.replace(/_/g, ' ')}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] px-1.5 py-0', severityTone[r.severity])}
                        >
                          {r.severity}
                        </Badge>
                        {r.attempts_count > 1 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            ×{r.attempts_count}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium truncate">
                        Target: <span className="text-foreground">"{r.target_content}"</span>
                      </p>
                      {r.attempted_content && (
                        <p className="text-xs text-muted-foreground truncate">
                          Heard: "{r.attempted_content}"
                        </p>
                      )}
                      {r.context && (
                        <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">
                          {r.context}
                        </p>
                      )}
                      {scores && (
                        <div className="flex gap-2 mt-1.5 text-[10px] text-muted-foreground">
                          <span>Acc {scores.accuracy ?? '—'}</span>
                          <span>Flu {scores.fluency ?? '—'}</span>
                          <span>Pro {scores.pronunciation ?? '—'}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resolvingId === r.id}
                      onClick={() => markResolved(r.id)}
                      className="shrink-0"
                    >
                      {resolvingId === r.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Resolve
                        </>
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
};

export default MistakeRepositoryPanel;

/**
 * Teacher/Parent Unit Reports Browser.
 *
 * Lists saved `unit_progress_reports` for a roster of students, most recent
 * first. Each row exposes the printable public share link plus a copy action.
 * RLS: teachers/parents linked to a student can read via their own row's
 * grants; anon can only read via share_token — we filter by user_id here.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Copy, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type Row = {
  id: string;
  user_id: string;
  unit_id: string;
  unit_title: string | null;
  hub: string;
  cefr: string;
  accuracy: number;
  stars: number;
  share_token: string;
  created_at: string;
};

interface Props {
  students: Array<{ id: string; name: string }>;
}

export default function TeacherUnitReportsBrowser({ students }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const nameById = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s.name])),
    [students],
  );

  useEffect(() => {
    if (students.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('unit_progress_reports')
        .select(
          'id,user_id,unit_id,unit_title,hub,cefr,accuracy,stars,share_token,created_at',
        )
        .in('user_id', students.map((s) => s.id))
        .order('created_at', { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) {
        toast.error('Could not load unit reports', { description: error.message });
        setRows([]);
      } else {
        setRows((data ?? []) as Row[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [students]);

  const shareUrl = (token: string) => `${window.location.origin}/reports/${token}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" /> Unit Progress Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No unit reports yet. Reports appear here after students complete a unit quiz.
          </p>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {r.unit_title || r.unit_id}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {nameById[r.user_id] ?? 'Student'} · {r.hub} · {r.cefr} ·{' '}
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {r.stars}
                  </Badge>
                  <Badge variant="secondary">{Math.round(r.accuracy * 100)}%</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl(r.share_token));
                      toast.success('Link copied');
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={shareUrl(r.share_token)} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

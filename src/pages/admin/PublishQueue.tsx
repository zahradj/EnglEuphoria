// Publish Queue — admin gate for launching drafted curriculum_lessons.
// Lists every unpublished lesson with QA verdict + governance status,
// enables one-click publish only when qa_verdict='publish', and links out
// to the unified content creator for regeneration/repair.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';

type Verdict = 'publish' | 'repair' | 'block' | 'never_run';

interface LessonRow {
  id: string;
  title: string | null;
  target_system: string | null;
  slot_cefr_level: string | null;
  slot_unit_number: number | null;
  slot_lesson_number: number | null;
  is_published: boolean | null;
  qa_verdict: string | null;
  governance_status: string | null;
  qa_report: any;
}

const HUBS = [
  { value: 'all', label: 'All hubs' },
  { value: 'kids', label: 'Playground' },
  { value: 'teen', label: 'Academy' },
  { value: 'success', label: 'Success' },
];

const CEFRS = ['all', 'Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];

function verdictOf(row: LessonRow): Verdict {
  const v = (row.qa_verdict ?? '').toLowerCase();
  if (v === 'publish' || v === 'repair' || v === 'block') return v;
  return 'never_run';
}

function VerdictBadge({ v }: { v: Verdict }) {
  const map: Record<Verdict, { label: string; className: string; Icon: any }> = {
    publish: { label: 'Publish ready', className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30', Icon: CheckCircle2 },
    repair: { label: 'Needs repair', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30', Icon: AlertTriangle },
    block: { label: 'Blocked', className: 'bg-red-500/15 text-red-700 border-red-500/30', Icon: XCircle },
    never_run: { label: 'Never run', className: 'bg-muted text-muted-foreground border-border', Icon: Clock },
  };
  const { label, className, Icon } = map[v];
  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export default function PublishQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hub, setHub] = useState('teen');
  const [cefr, setCefr] = useState('B1');
  const [publishing, setPublishing] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from('curriculum_lessons')
      .select('id, title, target_system, slot_cefr_level, slot_unit_number, slot_lesson_number, is_published, qa_verdict, governance_status, qa_report')
      .eq('is_published', false)
      .order('target_system')
      .order('slot_cefr_level')
      .order('slot_unit_number', { nullsFirst: false })
      .order('slot_lesson_number', { nullsFirst: false })
      .limit(500);
    if (hub !== 'all') q = q.eq('target_system', hub);
    if (cefr !== 'all') q = q.eq('slot_cefr_level', cefr);
    const { data, error } = await q;
    if (error) {
      toast.error(`Load failed: ${error.message}`);
      setLoading(false);
      return;
    }
    setRows((data ?? []) as LessonRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [hub, cefr]);

  const stats = useMemo(() => {
    const s = { total: rows.length, publish: 0, repair: 0, block: 0, never_run: 0 };
    for (const r of rows) s[verdictOf(r)]++;
    return s;
  }, [rows]);

  const publishOne = async (id: string) => {
    setPublishing((p) => new Set(p).add(id));
    const { error } = await supabase
      .from('curriculum_lessons')
      .update({ is_published: true })
      .eq('id', id);
    setPublishing((p) => { const n = new Set(p); n.delete(id); return n; });
    if (error) {
      toast.error(`Publish failed: ${error.message}`);
      return;
    }
    toast.success('Lesson published');
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const publishAllReady = async () => {
    const ids = rows.filter((r) => verdictOf(r) === 'publish').map((r) => r.id);
    if (ids.length === 0) {
      toast.info('No publish-ready lessons in the current filter');
      return;
    }
    const { error } = await supabase
      .from('curriculum_lessons')
      .update({ is_published: true })
      .in('id', ids);
    if (error) {
      toast.error(`Bulk publish failed: ${error.message}`);
      return;
    }
    toast.success(`Published ${ids.length} lesson${ids.length === 1 ? '' : 's'}`);
    load();
  };

  const openInCreator = (row: LessonRow) => {
    // Deep-link to the unified generator with pre-filled context.
    const params = new URLSearchParams({
      lessonId: row.id,
      hub: row.target_system ?? '',
      cefr: row.slot_cefr_level ?? '',
      unit: String(row.slot_unit_number ?? ''),
      lesson: String(row.slot_lesson_number ?? ''),
    });
    navigate(`/content-creator/unified-generator?${params.toString()}`);
  };

  const errCount = (r: LessonRow) =>
    Array.isArray(r.qa_report?.errors) ? r.qa_report.errors.length : 0;
  const warnCount = (r: LessonRow) =>
    Array.isArray(r.qa_report?.warnings) ? r.qa_report.warnings.length : 0;

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Publish Queue</h1>
          <p className="text-muted-foreground text-sm">
            Gate for launching curriculum lessons. QA verdict must be <code>publish</code> before flipping live.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Drafts</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-emerald-700">{stats.publish}</div><div className="text-xs text-muted-foreground">Publish ready</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-amber-700">{stats.repair}</div><div className="text-xs text-muted-foreground">Needs repair</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-700">{stats.block}</div><div className="text-xs text-muted-foreground">Blocked</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-muted-foreground">{stats.never_run}</div><div className="text-xs text-muted-foreground">Never run</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div className="flex gap-3 items-center">
            <Select value={hub} onValueChange={setHub}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{HUBS.map((h) => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={cefr} onValueChange={setCefr}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{CEFRS.map((c) => <SelectItem key={c} value={c}>{c === 'all' ? 'All CEFR' : c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button
            onClick={publishAllReady}
            disabled={stats.publish === 0}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Publish all ready ({stats.publish})
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No draft lessons match this filter. 🎉
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-3">Slot</th>
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">QA</th>
                    <th className="py-2 pr-3">Gov</th>
                    <th className="py-2 pr-3">Errors</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const v = verdictOf(r);
                    return (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 pr-3 whitespace-nowrap font-mono text-xs">
                          {r.target_system}·{r.slot_cefr_level}·U{r.slot_unit_number ?? '–'}·L{r.slot_lesson_number ?? '–'}
                        </td>
                        <td className="py-2 pr-3 max-w-md truncate" title={r.title ?? ''}>{r.title ?? '—'}</td>
                        <td className="py-2 pr-3"><VerdictBadge v={v} /></td>
                        <td className="py-2 pr-3">
                          <span className="text-xs text-muted-foreground">{r.governance_status ?? 'pending'}</span>
                        </td>
                        <td className="py-2 pr-3 text-xs">
                          {errCount(r) > 0 && <span className="text-red-700 mr-2">{errCount(r)} err</span>}
                          {warnCount(r) > 0 && <span className="text-amber-700">{warnCount(r)} warn</span>}
                          {errCount(r) === 0 && warnCount(r) === 0 && <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="py-2 pr-3 text-right whitespace-nowrap">
                          <Button size="sm" variant="ghost" className="gap-1" onClick={() => openInCreator(r)}>
                            <ExternalLink className="h-3 w-3" /> Open
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="ml-1 gap-1"
                            disabled={v !== 'publish' || publishing.has(r.id)}
                            onClick={() => publishOne(r.id)}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Publish
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Regeneration and repair happen inside the Content Creator. Publish button is only enabled once{' '}
        <code>qa_verdict = 'publish'</code>. Bulk publish respects the current filter.
      </p>
    </div>
  );
}
